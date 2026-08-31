<template>
  <div class="inner-content">
    <div class="title">数据过滤</div>
    <div class="tip">添加筛选条件，限制出现在此视图中的记录</div>
    <div class="config-detail" style="width: 320px; padding-top: 0">
      <div class="condition-item" style="margin-top: 15px" v-for="(item, conIndex) in conditionList">
        <div style="display: flex" v-if="conIndex > 0">
          <a-divider style="margin: 0" v-if="conIndex === 1">
            <a-select style="width: 50px" size="small" v-model:value="conditionRelation">
              <a-select-option value="and">且</a-select-option>
              <a-select-option value="or">或</a-select-option>
            </a-select>
          </a-divider>
          <a-divider style="margin: 0" v-else>
            <span style="font-size: 13px">{{ conditionRelation === 'and' ? '且' : '或' }}</span>
          </a-divider>
          <div class="icon-remove" style="position: relative; top: 4px">
            <close-outlined @click.prevent="onConRemove(conIndex)"/>
          </div>
        </div>

        <div class="children-query" v-for="(condition, index) in item.queryItems" style="margin-top: 20px">
          <div style="display: flex" @mousemove="mouseMoveQuery(conIndex + '-' + index)" @mouseleave="mouseLeaveQuery">
            <div style="flex: 1">
              <component-icon :type="condition.type" style="color: rgb(158, 158, 158)" :data-idx="1" :item="condition"/>
              <span style="margin-right: 10px; max-width: 100px; font-weight: bold">{{ condition.name }}</span>
              <span class="condition-select">
                <a-select
                    :value="condition.rule"
                    size="small"
                    style="min-width: 70px"
                    :dropdownStyle="{ minWidth: '120px' }"
                    @change="(val) => onChangeConditionRule(condition, val)"
                >
                  <a-select-option
                      v-for="queryItem in getOptions(condition)"
                      :value="queryItem.value"
                  >
                    {{ queryItem.label }}
                  </a-select-option>
                </a-select>
              </span>
            </div>
            <div :class="queryIndex === conIndex + '-' + index ? 'icon-children-show' : 'icon-children-hide'">
              <close-outlined @click.prevent="onRemove(conIndex, index)"/>
            </div>
          </div>
          <div class="condition-val">
            <div style="width: calc(100% - 70px)">
              <div
                  v-if="condition.rule === 'linkage'"
                  class="condition-val-linkage-box"
                  @click="openLinkageModal(condition)"
              >
                <span>已配置 {{ condition.val?.['rules']?.['length'] }} 个条件</span>
              </div>
              <SuperQueryValFilterCondition
                  v-else
                  :index="index"
                  :condition="condition"
                  :getSchema="getSchema"
                  :setFormModel="setFormModel"
                  :scrollContainer="scrollContainer"
              />
            </div>
            <div class="condition-rela">
              <a-select
                  v-if="index === 0"
                  style="width: 50px"
                  size="small"
                  v-model:value="item.matchType"
                  @change="(val) => matchTypeChange(val, conIndex, index)"
              >
                <a-select-option value="and">且</a-select-option>
                <a-select-option value="or">或</a-select-option>
              </a-select>
              <span v-else style="color: rgb(117, 117, 117); display: inline-block; width: 40px">
                {{ item.matchType === 'and' ? '且' : '或' }}
              </span>
            </div>
          </div>
        </div>
        <a-popover
            overlayClassName="view-pop-field-select"
            v-model:open="popArr[conIndex].showPop"
            trigger="click"
            v-if="conditionList.length > 1"
        >
          <template #content>
            <div class="field-list">
              <template v-for="item in filterColumnList">
                <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item, conIndex)">
                  <div>
                    <component-icon :type="item.type" :data-idx="2" :item="item"/>
                    {{ item.name }}
                  </div>
                </div>
              </template>
              <div class="split"></div>
              <template v-for="item in systemFields">
                <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item, conIndex)">
                  <div>
                    <component-icon :type="item.type" :data-idx="3" :item="item"/>
                    {{ item.name }}
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template #title>
            <a-input placeholder="搜索字段" class="my-input" v-model:value="filterValue">
              <template #prefix>
                <search-outlined style="color: #c0c0c0"/>
              </template>
            </a-input>
          </template>
          <span class="add-button" style="margin-top: 20px; cursor: pointer" @click="showPopField(conIndex)">
            <PlusOutlined/>
            筛选
          </span>
        </a-popover>
      </div>
      <a-popover
          v-if="conditionList.length <= 1"
          overlayClassName="view-pop-field-select"
          v-model:open="showPop"
          trigger="click"
      >
        <template #content>
          <div class="field-list">
            <template v-for="item in filterColumnList">
              <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
                <div>
                  <component-icon :type="item.type" :data-idx="4" :item="item"/>
                  {{ item.name }}
                </div>
              </div>
            </template>
            <div class="split"></div>
            <template v-for="item in systemFields">
              <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
                <div>
                  <component-icon :type="item.type" :data-idx="5" :item="item"/>
                  {{ item.name }}
                </div>
              </div>
            </template>
          </div>
        </template>
        <template #title>
          <a-input placeholder="搜索字段" class="my-input" v-model:value="filterValue">
            <template #prefix>
              <search-outlined style="color: #c0c0c0"/>
            </template>
          </a-input>
        </template>
        <a-button class="add-button" style="margin-top: 20px">
          <PlusOutlined/>
          添加筛选条件
        </a-button>
      </a-popover>
      <a-button class="add-button" style="margin-top: 20px; margin-left: 20px" @click="addFilterGroup">
        <PlusOutlined/>
        筛选组
      </a-button>
      <div style="width: 100%; text-align: right; position: relative">
        <a-button
            v-if="conditionList.length > 0"
            @click="saveCondition"
            type="primary"
            style="color: #fff; border-radius: 20px; right: -38px; top: -33px"
        >
          <save-outlined/>
          保 存
        </a-button>
      </div>
    </div>

    <DesformDataLinkageModal v-if="showDataLinkage" ref="linkageModalRef" :desformCode="desformCode" />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, watchEffect} from 'vue';
