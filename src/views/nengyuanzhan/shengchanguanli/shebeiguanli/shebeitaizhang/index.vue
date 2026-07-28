<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" :gutter="10" style="max-height: 800px" type="flex">
    <a-col :lg="24" :md="24" :xl="4" style="margin-bottom: 10px">
      <DepartLeftTree ref="leftTree" @select="onTreeSelect" />
    </a-col>
    <a-col :lg="24" :md="24" :xl="20" style="margin-bottom: 10px">
      <div class="address-book" style="height: 100%">
        <!--引用表格-->
        <BasicTable :rowSelection="rowSelection" @register="registerTable" style="padding: 0">
          <template #tableTitle>
            <a-button v-if="hasPermission('energy:energy_device_info:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"
              >新增
            </a-button>
            <a-button :disabled="checkedKeys.length !== 1" preIcon="ant-design:printer-outlined" type="primary" @click="handleErweima"
              >打印二维码</a-button
            >
            <!--            <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAddWeixiu">创建维修工单</a-button>-->
            <!--            <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">日期维护</a-button>-->
            <a-upload
              v-if="hasPermission('energy:energy_device_info:importExcel')"
              :customRequest="(file) => handleImportXls(file, getImportUrl, reload)"
              :showUploadList="false"
              name="file"
            >
              <a-button preIcon="ant-design:import-outlined" type="primary">导入</a-button>
            </a-upload>
            <a-button
              v-if="hasPermission('energy:energy_device_info:exportXls')"
              preIcon="ant-design:export-outlined"
              type="primary"
              @click="handleExportXls('设备台账', getExportUrl, getExportParams())"
            >
              导出
            </a-button>
            <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('energy:energy_device_info:deleteBatch')">
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="hasPermission('energy:energy_device_info:deleteBatch')" key="1" @click="batchHandleDelete">
                    <Icon icon="ant-design:delete-outlined"></Icon>
                    删除
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button
                >批量操作
                <Icon icon="ant-design:down-outlined" style="fontsize: 12px"></Icon>
              </a-button>
            </a-dropdown>
          </template>
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
        </BasicTable>
        <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="handleAddSuccess" />
        <DemoModalErweima :isDisabled="isDisabled" @register="registerModalErweima" @success="handleAddSuccess" />
        <AddWeixiuModal :isDisabled="isDisabled" @register="registerModalWeixiu" @success="reload" />
        <DetailModal :isDisabled="isDisabled" @register="registerModalDetail" @success="reload" />
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
  import { computed, provide, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import DepartLeftTree from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeifenlei/components/DepartLeftTree.vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { columns, searchFormSchema } from './demo.data';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import DemoModalErweima from './DemoModalErweima.vue';
  import AddWeixiuModal from './addWeixiuModal.vue';
  import DetailModal from './detailModal.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { filterObj } from '@/utils/common/compUtils';
  import { getDemoList, deleteDemo, batchDeleteDemo, getExportUrl, getImportUrl } from './demo.api';
  import { useMethods } from '@/hooks/system/useMethods';

  const { hasPermission } = usePermission();

  const { prefixCls } = useDesign('address-list');
  provide('prefixCls', prefixCls);

  // 给子组件定义一个ref变量
  const leftTree = ref();
  const isDisabled = ref(false);
  // 当前选中的设备分类
  const deviceTypeId = ref<string | number | ''>('');
  const checkedKeys = ref<Array<string | number>>([]);
  const checkedRows = ref<Recordable[]>([]);
  const [registerModal, { openModal }] = useModal();
  const [registerModalErweima, { openModal: openModalerweima }] = useModal();
  const [registerModalWeixiu, { openModal: openModalWeixiu }] = useModal();
  const [registerModalDetail, { openModal: openModalDetail }] = useModal();
  const { handleExportXls, handleImportXls } = useMethods();
  // 列表页面公共参数、方法
  const [registerTable, { reload, getForm }] = useTable({
    title: '',
    api: getDemoList,
    columns,
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
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
    canResize: false,
    rowKey: 'id',
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
    beforeFetch: (params) => {
      return {
        ...params,
        ...getBaseSearchParams(),
      };
    },
  });

  function getCurrentDeviceTypeId() {
    if (deviceTypeId.value === '' || deviceTypeId.value == null) {
      return undefined;
    }
    const parsedId = Number(deviceTypeId.value);
    return Number.isNaN(parsedId) ? deviceTypeId.value : parsedId;
  }

  function getBaseSearchParams(extraParams: Record<string, unknown> = {}) {
    return filterObj({
      category: '1',
      deviceTypeId: getCurrentDeviceTypeId(),
      ...extraParams,
    });
  }

  function getExportParams() {
    const formValues = getForm()?.getFieldsValue?.() || {};
    return getBaseSearchParams(formValues);
  }

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'energy:energy_device_info:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '删除',
        auth: 'energy:energy_device_info:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  /**
   * 选择列配置
   */
  const rowSelection = computed(() => ({
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys.value,
    onChange: onSelectChange,
    fixed: 'left',
  }));

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], selectRow) {
    checkedKeys.value = selectedRowKeys;
    checkedRows.value = selectRow;
  }

  /**
   * 新增事件
   */
  function handleAdd() {
    isDisabled.value = false;
    openModal(true, {
      isUpdate: false,
      record: getBaseSearchParams(),
    });
  }

  function handleErweima() {
    isDisabled.value = false;
    openModalerweima(true, {
      record: checkedRows.value[0],
      isUpdate: true,
    });
  }

  /**
   * 新增维修工单事件
   */
  function handleAddWeixiu() {
    isDisabled.value = false;
    openModalWeixiu(true, {
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
    isDisabled.value = false;
    openModalDetail(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, function () {
      leftTree.value?.loadRootTreeData(); // ✅ 刷新左树
      reload();
    });
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    const ids = checkedKeys.value.map((item) => String(item)).join(',');
    if (!ids) return;
    await batchDeleteDemo({ ids }, function () {
      checkedKeys.value = [];
      checkedRows.value = [];
      leftTree.value?.loadRootTreeData(); // ✅ 刷新左树
      reload();
    });
  }

  // 左侧树选择后触发
  function onTreeSelect(data) {
    checkedKeys.value = [];
    checkedRows.value = [];
    if (!data || data.id == null) {
      deviceTypeId.value = '';
      reload();
      return;
    }
    deviceTypeId.value = data.id;
    reload();
  }

  function handleAddSuccess() {
    checkedKeys.value = [];
    checkedRows.value = [];
    leftTree.value?.loadRootTreeData(); // ✅ 刷新左树
    reload();
  }
</script>

<style lang="less">
  @import './index.less';
</style>
