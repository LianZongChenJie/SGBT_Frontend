<template>
  <div :class="prefixCls">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button @click="onAddRecord" type="primary" preIcon="ant-design:plus">新增</a-button>
        <!-- 批量操作 -->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="onDeleteBatch">
                <a-icon type="delete" />
                <span>删除</span>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            <span>批量操作</span>
            <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </template>

      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <DesformTempletModal @register="registerDesformModal" @success="onModalOk" />
    <FormDesignerIframeModal templet :isLowApp="false" @register="registerFormDesignerIframeModal" @success="reload" @close="reload" />
  </div>
</template>

<script lang="ts">
  import type { ActionItem } from '/@/components/Table';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { defineComponent } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { templet } from './desform.data';
  import { templetApi } from './desform.api';
  import DesformTempletModal from './components/DesformTempletModal.vue';
  import FormDesignerIframeModal from './components/FormDesignerIframeModal.vue';

  export default defineComponent({
    name: 'DesformTempletList',
    components: {
      BasicTable,
      TableAction,
      DesformTempletModal,
      FormDesignerIframeModal,
    },
    setup() {
      const ctx = useListPage({
        tableProps: {
          api: templetApi.list,
          columns: templet.columns,
          formConfig: {
            //labelWidth: 200,
            schemas: templet.searchFormSchemas,
          },
          actionColumn: {
            width: 200,
          },
        },
      });
      const { prefixCls, tableContext, doRequest, doDeleteRecord } = ctx;
      // 注册table数据
      const [registerTable, { reload, getDataSource }, { rowSelection, selectedRowKeys }] = tableContext;
      // 注册编辑弹窗
      const [registerDesformModal, desformModal] = useModal();
      // 注册设计表单弹窗
      const [registerFormDesignerIframeModal, formDesignerIframeModal] = useModal();

      function onModalOk() {
        reload();
      }

      /**
       * 新增表单
       */
      function onAddRecord() {
        desformModal.openModal(true, { isUpdate: false });
      }

      /**
       * 编辑表单
       */
      function onEditRecord(record, action = 'default') {
        desformModal.openModal(true, { isUpdate: true, record, action });
      }

      /** 删除单个表单*/
      async function onDelete(record) {
        if (record.children) {
          ctx.createErrorModal({ content: '请删除完所有的子视图以后再删除主视图！' });
        } else {
          doDeleteRecord(() => templetApi.delete(record.id));
        }
      }

      /** 打开设计表单 */
      function onOpenDesign(record) {
        formDesignerIframeModal.openModal(true, { record });
      }

      /** 批量删除 */
      function onDeleteBatch() {
        const getRecord = (id, data) => {
          for (let d of data) {
            if (d.id === id) {
              return d;
            }
            if (d.children) {
              return getRecord(id, d.children);
            }
          }
        };
        // 判断是否有包含子视图的表单，如果有就去掉选择
        let removeSelectKeys: any = [];
        selectedRowKeys.value.forEach((rowKey, rowIndex) => {
          let record = getRecord(rowKey, getDataSource());
          if (record && record.children) {
            removeSelectKeys.push(rowIndex);
          }
        });
        removeSelectKeys.reverse();
        for (let idx of removeSelectKeys) {
          selectedRowKeys.value.splice(idx, 1);
        }
        if (selectedRowKeys.value.length === 0) {
          ctx.createErrorModal({ content: '请删除完所有的子视图以后再删除主视图！' });
        } else {
          doRequest(() => templetApi.batchDelete(selectedRowKeys.value));
        }
      }

      /**
       * 操作栏
       */
      function getTableAction(record): ActionItem[] {
        return [
          {
            label: '编辑',
            onClick: () => onEditRecord(record),
          },
          {
            label: '设计模板',
            icon: 'ant-design:setting',
            onClick: () => onOpenDesign(record),
          },
        ];
      }

      /**
       * 下拉操作栏
       */
      function getDropDownAction(record): ActionItem[] {
        return [
          {
            label: '删除',
            popConfirm: {
              title: '确定要删除吗？',
              placement: 'left',
              confirm: () => onDelete(record),
            },
          },
        ];
      }

      return {
        prefixCls,
        rowSelection,
        selectedRowKeys,

        reload,
        onModalOk,
        onAddRecord,
        onDeleteBatch,
        getTableAction,
        getDropDownAction,

        registerTable,
        registerDesformModal,
        registerFormDesignerIframeModal,
      };
    },
  });
</script>

<style scoped></style>
