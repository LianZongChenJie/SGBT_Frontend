<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <!--站点编辑弹窗-->
  <SiteModal @register="registerModal" @success="reload" />
</template>
<script lang="ts" name="site-list" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import SiteModal from './components/siteModal.vue';
  import { useModal } from '/@/components/Modal';
  import { columns } from './site.data';
  import { list, getExportUrl, getImportUrl } from './site.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  const [registerModal, { openModal }] = useModal();
  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      api: list,
      columns: columns,
      useSearchForm: false,
      actionColumn: {
        width: 120,
      },
    },
    exportConfig: {
      name: 'cms站点列表',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });
  const [registerTable, { reload }, { rowSelection }] = tableContext;

  /**
   * 编辑
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
    });
  }
  /**
   * 详情
   */
  async function handleDetail(record) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: false,
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
</script>
