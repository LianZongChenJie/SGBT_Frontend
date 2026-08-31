<template>
  <a-popover v-model:open="visible" placement="bottomLeft" trigger="click" :overlayClassName="`${prefixCls}__column-list`">
    <template #title>
      <div :class="`${prefixCls}__popover-title`">
        <a-checkbox v-model:checked="showIndex" @change="onIndexChange"> 序号列 </a-checkbox>
        <a-checkbox v-model:checked="showAction" @change="onActionChange"> 操作列 </a-checkbox>
      </div>
    </template>

    <template #content>
      <div :class="[`${prefixCls}__scroll`]">
        <a-checkbox-group :value="checkedList" @change="onChange">
          <template v-for="item in columnOptions" :key="item.value">
            <div :class="`${prefixCls}__check-item`">
              <a-checkbox :value="item.value">
                {{ item.label }}
              </a-checkbox>
            </div>
          </template>
        </a-checkbox-group>
      </div>
      <div :class="`${prefixCls}__popover-footer`">
        <a-button size="small" @click="onReset">重置</a-button>
        <a-button size="small" type="primary" @click="onSave">保存</a-button>
      </div>
    </template>

    <a-tooltip v-if="auth" title="自定义列">
      <div :class="`${prefixCls}__icon`">
        <a-icon type="setting" />
      </div>
    </a-tooltip>
  </a-popover>
</template>

<script lang="ts">
  import type { BasicColumn } from '/@/components/Table';
  import { computed, defineComponent, ref, unref, watchEffect, watch } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { propTypes } from '/@/utils/propTypes';
  import { createLocalStorage } from '/@/utils/cache';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {useTableColumnShower} from '/@/views/super/online/desform/multi/ts/useBaseList'

  export default defineComponent({
    name: 'AutoColumnSettings',
    props: {
      desformCode: propTypes.string,
      columns: propTypes.array,
      auth: propTypes.bool.def(true),
      //新增配置 
      dynamicConfig: Object,
    },
    emits: ['columns-change'],
    setup(props, { emit }) {
      let isInit = false;
      const $ls = createLocalStorage();
      const { createMessage: $message } = useMessage();
      const { prefixCls } = useDesign('desform-column-setting');
      // 列表配置缓存key
      const cacheKey = computed(() => {
        let key = `desform:auto:${props.desformCode}`;
        return 'columnCache:' + key;
      });
      const visible = ref(false);
      // 选择的列（显示出来的）
      const checkedList = ref<Recordable[]>([]);
      // 是否显示行号列
      const showIndex = ref(true);
      // 是否显示操作列
      const showAction = ref(true);
      const {addOptions, addColumns} = useTableColumnShower(checkedList);
      // 列配置
      const columnOptions = computed(() => {
        if (!props.columns) {
          return [];
        }
        console.log('props.columns-->', props.columns)
        let options: Recordable[] = [];
        for (let i = 0; i < props.columns.length; i++) {
          let column = props.columns[i] as BasicColumn;
          options.push({
            label: column.title,
            value: column.key,
          });
        }
        let {hasChange, newOptions} = addOptions(props.dynamicConfig, options)
        if(hasChange===true && isInit){
          columnsChange();
        }
        return newOptions;
      });

      watchEffect(() => {
        if (props.columns?.length) {
          init();
        }
      });
      
      watch(()=>props.dynamicConfig, (val)=>{
        if(val){
          columnsChange();
        }
      });

      async function init() {
        if (isInit) {
          return;
        }
        isInit = true;
        let columnCache = $ls.get(cacheKey.value);
        // 判断是否有缓存
        if (columnCache && columnCache.checkedList) {
          checkedList.value = columnCache.checkedList;
          showIndex.value = columnCache.showIndex;
          showAction.value = columnCache.showAction;
        } else {
          // 如果没有缓存，就初始化
          resetSetting();
        }
        columnsChange();
      }

      function saveSetting(checkedList) {
        $ls.set(cacheKey.value, {
          // 保存的列
          checkedList,
          showIndex: unref(showIndex),
          showAction: unref(showAction),
        });
      }

      function resetSetting() {
        // 默认显示5列
        checkedList.value = columnOptions.value.filter((_, i) => i < 99).map((i) => i.value);
        showIndex.value = true;
        showAction.value = true;
      }

      /** 列选中/取消选中时触发 */
      function onChange($checkedList) {
        if ($checkedList.length === 0) {
          $message.warning('请至少选择1列');
          return;
        }
        checkedList.value = $checkedList;
        columnsChange();
      }

      function onIndexChange() {
        columnsChange();
      }

      function onActionChange() {
        columnsChange();
      }

      function onSave() {
        saveSetting(checkedList.value);
        $message.success('保存成功');
        // 保存之后直接关闭
        visible.value = false;
      }

      /** 重置 */
      function onReset() {
        resetSetting();
        columnsChange();
        $ls.remove(cacheKey.value);
        $message.success('重置成功');
        visible.value = false;
      }

      function columnsChange() {
        let checked = unref(checkedList);
        let columns = props.columns.filter((col) => checked.includes((col as any).key));
        columns = addColumns(props.dynamicConfig, columns);
        
        emit('columns-change', {
          columns,
          showIndex: unref(showIndex),
          showAction: unref(showAction),
        });
      }

      return {
        visible,
        prefixCls,
        checkedList,
        columnOptions,
        showIndex,
        showAction,
        onSave,
        onReset,
        onChange,
        onIndexChange,
        onActionChange,
      };
    },
  });
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-desform-column-setting';
  .@{prefix-cls} {
    &__icon {
      cursor: pointer;

      span.anticon {
        vertical-align: middle;
      }

      svg {
        width: 1.3em;
        height: 1.3em;
      }
    }

    &__check-item {
      display: flex;
      align-items: center;
      min-width: 100%;
      padding: 4px 16px 8px 0;

      .ant-checkbox-wrapper {
        width: 100%;

        &:hover {
          color: @primary-color;
        }
      }
    }

    &__column-list {
      svg {
        width: 1em !important;
        height: 1em !important;
      }

      .ant-popover-inner-content {
        padding-right: 0;
        padding-left: 0;
      }

      .ant-checkbox-group {
        width: 100%;
        min-width: 260px;
        padding: 0 16px;
      }

      .scrollbar {
        height: 220px;
      }
    }

    &__scroll {
      overflow: auto;
      max-height: 300px;
    }

    /* 卡片底部样式 */

    &__popover-footer {
      position: relative;
      top: 7px;
      text-align: right;
      padding: 4px 0 0;
      border-top: 1px solid #f0f0f0;

      .ant-btn {
        margin-right: 6px;
      }
    }
  }
</style>