import {CloseOutlined, PlusOutlined, SaveOutlined, SearchOutlined, TableOutlined} from '@ant-design/icons-vue';
import {
  dontShowTypes,
  FilterItem,
  FilterQueryGroup,
  systemFields
} from '/@/views/super/online/desform/multi/ts/type.definition';
import {pick} from 'lodash-es';
import {useComponentCondition, useFilterField} from '../ts/useFilterField';
import ComponentIcon from '/@/components/jeecg/super/desform/ComponentIcon.vue';
import { DesformDataLinkageModal } from '@/components/jeecg/super/desform';
import { useMessage } from '@/hooks/web/useMessage';
import SuperQueryValFilterCondition from "../components/SuperQueryValFilterCondition.vue";

/**
 * 数据过滤查询
 */
export default defineComponent({
  name: 'MultipleQueryGroupFilter',
  components: {
    PlusOutlined,
    SearchOutlined,
    CloseOutlined,
    TableOutlined,
    SaveOutlined,
    ComponentIcon,
    DesformDataLinkageModal,
    SuperQueryValFilterCondition,
  },
  emits: ['save'],
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
    desformCode: String,
    scrollContainer: HTMLDivElement,
  },
  setup(props, {emit}) {
    const { createMessage: $message } = useMessage();

    const {getSchema} = useFilterField(props);
    const {getConditionOptions, getDefaultRule, getDefaultVal} = useComponentCondition();
    //×显示隐藏
    const queryIndex = ref<string>('');
    const filterColumnList = ref<any[]>([]);

    const linkageModalRef = ref<InstanceType<typeof DesformDataLinkageModal>>();

    function initFilterColumnList(list) {
      if (!list || list.length == 0) {
        filterColumnList.value = [];
        return;
      }
      filterColumnList.value = list.filter((item) => {
        let dontShow = dontShowTypes.includes(item.type);
        if (dontShow) {
          // 【QQYUN-5376】他表字段，存储模式显示
          if (item.type === 'link-field') {
            return item.saveType === 'save';
          }
          return false;
        }
        return true;
      });
    }

    const showPop = ref(false);
    const conditionList = ref<FilterQueryGroup[]>([]);
    const conditionRelation = ref('and');
    const popArr = ref<any>([]);

    watchEffect(() => {
      let cList: any[] = props.columnList;
      initFilterColumnList(cList);
      let temp = props.info;
      console.log('temp：：', temp);
      conditionRelation.value = temp.matchType;
      if (temp.conditions && temp.conditions.length > 0) {
        let oldQuery = true;
        let superOldQueryItems: any = [];
        let queryList = temp.conditions;
        let filterQueryGroup: any = [];
        if (queryList && queryList.length > 0) {
          for (let item of queryList) {
            popArr.value.push({
              showPop: false,
            });
            let superQueryItems: any = [];
            let queryItems = item.queryItems;
            //新数据superQueryGroup包含
            if (queryItems && queryItems.length > 0) {
              for (const item of queryItems) {
                let a: FilterItem = pick(item, 'field', 'rule', 'val', 'type');
                let name = getQueryName(item.field, cList, item);
                if (!name) {
                  console.error('数据过滤条件失效，没找到与之匹配的字段', item);
                } else {
                  superQueryItems.push({
                    ...a,
                    name,
                  });
                }
              }
              filterQueryGroup.push({
                matchType: item.matchType,
                queryItems: superQueryItems,
              });
              oldQuery = false;
            } else {
              //兼容旧数据，旧数据不存在superQueryGroup
              let a: FilterItem = pick(item, 'field', 'rule', 'val', 'type');
              let name = getQueryName(item.field, cList, item);
              if (!name) {
                console.error('数据过滤条件失效，没找到与之匹配的字段', item);
              } else {
                superOldQueryItems.push({
                  ...a,
                  name,
                });
              }
              oldQuery = true;
            }
          }
          //兼容老数据
          if (oldQuery) {
            filterQueryGroup.push({
              matchType: temp.conditionType || 'and',
              queryItems: superOldQueryItems,
            });
          }
        }
        console.log('filterQueryGroup：：：', filterQueryGroup);
        conditionList.value = filterQueryGroup;
      } else {
        conditionList.value = [];
      }
    });

    /**
     * 获取筛选名称
     */
    function getQueryName(field, cList, item) {
      let name = '';

      if (cList && cList.length > 0) {
        let matchElements: any[] = cList.filter((i) => i.model == field);
        if (matchElements && matchElements.length > 0) {
          name = matchElements[0].name;
        }
      }
      if (!name) {
        let matchElements: any[] = systemFields.filter((i) => i.field == field);
        if (matchElements && matchElements.length > 0) {
          name = matchElements[0].name;
        }
      }
      if (!name) {
        console.error('数据过滤条件失效，没找到与之匹配的字段', item);
      } else {
        return name;
      }
    }

    /**
     * 选中字段触发事件
     */
    function onSelectField(item, conIndex = 0) {
      let field = item.field || item.model;
      let arr = conditionList.value[conIndex];
      let rule = getDefaultRule(item.type);
      let val = getDefaultVal(item.type);
      let queryItems: FilterItem[] = [];
      let queryItem: FilterItem = {
        field,
        rule,
        val,
        type: item.type,
        name: item.name,
        multiple: item.multiple,
      };
      if (arr && arr.queryItems && arr.queryItems.length > 0) {
        let arrQueryItems = arr.queryItems;
        arrQueryItems.push({
          ...queryItem,
        });
        conditionList.value[conIndex].queryItems = arrQueryItems;
      } else if (arr) {
        queryItems.push({
          ...queryItem,
        });
        conditionList.value[conIndex].queryItems = queryItems;
      } else {
        queryItems.push({
          ...queryItem,
        });
        conditionList.value.push({
          matchType: 'and',
          queryItems: queryItems,
        });
      }
      if (popArr.value[conIndex]) {
        popArr.value[conIndex]['showPop'] = false;
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

    //保存并执行查询条件
    function saveCondition() {
      console.log('conditionList.value:::', conditionList.value);
      if (conditionList.value.length > 0) {
        if (conditionList.value.length == 1) {
          let queryItems = conditionList.value[0].queryItems;
          let matchType = conditionList.value[0].matchType;
          emit('save', {
            conditionType: matchType,
            conditions: queryItems,
          });
        } else {
          emit('save', {
            matchType: conditionRelation.value,
            conditions: conditionList.value,
          });
        }
      }
    }

    // 是否渲染查询工作表弹窗
    const showDataLinkage = computed(() => {
      const currentConditions = conditionList.value.flatMap((item) => item.queryItems);
      const find = currentConditions.find((item) => ['link-record'].includes(item.type!));
      return find != null;
    });

    // 改变条件规则事件
    function onChangeConditionRule(condition: FilterItem, val: string) {
      if (val === 'linkage') {
        openLinkageModal(condition);
      } else {
        condition.rule = val;
      }
    }

    // 打开查询工作表弹窗
    function openLinkageModal(condition: FilterItem){
      const find = props.columnList.find((item: Recordable) => item.model === condition.field) as Recordable;
      if (!find) {
        $message.warning('字段不存在');
        return;
      }
      linkageModalRef.value?.open({
        desformCode: find.code,
        needSystemFields: true,
        widgetKey: find.key,
        widgetKeys: [],
        rules: condition.val?.['rules'],
        callback: (data: Recordable) => {
          condition.rule = 'linkage';
          condition.val = data;
        },
      });
    }

    //移除条件
    function onRemove(conIndex, index) {
      let arr = conditionList.value[conIndex];
      arr.queryItems.splice(index, 1);
      conditionList.value[conIndex] = arr;
      if (conditionList.value.length == 1 && conditionList.value[0].queryItems.length == 0) {
        conditionRelation.value = 'and';
        emit('save', {
          matchType: conditionRelation.value,
          conditionType: conditionRelation.value,
          conditions: [],
        });
      }
    }

    /**
     * 移除筛选组
     */
    function onConRemove(conIndex) {
      let arr = conditionList.value;
      arr.splice(conIndex, 1);
      if (conditionList.value.length == 0) {
        //第一个没有筛选条件直接删除
        if (conditionList.value[0].queryItems.length == 0) {
          arr.splice(0, 1);
        }
      }
      if (arr.length == 0) {
        conditionRelation.value = 'and';
        emit('save', {
          matchType: conditionRelation.value,
          conditionType: conditionRelation.value,
          conditions: [],
        });
      }
    }

    /**
     * 获取条件下拉框选项
     * @param condition
     */
    function getOptions(condition: FilterItem) {
      const {type, multiple} = condition
      let arr = getConditionOptions(type!, multiple, true);
      if (!arr || arr.length == 0) {
        return [];
      }
      return arr;
    }

    /**
     * val组件赋值
     */
    function setFormModel(_key: string, value: any, item: any) {
      item['val'] = value;
    }

    /**
     * 设置匹配类型
     * @param value
     * @param conIndex
     * @param _index
     */
    function matchTypeChange(value, conIndex, _index) {
      let condition = conditionList.value[conIndex];
      condition.matchType = value;
    }

    /**
     * 创建筛选组
     */
    function addFilterGroup() {
      if (conditionList.value.length == 0) {
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
      popArr.value.push({
        showPop: false,
      });
      conditionList.value.push({
        matchType: 'and',
        queryItems: [],
      });
    }

    /**
     * 显示字段
     */
    function showPopField(index) {
      if (popArr.value[index]) {
        popArr.value[index]['showPop'] = true;
      }
    }

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

    return {
      linkageModalRef,
      conditionList,
      systemFields,
      showPop,
      filterValue,
      onSelectField,
      isFilterItem,
      saveCondition,
      showDataLinkage,
      openLinkageModal,
      onChangeConditionRule,
      onRemove,
      getOptions,
      getSchema,
      setFormModel,
      filterColumnList,
      matchTypeChange,
      addFilterGroup,
      onConRemove,
      queryIndex,
      mouseMoveQuery,
      mouseLeaveQuery,
      popArr,
      showPopField,
      conditionRelation,
    };
  },
});
</script>

<style lang="less" scoped>
@import './common';

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

.condition-val-linkage-box {
  width: 100%;
  height: 32px;
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  cursor: pointer;
  color:  #333333;
  font-size: 14px;

  &:hover {
    border-color: @primary-color;
  }
}
</style>
