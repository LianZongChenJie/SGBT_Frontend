<template>
  <div>
    <div @click="click2Add" :class="disabled?'link-record-container disabled':'link-record-container'">
      <template v-if="selectList.length > 0">
        <SelectItem v-for="item in showList" :info="item" @unSelect="unSelect" :titleField="titleField" />
      </template>
      <span v-else style="height: 30px; line-height: 30px; display: inline-block; margin-left: 7px; color: #bfbfbf">请选择</span>
      <div v-if="ellipsisInfo.status" class="user-selected-item">
        <div class="user-select-ellipsis">
          <span style="color: red">+{{ ellipsisInfo.count }}...</span>
        </div>
      </div>
    </div>

    <select-modal
      @register="registerModal"
      @selected="onSelected"
      :code="code"
      :titleField="titleField"
      :showFields="showFields"
      :multi="multi"
      :getContainer="getContainer"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, watch, ref, computed, toRaw } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import { defHttp } from '/@/utils/http/axios';
  import SelectItem from './SelectItem.vue';
  import SelectModal from './SelectModal.vue';
  import { Form } from 'ant-design-vue';

  export default defineComponent({
    name: 'LinkRecordSelect',
    components: {
      PlusOutlined,
      SelectItem,
      SelectModal,
    },
    props: {
      // 多个值逗号隔开
      value: {
        type: [String, Array],
        default: '',
      },
      multi: {
        type: Boolean,
        default: false,
      },
      getContainer: {
        type: Function,
        default: null,
      },
      //最多显示几个tag-
      maxCount: {
        type: Number,
        default: 2,
      },
      titleField: {
        type: String,
        default: '',
      },
      code: {
        type: String,
        default: '',
      },
      showFields: {
        type: Array,
        default: () => [],
      },
      disabled:{
        type: Boolean,
        default: false,
      }
    },
    emits: ['update:value', 'change'],
    setup(props, { emit }) {
      const formItemContext = Form.useInjectFormItemContext();
      // value-label
      const selectList = ref<any[]>([]);
      const ellipsisInfo = computed(() => {
        let max = props.maxCount;
        let len = selectList.value.length;
        if (len > max) {
          return { status: true, count: len - max };
        } else {
          return { status: false };
        }
      });

      const showList = computed(() => {
        let list = selectList.value;
        let max = props.maxCount;
        if (list.length <= max) {
          return list;
        }
        return list.filter((_item, index) => index < max);
      });

      // 注册弹窗
      const [registerModal, { openModal }] = useModal();

      function click2Add(e) {
        e.preventDefault();
        e.stopPropagation();
        onShowModal();
      }

      function onShowModal() {
        if(props.disabled===true){
          return ;
        }
        let list = toRaw(selectList.value);
        openModal(true, {
          list,
        });
      }

      // 取消选择
      function unSelect(value) {
        let arr = selectList.value;
        let index = arr.findIndex((item) => item.value === value);
        arr.splice(index, 1);
        selectList.value = arr;
        console.log('unSelect', arr);
        emitChange();
      }

      // 选中
      function onSelected(list) {
        selectList.value = list;
        emitChange();
      }

      // 往外抛事件
      const watchValid = ref(true);
      function emitChange() {
        watchValid.value = false;
        let list = selectList.value;
        if (list.length > 0) {
          let arr = list.map((item) => item.value);
          let str = arr.join(',');
          emit('update:value', str);
          emit('change', str);
        } else {
          emit('update:value', '');
          emit('change', '');
        }
        formItemContext.onFieldChange();
      }

      // 合并成逗号分割的字符串
      // 【QQYUN-5278 #3】防止数组变化但内部值不变导致的重复请求
      const propJoinId = computed(()=>{
        let {value} = props
        if(value && value.length > 0 ){
          return Array.isArray(value) ? value.join(',') : value;
        }
        return ''
      })

      watch(
        propJoinId,
        async (val) => {
          if (watchValid.value === true) {
            let arr: any[] = [];
            if (val && val.length > 0) {
              const list = await getSelectedData(val);
              for (let item of list) {
                arr.push({
                  label: item.desformData[props.titleField],
                  value: item.id,
                });
              }
            }
            selectList.value = arr;
          }
          watchValid.value = true;
        },
        { immediate: true }
      );

      async function getSelectedData(id) {
        const url = '/desform/data/list';
        const params = {
          desformCode: props.code,
          id: id,
        };
        const data = await defHttp.get({ url, params }, { isTransformResponse: false });
        if (data.success) {
          let list = data.result.records;
          if (list && list.length > 0) {
            return list;
          }
        } else {
          console.error(data.message);
        }
        return [];
      }

      return {
        selectList,
        showList,
        click2Add,
        unSelect,
        onSelected,
        registerModal,
        ellipsisInfo,
      };
    },
  });
</script>

<style scoped lang="less">
  .link-record-container {
    padding: 0 5px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-sizing: border-box;
    display: flex;
    color: #9e9e9e;
    font-size: 14px;
    flex-wrap: wrap;
    min-height: 32px;
    &.disabled{
      cursor: not-allowed;
      background-color: #f5f5f5 !important;
    }
  }
</style>
