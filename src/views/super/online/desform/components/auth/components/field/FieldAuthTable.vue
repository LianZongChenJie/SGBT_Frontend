<template>
  <div>
    <div style="padding: 0 10px 10px;">
      <a-input-search v-model:value="keywords" placeholder="筛选权限名称"/>
    </div>
    <BasicTable @register="registerTable" :dataSource="getDataSource" @tableRedo="onTableRedo">
      <!-- 批量操作 -->
      <template #alertAfter>
        <a-divider type="vertical"/>
        <a-popconfirm :title="`确定要删除这 ${selectedRowKeys.length} 项吗?`" placement="bottom" @confirm="onBatchDelete">
          <a>批量删除</a>
        </a-popconfirm>
      </template>

      <template #switch="{ record }">
        <a-switch size="small" :loading="record.loading" :checked="record.status === 1" @change="onUpdateStatus(record)"/>
      </template>

      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"/>
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts">
  import type { ActionItem } from '/@/components/Table';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { ref, computed, defineComponent } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { fieldAuth } from '../../auth.data';
  import DataAuthModal from '../data/DataAuthModal.vue';
  import {buttonAuthApi} from "../../auth.api";
  import {useDesformAuth} from "../../hooks/useDesformAuth";

  export default defineComponent({
    name: 'FieldAuthTable',
    components: {
      BasicTable,
      TableAction,
      DataAuthModal,
    },
    props: {
      desformRecord: propTypes.any.isRequired,
      dataSource: {
        type: Array as () => Recordable[],
        default: () => ([]),
      },
    },
    emits: ['reload', 'delete', 'auth'],
    setup(props, { emit }) {
      const { doUpdateStatus } = useDesformAuth(props);

      const keywords = ref('');
      const getDataSource = computed(() => {
        if (!keywords.value) {
          return props.dataSource;
        }
        return props.dataSource.filter((item) => item.authTitle.includes(keywords.value));
      });

      const ctx = useListPage({
        tableProps: {
          columns: fieldAuth.columns,
          tableSetting: { setting: false, size: false },
          showTableSetting: false,
          useSearchForm: false,
          pagination: false,
          canResize: false,
          actionColumn: {
            width: 120,
          },
        },
      });
      const { tableContext } = ctx;
      // 注册table数据
      const [registerTable, {}, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;

      function onTableRedo() {
        emit('reload');
      }

      function onBatchDelete() {
        let authComKeys = selectedRows.value.map((item) => item.authComKey).join(',');
        emit('delete', [authComKeys, batchDeleteCallback]);
      }

      function batchDeleteCallback() {
        selectedRows.value = [];
        selectedRowKeys.value = [];
      }

      // 更新状态
      function onUpdateStatus(record: Recordable) {
        doUpdateStatus((p) => buttonAuthApi.updateFieldStatus(p), record, {authComKey: record.authComKey});
      }

      /**
       * 操作栏
       */
      function getTableAction(record): ActionItem[] {
        return [
          {
            label: '授权',
            disabled: record.status == 0,
            onClick: () => emit('auth', record),
          },
          // {
          //   label: '删除',
          //   popConfirm: {
          //     title: '确定要删除吗？',
          //     placement: 'left',
          //     confirm: () => emit('delete', [record.authComKey]),
          //   },
          // },
        ];
      }

      return {
        registerTable,
        onTableRedo,
        onBatchDelete,
        onUpdateStatus,
        keywords,
        getDataSource,
        rowSelection,
        selectedRowKeys,
        getTableAction,
      };
    },
  });
</script>

<style scoped></style>
