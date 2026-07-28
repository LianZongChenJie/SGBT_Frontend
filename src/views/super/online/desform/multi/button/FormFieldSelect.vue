<template>
  <div class="button-form-field-config">
    <template v-if="myList.length > 0">
      <a-divider />
      <table>
        <colgroup>
          <col style="width: 180px;" />
          <col style="width: 110px;" />
          <col style="" />
          <col style="width: 50px;" />
        </colgroup>
        <thead>
          <tr>
            <th style="padding-left: 8px">字段</th>
            <th style="padding-left: 8px">属性</th>
            <th style="padding-left: 8px">默认值</th>
            <th></th>
          </tr>
        </thead>
      </table>
      <div ref="scrollRef" style="max-height: 440px; overflow-y: auto;">
        <table>
          <tbody>
            <tr v-for="(condition, index) of conditions">
              <td>
                <div class="field-name">{{ getFieldLabel(condition.key) }}</div>
              </td>
              <td>
                <a-select style="width: 100px" v-model:value="myList[index].attr">
                  <a-select-option value="readonly">只读</a-select-option>
                  <a-select-option value="">填写</a-select-option>
                  <a-select-option value="required">必填</a-select-option>
                </a-select>
              </td>
              <td>
  <!--              <a-input v-model:value="item.defaultVal" style="width: 250px; margin: 0 10px" placeholder="请输入" />-->
                <div style="width: 230px; margin: 0 10px">
                  <SuperQueryValFilterCondition
                      :condition="condition"
                      :getSchema="getSchema"
                      :setFormModel="setFormModel"
                      :scrollContainer="$refs.scrollRef as HTMLDivElement"
                  />
                </div>
              </td>
              <td>
                <DeleteOutlined class="field-remove" @click="(e) => onRemove(e, index)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <a-popover overlayClassName="view-pop-field-select2" v-model:open="showPop" trigger="click">
      <template #content>
        <div class="field-list">
          <template v-for="item in selectList">
            <div class="field-item" v-if="isFilterItem(item)" @click="onSelectField(item)">
              <div style="display: flex">
                <div style="line-height: 32px">
                  <a-switch v-model:checked="item.selectedItem" size="small" @click="(c, e) => onClickSwitch(e, item)" />
                </div>
                <div style="margin-left: 10px">{{ item.name }}</div>
              </div>
            </div>
          </template>
        </div>
      </template>
      <template #title>
        <a-input placeholder="搜索字段" class="my-input" v-model:value="filterValue">
          <template #prefix>
            <SearchOutlined style="color: #c0c0c0" />
          </template>
        </a-input>
      </template>
      <div class="add-field-button">
        <PlusOutlined style="margin-right: 5px" />
        选择填写字段
      </div>
    </a-popover>
  </div>
</template>

