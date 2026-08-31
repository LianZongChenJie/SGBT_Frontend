<template>
  <div style="padding: 10px" class="box">
    <a-card>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane :key="1" tab="全部任务"></a-tab-pane>
        <a-tab-pane :key="2" tab="我的任务"></a-tab-pane>
      </a-tabs>
      <BasicTable :rowSelection="rowSelection" @register="registerTable">
        <template #tableTitle>
          <a-button
            v-if="hasPermission('operation:operation_inspection_task:execute')"
            type="primary"
            preIcon="ant-design:play-circle-outlined"
            :disabled="!canExecuteSelected"
            @click="handleSelectedExecute"
          >
            执行任务
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_inspection_task:adjust')"
            type="primary"
            preIcon="ant-design:edit-outlined"
            :disabled="!canAdjustSelected"
            @click="handleSelectedAdjust"
          >
            调整任务
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_inspection_task:exportXls')"
            preIcon="ant-design:export-outlined"
            type="primary"
            @click="handleExportXls('巡检任务', getExportUrl, exportParams)"
          >
            导出
          </a-button>
          <!--        <j-upload-button v-if="hasPermission('operation:operation_inspection_point_plan:importExcel')" type="primary" @click="onImportXls">导入计划</j-upload-button>-->

          <!--        <a-upload :customRequest="(file) => handleImportXls(file, getImportUrl, reload)" :showUploadList="false" name="file">-->
          <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入计划</a-button>-->
          <!--        </a-upload>-->
          <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
          <!--          下载模版-->
          <!--        </a-button>-->
        </template>
        <template #action="{ record }">
          <TableAction :actions="getActions(record)" />
        </template>
      </BasicTable>

      <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="handleReload" />
      <DemoModalDetail :isDisabled="isDisabled" @register="registerModalDetail" @success="handleReload" />
      <DemoModalZx :isDisabled="isDisabled" @register="registerModalZx" @success="handleReload" />
    </a-card>
  </div>
</template>
<script lang="ts" name="yuanchengcaozuojilu" setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import DemoModal from './DemoModal.vue';
  import DemoModalZx from './DemoModalZhixing.vue';
  import DemoModalDetail from './DemoModalDetail.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { filterObj } from '/@/utils/common/compUtils';
  import { canAdjustTask, canExecuteTask } from '../taskWorkflow';
  const { hasPermission } = usePermission();
  import { useMethods } from '@/hooks/system/useMethods';

  const { handleExportXls } = useMethods();
  import { getDemoList, deleteDemo, getExportUrl } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerModalDetail, { openModal: openModalDetail }] = useModal();
  const [registerModalZx, { openModal: openModalZx }] = useModal();
  const isDisabled = ref(false);
  const checkedKeys = ref<Array<string | number>>([]);
  const selectedRows = ref<Record<string, any>[]>([]);
  const activeKey = ref(1);
  const [registerTable, { reload, getDataSource, getForm }] = useTable({
    title: '',
    api: getDemoList,
    columns,
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      autoAdvancedCol: 3,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    //自定义默认排序
    defSort: {
      // column: 'createTime,sex',
      // order: 'desc',
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      title: '序号',
      width: 60,
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    beforeFetch: (params) => {
      return {
        ...params,
        bizType: 2,
        tabType: activeKey.value,
      };
    },
    actionColumn: {
      width: 110,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '查看',
        icon: 'ant-design:eye-outlined',
        onClick: handleDetail.bind(null, record),
      },
      // {
      //   label: '删除',
      //   popConfirm: {
      //     title: '是否确认删除',
      //     confirm: handleDelete.bind(null, record),
      //   },
      //   auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      //
      // },
    ];
  }

  const selectedRecord = computed(() => {
    if (checkedKeys.value.length !== 1) {
      return null;
    }
    if (selectedRows.value.length === 1) {
      return selectedRows.value[0];
    }
    const selectedKey = checkedKeys.value[0];
    return getDataSource<Record<string, any>>().find((item) => String(item?.id) === String(selectedKey)) ?? null;
  });

  const canExecuteSelected = computed(() => {
    if (!selectedRecord.value) {
      return false;
    }
    return canExecuteTask(selectedRecord.value.status);
  });

  const canAdjustSelected = computed(() => {
    if (!selectedRecord.value) {
      return false;
    }
    return canAdjustTask(selectedRecord.value.status);
  });

  const rowSelection = computed(() => ({
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys.value,
    onChange: onSelectChange,
    fixed: 'left',
  }));
  const exportParams = computed(() => {
    let paramsForm: Record<string, unknown> = {
      ...(getForm()?.getFieldsValue?.() || {}),
      bizType: 2,
      tabType: activeKey.value,
    };
    if (checkedKeys.value && checkedKeys.value.length > 0) {
      paramsForm['selections'] = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });
  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], rows: Record<string, any>[] = []) {
    checkedKeys.value = selectedRowKeys;
    selectedRows.value = rows;
  }

  function getSingleSelectedRecord(actionLabel: string) {
    if (checkedKeys.value.length === 0) {
      createMessage.warning(`请先勾选一条任务后再${actionLabel}`);
      return null;
    }
    if (checkedKeys.value.length > 1 || selectedRows.value.length > 1) {
      createMessage.warning(`${actionLabel}时只能选择一条任务`);
      return null;
    }
    return selectedRecord.value;
  }

  function handleSelectedExecute() {
    const record = getSingleSelectedRecord('执行');
    if (!record) {
      return;
    }
    if (!canExecuteTask(record.status)) {
      createMessage.warning('当前任务状态不支持执行');
      return;
    }
    handleZhixing(record);
  }

  function handleSelectedAdjust() {
    const record = getSingleSelectedRecord('调整');
    if (!record) {
      return;
    }
    if (!canAdjustTask(record.status)) {
      createMessage.warning('当前任务状态不支持调整');
      return;
    }
    handleEdit(record);
  }

  /**
   * 新增事件
   */
  function handleZhixing(record) {
    isDisabled.value = false;
    openModalZx(true, {
      record,
      isUpdate: true,
      disabled: false,
    });
  }

  /**
   * 编辑事件
   */
  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
      disabled: false,
    });
  }

  /**
   * 详情页面
   */
  function handleDetail(record) {
    isDisabled.value = true;
    openModalDetail(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, handleReload);
  }

  function resetSelection() {
    checkedKeys.value = [];
    selectedRows.value = [];
  }

  function handleReload() {
    resetSelection();
    reload();
  }

  onMounted(() => {
    watch(
      () => activeKey.value,
      () => {
        resetSelection();
        reload({ page: 1 }); // 切 tab 回到第一页
      },
      { deep: true, immediate: false }
    );
  });
</script>
<style lang="less" scoped>
  .box {
    :deep(.ant-card-body) {
      padding-top: 0;
    }
  }

  .jeecg-basic-table-form-container {
    padding: 0;

    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
