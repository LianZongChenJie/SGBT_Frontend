<template>
  <BasicTable @register="registerTable">
    <template #switch="{ record }">
      <a-switch size="small" :loading="record.loading" :checked="record.status === 1" @change="onUpdateStatus(record)" />
    </template>

    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <SettingAuthModal @register="registerSettingAuthModal" @save="onAuthSave" />
</template>

<script lang="ts">
  import type { ActionItem } from '/@/components/Table';
  import { defineComponent, watch } from 'vue';
  import { pick } from 'lodash-es';
  import { propTypes } from '/@/utils/propTypes';
  import { useModal } from '/@/components/Modal';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { buttonAuth } from '../../auth.data';
  import { buttonAuthApi } from '../../auth.api';
  import { useDesformAuth } from '../../hooks/useDesformAuth';
  import DataAuthModal from '../data/DataAuthModal.vue';
  import SettingAuthModal from '../SettingAuthModal.vue';

  export default defineComponent({
    name: 'ButtonAuthTab',
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
          api: (params) => buttonAuthApi.list(params, props.desformRecord?.desformCode),
          columns: buttonAuth.columns,
          showTableSetting: false,
          tableSetting: { setting: false, size: false },
          useSearchForm: false,
          pagination: false,
          actionColumn: {
            width: 80,
          },
        },
      });
      const { tableContext } = ctx;
      // 注册table数据
      const [registerTable, { reload }, {}] = tableContext;
      // 注册modal
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

      async function onAuthSave({ formData, resolve }) {
        resolve(
          await buttonAuthApi.saveOrUpdate(
            {
              ...pick(formData, 'id', 'authField', 'authScopeIsAll', 'authScopeDepartsVal', 'authScopeUsersVal', 'authScopeRolesVal'),
              desformId: props.desformRecord.id,
              desformCode: props.desformRecord.desformCode,
            },
            true
          )
        );
        reload();
      }

      function onUpdateStatus(record) {
        doUpdateStatus((p) => buttonAuthApi.updateStatus(p), record, { authField: record.authField });
      }

      /**
       * 操作栏
       */
      function getTableAction(record): ActionItem[] {
        return [
          {
            label: '授权',
            onClick: () => settingAuthModal.openModal(true, { record }),
          },
        ];
      }

      return {
        registerTable,
        registerSettingAuthModal,

        getTableAction,
        onAuthSave,
        onUpdateStatus,
      };
    },
  });
</script>

<style scoped></style>