<script lang="ts">
  /**
   * 打开的表单中字段选择控件
   */
  import { SearchOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { ref, inject, watch, watchEffect, toRaw, reactive, computed } from 'vue';
  import type { Ref } from 'vue';
  import { useComponentCondition, useFilterField } from "../ts/useFilterField";
  import SuperQueryValFilterCondition from "../components/SuperQueryValFilterCondition.vue";

  export default {
    name: 'FormFieldSelect',
    components: {
      SuperQueryValFilterCondition,
      DeleteOutlined,
      SearchOutlined,
      PlusOutlined,
    },
    props: {
      dbFieldList: {
        type: Array,
        default: () => [],
      },
      formTable: {
        type: String,
        default: '',
      },
      linkRecordColumnList: {
        type: Array,
        default: () => [],
      },
      linkRecordField: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const showPop = ref(false);
      // name-key-model
      const columnList = inject('globalColumnList') as Ref<any[]>;
      const selectList = ref<any[]>([]);

      const filterFieldProps = reactive<Recordable>({});
      watchEffect(() => {
        if (props.formTable === 'link-record' && Array.isArray(props.linkRecordColumnList)) {
          filterFieldProps.columnList = props.linkRecordColumnList;
        } else {
          filterFieldProps.columnList = columnList.value;
        }
      });

      const { getSchema } = useFilterField(filterFieldProps);

      watchEffect(() => {
        if (props.formTable === 'current') {
          if (columnList) {
            let arr = columnList.value;
            let list: any[] = [];
            if (arr && arr.length > 0) {
              for (let item of arr) {
                list.push({
                  ...item,
                  selectedItem: false,
                });
              }
              selectList.value = list;
            } else {
              selectList.value = [];
            }
          } else {
            selectList.value = [];
          }
        } else if (props.formTable === 'link-record') {
          if (props.linkRecordColumnList) {
            let arr = props.linkRecordColumnList;
            let list: any[] = [];
            if (arr && arr.length > 0) {
              for (let item of arr) {
                let rawObj = toRaw(item);
                list.push({
                  ...rawObj,
                  selectedItem: false,
                });
              }
              selectList.value = list;
            } else {
              selectList.value = [];
            }
          } else {
            selectList.value = [];
          }
        }
      });

      watch(columnList, () => {}, { deep: true, immediate: true });

      watch(
        () => props.linkRecordField,
        () => {
          myList.value = [];
        }
      );

      watch(
        () => props.formTable,
        (val) => {
          if (val == 'current') {
            myList.value = [];
          }
        }
      );

      // 字段名-属性-默认值
      const myList = ref<any[]>([]);
      watch(
        () => props.dbFieldList,
        (list) => {
          console.log('--按钮表单字段改变--',list)
          if (!list || list.length == 0) {
            myList.value = [];
          } else {
            let arr: any[] = [];
            for (let item of list) {
              arr.push({ ...item });
            }
            myList.value = arr;
          }
        },
        { deep: true, immediate: true }
      );

      const { getDefaultVal } = useComponentCondition();

      const conditions = computed(() => {
        if (myList.value && myList.value.length > 0) {
          let arr = myList.value;
          let list: any[] = [];
          for (let item of arr) {
            let condition = reactive({
              key: item.key,
              field: item.field,
              model: item.model,
              name: item.name,
              type: item.type,
              attr: item.attr,
              rule: '',
              val: item.defaultVal,
            })
            if (!condition.type) {
              let find = selectList.value.find((v) => v.key === condition.key);
              if (find) {
                condition.name = find.name;
                condition.type = find.type;
                condition.model = find.model;
                condition.field = condition.model;
              }
            }
            let defaultVal = getDefaultVal(condition.type);
            // 默认值
            if (!condition.val || condition.val.length == 0) {
              condition.val = defaultVal;
            } else {
              if (typeof defaultVal == 'number') {
                condition.val = Number(condition.val);
              } else if (Array.isArray(defaultVal)) {
                condition.val = condition.val.split(',');
              }
            }
            list.push(condition);
          }
          return list;
        }
        return [];
      });

      /**
       * val组件赋值
       */
      function setFormModel(index: number, value) {
        myList.value[index].defaultVal = Array.isArray(value) ? value.join(',') : value;
        conditions.value[index].val = value;
      }

      function onClickSwitch(e, item) {
        e.preventDefault();
        e.stopPropagation();
        onStatueChange(item);
      }

      function onStatueChange(item) {
        let status = item.selectedItem;
        let arr = myList.value;
        let field = item.key;
        if (status === true) {
          arr.push({
            key: field,
            attr: item.required===true?'required':'',
            defaultVal: '',
            type: item.type,
            field: item.model,
            model: item.model,
            name: item.name,
          });
          myList.value = arr;
        } else {
          let index = -1;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].key === field) {
              index = i;
            }
          }
          if (index >= 0) {
            arr.splice(index, 1);
            myList.value = arr;
          }
        }
      }

      function onSelectField(item) {
        let status = item.selectedItem;
        if (status === true) {
          // 由true 转 false  取消选中
          item.selectedItem = false;
        } else {
          // 由 false转 true  选中
          item.selectedItem = true;
        }
        onStatueChange(item);
        //   showPop.value = false;
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
      function getFieldLabel(field) {
        if (props.formTable === 'current') {
          if (columnList) {
            let list: any[] = columnList.value;
            let arr = list.filter((item) => item.key === field);
            if (arr.length > 0) {
              return arr[0].name;
            } else {
              console.error('该字段被修改，请重新配置', field);
            }
          }
          return field;
        } else {
          if (props.linkRecordColumnList) {
            let list: any[] = toRaw(props.linkRecordColumnList);
            let arr = list.filter((item) => item.key === field);
            if (arr.length > 0) {
              return arr[0].name;
            } else {
              console.error('该字段被修改，请重新配置', field);
            }
          }
          return field;
        }
      }

      function onRemove(e, index) {
        e.preventDefault();
        e.stopPropagation();
        let arr = myList.value;
        arr.splice(index, 1);
        myList.value = arr;
      }

      function getFieldListData() {
        let list = myList.value;
        let arr: any[] = [];
        for (let item of list) {
          arr.push({ ...item });
        }
        return arr;
      }
      return {
        showPop,
        columnList,
        onSelectField,
        filterValue,
        isFilterItem,
        getFieldLabel,
        myList,
        conditions,
        getSchema,
        setFormModel,
        onRemove,
        selectList,
        onClickSwitch,
        getFieldListData,
      };
    },
  };
</script>

<style lang="less">
  .button-form-field-config {
    .field-name {
      background: #f8f8f8;
      border-radius: 4px;
      height: 36px;
      width: 170px;
      line-height: 36px;
      padding: 0 8px 0 10px;
      margin: 2px 10px 2px 0px;
    }
    .field-remove {
      cursor: pointer;
      &:hover {
        color: red;
      }
    }
    .add-field-button {
      background: #f8f8f8;
      border-radius: 4px;
      box-sizing: border-box;
      color: #2196f3;
      cursor: pointer;
      display: inline-block;
      height: 36px;
      line-height: 36px;
      margin-top: 10px;
      padding: 0 17px;
      &:hover {
        background: #f5f5f5;
      }
    }
  }

  .view-pop-field-select2 {
    width: 250px;
    .ant-popover-title {
      padding-left: 5px;
      padding-right: 5px;

      .my-input {
        border: none !important;
      }
    }

    .ant-popover-inner-content {
      padding: 10px 0;
    }

    .field-list {
      max-height: 320px;
      overflow-y: auto;

      .field-item {
        width: 100%;
        height: 36px;
        line-height: 36px;
        padding-left: 15px;
        cursor: pointer;

        &:hover {
          background: rgb(245, 245, 245);
          border-radius: 4px;
        }

        > div {
          box-sizing: border-box;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
          overflow: hidden;
        }
      }

      .split {
        border-top: 1px solid rgb(221, 221, 221);
        margin: 8px 0px;
      }
    }

    .all-fields {
      max-height: 270px;
      overflow-y: auto;
      width: 280px;

      .field {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        padding: 6px;
        cursor: pointer;

        > div:first-child {
          flex: 1;
        }

        .icon {
          width: 30px;
          display: none;
          color: #979797;

          &:hover {
            color: #2196f3;
          }
        }

        &:hover {
          background-color: #f5f5f5;

          .icon {
            display: block;
          }
        }
      }
    }
  }
</style>
