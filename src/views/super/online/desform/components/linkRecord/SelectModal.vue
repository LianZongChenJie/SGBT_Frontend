<template>
  <BasicModal
    @register="register"
    :canFullscreen="false"
    title="选择记录"
    :width="800"
    centered
    destroyOnClose
    :getContainer="getContainer"
    wrapClassName="link-record-select-modal"
  >
    <a-input placeholder="搜索关键字" class="my-input" v-model:value="filterValue" @pressEnter="()=>onLoadData()" @change="onChangeFilter">
      <template #prefix>
        <SearchOutlined style="color: #c0c0c0" />
      </template>
    </a-input>

    <div class="link-record-select-list" :style="{ height: maxHeight + 'px' }">
      <template v-for="data in dataList">
        <div :class="getDataItemClass(data)" @click="(e) => onSelect(e, data)">
          <div class="selected-icon">
            <CheckOutlined />
          </div>
          <div class="title ellipsis-text">
            {{ getTitle(data) }}
          </div>
          <div class="others" v-for="field in showFieldList">
            <div class="label ellipsis-text">
              {{ field.title }}
            </div>
            <div class="value">
              <component v-if="isComponent(field, data)" :is="getComponentValue(data.desformData, field.model)" />
              <div v-else-if="field.compType == 'imgupload'">
                <TableImage :text="getFieldValue(data.desformData, field.model)" />
              </div>
              <div v-else-if="field.compType == 'file-upload'">
                <card-cell-file :text="getFieldValue(data.desformData, field.model)" />
              </div>
              <div v-else-if="field.compType=='sub-table-design'">
                <sub-table-tag :text="getFieldValue(data.desformData, field.name)"/>
              </div>

              <a-tooltip
                v-else-if="field.compType == 'color' && data.desformData[field.model]"
                placement="top"
                :title="getFieldValue(data.desformData, field.model)"
                :getPopupContainer="(node) => node?.parentNode"
              >
                <div :style="{ width: '20px', height: '20px', backgroundColor: getFieldValue(data.desformData, field.model) }"></div>
              </a-tooltip>
              <span v-else>{{ getFieldValue(data.desformData, field.model) }} </span>
            </div>
          </div>
        </div>
      </template>
      <a-empty v-if="dataList.length == 0" />
    </div>

    <template #footer>
      <div style="display: flex; justify-content: space-between; width: 100%">
        <div class="page-info">
          <a-pagination v-model:current="pageNo" size="small" :total="totalRecord" show-quick-jumper @change="onPageChange" />
        </div>
        <div>
          <a-button @click="onCancel">取 消</a-button>
          <a-button type="primary" @click="onOk">确 定</a-button>
        </div>
      </div>
    </template>
  </BasicModal>
</template>

