<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    width="900px"
    :height="800"
    @ok="ok"
    @cancel="closeModal"
    @visible-change="visibleChange"
    :closable="false"
  >
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane tab="Online表单" key="1">
        <BasicTable @register="registerOnlineTable" :rowSelection="rowOnlineSelection"></BasicTable>
      </a-tab-pane>
      <a-tab-pane tab="设计表单" key="2">
        <BasicTable @register="registerTable" :rowSelection="rowSelection"></BasicTable>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { queryDesFormList, queryOnlineList } from '../appdes.api';

  const emit = defineEmits(['choose' ,'register']);
  const activeKey = ref('1');
  const [registerModal, { closeModal }] = useModalInner();
  //表格
  const columns = [
    {
      title: '表名/自定义表单CODE',
      dataIndex: 'desformCode',
      align: 'center',
    },
    {
      title: '表名称',
      dataIndex: 'desformName',
      align: 'center',
    },
    {
      title: '流程名称',
      dataIndex: 'procName',
      align: 'center',
    },
  ];
  //表格配置
  const tableConfig = {
    columns,
    useSearchForm: false,
    showTableSetting: false,
    showActionColumn: false,
    rowSelection: { type: 'radio' },
    size: 'middle',
    canResize: false,
    clickToRowSelect: true,
  };
  // onlineTable列表 配置
  const { tableContext: tableOnlineContext } = useListPage({
    tableProps: {
      api: queryOnlineList,
      ...tableConfig,
    },
  });
  const [registerOnlineTable, {}, { rowSelection: rowOnlineSelection, selectedRowKeys: selectedOnlineRowKeys, selectedRows: selectedOnlineRows }] =
    tableOnlineContext;
  // 表单设计table列表 配置
  const { tableContext } = useListPage({
    tableProps: {
      api: queryDesFormList,
      ...tableConfig,
    },
  });
  const [registerTable, {}, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;

  /**
   * 提交确认方法
   */
  function ok() {
    let selected = unref(activeKey) == '1' ? unref(selectedOnlineRows) : unref(selectedRows);
    if (selected.length > 0) {
      let code = selected[0].desformCode;
      let prefix = unref(activeKey) == '1' ? '/app/online/' : '/app/desform/';
      emit('choose', `${prefix}${code}`);
    }
    closeModal();
    onClearSelected();
  }

  /**
   * 清除表格选项
   */
  function onClearSelected() {
    selectedOnlineRows.value = [];
    selectedRows.value = [];
    selectedOnlineRowKeys.value = [];
    selectedRowKeys.value = [];
  }

  /**
   * modal显示隐藏方法
   */
  function visibleChange() {
    activeKey.value = '1';
    onClearSelected();
  }
</script>
