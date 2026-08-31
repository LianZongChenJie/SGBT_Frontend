<template>
  <div class="config-detail" style="padding-top: 0">
    <div class="condition-item" style="margin-top: 12px; padding: 0 16px" v-for="(condition, index) in conditionList">
      <div style="display: flex">
        <div style="width: 50px">
          <span v-if="index === 0" style="color: rgb(117, 117, 117); display: inline-block; margin: 6px 0px 0px 6px">当</span>
          <div v-else-if="index === 1" class="condition-rela">
            <a-select style="width: 50px" size="small" v-model:value="conditionRelation" @change="onRelationChange">
              <a-select-option value="and">且</a-select-option>
              <a-select-option value="or">或</a-select-option>
            </a-select>
          </div>
          <span v-else style="color: rgb(117, 117, 117); display: inline-block; margin: 6px 0px 0px 7px">
            {{conditionRelation=='and'?'且': '或'}}
          </span>
        </div>

        <div style="display: flex; flex: 1; flex-direction: column">
          <div style="margin-bottom: 2px; display: flex">
            <div style="flex: 1">
              <component-icon :type="condition.type" style="color: rgb(158, 158, 158)"/>
              <span style="margin-right: 10px;max-width: 100px;font-weight: bold">
              {{ condition.name }}
            </span>
              <span class="condition-select" style="width: 100px">
              <a-select style="min-width: 70px" size="small" v-model:value="condition.rule" :dropdownStyle="{minWidth: '120px'}" @change="onConditionRuleChange(condition, index)">
                <a-select-option v-for="item in getOptions(condition)" :value="item.value">{{ item.label }}</a-select-option>
              </a-select>
            </span>
            </div>
            <div class="icon-remove" style="width: 60px; text-align: right; margin-right: 0">
              <close-outlined title="移除条件" @click.prevent="onRemove(index)" />
            </div>
          </div>

          <div style="width: 100%;margin-top:0" class="condition-val">
            <online-super-query-val-component
              v-if="!condition.reloading"
              style="width: 100%"
              :schema="getSchema(condition, index)"
              :formModel="condition"
              :setFormModel="
                (key, value) => {
                  setFormModel(key, value, condition);
                }
              "
            />
          </div>
        </div>
      </div>
    </div>

    <a-popover overlayClassName="view-pop-field-select" v-model:open="showPop" trigger="click">
      <template #content>
        <div class="field-list">
          <template v-for="item in filterColumnList">
            <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
              <div><component-icon :type="item.type"/> {{ item.name }}</div>
            </div>
          </template>
          <div class="split"></div>
          <template v-for="item in systemFields">
            <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
              <div><component-icon :type="item.type"/>{{ item.name }}</div>
            </div>
          </template>
        </div>
      </template>
      <template #title>
        <a-input placeholder="搜索字段" class="my-input" v-model:value="filterValue">
          <template #prefix>
            <search-outlined style="color: #c0c0c0" />
          </template>
        </a-input>
      </template>
      <a-button class="add-button add-filter" style="margin-top: 20px" type="text">
        <PlusOutlined />
        添加筛选条件
      </a-button>
    </a-popover>

    <div style="width: 100%; text-align: right; position: relative">
      <a-button v-if="showSave" class="save-button" @click="saveCondition" style="right: 14px">保存</a-button>
      <slot name="save-button" v-bind="{saveable}"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import {ref, watchEffect, defineComponent, computed, watch, toRaw, nextTick} from 'vue';
  import { PlusOutlined, SearchOutlined, CloseOutlined, TableOutlined, SaveOutlined } from '@ant-design/icons-vue';
  import { FilterItem, systemFields, dontShowTypes } from '/@/views/super/online/desform/multi/ts/type.definition';
  import { pick } from 'lodash-es';
  import OnlineSuperQueryValComponent from '/@/views/super/online/cgform/auto/comp/superquery/SuperQueryValComponent.vue';
  import { useFilterField, useComponentCondition } from '../ts/useFilterField';
  import { useDebounceFn } from '@vueuse/core';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ComponentIcon from "/@/components/jeecg/super/desform/ComponentIcon.vue";

  
  export default defineComponent({
    name: 'FilterFiledList',
    components: {
      PlusOutlined,
      SearchOutlined,
      CloseOutlined,
      TableOutlined,
      OnlineSuperQueryValComponent,
      SaveOutlined,
      ComponentIcon
    },
    emits: ['save', 'copy', 'search', 'update:clear'],
    props: {
      // 表单设计器默认的列
      columnList: {
        type: Array,
        default: () => [],
      },
      // conditions;conditionType
      info: {
        type: Object,
        require: false,
        default: {},
      },
      saveButton: {
        type: Boolean,
        default: true,
      },
      clear: {
        type: Boolean,
        default: false,
      },
      emitChange: {
        type: String,
        default: '',
      },
      parentContainer:{
        type: String,
        default: '',
      }
    },
    setup(props, { emit }) {
      const { getConditionOptions, getDefaultRule, getDefaultVal } = useComponentCondition();
      
      // QQYUN-3208 【视图】高级查询对控件的覆盖测试问题
      const filterColumnList = ref<any[]>([]);
      function initFilterColumnList(list) {
        if(!list || list.length==0){
          filterColumnList.value = [];
          return;
        }
        let arr = list.filter(item => {
          if (dontShowTypes.includes(item.type) || dontShowTypes.includes(item.realType)) {
            // 他表字段特殊处理
            if (item.type == 'link-field' || item.realType === 'link-field') {
              // 只有存储类型为save的才能作为筛选条件
              return item.saveType === 'save';
            }
            return false;
          }
          return true
        })
        filterColumnList.value = arr;
      }

      const showPop = ref(false);
      const conditionRelation = ref('and');
      const conditionList = ref<FilterItem[]>([]);

      const { getSchema, getFieldConfig } = useFilterField(props, true, props.parentContainer);

      const { createMessage } = useMessage()
      
      watchEffect(() => {
        let cList: any[] = props.columnList;
        initFilterColumnList(cList);
        let temp = props.info;
        conditionRelation.value = temp.conditionType || 'and';
        let arr: FilterItem[] = [];
        if (temp.conditions) {
          let queryList: FilterItem[] = temp.conditions;
          if (queryList && queryList.length > 0) {
            for (let item of queryList) {
              let name = '';
              if (cList && cList.length > 0) {
                let matchElements: any[] = cList.filter((i) => i.model == item.field);
                if (matchElements && matchElements.length > 0) {
                  name = matchElements[0].name;
                }
              }
              if (!name) {
                let matchElements: any[] = systemFields.filter((i) => i.field == item.field);
                if (matchElements && matchElements.length > 0) {
                  name = matchElements[0].name;
                }
              }
              if (!name) {
                console.error('数据过滤条件失效，没找到与之匹配的字段', item);
              } else {
                let a: FilterItem = pick(item, 'field', 'rule', 'val', 'type', 'timestamp');
                arr.push({
                  ...a,
                  name,
                  reloading: false,
                });
              }
            }
          }
        }
        console.log('查询条件', arr);
        conditionList.value = arr;
      });

      function onSelectField(item) {
        let field = item.field || item.model;
        let arr = conditionList.value;
        let rule = getDefaultRule(item.type);
        let val = getDefaultVal(item.type);
        arr.push({
          field,
          rule,
          val,
          type: item.type,
          name: item.name,
          timestamp: item.timestamp,
          reloading: false,
        });
        conditionList.value = arr;
        showPop.value = false;
      }

      const filterValue = ref('');
      function isFilterItem(item) {
        let temp = filterValue.value;
        if (!temp) {
          return true;
        }
        if (!item) {
          return false;
        }
        return item.name.indexOf(temp) >= 0;
      }

      //保存并执行查询条件
      function saveCondition() {
        let arr: any[] = [];
        for (let item of conditionList.value) {
          if (isValidValue(item)) {
            let temp = pick(item, 'field', 'rule','type', 'timestamp');
            arr.push({
              ...temp,
              val: toRaw(item.val)
            });
          }
        }
        if (arr.length > 0) {
          emit('save', {
            conditions: arr,
            conditionType: conditionRelation.value,
          });
        }else{
          createMessage.warning('没有有效的条件值，不可保存！');
        }
        //let superQueryParams = encodeURI(JSON.stringify(arr));
        //superQueryParams '[{"field":"radio_1663236052490_232483","rule":"eq","val":0,"type":"list"}]'
        // matchType
      }

      function copyCondition() {
        let arr: any[] = [];
        for (let item of conditionList.value) {
          if (isValidValue(item)) {
            let temp = pick(item, 'field', 'rule','type', 'timestamp');
            arr.push({
              ...temp,
              val: toRaw(item.val)
            });
          }
        }
        if (arr.length > 0) {
          emit('copy', {
            conditions: arr,
            conditionType: conditionRelation.value,
          });
        }
      }

      //移除条件
      function onRemove(index) {
        console.log('remove', index);
        let arr = conditionList.value;
        arr.splice(index, 1);
        conditionList.value = arr;

        if (arr.length == 0) {
          emit('search', {
            conditions: [],
            conditionType: conditionRelation.value,
          });
          emit('update:clear', false)
        }
      }

      /**
       * 判断条件值是否有效
       * @param item
       */
      function isValidValue(item) {
        if (item.val === '0' || item.val === 0) {
          return true;
        } else {
          if (item.val) {
            return true;
          } else {
            if (item.rule === 'empty' || item.rule === 'not_empty') {
              return true;
            }
          }
        }
        return false;
      }

      const showSave = computed(() => {
        if (props.saveButton === false) {
          return false;
        }
        let arr = conditionList.value;
        if (!arr || arr.length == 0) {
          return false;
        }
        /*let flag = false;
        for (let i = 0; i < arr.length; i++) {
          if (isValidValue(arr[i])) {
            flag = true;
          }else{
            flag = false;
            break;
          }
        }*/
        return true;
      });
      
      const saveable = computed(() => {
        let arr = conditionList.value;
        if (!arr || arr.length == 0) {
          return false;
        }
        let flag = false;
        for (let i = 0; i < arr.length; i++) {
          if (isValidValue(arr[i])) {
            flag = true;
          }else{
            flag = false;
            break;
          }
        }
        return flag;
      });

      watch(
        () => props.clear,
        (val) => {
          // clear 值改变，清空已有字段配置
          if(val===true){
            conditionList.value = [];
            showPop.value = true;
          }
        }, {immediate: true}
      );

      watch(
        () => props.info,
        (info) => {
          let type = info.emitChange;
          console.log('条件改变,emitChange--->', type)
          if (type) {
            /*let arr: any[] = [];
            for (let item of conditionList.value) {
              if (isValidValue(item)) {
                arr.push(pick(item, 'field', 'rule', 'val', 'type'));
              }
            }
            let data = {
              conditions: arr,
              conditionType: conditionRelation.value,
            };
            if (arr.length > 0) {
              if (type == 'save') {
                emit('save', data);
              } else if (type == 'copy') {
                emit('copy', data);
              }
            }*/
          }
        },
        { deep: true }
      );

      /**
       * val组件赋值
       */
      function setFormModel(key: string, value: any, item: any) {
        console.log('setFormModel', key, value);
        // formModel[key] = value;
        item['val'] = value;
      }

      /**
       * 获取条件下拉框选项
       * @param type
       */
      function getOptions(item) {
        const config = getFieldConfig(item.field)
        let type = item.type;
        let arr = getConditionOptions(type, config.multiple);
        if (!arr || arr.length == 0) {
          return [];
        }
        return arr;
      }

      function emitSearch(){
        let arr:any[] = []
        for (let item of conditionList.value) {
          let temp = pick(item, 'field', 'rule','type', 'timestamp');
          arr.push({
            ...temp,
            val: toRaw(item.val)
          });
        }
        console.log('emitSearch', arr);
        if (arr.length > 0) {
          emit('search', {
            conditions: arr,
            conditionType: conditionRelation.value,
          });
        }
      }
      const emitSearchDebounce = useDebounceFn(emitSearch, 800);
      watch(conditionList.value, ()=>{
        emitSearchDebounce();
      }, {deep: true});
      function onRelationChange() {
        emitSearchDebounce();
      }

      function onConditionRuleChange(condition:FilterItem) {
        condition.reloading = true;
        nextTick(() => {
          condition.reloading = false;
        });
      }

      return {
        conditionList,
        getOptions,
        conditionRelation,
        systemFields,
        showPop,
        filterValue,
        onSelectField,
        isFilterItem,
        saveCondition,
        copyCondition,
        onRemove,
        showSave,
        getSchema,
        saveable,
        setFormModel,
        filterColumnList,
        onRelationChange,
        onConditionRuleChange,
      };
    },
  });
</script>

<style lang="less">
  @import '../config/common';
</style>

<style lang="less">
  .condition-select .ant-select-selector,
  .condition-rela .ant-select-selector {
    background: none !important;
  }
  .add-button:hover {
    background: none;
  }
  .save-button {
    border-radius: 20px;
    position: absolute;
    right: 3px;
    top: -33px;
    &:hover {
      background: none;
      color: #0a8fe9;
    }
  }

  .condition-val {
    .ant-select {
      width: 100%;
    }
  }
  .add-filter{
    cursor: pointer;
    color: rgb(117, 117, 117);
    font-weight: bold;
  }

</style>
