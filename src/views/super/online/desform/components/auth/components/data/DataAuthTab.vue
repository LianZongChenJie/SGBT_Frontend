<template>
  <BasicTable @register="registerTable">
    <template #tableTitle>
      <a-button @click="onAddRecord" type="primary" preIcon="ant-design:plus">新增</a-button>
    </template>

    <template #switch="{ record }">
      <a-switch size="small" :loading="record.loading" :checked="record.status === 1" @change="onUpdateStatus(record)" />
    </template>

    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
    </template>
  </BasicTable>
  <DataAuthModal @register="registerModal" :desformRecord="desformRecord" @success="reload" />
  <SettingAuthModal @register="registerSettingAuthModal" @save="onAuthSave" />
</template>

<script lang="ts">
  import { ActionItem, BasicTable, TableAction } from '/@/components/Table';
  import { defineComponent, watch } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { dataAuth } from '../../auth.data';
  import { dataAuthApi } from '../../auth.api';
  import { useDesformAuth } from '../../hooks/useDesformAuth';
  import DataAuthModal from './DataAuthModal.vue';
  import SettingAuthModal from '../SettingAuthModal.vue';

  export default defineComponent({
    name: 'DesformIndex',
    components: {
      BasicTable,
      TableAction,
      DataAuthModal,
      SettingAuthModal,
    },
    props: {
      visible: propTypes.bool.def(false),
      desformRecord: propTypes.any.isRequired,
    },
    setup(props) {
      const ctx = useListPage({
        tableProps: {
          immediate: false,
          api: (params) => dataAuthApi.list(params, props.desformRecord?.desformCode),
          columns: dataAuth.columns,
          showTableSetting: false,
          tableSetting: { setting: false, size: false },
          formConfig: {
            //labelWidth: 200,
            schemas: dataAuth.searchFormSchemas,
            baseColProps: { xs: 24, sm: 9, md: 9, lg: 9, xl: 9, xxl: 9 },
            actionColOptions: { xs: 24, sm: 6, md: 6, lg: 6, xl: 6, xxl: 6 },
          },
          actionColumn: {
            width: 120,
          },
        },
      });
      const { tableContext, doDeleteRecord } = ctx;
      // 注册table数据
      const [registerTable, { reload }, {}] = tableContext;
      // 注册modal
      const [registerModal, { openModal }] = useModal();
      const [registerSettingAuthModal, settingAuthModal] = useModal();

      const { doUpdateStatus } = useDesformAuth(props);

      watch(
        () => props.visible,
        () => {
          if (props.visible && props.desformRecord) {
            reload();
          }
        },
        { immediate: true }
      );

      function onAddRecord() {
        openModal(true, { isUpdate: false });
      }

      function onEditRecord(record) {
        openModal(true, { isUpdate: true, record });
      }

      function onDelete(record) {
        doDeleteRecord(() => dataAuthApi.delete(record.id));
      }

      function onUpdateStatus(record) {
        doUpdateStatus((p) => dataAuthApi.updateStatus(p), record);
      }

      async function onAuthSave({ formData, resolve }) {
        resolve(await dataAuthApi.saveOrUpdate(formData, true));
        reload();
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
        ];
      }

      /**
       * 下拉操作栏
       */
      function getDropDownAction(record): ActionItem[] {
        return [
          {
            label: '授权',
            onClick: () => settingAuthModal.openModal(true, { record }),
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
        registerTable,
        registerModal,
        registerSettingAuthModal,

        reload,
        onAuthSave,
        onAddRecord,
        onUpdateStatus,
        getTableAction,
        getDropDownAction,
      };
    },
  });
</script>

<style scoped lang="less">
  .@{namespace}-basic-table {
    // 查询区域的最后一个按钮没有边距
    :deep(.ant-form-item-control-input-content button:last-child){
      margin: 0;
    }
  }
</style>
