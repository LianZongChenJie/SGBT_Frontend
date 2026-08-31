<template>
  <div style="padding: 10px">
    <BasicTable :rowSelection="rowSelection" @register="registerTable">
      <template #tableTitle>
        <a-button
          v-if="hasPermission('operation:operation_video_patrol_plan:add')"
          preIcon="ant-design:plus-outlined"
          type="primary"
          @click="handleAdd"
          >创建巡逻计划</a-button
        >
        <a-button
          v-if="hasPermission('operation:operation_video_patrol_plan:edit')"
          type="primary"
          :disabled="!canStart"
          @click="handleStartFromToolbar"
          >启动</a-button
        >
        <a-button
          v-if="hasPermission('operation:operation_video_patrol_plan:edit')"
          :disabled="!canStop"
          @click="handleStopFromToolbar"
          >停止</a-button
        >
        <a-button
          v-if="hasPermission('operation:operation_video_patrol_plan:exportXls')"
          preIcon="ant-design:export-outlined"
          type="primary"
          @click="handleExportXls('视频巡更计划', getExportUrl, exportParams)"
          >导出</a-button
        >
        <!--        <a-button v-if="hasPermission('operation:operation_inspection_point_plan:exportTemplate')"  type="primary" @click="onExportXls">下载模版</a-button>-->
        <!--        <j-upload-button v-if="hasPermission('operation:operation_inspection_point_plan:importExcel')" type="primary" @click="onImportXls">导入计划</j-upload-button>-->

        <!--        <a-upload :customRequest="(file) => handleImportXls(file, getImportUrl, reload)" :showUploadList="false" name="file">-->
        <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入计划</a-button>-->
        <!--        </a-upload>-->
        <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
        <!--          下载模版-->
        <!--        </a-button>-->
        <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('operation:operation_video_patrol_plan:deleteBatch')">
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="hasPermission('operation:operation_video_patrol_plan:deleteBatch')" @click="batchHandleDelete">
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

    <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="reload" />
  </div>
</template>
<script lang="ts" name="shipinxungengjihua" setup>
  import { computed, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { filterObj } from '/@/utils/common/compUtils';

  const { hasPermission } = usePermission();
  import { getDemoList, deleteDemo, batchDeleteDemo, setUpdateStatus, getExportUrl, getImportUrl } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  const checkedKeys = ref<Array<string | number>>([]);
  const checkedRows = ref<any[]>([]);
  const tableRows = ref<any[]>([]);
  // const selectedRowKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();
  const { handleExportXls } = useMethods();
  const isDisabled = ref(false);
  const [registerTable, { reload, getForm }] = useTable({
    title: '',
    api: getDemoList,
    columns,
    formConfig: {
      // labelWidth: 80,
      schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      autoAdvancedCol: 2,
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
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: true,
    rowKey: 'id',
    afterFetch: (items) => {
      tableRows.value = Array.isArray(items) ? items : [];
      return items;
    },
    // beforeFetch: (params) => {
    //   return {
    //     ...params,
    //     // tabType: activeKey.value,
    //   };
    // },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });
  const rowSelection = computed(() => ({
    type: 'checkbox',
    columnWidth: 40,
    fixed: 'left',
    selectedRowKeys: checkedKeys.value,
    onChange: onSelectChange,
  }));

  const exportParams = computed(() => {
    const paramsForm: Record<string, unknown> = {
      ...(getForm()?.getFieldsValue?.() || {}),
    };
    if (checkedKeys.value.length > 0) {
      paramsForm.selections = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], rows: any[]) {
    checkedKeys.value = selectedRowKeys;
    if (Array.isArray(rows) && rows.length) {
      checkedRows.value = rows;
    } else {
      checkedRows.value = tableRows.value.filter((item) => selectedRowKeys.map(String).includes(String(item.id)));
    }
    if (selectedRowKeys.length > 1) {
      message.warning('只能选中1条进行启停操作');
    }
  }

  const selectedOneRow = computed(() => {
    if (checkedRows.value.length === 1) {
      return checkedRows.value[0];
    }
    if (checkedKeys.value.length === 1) {
      const selectedId = String(checkedKeys.value[0]);
      return tableRows.value.find((item) => String(item.id) === selectedId) || null;
    }
    return null;
  });
  const isSelectedStarted = computed(() => {
    const status = selectedOneRow.value?.status;
    return status === 'START' || status === '启动' || status === 1 || status === '1';
  });
  const isSelectedStopped = computed(() => {
    const status = selectedOneRow.value?.status;
    return status === 'STOP' || status === '停止' || status === 0 || status === '0';
  });
  const canStart = computed(() => !!selectedOneRow.value && isSelectedStopped.value);
  const canStop = computed(() => !!selectedOneRow.value && isSelectedStarted.value);

  // const { tableContext, onExportXls, onImportXls } = useListPage({
  //   tableProps: {
  //     title: '单表示例',
  //     api: getDemoList,
  //     columns,
  //     formConfig: {
  //       schemas: searchFormSchema,
  //       // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
  //       // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
  //       autoAdvancedCol: 2,
  //     },
  //     defSort: {
  //       // column: 'createTime,sex',
  //       // order: 'desc',
  //     },
  //     striped: true,
  //     bordered: true,
  //     rowKey: 'id',
  //     showIndexColumn: true,
  //     rowSelection: { type: 'checkbox' }, //默认是 checkbox 多选，可以设置成 radio 单选
  //     actionColumn: {
  //       width: 180,
  //       title: '操作',
  //       dataIndex: 'action',
  //       slots: { customRender: 'action' },
  //       fixed: 'right',
  //     },
  //   },
  //   exportConfig: {
  //     name: '下载模版',
  //     url: getExportUrl,
  //   },
  //   importConfig: {
  //     url: getImportUrl,
  //   },
  // });
  // const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'operation:operation_video_patrol_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        auth: 'operation:operation_video_patrol_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  async function handleOpen(obj) {
    await setUpdateStatus(obj, reload);
    checkedKeys.value = [];
    checkedRows.value = [];
  }

  function handleStartFromToolbar() {
    if (!selectedOneRow.value) return;
    Modal.confirm({
      title: '是否启动？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await handleOpen({ id: String(selectedOneRow.value.id), status: 'START' });
      },
    });
  }

  function handleStopFromToolbar() {
    if (!selectedOneRow.value) return;
    Modal.confirm({
      title: '是否停止？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await handleOpen({ id: String(selectedOneRow.value.id), status: 'STOP' });
      },
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

  /**
   * 详情页面
   */
  function handleDetail(record) {
    isDisabled.value = true;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, reload);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteDemo({ ids: checkedKeys.value }, reload);
  }
</script>
<style lang="less" scoped>
  .jeecg-basic-table-form-container {
    padding: 0;

    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
