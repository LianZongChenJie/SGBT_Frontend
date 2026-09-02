<template>
  <div style="padding: 10px">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <!--        <a-button    preIcon="ant-design:plus-outlined" type="primary" @click="handleEdit">播放</a-button>-->
        <!--        <a-button v-if="hasPermission('operation:operation_inspection_point_plan:exportTemplate')"  type="primary" @click="onExportXls">下载模版</a-button>-->
        <!--        <j-upload-button v-if="hasPermission('operation:operation_inspection_point_plan:importExcel')" type="primary" @click="onImportXls">导入计划</j-upload-button>-->

        <!--        <a-upload :customRequest="(file) => handleImportXls(file, getImportUrl, reload)" :showUploadList="false" name="file">-->
        <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入计划</a-button>-->
        <!--        </a-upload>-->
        <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
        <!--          下载模版-->
        <!--        </a-button>-->
        <!--        <a-dropdown v-if="selectedRowKeys.length > 0">-->
        <!--          <template #overlay>-->
        <!--            <a-menu>-->
        <!--              <a-menu-item v-if="hasPermission('operation:operation_inspection_point_plan:deleteBatch')" @click="batchHandleDelete">-->
        <!--                <Icon icon="ant-design:delete-outlined" />-->
        <!--                批量删除-->
        <!--              </a-menu-item>-->
        <!--            </a-menu>-->
        <!--          </template>-->
        <!--          <a-button>-->
        <!--            批量操作-->
        <!--            <Icon icon="ant-design:down-outlined" />-->
        <!--          </a-button>-->
        <!--        </a-dropdown>-->
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="reload" />
  </div>
</template>
<script lang="ts" name="shipinxungengrenwu" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import { getDemoList } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';
  const [registerModal, { openModal }] = useModal();
  const isDisabled = ref(false);

  const [registerTable, { reload }] = useTable({
    title: '',
    api: getDemoList,
    columns,
    formConfig: {
      // labelWidth: 120,
      schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      autoAdvancedCol: 2,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    //自定义默认排序
    // defSort: {
    //   column: 'createTime,sex',
    //   order: 'desc',
    // },
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
    actionColumn: {
      width: 120,
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
    const isCompleted = isTaskCompleted(record);
    return [
      {
        label: '执行巡更任务',
        onClick: handleEdit.bind(null, record),
        disabled: isCompleted,
        auth: ['operation:videoPatrolTask:startTask'],
      },
      // {
      //   label: '停止',
      //   onClick: handleEdit.bind(null, record),
      //   auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      //
      // },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
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

  /**
   * 编辑事件
   */
  function handleEdit(record) {
    if (isTaskCompleted(record)) {
      return;
    }
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  function isTaskCompleted(record) {
    const status = record?.taskStatus;
    return status === 2 || status === '2' || status === '完成' || status === '已完成';
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
