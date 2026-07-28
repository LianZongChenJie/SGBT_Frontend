<template>
  <div style="padding: 10px">
    <BasicTable :rowSelection="rowSelection" @register="registerTable">
      <template #tableTitle>
        <a-button v-if="hasPermission('operation:operation_inspection_item:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"
          >新增</a-button
        >
        <a-button
          v-if="hasPermission('operation:operation_inspection_item:edit')"
          preIcon="ant-design:stop-outlined"
          type="primary"
          :disabled="!canStopSelected"
          @click="handleSelectedDisable"
          >停用</a-button
        >
        <a-button
          v-if="hasPermission('operation:operation_inspection_item:edit')"
          preIcon="ant-design:redo-outlined"
          type="primary"
          :disabled="!canOpenSelected"
          @click="handleSelectedEnable"
          >启用</a-button
        >
        <a-button
          v-if="hasPermission('operation:operation_inspection_item:exportXls')"
          preIcon="ant-design:export-outlined"
          type="primary"
          @click="onExportXls"
        >
          导出
        </a-button>
        <!--        <a-button v-if="hasPermission('operation:operation_inspection_item:edit')"   preIcon="ant-design:redo-outlined" type="primary"-->
        <!--                  :disabled="selectedRowKeys.length < 1"-->
        <!--                  @click="handleAdd">启用</a-button>-->
        <!--        <a-button v-if="hasPermission('operation:operation_inspection_item:edit')"   preIcon="ant-design:stop-outlined" type="primary"-->
        <!--                  :disabled="selectedRowKeys.length < 1"-->
        <!--                  @click="handleAdd">停用</a-button>-->
        <!--        <a-button v-if="hasPermission('operation:operation_inspection_point_plan:exportTemplate')"  type="primary" @click="onExportXls">下载模版</a-button>-->
        <!--        <j-upload-button v-if="hasPermission('operation:operation_inspection_point_plan:importExcel')" type="primary" @click="onImportXls">导入计划</j-upload-button>-->

        <!--        <a-upload :customRequest="(file) => handleImportXls(file, getImportUrl, reload)" :showUploadList="false" name="file">-->
        <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入计划</a-button>-->
        <!--        </a-upload>-->
        <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
        <!--          下载模版-->
        <!--        </a-button>-->
        <a-dropdown v-if="selectedRowKeys.length > 0 && hasPermission('operation:operation_inspection_item:deleteBatch')">
          <template #overlay>
            <a-menu>
              <a-menu-item v-if="hasPermission('operation:operation_inspection_item:deleteBatch')" @click="batchHandleDelete">
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
  </div>
</template>
<script lang="ts" name="yuanchengcaozuojilu" setup>
  import { computed, ref } from 'vue';
  import { Modal } from 'ant-design-vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();
  import { getDemoList, deleteDemo, batchDeleteDemo, getExportUrl, getImportUrl, setUpdateStatus } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  import { useListPage } from '@/hooks/system/useListPage';

  // const selectedRowKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();
  const isDisabled = ref(false);

  const { tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '单表示例',
      api: getDemoList,
      columns,
      formConfig: {
        schemas: searchFormSchema,
        // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
        // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
        autoAdvancedCol: 3,
      },
      striped: true,
      bordered: true,
      rowKey: 'id',
      showIndexColumn: true,
      indexColumnProps: {
        title: '序号',
        width: 60,
        fixed: 'left',
      },
      rowSelection: { type: 'checkbox', fixed: 'left' }, //默认是 checkbox 多选，可以设置成 radio 单选
      actionColumn: {
        width: 250,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '点检项目',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;

  const selectedRecord = computed(() => {
    if (selectedRowKeys.value.length !== 1 || selectedRows.value.length !== 1) {
      return null;
    }
    return selectedRows.value[0] as Record<string, any>;
  });

  const canStopSelected = computed(() => {
    return !!selectedRecord.value && Number(selectedRecord.value.status) === 1;
  });

  const canOpenSelected = computed(() => {
    return !!selectedRecord.value && Number(selectedRecord.value.status) === 0;
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
        auth: 'operation:operation_inspection_item:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        auth: 'operation:operation_inspection_item:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }
  /**
   * 修改状态
   * @param id
   */
  async function handleOpen(obj) {
    console.log('点击了启用、停用', obj);
    await setUpdateStatus(obj, handleReload);
  }

  function handleSelectedEnable() {
    if (!selectedRecord.value) {
      return;
    }
    Modal.confirm({
      title: '确认启用',
      content: '是否启用当前选中的点检项目？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        return setUpdateStatus(
          {
            id: selectedRecord.value?.id,
            status: 1,
          },
          handleReload
        );
      },
    });
  }

  function handleSelectedDisable() {
    if (!selectedRecord.value) {
      return;
    }
    Modal.confirm({
      title: '确认停用',
      content: '是否停用当前选中的点检项目？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        return setUpdateStatus(
          {
            id: selectedRecord.value?.id,
            status: 0,
          },
          handleReload
        );
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
    await deleteDemo({ id: record.id }, handleReload);
  }

  /**
   * 批量删除事件
   */
  // async function batchHandleDelete() {
  //   await batchDeleteDemo({ ids: checkedKeys.value }, reload);
  // }
  async function batchHandleDelete() {
    await batchDeleteDemo({ ids: selectedRowKeys.value.join(',') }, () => {
      handleReload();
    });
    // clearSelected();
  }

  function handleReload() {
    selectedRowKeys.value = [];
    selectedRows.value = [];
    reload();
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
