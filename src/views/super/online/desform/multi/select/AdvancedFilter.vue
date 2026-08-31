<template>
  <div class="config-detail" style="padding-top: 0">
    <div class="condition-item" style="margin-top: 12px; padding: 0 16px" v-for="(item, conIndex) in conditionsGroupList">
      <div style="display: flex" v-if="conIndex > 0">
        <a-divider style="margin: 0" v-if="conIndex === 1">
          <a-select class="no-select-boder" style="width: 50px" size="small" v-model:value="conditionRelation" @change="onRelationChange">
            <a-select-option value="and">且</a-select-option>
            <a-select-option value="or">或</a-select-option>
          </a-select>
        </a-divider>
        <a-divider style="margin: 0" v-else>
          <span style="font-size: 13px">{{ conditionRelation === 'and' ? '且' : '或' }}</span>
        </a-divider>
        <div class="icon-remove" style="position: relative; top: 4px">
          <close-outlined @click.prevent="onConRemove(conIndex)" />
        </div>
      </div>
      <div class="children-query" v-for="(condition, index) in item.queryItems" style="margin-top: 20px">
        <div style="display: flex" @mousemove="mouseMoveQuery(conIndex + '-' + index)" @mouseleave="mouseLeaveQuery">
          <div style="width: 50px">
            <span v-if="index === 0" style="color: rgb(117, 117, 117); display: inline-block; margin: 6px 0 0 6px">当</span>
            <div v-else-if="index === 1" class="condition-rela">
              <a-select style="width: 50px" size="small" v-model:value="item.matchType" @change="onRelationChange">
                <a-select-option value="and">且</a-select-option>
                <a-select-option value="or">或</a-select-option>
              </a-select>
            </div>
            <span v-else style="color: rgb(117, 117, 117); display: inline-block; margin: 6px 0 0 7px">
              {{ item.matchType === 'and' ? '且' : '或' }}
            </span>
          </div>

          <div style="display: flex; flex: 1; flex-direction: column">
            <div style="margin-bottom: 2px; display: flex">
              <div style="flex: 1">
                <component-icon :type="condition.type" style="color: rgb(158, 158, 158)" />
                <span style="margin-right: 10px; max-width: 100px; font-weight: bold">
                  {{ condition.name }}
                </span>
                <span class="condition-select" style="width: 100px">
                  <a-select
                      style="min-width: 70px"
                      size="small"
                      v-model:value="condition.rule"
                      :dropdownStyle="{ minWidth: '120px' }"
                      @change="onConditionRuleChange(condition, conIndex)"
                  >
                    <a-select-option v-for="item in getOptions(condition)" :value="item.value">{{ item.label }}</a-select-option>
                  </a-select>
                </span>
              </div>
              <div :class="queryIndex == conIndex + '-' + index ? 'icon-children-show' : 'icon-children-hide'">
                <close-outlined @click.prevent="onRemove(conIndex, index)" />
              </div>
            </div>

            <div style="width: 100%; margin-top: 0" class="condition-val">
              <SuperQueryValFilterCondition
                  v-if="!condition.reloading"
                  :index="index"
                  :condition="condition"
                  :getSchema="getSchema"
                  :setFormModel="setFormModel"
                  scrollContainer="ant-popover-inner-content"
              />
            </div>
          </div>
        </div>
      </div>
      <a-popover overlayClassName="view-pop-field-select" v-model:visible="item.showPop" trigger="click" v-if="conditionsGroupList.length > 1">
        <template #content>
          <div class="field-list">
            <template v-for="item in filterColumnList">
              <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item, conIndex)">
                <div><component-icon :type="item.type" />{{ item.name }}</div>
              </div>
            </template>
            <div class="split"></div>
            <template v-for="item in systemFields">
              <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item, conIndex)">
                <div><component-icon :type="item.type" />{{ item.name }}</div>
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
        <span class="add-button" style="margin-top: 20px; cursor: pointer;width: 80px" @click="showPopField(conIndex)">
          <PlusOutlined />
          筛选
        </span>
      </a-popover>
    </div>

    <a-popover overlayClassName="view-pop-field-select" v-model:visible="showPop" trigger="click" v-if="conditionsGroupList.length <= 1">
      <template #content>
        <div class="field-list">
          <template v-for="item in filterColumnList">
            <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
              <div><component-icon :type="item.type" /> {{ item.name }}</div>
            </div>
          </template>
          <div class="split"></div>
          <template v-for="item in systemFields">
            <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
              <div><component-icon :type="item.type" />{{ item.name }}</div>
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
    <a-button class="add-button add-filter" style="margin-top: 20px; margin-left: 20px" type="text" @click="addFilterGroup">
      <PlusOutlined />
      筛选组
    </a-button>
    <div style="width: 100%; text-align: right; position: relative">
      <a-button v-if="showSave" class="save-button" @click="saveCondition" style="right: 14px">保存</a-button>
      <slot name="save-button" v-bind="{ saveable }"></slot>
    </div>

  </div>
