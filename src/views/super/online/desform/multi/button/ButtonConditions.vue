<template>
  <div v-show="visible" class="button-conditions">
    <div v-if="conditionsGroupList && conditionsGroupList.length > 0" class="button-conditions-text">
      <div style="flex: 1">
        <div v-for="(groupItem, conIndex) in conditionsGroupList" class="condition-group-item">
          <span v-if="conIndex === 0" class="condition-right">当</span>
          <span v-else class="condition-right">{{ conditionType === 'and' ? '且' : '或' }}</span>
          <div v-if="groupItem.queryItems" v-for="(condition, index) in groupItem.queryItems" class="condition-item">
            <span v-if="index > 0">
              {{ groupItem.matchType === 'and' ? '且' : '或' }}
            </span>
            <span>{{ getFieldLabel(condition.field) }}</span>
            <span style="color: #333; font-weight: 700">{{ getTypeLabel(condition.rule) }}</span>
            <span v-if="isLinkrecordComponent(condition)" class="link-record-span">
              <component v-if="condition.val" :is="getFieldValue(condition)" />
            </span>
            <span v-else-if="condition.valText">
              {{ getValueText(condition.valText) }}
            </span>
            <span v-else>
              {{ getValueText(condition.val) }}
            </span>
          </div>
        </div>
      </div>
      <div class="button-edit-icon">
        <EditOutlined @click="goEdit" />
      </div>
    </div>
    <a-modal
      centered
      v-model:open="modalVisible"
      title="筛选"
      :bodyStyle="bodyStyle"
      @cancel="onBack"
      @ok="onConditionSelected"
      wrapClassName="button-condition-modal"
    >
      <div class="inner-content filter-select-adding" style="padding: 0 20px 20px 15px; height: 100%; overflow: auto">
        <FilterFiledListNew
          ref="filterRef"
          :columnList="columnList"
          :info="filterInfo"
          parentContainer="button-condition-modal"
          :saveButton="false"
          @save="onSaveFilter"
        >
        </FilterFiledListNew>
      </div>

      <template #footer>
        <a-button v-if="conditionsGroupList.length > 0" @click="clearAll">清空</a-button>
        <a-button style="margin-left: 18px" @click="onBack">取消</a-button>
        <a-button style="margin-left: 10px" type="primary" @click="onConditionSelected">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
  import type { Ref } from 'vue';
  import type {FilterInfoType, FilterItem, FilterItemGroup, MatchType} from '../ts/type.definition';
  import { ref, inject,toRaw, computed, watch, watchEffect } from 'vue';
  import { EditOutlined } from '@ant-design/icons-vue';
  import { systemFields } from '../ts/type.definition';
  import { useComponentCondition } from '../ts/useFilterField';
  import { useButtonCurd, updateConditionsList } from '../ts/useCustomButton';
  import FilterFiledListNew from '../select/FilterFiledListNew.vue';
  import {pick} from "lodash-es";
  import { cloneDeep } from 'lodash-es';

  export default {
    name: 'ButtonConditions',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      // type -- list
      conditions: {
        type: Array,
        default: () => [],
      },
      conditionsGroup: {
        type: Array,
        default: () => [],
      },
      type: {
        type: String,
        default: '',
      },
      code:{
        type: String,
        default: '',
      },
      allColumns:{
        type: Array,
        default: () => [],
      }
    },
    components: {
      EditOutlined,
      FilterFiledListNew,
    },
    emits: ['ok', 'back', 'update:conditions', 'update:conditionsGroup'],
    setup(props, { emit }) {
      const conditionsGroupList = ref<FilterItemGroup[]>([]);
      const conditionType = ref<MatchType>('and');
      const { translateCondition } = useButtonCurd(props);

      watchEffect(async () => {
        conditionType.value = props.type;
      });

      // 升级条件集合 conditions
      watch(() => props.conditions, async () => {
        if (Array.isArray(props.conditions) && props.conditions.length > 0) {
          const cGroups = updateConditionsList(props.conditions, props.type);
          emit('update:conditions', []);
          emit('update:conditionsGroup', cGroups);
        }
      }, {immediate: true})

      // 封装按钮条件集合 conditionsGroupList
      watch(() => props.conditionsGroup, async () => {
        const cGroups = Array.isArray(props.conditionsGroup) ? props.conditionsGroup : [];
        for (const cGroup of cGroups) {
          if (!cGroup.queryItems || cGroup.queryItems.length === 0) {
            continue;
          }
          let cList: FilterItem[] = [];
          for (let item of cGroup.queryItems) {
            let temp = pick(item, 'field', 'rule', 'val', 'type');
            cList.push(temp);
          }
          let str = JSON.stringify(cList);
          const array = await translateCondition(str);
          console.log('translateCondition:', array);
          if (array.length > 0) {
            cGroup.queryItems = array;
          } else {
            cGroup.queryItems = cList;
          }
        }
        conditionsGroupList.value = cGroups;
      }, {immediate: true})

      const columnList: Ref<any[]> | undefined = inject('globalColumnList');

      const { getTypeLabel } = useComponentCondition();

      // 【QQYUN-5070】全部列配置，包括系统字段和用户自定义字段
      const fullColumns = computed<Recordable[]>(() => {
        return [
          // 合并用户自定义字段
          ...(columnList?.value || []),
          // 合并系统字段
          ...systemFields.map((item) => ({ ...item, model: item.field })),
        ];
      });

      function getFieldLabel(field) {
        let list = fullColumns.value;
        let arr = list.filter((item) => item.model === field);
        if (arr.length > 0) {
          return arr[0].name;
        } else {
          console.error('该字段被修改，请重新配置', field);
        }
        return field;
      }

      const modalVisible = ref(false);
      const filterRef = ref();
      function goEdit() {
        modalVisible.value = true;
      }
      function onConditionSelected() {
        filterRef.value.saveCondition();
      }

      /**
       * 保存查询条件事件
       * @param saveInfo
       */
      function onSaveFilter(saveInfo) {
        console.log('保存查询条件: ', saveInfo);
        emit('ok', saveInfo);
        modalVisible.value = false;
      }

      function onBack() {
        emit('back');
        modalVisible.value = false;
      }

      const filterInfo = computed<FilterInfoType>(() => {
        // cloneDeep 防止弹窗内修改影响外部
        return cloneDeep({
          modalVisible: modalVisible.value,
          conditionsGroup: conditionsGroupList.value,
          conditionType: conditionType.value,
        });
      });

      watch(
        () => props.visible,
        (val) => {
          if (val === true) {
            if ((props.conditions && props.conditions.length > 0) || (props.conditionsGroup && props.conditionsGroup.length > 0)) {
              // 如果已经有条件了，啥都不用干
            } else {
              //没有条件 那么需要弹窗
              modalVisible.value = true;
            }
          }
        }
      );

      const maxHeight = window.innerHeight - 200;
      const bodyStyle = {
        maxHeight: maxHeight + 'px',
        overflow: 'auto',
      };

      function clearAll() {
        emit('ok', {
          conditions: [],
          conditionsGroup: [],
          conditionType: 'and',
        });
        modalVisible.value = false;
      }
      
      const translateCompTypeArray = ['radio','checkbox','select','select-user','select-depart','table-dict','select-tree','link-record']
      function getFieldValue(data) {
        let {val, field, type} = data;
        let res = toRaw(val);
        if(translateCompTypeArray.indexOf(type)>=0){
          let columns = props.allColumns;
          if(!columns || columns.length==0){
            return res;
          }
          for (let item of columns) {
            if (item.dataIndex === field) {
              if (item.customRender) {
                res = item.customRender({ text: res, record:{} });
              }
              break;
            }
          }
        }
        return res;
      }
      const componentTypeArray = ['link-record'];
      function isLinkrecordComponent(data) {
        let columns = props.allColumns;
        if(!columns || columns.length==0){
          return false
        }
        return componentTypeArray.indexOf(data.type) >= 0;
      }

      // 【QQYUN-5012】替换valText，（当前用户等）
      function getValueText(valText) {
        if (!valText) {
          return valText;
        }
        if (Array.isArray(valText)) {
          valText = valText.map(text => getValueText(text)).join(',');
        } else if (typeof valText.replace === 'function') {
          valText = valText.replace(/#\{\s*sys_user_code\s*}/g, '当前用户');
        }
        return valText;
      }

      return {
        conditionsGroupList,
        conditionType,
        getFieldLabel,
        getTypeLabel,
        goEdit,
        onConditionSelected,
        modalVisible,
        columnList,
        filterInfo,
        onSaveFilter,
        bodyStyle,
        filterRef,
        onBack,
        clearAll,
        isLinkrecordComponent,
        getFieldValue,
        getValueText,
      };
    },
  };
</script>

<style lang="less">
  .button-conditions-text {
    width: 100%;
    border: 1px solid rgb(221, 221, 221);
    border-radius: 3px;
    padding: 4px 12px 6px;
    box-sizing: border-box;
    color: rgb(51, 51, 51);
    margin: 10px 0px;
    display: flex;
    cursor: pointer;
    &:hover {
      background: rgb(245, 245, 245);
      border-color: rgb(216, 216, 216);
      .button-edit-icon {
        color: #0a8fe9;
      }
    }
    .button-edit-icon {
      color: rgb(158, 158, 158);
      font-size: 15px;
      padding-top: 5px;
    }
    .condition-item {
      padding-left: 20px;
      height: 25px;
      line-height: 25px;
      span {
        margin: 0px 7px 4px 1px;
      }
      .link-record-span{
        display: inline-block;
        .jeecg-desform-link-record-tags{
          margin-top: 5px;
          vertical-align: middle;
        }
      }
    }
  }
  .condition-group-item{
    margin-top: 2px;
    position: relative;
  }
  .condition-right{
    position: absolute;
    left: -2px;
    top: 2px;
    color: #757575;
  }
</style>
