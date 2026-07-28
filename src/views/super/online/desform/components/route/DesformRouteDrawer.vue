<template>
  <div>
    <BasicDrawer v-bind="getProps">
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

        <template #switch="{ record }">
          <a-switch size="small" :loading="record.loading" :checked="record.status === 1" @change="onUpdateStatus(record)" />
        </template>

        <!--操作栏-->
        <template #action="{ record }">
          <TableAction :actions="getTableAction(record)" />
        </template>
      </BasicTable>
    </BasicDrawer>
    <RouteModal :desformId="desformId" :desformCode="desformCode" @register="registerModal" @success="reload" />
  </div>
</template>

<script lang="ts">
  import type { DrawerProps } from '/@/components/Drawer';
  import type { ActionItem } from '/@/components/Table';
  import { ref, defineComponent, computed, unref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { cloneDeep } from 'lodash-es';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { formApi, pageApi } from './route.api';
  import { columns, searchFormSchemas } from './route.data';
  import RouteModal from './RouteModal.vue';

  export default defineComponent({
    name: 'DesformRouteDrawer',
    components: {
      BasicDrawer,
      BasicTable,
      TableAction,
      RouteModal,
    },
    emits: ['register'],
    setup(props) {
      const attrs = useAttrs();
      // 表单model
      const model = ref<Recordable>();
      const desformId = computed(() => model.value?.id);
      const desformCode = computed(() => model.value?.desformCode);
      // 注册弹窗
      const [registerDrawer, { closeDrawer }] = useDrawerInner(open);
      // 弹窗最终props
      const getProps = computed(() => {
        let drawerProps: Partial<DrawerProps> = {
          width: 800,
          title: '下一步路由配置',
        };
        let finalProps: Recordable = {
          ...unref(attrs),
          ...drawerProps,
          ...props,
          onOk: close,
          onCancel: close,
          onRegister: registerDrawer,
        };
        return finalProps;
      });
      const ctx = useListPage({
        tableProps: {
          api: (params) => pageApi.list(desformCode.value, params),
          immediate: false,
          columns,
          formConfig: {
            //labelWidth: 200,
            schemas: searchFormSchemas,
            baseColProps: { xs: 24, sm: 9, md: 9, lg: 9, xl: 9, xxl: 9 },
            actionColOptions: { xs: 24, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 },
          },
          actionColumn: {
            width: 120,
          },
          showTableSetting:false,
          tableSetting: { setting: false, size: false },
        },
      });
      const { tableContext, doRequest, doDeleteRecord } = ctx;
      // 注册table数据
      const [registerTable, { reload, setLoading, getForm }, { rowSelection, selectedRowKeys }] = tableContext;
      // 注册 form modal
      const [registerModal, { openModal }] = useModal();

      /** 弹窗开启 */
      async function open(data) {
        model.value = cloneDeep(data?.record);
        await getForm().resetFields();
        selectedRowKeys.value = [];
      }

      /** 弹窗关闭 */
      function close() {
        closeDrawer();
      }

      function onAddRecord() {
        openModal(true, { isUpdate: false });
      }

      /** 删除单个表单*/
      async function onDelete(record) {
        doDeleteRecord(() => pageApi.delete(record.id));
      }

      function onDeleteBatch() {
        doRequest(() => pageApi.batchDelete(selectedRowKeys.value));
      }

      async function onUpdateStatus(record) {
        setLoading(true);
        try {
          let params = {
            id: record.id,
            status: record.status === 1 ? 0 : 1,
            desformId: desformId.value,
            desformCode: desformCode.value,
          };
          await formApi.saveOrUpdate(params, true, { successMessageMode: 'none' });
          reload();
        } finally {
          setLoading(true);
        }
      }

      /**
       * 操作栏
       */
      function getTableAction(record): ActionItem[] {
        return [
          {
            label: '编辑',
            onClick: () => openModal(true, { isUpdate: true, record }),
          },
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
        reload,
        getProps,
        desformId,
        desformCode,
        selectedRowKeys,

        onAddRecord,
        onDeleteBatch,
        onUpdateStatus,
        getTableAction,

        rowSelection,
        registerTable,
        registerModal,
      };
    },
  });
</script>

<style scoped lang="less">
  :deep(.@{namespace}-basic-table-form-container){
    padding: 0 !important;
  }

  .@{namespace}-basic-table {
    // 查询区域的最后一个按钮没有边距
    :deep(.ant-form-item-control-input-content button:last-child){
      margin: 0;
    }
  }
</style>
