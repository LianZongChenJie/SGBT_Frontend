<template>
  <div style="padding: 10px" class="box">
    <a-card>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane :key="1" tab="全部计划"></a-tab-pane>
        <a-tab-pane :key="2" tab="我的计划"></a-tab-pane>
        <a-tab-pane :key="3" tab="我的审核"></a-tab-pane>
      </a-tabs>
      <BasicTable :rowSelection="rowSelection" @register="registerTable">
        <template #tableTitle>
          <a-button
            v-if="hasPermission('operation:operation_inspection_plan:add')"
            preIcon="ant-design:plus-outlined"
            type="primary"
            @click="handleAdd"
            >新增
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_inspection_plan:adjust')"
            preIcon="ant-design:edit-outlined"
            type="primary"
            :disabled="!canAdjustSelected"
            @click="handleSelectedAdjust"
            >调整计划
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_inspection_plan:cancel')"
            preIcon="ant-design:undo-outlined"
            type="primary"
            :disabled="!canCancelSelected"
            @click="handleSelectedCancel"
            >撤销
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_inspection_plan:cancel')"
            preIcon="ant-design:check-circle-outlined"
            type="primary"
            :disabled="!canOpenSelected"
            @click="handleSelectedOpen"
            >开启
          </a-button>
          <a-button
            v-if="hasPermission('operation:operation_inspection_plan:audit')"
            preIcon="ant-design:safety-certificate-outlined"
            type="primary"
            :disabled="!canAuditSelected"
            @click="handleSelectedAudit"
            >审核
          </a-button>
          <!--        <a-button    preIcon="ant-design:plus-outlined" type="primary" @click="handleDetail">查看</a-button>-->
          <a-button
            v-if="hasPermission('operation:operation_inspection_plan:exportXls')"
            preIcon="ant-design:export-outlined"
            type="primary"
            @click="handleExportXls('点检计划', getExportUrl, exportParams)"
            >导出
          </a-button>
          <!--            <a-button v-if="hasPermission('operation:operation_inspection_point_plan:exportTemplate')"  type="primary" @click="onExportXls">下载模版</a-button>-->
          <!--            <j-upload-button v-if="hasPermission('operation:operation_inspection_point_plan:importExcel')" type="primary" @click="onImportXls">导入计划</j-upload-button>-->

          <!--        <a-upload :customRequest="(file) => handleImportXls(file, getImportUrl, reload)" :showUploadList="false" name="file">-->
          <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入计划</a-button>-->
          <!--        </a-upload>-->
          <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
          <!--          下载模版-->
          <!--        </a-button>-->
          <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('operation:operation_inspection_plan:deleteBatch')">
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="hasPermission('operation:operation_inspection_plan:deleteBatch')" @click="batchHandleDelete">
                  <Icon icon="ant-design:delete-outlined" />
                  批量删除
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              批量操作
              <Icon icon="ant-design:down-outlined" />
            </a-button>
          </a-dropdown>
        </template>
        <template #action="{ record }">
          <TableAction :actions="getActions(record)" />
        </template>
      </BasicTable>
      <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="handleReload" />
      <DemoModalEdit :isDisabled="isDisabled" @register="registerModalEdit" @success="handleReload" />
      <DemoModalShenhe :isDisabled="isDisabled" @register="registerModalShenhe" @success="handleReload" />
      <DemoModalDetail :isDisabled="isDisabled" @register="registerModalDetail" @success="handleReload" />
    </a-card>
  </div>
</template>

<script setup lang="ts" name="xunjiandianjian">
  import { computed, onMounted, ref, watch } from 'vue';
  import { Modal } from 'ant-design-vue';
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import DemoModalEdit from './DemoModalEdit.vue';
  import DemoModalShenhe from './DemoModalShenhe.vue';
  import DemoModalDetail from './DemoModalDetail.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { filterObj } from '/@/utils/common/compUtils';
  import { useMethods } from '@/hooks/system/useMethods';
  import { getDemoList, deleteDemo, batchDeleteDemo, getExportUrl, getImportUrl, saveKaiqiChexiao } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  const { hasPermission } = usePermission();
  const { handleExportXls } = useMethods();

  const [registerModal, { openModal }] = useModal();
  const [registerModalEdit, { openModal: openModalEdit }] = useModal();
  const [registerModalShenhe, { openModal: openModalShenhe }] = useModal();
  const [registerModalDetail, { openModal: openModalDetail }] = useModal();
  const isDisabled = ref(false);
  const activeKey = ref(1);
  const checkedKeys = ref<Array<string | number>>([]);
  const selectedRows = ref<Record<string, any>[]>([]);

  function resetSelection() {
    checkedKeys.value = [];
    selectedRows.value = [];
  }

  const [registerTable, { reload, setProps, getDataSource, getForm }] = useTable({
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
        bizType: 1,
        tabType: activeKey.value,
      };
    },
    actionColumn: {
      width: 250,
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
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'operation:operation_inspection_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        auth: 'operation:operation_inspection_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    fixed: 'left',
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

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

  const canAdjustSelected = computed(() => !!selectedRecord.value);

  // 撤销：选中1条且审核状态为待审核(1)时可用
  const canCancelSelected = computed(() => {
    return !!selectedRecord.value && Number(selectedRecord.value.reviewStatus) === 1;
  });

  // 开启：选中1条且审核状态为已关闭(6)时可用
  const canOpenSelected = computed(() => {
    return !!selectedRecord.value && Number(selectedRecord.value.reviewStatus) === 6;
  });

  // 审核通过/驳回：选中1条且审核状态不是已审核(3)时可用
  const canAuditSelected = computed(() => {
    return !!selectedRecord.value && Number(selectedRecord.value.reviewStatus) !== 3;
  });

  const exportParams = computed(() => {
    const paramsForm: Record<string, unknown> = {
      ...(getForm()?.getFieldsValue?.() || {}),
      bizType: 1,
      tabType: activeKey.value,
    };
    if (checkedKeys.value.length > 0) {
      paramsForm.selections = checkedKeys.value.join(',');
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

  function handleSelectedAdjust() {
    if (!selectedRecord.value) {
      return;
    }
    handleEditTiaozheng(selectedRecord.value);
  }

  /**
   * 撤销事件
   */
  function handleSelectedCancel() {
    if (!selectedRecord.value) {
      return;
    }
    Modal.confirm({
      title: '确认撤销',
      content: '是否撤销当前选中的点检计划？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        return saveKaiqiChexiao({ id: selectedRecord.value?.id, cancelResult: 2 }, handleReload);
      },
    });
  }

  /**
   * 开启事件
   */
  function handleSelectedOpen() {
    if (!selectedRecord.value) {
      return;
    }
    Modal.confirm({
      title: '确认开启',
      content: '是否开启当前选中的点检计划？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        return saveKaiqiChexiao({ id: selectedRecord.value?.id, cancelResult: 1 }, handleReload);
      },
    });
  }

  /**
   * 审核事件
   */
  function handleSelectedAudit() {
    if (!selectedRecord.value) {
      return;
    }
    openModalShenhe(true, {
      record: selectedRecord.value,
      isUpdate: true,
    });
  }

  /**
   * 新增事件
   */
  function handleAdd() {
    isDisabled.value = false;
    openModal(true, {
      isUpdate: false,
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
    });
  }

  function handleEditTiaozheng(record) {
    isDisabled.value = false;
    openModalEdit(true, {
      record,
      isUpdate: true,
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

  async function batchHandleDelete() {
    await batchDeleteDemo({ ids: checkedKeys.value.join(',') }, handleReload);
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

<style scoped lang="less">
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
