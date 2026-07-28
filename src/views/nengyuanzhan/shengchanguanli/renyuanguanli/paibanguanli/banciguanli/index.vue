<template>
  <div class="app-container">
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :class="{ 'p-4': customSearch }">
      <template #tableTitle>
        <a-button v-if="hasPermission('energy:energy_plan_item:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"
          >新增</a-button
        >

        <a-upload
          v-if="hasPermission('energy:energy_plan_item:importExcel')"
          name="file"
          :showUploadList="false"
          :customRequest="(file) => handleImportXls(file, getImportUrl, reload)"
        >
          <a-button preIcon="ant-design:import-outlined" type="primary">导入</a-button>
        </a-upload>
        <a-button
          v-if="hasPermission('energy:energy_plan_item:exportXls')"
          preIcon="ant-design:export-outlined"
          type="primary"
          @click="handleExportXls('班次管理', getExportUrl, exportParams)"
        >
          导出
        </a-button>
        <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('energy:energy_plan_item:deleteBatch')">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            批量操作
            <Icon style="fontsize: 12px" icon="ant-design:down-outlined"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DemoModal @register="registerModal" @success="reload" :isDisabled="isDisabled" />
    <JImportModal @register="registerModalJimport" :url="getImportUrl" online />
  </div>
</template>

<script setup lang="ts" name="banciguanli">
  import { ref, unref, watch, computed } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();
  import JImportModal from '/@/components/Form/src/jeecg/components/JImportModal.vue';

  import { useMethods } from '/@/hooks/system/useMethods';
  import { getDemoList, deleteDemo, batchDeleteDemo, getExportUrl, getImportUrl, resolveDeptNameMap, formatDeptNameByMap } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  import { filterObj } from '/@/utils/common/compUtils';

  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();
  const [registerModalJimport] = useModal();
  const { handleExportXls, handleImportXls } = useMethods();
  const isDisabled = ref(false);

  async function loadShiftList(params) {
    const result = await getDemoList(params);
    const records = Array.isArray(result?.records) ? result.records : [];
    const deptMap = await resolveDeptNameMap(records.map((item) => item.sysOrgCode));

    records.forEach((item) => {
      item.sysOrgName = item.sysOrgName || formatDeptNameByMap(item.sysOrgCode, deptMap) || item.sysOrgCode;
    });

    return result;
  }

  const [registerTable, { reload, setProps }] = useTable({
    title: '班次管理',
    api: loadShiftList,
    columns,
    formConfig: {
      schemas: searchFormSchema,
      autoAdvancedCol: 2,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
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
    rowKey: 'id',
    actionColumn: {
      width: 180,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  /**
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  const exportParams = computed(() => {
    let paramsForm = {};
    if (checkedKeys.value && checkedKeys.value.length > 0) {
      paramsForm['selections'] = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
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
        auth: 'energy:energy_plan_item:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
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
        auth: 'energy:energy_plan_item:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }
  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
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
    const ids = checkedKeys.value.map((item) => String(item)).join(',');
    if (!ids) return;
    await batchDeleteDemo({ ids }, () => {
      checkedKeys.value = [];
      reload();
    });
  }

  const customSearch = ref(false);
  watch(customSearch, () => {
    setProps({ useSearchForm: !unref(customSearch) });
  });
</script>

<style scoped lang="less">
  .app-container {
    padding: 10px;
  }
</style>
