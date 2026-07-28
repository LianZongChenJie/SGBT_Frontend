<template>
  <div class="inner-content">
    <div class="title">数据过滤</div>
    <div class="tip">添加筛选条件，限制出现在此视图中的记录</div>
    <div class="config-detail" style="width: 320px; padding-top: 0">
      <div class="condition-item" style="margin-top: 25px;" v-for="(condition, index) in conditionList">
        <div style="display: flex">
          <div style="flex: 1">
            <component-icon :type="condition.type" style="color: rgb(158, 158, 158)"/>
            <span style="margin-right: 10px; max-width: 100px;font-weight: bold">{{ condition.name }}</span>
            <span class="condition-select">
              <a-select style="min-width: 70px" size="small" v-model:value="condition.rule" :dropdownStyle="{minWidth: '100px'}">
                <a-select-option v-for="item in getOptions(condition.type)" :value="item.value">{{ item.label }}</a-select-option>
              </a-select>
            </span>
          </div>
          <div class="icon-remove">
            <close-outlined @click.prevent="onRemove(index)" />
          </div>
        </div>
        <div class="condition-val">
          <div style="width: calc(100% - 70px)">
            <online-super-query-val-component
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
          <div class="condition-rela" >
            <a-select v-if="index == 0" style="width: 50px" size="small" v-model:value="conditionRelation">
              <a-select-option value="and">且</a-select-option>
              <a-select-option value="or">或</a-select-option>
            </a-select>
            <span v-else style="color: rgb(117, 117, 117); display: inline-block; width: 40px">
              {{conditionRelation=='and'?'且': '或'}}
            </span>
          </div>
        </div>
      </div>

      <a-popover overlayClassName="view-pop-field-select" v-model:open="showPop" trigger="click">
        <template #content>
          <div class="field-list">
            <template v-for="item in filterColumnList">
              <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
                <div><component-icon :type="item.type"/>{{ item.name }}</div>
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
        <a-button class="add-button" style="margin-top: 20px">
          <PlusOutlined />
          添加筛选条件
        </a-button>
      </a-popover>

      <div style="width: 100%; text-align: right; position: relative">
        <a-button
          v-if="conditionList.length > 0"
          @click="saveCondition"
          type="primary"
          style="color: #fff; border-radius: 20px; position: absolute; right: 45px; top: -33px"
        >
          <save-outlined />保 存
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { ref, watchEffect, defineComponent } from 'vue';
  import { PlusOutlined, SearchOutlined, CloseOutlined, TableOutlined, SaveOutlined } from '@ant-design/icons-vue';
  import { FilterItem, systemFields, dontShowTypes } from '/@/views/super/online/desform/multi/ts/type.definition';
  import { pick } from 'lodash-es';
  import OnlineSuperQueryValComponent from '/@/views/super/online/cgform/auto/comp/superquery/SuperQueryValComponent.vue';
  import { useFilterField, useComponentCondition } from '../ts/useFilterField';
  import ComponentIcon from "/@/components/jeecg/super/desform/ComponentIcon.vue";

  /**
   * 数据过滤查询
   */
  export default defineComponent({
    name: 'Shujuguolv',
    components: {
      PlusOutlined,
      SearchOutlined,
      CloseOutlined,
      TableOutlined,
      OnlineSuperQueryValComponent,
      SaveOutlined,
      ComponentIcon
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
    },
    setup(props, { emit }) {
      const { getSchema } = useFilterField(props);
      const { getConditionOptions, getDefaultRule, getDefaultVal } = useComponentCondition();

      // QQYUN-3208 【视图】高级查询对控件的覆盖测试问题
      const filterColumnList = ref<any[]>([]);
      function initFilterColumnList(list) {
        if(!list || list.length==0){
          filterColumnList.value = [];
          return;
        }
        let arr = list.filter(item=> {
          let dontShow = dontShowTypes.includes(item.type)
          if (dontShow) {
            // 【QQYUN-5376】他表字段，存储模式显示
            if (item.type === 'link-field') {
              return item.saveType === 'save'
            }
            return false;
          }
          return true;
        })
        filterColumnList.value = arr;
      }
      
      const showPop = ref(false);
      const conditionRelation = ref('and');
      const conditionList = ref<FilterItem[]>([]);

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
                let a: FilterItem = pick(item, 'field', 'rule', 'val', 'type');
                arr.push({
                  ...a,
                  name,
                });
              }
            }
          }
        }
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
          let temp = pick(item, 'field', 'rule', 'val', 'type');
          /*     if(temp.val){
            if(temp.val instanceof Array){
              temp.val = temp.val.join(',')
            }
          }*/
          arr.push(temp);
        }
        if (arr.length > 0) {
          emit('save', {
            conditions: arr,
            conditionType: conditionRelation.value,
          });
        }
        //let superQueryParams = encodeURI(JSON.stringify(arr));
        //superQueryParams '[{"field":"radio_1663236052490_232483","rule":"eq","val":0,"type":"list"}]'
        // matchType
      }

      //移除条件
      function onRemove(index) {
        console.log('remove', index);
        let arr = conditionList.value;
        arr.splice(index, 1);
        conditionList.value = arr;

        if (arr.length == 0) {
          emit('save', {
            conditions: [],
            conditionType: conditionRelation.value,
          });
        }
      }

      /**
       * 获取条件下拉框选项
       * @param type
       */
      function getOptions(type) {
        let arr = getConditionOptions(type);
        if (!arr || arr.length == 0) {
          return [];
        }
        return arr;
      }

      /**
       * val组件赋值
       */
      function setFormModel(key: string, value: any, item: any) {
        console.log('setFormModel', key, value);
        // formModel[key] = value;
        item['val'] = value;
      }

      return {
        conditionList,
        conditionRelation,
        systemFields,
        showPop,
        filterValue,
        onSelectField,
        isFilterItem,
        saveCondition,
        onRemove,
        getOptions,
        getSchema,
        setFormModel,
        filterColumnList
      };
    },
  });
</script>

<style lang="less" scoped>
  @import './common';
</style>
