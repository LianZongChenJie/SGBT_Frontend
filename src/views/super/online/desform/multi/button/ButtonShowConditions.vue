<template>
  <div v-show="visible" class="button-conditions">
    <div v-if="conditionList && conditionList.length > 0" class="button-conditions-text">
      <div style="flex: 1">
        <div v-for="(item, index) in conditionList" class="condition-item">
          <span v-if="index > 0">
            {{ conditionType == 'and' ? '且' : '或' }}
          </span>
          <span>{{ getFieldLabel(item.field) }}</span>
          <span style="color: #333; font-weight: 700">{{ getTypeLabel(item.rule) }}</span>
          <span v-if="isLinkrecordComponent(item)" class="link-record-span">
             <component v-if="item.val" :is="getFieldValue(item)" />
          </span>
          <span v-else-if="item.valText">
             {{ getValueText(item.valText) }}
          </span>
          <span v-else>
            {{ getValueText(item.val) }}
          </span>
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
        <FilterFiledList
          ref="filterRef"
          :columnList="columnList"
          @save="saveInfo"
          :info="filterInfo"
          parentContainer="button-condition-modal"
          :saveButton="false"
        >
        </FilterFiledList>
      </div>

      <template #footer>
        <a-button v-if="conditionList.length > 0" @click="clearAll">清空</a-button>
        <a-button style="margin-left: 18px" @click="onBack">取消</a-button>
        <a-button style="margin-left: 10px" type="primary" @click="onConditionSelected">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
  import { ref, inject,toRaw, computed, watch, watchEffect } from 'vue';
  import {FilterItem, systemFields} from '../ts/type.definition';
  import type { Ref } from 'vue';
  import { useComponentCondition } from '../ts/useFilterField';
  import { EditOutlined } from '@ant-design/icons-vue';
  import FilterFiledList from '../select/FilterFiledList.vue';
  import { pick } from 'lodash-es';
  import {useButtonCurd} from "/@/views/super/online/desform/multi/ts/useCustomButton";

  export default {
    name: 'ButtonShowConditions',
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
      FilterFiledList,
    },
    emits: ['ok', 'back'],
    setup(props, { emit }) {
      const conditionList = ref<FilterItem[]>([]);
      const conditionType = ref('and');
      const { translateCondition } = useButtonCurd(props);
      watchEffect(async () => {
        conditionType.value = props.type;
        let cList = props.conditions;
        if (!cList || cList.length == 0) {
          conditionList.value = [];
        } else {
          let arr: FilterItem[] = [];
          for (let item of cList) {
            let temp = pick(item, 'field', 'rule', 'val', 'type');
            arr.push(temp);
          }
          let str = JSON.stringify(arr);
          const array = await translateCondition(str);
          if(array.length>0){
            conditionList.value = array;
          }else{
            conditionList.value = arr;
          }
        }
      });


      const columnList: Ref<any[]> | undefined = inject('globalColumnList', undefined);

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
      function saveInfo(data) {
        console.error('saveInfo', data);
        emit('ok', data);
        modalVisible.value = false;
      }

      function onBack() {
        emit('back');
        modalVisible.value = false;
      }
      const filterInfo = computed(() => {
        return {
          conditions: conditionList.value,
          conditionType: conditionType.value,
        };
      });

      watch(
        () => props.visible,
        (val) => {
          console.error('props.visibl', val);
          if (val === true) {
            if (props.conditions && props.conditions.length > 0) {
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
        valText = valText?.replace(/#\{\s*sys_user_code\s*}/g, '当前用户');
        return valText;
      }

      return {
        conditionList,
        conditionType,
        getFieldLabel,
        getTypeLabel,
        goEdit,
        onConditionSelected,
        modalVisible,
        columnList,
        filterInfo,
        saveInfo,
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
</style>
