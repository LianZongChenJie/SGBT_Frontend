<template>
  <div class="app-container">
    <a-row type="flex" :gutter="10" style="max-height: 800px">
      <a-col :xl="4" :lg="24" :md="24" style="margin-bottom: 10px">
        <DepartLeftTree ref="leftTree" @select="onTreeSelect" />
      </a-col>
      <a-col :xl="20" :lg="24" :md="24" style="margin-bottom: 10px">
        <BasicTable @register="registerTable">
<!--          <template #tableTitle>-->
<!--            <span class="table-title-tip">当前页面按接口文档仅支持查询和设置排班。</span>-->
<!--          </template>-->
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
        </BasicTable>
        <DemoModal @register="registerModal" @success="reload" :isDisabled="isDisabled" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="paibanguanli">
  import { ref } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import DemoModal from './DemoModal.vue';
  import { getDemoList } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';
  import DepartLeftTree from './components/DepartLeftTree.vue';

  const { hasPermission } = usePermission();
  const orgCode = ref('A01');
  const isDisabled = ref(false);
  const [registerModal, { openModal }] = useModal();

  const [registerTable, { reload }] = useTable({
    title: '人员排班',
    api: getDemoList,
    columns,
    formConfig: {
      schemas: searchFormSchema,
    },
    beforeFetch(params) {
      return {
        ...params,
        orgCode: orgCode.value,
      };
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'employeeId',
    actionColumn: {
      width: 140,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  function getActions(record) {
    return [
      {
        label: '设置排班',
        onClick: handleEdit.bind(null, record),
        auth: 'operation:operation_plan_duty:add',
      },
    ];
  }

  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  function onTreeSelect(data) {
    orgCode.value = data.orgCode;
    reload();
  }
</script>

<style scoped lang="less">
  .app-container {
    padding: 10px;
  }

  .table-title-tip {
    color: #8c8c8c;
  }
</style>