<script lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { SearchOutlined, CheckOutlined } from '@ant-design/icons-vue';

  import { Pagination } from 'ant-design-vue';
  const APagination = Pagination;
  import { ref, toRaw, defineComponent } from 'vue';
  import { useCardData } from './useCardData';
  import TableImage from '../../auto/components/TableImage.vue';
  import SubTableTag from '../../auto/components/SubTableTag.vue';
  import CardCellFile from '../../auto/components/CardCellFile.vue';

  export default defineComponent({
    name: 'SelectModal',
    components: {
      BasicModal,
      APagination,
      SearchOutlined,
      CheckOutlined,
      TableImage,
      CardCellFile,
      SubTableTag
    },
    props: {
      code: {
        type: String,
        default: '',
      },
      titleField: {
        type: String,
        default: '',
      },
      showFields: {
        type: Array,
        default: () => [],
      },
      multi: {
        type: Boolean,
        default: false,
      },
      getContainer: {
        type: Function,
        default: null,
      },
    },
    emits: ['selected', 'register'],
    setup(props, { emit }) {
      const { pageNo, totalRecord, dataList, filterValue, onLoadData, showFieldList, getFieldValue, getComponentValue, isComponent, onChangeFilter } =
        useCardData(props, true);
      // 弹窗事件
      const [register, { closeModal }] = useModalInner((data) => {
        let list = data.list;
        // value-label
        console.log('打开选择弹窗, 已选记录>', list);
        if (list.length > 0) {
          selectedId.value = list.map((item) => item.value);
          selectedRows.value = list;
        } else {
          selectedId.value = [];
          selectedRows.value = [];
        }
      });

      const selectedId = ref<string[]>([]);
      const selectedRows = ref<any[]>([]);

      function onSelect(e, data) {
        e.preventDefault();
        e.stopPropagation();
        let arr = selectedId.value;
        let index = arr.indexOf(data.id);
        if (index >= 0) {
          //已经有了 移除
          arr.splice(index, 1);
          selectedId.value = arr;
          removeOne(data, index);
        } else {
          // 如果没有则添加
          if (props.multi === false) {
            selectedId.value = [data.id];
          } else {
            arr.push(data.id);
            selectedId.value = arr;
          }
          addOne(data);
        }
      }

      function onPageChange() {
        onLoadData();
      }

      function onOk() {
        let arr = toRaw(selectedRows.value);
        emit('selected', arr);
        closeModal();
      }
      function onCancel() {
        closeModal();
      }

      const maxHeight = ref(300);
      maxHeight.value = window.innerHeight - 200;

      function getTitle(data) {
        return data.desformData[props.titleField];
      }

      function removeOne(data, index) {
        let rows = selectedRows.value;
        let row = rows[index];
        if (row.id === data.id) {
          rows.splice(index, 1);
        } else {
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].id === data.id) {
              index = i;
              break;
            }
          }
          rows.splice(index, 1);
        }
        selectedRows.value = rows;
      }

      function addOne(data) {
        let rows = selectedRows.value;
        if (props.multi === false) {
          rows = [];
        }
        let label = getTitle(data);
        rows.push({ value: data.id, label });
        selectedRows.value = rows;
      }

      function getDataItemClass(data) {
        let arr = selectedId.value;
        if (arr.indexOf(data.id) >= 0) {
          return 'data-item selected';
        }
        return 'data-item';
      }

      return {
        getDataItemClass,
        register,
        pageNo,
        totalRecord,
        onPageChange,
        onCancel,
        onOk,
        onLoadData,
        filterValue,
        dataList,
        maxHeight,
        getTitle,
        onSelect,
        onChangeFilter,

        showFieldList,
        getFieldValue,
        isComponent,
        getComponentValue
      };
    },
  });
</script>

<style lang="less">
  .link-record-select-modal {
    .link-record-select-list {
      margin-top: 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      padding-right: 2px;
      .data-item {
        padding: 10px;
        margin: 2px 2px 8px 2px;
        position: relative;
        border-radius: 3px;
        background-color: #fff;
        cursor: pointer;
        border: 1px solid transparent;
        -webkit-box-shadow: 0 1px 4px 0 rgb(0 0 0 / 12%), 0 0 2px 0 rgb(0 0 0 / 12%);
        box-shadow: 0 1px 4px 0 rgb(0 0 0 / 12%), 0 0 2px 0 rgb(0 0 0 / 12%);
        &:hover {
          background-color: #f5f7fa;
        }

        .title {
          font-weight: 500;
          font-size: 14px;
          line-height: 20px;
          color: #333;
          margin-bottom: 8px;
        }
        .ellipsis-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .others {
          display: flex;
          -webkit-box-orient: horizontal;
          -webkit-box-direction: normal;
          flex-direction: row;
          font-size: 12px;
          line-height: 28px;
        }
        .label {
          max-width: 160px;
          color: #9e9e9e;
          padding-right: 1em;
        }
        .value {
          -webkit-box-flex: 1;
          -ms-flex: 1 1 0px;
          flex: 1 1 0;
          height: 28px;
          overflow: hidden;
          white-space: nowrap;
        }
        .selected-icon {
          border-color: #2096f3 #2096f3 transparent transparent;
          border-style: solid;
          border-width: 17px;
          color: #fff;
          display: none;
          font-size: 18px;
          height: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: 0;
          z-index: 2;
        }
        &.selected {
          border-color: #2096f3;
          .selected-icon {
            display: inline-block;
            .anticon {
              position: absolute;
              right: -17px;
              top: -15px;
            }
          }
        }
      }
    }
    .depart-select {
      .ant-select-selector {
        color: #fff !important;
        background-color: #409eff !important;
        border-radius: 5px !important;
      }
      .ant-select-selection-item,
      .ant-select-arrow {
        color: #fff !important;
      }
    }
    .my-search {
      position: absolute;
      top: 14px;
      z-index: 1;
      &.all-width {
        width: 100%;
      }

      .anticon {
        cursor: pointer;
        &:hover {
          color: #0a8fe9 !important;
        }
      }
      .hidden {
        display: none;
      }
    }

    .my-tabs {
    }

    .selected-users {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      padding-top: 15px;
    }

    .scroll-container {
      padding-bottom: 0 !important;
    }
  }
</style>