</template>

<script lang="ts">
import type {FilterInfoType, FilterItem, FilterItemGroup, MatchType} from '../ts/type.definition';
import { ref, watchEffect, defineComponent, computed, watch, toRaw, nextTick } from 'vue';
import { pick } from 'lodash-es';
import { PlusOutlined, SearchOutlined, CloseOutlined, TableOutlined, SaveOutlined } from '@ant-design/icons-vue';
import { useDebounceFn } from '@vueuse/core';
import { useMessage } from '/@/hooks/web/useMessage';
import { systemFields, dontShowTypes } from '../ts/type.definition';
import { useFilterField, useComponentCondition } from '../ts/useFilterField';
import ComponentIcon from '/@/components/jeecg/super/desform/ComponentIcon.vue';
import SuperQueryValFilterCondition from "../components/SuperQueryValFilterCondition.vue";
import {MultipleQueryFilter} from "@/views/super/online/desform/multi/config";

export default defineComponent({
  name: 'AdvancedFilter',
  components: {
    MultipleQueryFilter,
    PlusOutlined,
    SearchOutlined,
    CloseOutlined,
    TableOutlined,
    SaveOutlined,
    ComponentIcon,
    SuperQueryValFilterCondition,
  },
  emits: ['save', 'copy', 'search', 'update:clear'],
  props: {
    // 表单设计器默认的列
    columnList: {
      type: Array,
      default: () => [],
    },
    info: {
      type: Object as PropType<FilterInfoType>,
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
    parentContainer: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const { getConditionOptions, getDefaultRule, getDefaultVal } = useComponentCondition();

    // QQYUN-3208 【视图】高级查询对控件的覆盖测试问题
    const filterColumnList = ref<any[]>([]);
    function initFilterColumnList(list) {
      if (!list || list.length == 0) {
        filterColumnList.value = [];
        return;
      }
      let arr = list.filter((item) => {
        if (dontShowTypes.includes(item.type) || dontShowTypes.includes(item.realType)) {
          // 他表字段特殊处理
          if (item.type == 'link-field' || item.realType === 'link-field') {
            // 只有存储类型为save的才能作为筛选条件
            return item.saveType === 'save';
          }
          return false;
        }
        return true;
      });
      filterColumnList.value = arr;
    }

    const showPop = ref(false);
    const conditionRelation = ref<MatchType>('and');
    const conditionsGroupList = ref<(FilterItemGroup & { showPop?: boolean })[]>([]);

    const { getSchema, getFieldConfig } = useFilterField(props, true, props.parentContainer);

    const { createMessage } = useMessage();

    watchEffect(() => {
      const cList: Recordable[] = props.columnList as any;
      initFilterColumnList(cList);
      const filterInfo = props.info;
      conditionRelation.value = filterInfo.conditionType?filterInfo.conditionType:'and';
      let conditionsGroup:any;
      if(Array.isArray(filterInfo.conditions) && filterInfo.conditions.length > 0){
        conditionsGroup = filterInfo.conditions;
      }else{
        conditionsGroup = filterInfo.conditionsGroup;
      }
      if (conditionsGroup && conditionsGroup.length>0) {
        let oldQuery = true;
        let superOldQueryItems: any = [];
        let filterQueryGroup: any = [];
        for (let groupItem of conditionsGroup) {
          let queryItems = groupItem.queryItems;
          if (queryItems && queryItems.length > 0) {
            let superQueryItems: any = [];
            for (const item of groupItem.queryItems) {
              let name = '', findColumn: Recordable | undefined;
              // 从用户自定义字段中查找
              findColumn = cList?.find((i) => i.model == item.field);
              if (!findColumn) {
                // 从系统字段中查找
                findColumn = systemFields.find((i) => i.field == item.field);
              }
              if (findColumn) {
                name = findColumn.name;
              }
              if (!name) {
                console.error('数据过滤条件失效，没找到与之匹配的字段', item);
              } else {
                let picked: FilterItem = pick(item, 'field', 'rule', 'val', 'type', 'timestamp');
                superQueryItems.push({
                  ...picked,
                  name,
                  reloading: false,
                });
              }
            }
            filterQueryGroup.push({
              matchType: groupItem.matchType,
              queryItems: superQueryItems,
            });
            oldQuery = false;
          }else{
            //兼容旧数据，旧数据不存在
            let name = '', findColumn: Recordable | undefined;
            // 从用户自定义字段中查找
            findColumn = cList?.find((i) => i.model == groupItem.field);
            if (!findColumn) {
              // 从系统字段中查找
              findColumn = systemFields.find((i) => i.field == groupItem.field);
            }
            if (findColumn) {
              name = findColumn.name;
            }
            if (!name) {
              console.error('数据过滤条件失效，没找到与之匹配的字段', groupItem);
            } else {
              let picked: FilterItem = pick(groupItem, 'field', 'rule', 'val', 'type', 'timestamp');
              superOldQueryItems.push({
                ...picked,
                name,
                reloading: false,
              });
            }
            oldQuery = true;
          }
          //兼容老数据
          if (oldQuery) {
            filterQueryGroup.push({
              matchType: groupItem.conditionType || 'and',
              queryItems: superOldQueryItems,
            });
          }
        }
        conditionsGroupList.value = filterQueryGroup;
      }else{
        conditionsGroupList.value = [];
      }
    });

    function onSelectField(item, conIndex = 0) {
      let field = item.field || item.model;
      let arr = conditionsGroupList.value[conIndex];
      let rule = getDefaultRule(item.type);
      let val = getDefaultVal(item.type);
      let queryItems: FilterItem[] = [];
      let queryItem: FilterItem = {
        ...pick(item, 'name', 'type', 'timestamp'),
        field,
        rule,
        val,
      };
      if (arr && arr.queryItems && arr.queryItems.length > 0) {
        let arrQueryItems = arr.queryItems;
        arrQueryItems.push({
          ...queryItem,
        });
        conditionsGroupList.value[conIndex].queryItems = arrQueryItems;
      } else if (arr) {
        queryItems.push({
          ...queryItem,
        });
        conditionsGroupList.value[conIndex].queryItems = queryItems;
      } else {
        queryItems.push({
          ...queryItem,
        });
        conditionsGroupList.value.push({
          matchType: 'and',
          queryItems: queryItems,
        });
      }
      if (conditionsGroupList.value[conIndex]) {
        conditionsGroupList.value[conIndex]['showPop'] = false;
      }
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

    // 处理高级查询的值
    function toVal(item: FilterItem) {
      let rawVal = toRaw(item.val)
      // 【TV360X-783】范围传逗号分割
      if (item.rule === 'range' && Array.isArray(rawVal)) {
        rawVal = rawVal.join(',')
      }
      return rawVal
    }

    //保存并执行查询条件
    function saveCondition() {
      let cGroups: FilterItemGroup[] = [];
      for (const groupItem of conditionsGroupList.value) {
        const newItems: FilterItem[] = [];
        for (const item of groupItem.queryItems) {
          if (isValidValue(item)) {
            const picked = pick(item, 'field', 'rule', 'type', 'timestamp');
            newItems.push({
              ...picked,
              val: toVal(item),
            });
          }
        }
        if (newItems.length > 0) {
          cGroups.push({
            ...groupItem,
            queryItems: newItems,
          });
        }
      }
      if (cGroups.length > 0) {
        emit('save', {
          conditions: null,
          conditionsGroup: cGroups,
          conditionType: conditionRelation.value?conditionRelation.value:'and',
        });
      } else {
        createMessage.warning('没有有效的条件值，不可保存！');
      }
    }

    /**
     * 复制筛选
     */ 
    function copyCondition() {
      let arr: any[] = [];
      for (let item of conditionsGroupList.value) {
        if(item.queryItems){
          const newItems: any = [];
          for (const subItem of item.queryItems) {
            if (isValidValue(subItem)) {
              let temp = pick(subItem, 'field', 'rule', 'type', 'timestamp');
              newItems.push({
                ...temp,
                val: toVal(subItem),
              });
            }
          }
          if(newItems.length>0){
            arr.push({
              ...item,
              queryItems: newItems,
            });
          }
        }else{
          if (isValidValue(item)) {
            let temp = pick(item, 'field', 'rule', 'type', 'timestamp');
            arr.push({
              ...temp,
              val: toVal(item),
            });
          }
        }
      }
      if (arr.length > 0) {
        emit('copy', {
          conditionsGroup: arr,
          conditionType: conditionRelation.value,
        });
      }
    }

    //移除条件
    function onRemove(conIndex,index) {
      let arr = conditionsGroupList.value[conIndex];
      arr.queryItems.splice(index, 1);
      conditionsGroupList.value[conIndex] = arr;
      if(conditionsGroupList.value.length === 1){
        if(conditionsGroupList.value[0].queryItems && conditionsGroupList.value[0].queryItems.length == 0){
          conditionsGroupList.value = [];
        }
      }
      emit('search', {
        conditions: [],
        conditionsGroup: conditionsGroupList.value,
        conditionType: conditionRelation.value,
      });
    }

    /**
     * 移除筛选组
     * @param conIndex
     */
    function onConRemove(conIndex) {
      let arr = conditionsGroupList.value;
      arr.splice(conIndex, 1);
      console.log("conditionsGroupList::::",conditionsGroupList.value.length)
      if (conditionsGroupList.value.length == 1) {
        //第一个没有筛选条件直接删除
        if (conditionsGroupList.value[0].queryItems.length == 0) {
          arr.splice(0, 1);
        }
      }
      emit('search', {
        conditions: [],
        conditionsGroup: conditionsGroupList.value,
        conditionType: conditionRelation.value,
      });
      if(conditionsGroupList.value.length == 0){
        emit('update:clear', false);
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
      let arr = conditionsGroupList.value;
      if (!arr || arr.length == 0) {
        return false;
      }
      for (const item of arr) {
        if(!item.queryItems || item.queryItems.length == 0){
           return false;
        }
      }
      return true;
    });

    const saveable = computed(() => {
      let arr = conditionsGroupList.value;

      if (!arr || arr.length == 0) {
        return false;
      }
      
      let flag = false;
      
      for (let i = 0; i < arr.length; i++) {
        if(arr[i].queryItems){
          if(arr[i].queryItems.length == 0){
             flag = false;
             break;
          }
          for (let j = 0; j < arr[i].queryItems.length; j++) {
            let field = arr[i].queryItems[j];
            if (isValidValue(field)) {
              flag = true;
            }else{
              flag = false;
              return flag;
            }
          }
        }else{
          if (isValidValue(arr[i])) {
            flag = true;
          } else {
            flag = false;
            break;
          }
        }
      }
      return flag;
    });

    watch(
        () => props.clear,
        (val) => {
          // clear 值改变，清空已有字段配置
          if (val === true) {
            conditionsGroupList.value = [];
            showPop.value = true;
          }
        },
        { immediate: true }
    );

    /**
     * val组件赋值
     */
    function setFormModel(key: string, value: any, item: any) {
      item['val'] = value;
    }

    /**
     * 获取条件下拉框选项
     * @param type
     */
    function getOptions(item) {
      const config = getFieldConfig(item.field);
      let type = item.type;
      let arr = getConditionOptions(type, config.multiple);
      if (!arr || arr.length == 0) {
        return [];
      }
      return arr;
    }

    function emitSearch() {
      let arr:any[] = []
      for (let items of conditionsGroupList.value) {
        let subItem:any[] = []
        for (const item of items.queryItems) {
          let temp = pick(item, 'field', 'rule','type', 'timestamp');
          subItem.push({
            ...temp,
            val: toVal(item)
          });
        }
        arr.push({
          queryItems:subItem,
          matchType: items.matchType
        });
      }
      
      if (arr.length > 0) {
        emit('search', {
          matchType: conditionRelation.value,
          conditionType: conditionRelation.value,
          conditionsGroup: arr,
        });
      }
    }
    const emitSearchDebounce = useDebounceFn(emitSearch, 800);
    watch(
        conditionsGroupList.value,
        () => {
          emitSearchDebounce();
        },
        { deep: true }
    );
    function onRelationChange() {
      emitSearchDebounce();
    }

    /**
     * 组件选中
     */
    function onConditionRuleChange(condition: FilterItem,conIndex) {
      condition.reloading = true;
      nextTick(() => {
        condition.reloading = false;
        if (conditionsGroupList.value[conIndex]) {
          conditionsGroupList.value[conIndex].showPop = false;
        }
      });

    }

    /**
     * 创建筛选组
     */
    function addFilterGroup() {
      if (conditionsGroupList.value.length == 0) {
        for (let i = 0; i < 2; i++) {
          addConditionList();
        }
      } else {
        addConditionList();
      }
    }

    /**
     * 添加筛选组
     */
    function addConditionList() {
      conditionsGroupList.value.push({
        matchType: 'and',
        showPop: false,
        queryItems: [],
      });
    }

    //显示隐藏
    const queryIndex = ref<string>('');
    /**
     * 子级查询显示删除图标
     * @param index
     */
    function mouseMoveQuery(index) {
      queryIndex.value = index;
    }

    /**
     * 子级查询隐藏删除图标
     */
    function mouseLeaveQuery() {
      queryIndex.value = '';
    }

    /**
     * 显示字段
     */
    function showPopField(index) {
      if (conditionsGroupList.value[index]) {
        conditionsGroupList.value[index].showPop = true;
      }
    }

    return {
      conditionsGroupList,
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
      addFilterGroup,
      queryIndex,
      mouseMoveQuery,
      mouseLeaveQuery,
      showPopField,
      onConRemove,
    };
  },
});
</script>

<style lang="less">
@import '../config/common';
</style>

<style lang="less" scoped>
.condition-select :deep(.ant-select-selector),
.condition-rela :deep(.ant-select-selector) {
  background: none !important;
}

:deep(.ant-select-selector){
  // update-begin--author:sunjianlei---date:20240430---for：修复筛选条件下的下拉框没有边框
  //box-shadow: none !important;
  //border: none !important;
  // update-end--author:sunjianlei---date:20240430---for：修复筛选条件下的下拉框没有边框
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
.add-filter {
  cursor: pointer;
  color: rgb(117, 117, 117);
  font-weight: bold;
}

.icon-children-show {
  cursor: pointer;
  visibility: visible;
  color: #757575;
  margin-right: 10px;
  &:hover {
    color: #2196f3;
  }
}

.icon-children-hide {
  visibility: hidden;
}
</style>
