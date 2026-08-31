<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <template #form-remindType="{ model, field }">
      <a-select placeholder="请选择提醒类型" mode="multiple" v-model:value="model[field]">
        <a-select-option value="1">邮件</a-select-option>
        <a-select-option value="2">短信</a-select-option>
        <a-select-option value="4">系统消息</a-select-option>
      </a-select>
    </template>
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchHandleDelete">
              <Icon icon="ant-design:delete-outlined"></Icon>
              删除
            </a-menu-item>
          </a-menu>
        </template>
        <a-button
          >批量操作
          <Icon icon="mdi:chevron-down"></Icon>
        </a-button>
      </a-dropdown>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <!--计划编辑弹窗-->
  <PlanModal ref="planRef" @success="reload" />
</template>
<script lang="ts" name="plan-list" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import PlanModal from './components/PlanModal.vue';
  import { columns, searchFormSchema } from './plan.data';
  import { queryMyPlan, deletePlan, batchDeletePlan, getExportUrl, getImportUrl } from './plan.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  const planRef = ref();
  // 列表页面公共参数、方法
  const { prefixCls, tableContext, onImportXls, onExportXls } = useListPage({
    designScope: 'plan-template',
    tableProps: {
      title: '日常计划列表',
      api: queryMyPlan,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      handleSearchInfoFn(info) {
        if (info.remindType && (info.remindType instanceof Array) && info.remindType.length > 0 ) {
          info.remindType = info.remindType.join(',');
        }
        return info;
      },
      actionColumn: {
        width: 120,
      },
      rowSelection: null,
    },
    exportConfig: {
      name: '日常计划列表',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 新增
   */
  function handleCreate() {
    planRef.value.show({
      isUpdate: false,
    });
  }
  /**
   * 编辑
   */
  function handleEdit(record: Recordable) {
    planRef.value.show({
      record,
      isUpdate: true,
    });
  }
  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deletePlan({ id: record.id }, reload);
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeletePlan({ ids: selectedRowKeys.value }, reload);
  }
  /**
   * 操作栏
   * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }
</script>
