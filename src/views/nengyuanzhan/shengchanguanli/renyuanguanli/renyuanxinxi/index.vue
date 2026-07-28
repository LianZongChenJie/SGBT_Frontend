<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" :gutter="10" type="flex">
    <a-col :lg="24" :md="24" :xl="4" style="margin-bottom: 10px">
      <DepartLeftTree ref="leftTree" @rootTreeData="onRootTreeData" @select="onTreeSelect" />
    </a-col>
    <a-col :lg="24" :md="24" :xl="20" style="margin-bottom: 10px">
      <BasicTable :class="{ 'p-4': customSearch }" :rowSelection="rowSelection" @register="registerTable">
        <template #tableTitle>
          <a-button v-if="hasPermission('energy:energy_employee:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd1"
            >新增
          </a-button>
          <!--          <a-button v-if="hasPermission('energy:energy_employee:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"-->
          <!--            >人员调整-->
          <!--          </a-button>-->
          <!--        <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, getImportUrl, reload)">-->
          <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入计划</a-button>-->
          <!--        </a-upload>-->
          <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
          <!--          下载模版-->
          <!--        </a-button>-->
          <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('energy:energy_employee:deleteBatch')">
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="hasPermission('energy:energy_employee:deleteBatch')" key="1" @click="batchHandleDelete">
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
        <!--操作栏-->
        <template #action="{ record }">
          <TableAction :actions="getActions(record)" />
        </template>
      </BasicTable>
      <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="reload" />
      <DemoModalAddorEdit :isDisabled="isDisabled" @register="registerModal1" @success="reload" />
    </a-col>
  </a-row>
</template>

<script lang="ts" name="system-depart" setup>
  import { provide, ref, watch, unref, computed } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useDesign } from '/@/hooks/web/useDesign';
  import DepartLeftTree from './components/DepartLeftTree.vue';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import DemoModalAddorEdit from './DemoModalAddorEdit.vue';
  import { usePermission } from '@/hooks/web/usePermission';
  import { getDemoList, deleteDemo, batchDeleteDemo } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';
  const { hasPermission } = usePermission();
  const customSearch = ref(false);
  const orgCode = ref('');
  const { prefixCls } = useDesign('depart-manage');
  provide('prefixCls', prefixCls);

  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();
  const [registerModal1, { openModal: openModal1 }] = useModal();
  const [registerTable, { reload, setProps }] = useTable({
    title: '人员信息',
    api: getDemoList,
    columns,
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      // autoAdvancedCol: 2,
      // actionColOptions: {
      //   style: { textAlign: 'left' },
      // },
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
  const rowSelection = computed(() => ({
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys.value,
    onChange: onSelectChange,
  }));
  const isDisabled = ref(false);
  // 给子组件定义一个ref变量
  const leftTree = ref();

  // 当前选中的部门信息
  const departData = ref({});
  const rootTreeData = ref<any[]>([]);

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

  // 左侧树选择后触发

  function onTreeSelect(data) {
    checkedKeys.value = [];
    if (!data || !data.orgCode) {
      orgCode.value = '';
      reload();
      return;
    }
    departData.value = data;
    orgCode.value = data.orgCode;
    reload({
      searchInfo: {
        sysOrgCode: orgCode.value,
      },
    });
  }

  // function onTreeSelect(data) {
  //   orgCode.value = data.id;
  //   reload({
  //     searchInfo: {
  //       orgCode: orgCode.value,
  //     },
  //   });
  // }
  // 左侧树rootTreeData触发
  function onRootTreeData(data) {
    rootTreeData.value = data;
  }

  /**
   * 操作栏
   */
  function getActions(record) {
    return [
      {
        label: '编辑',
        auth: 'energy:energy_employee:edit',
        onClick: handleEdit.bind(null, record),
      },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '删除',
        auth: 'energy:energy_employee:delete',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  function handleEdit(record) {
    // let { getFieldsValue } = getForm();
    // console.log('查询form的数据', getFieldsValue());
    // console.log(record);
    isDisabled.value = false;
    openModal1(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, function () {
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
      reload();
    });
  }

  /**
   * 新增事件
   */
  function handleAdd1() {
    isDisabled.value = false;
    openModal1(true, {
      isUpdate: false,
      record: {
        sysOrgCode: orgCode.value,
      },
    });
  }

  function handleAdd() {
    isDisabled.value = false;
    openModal(true, {
      isUpdate: false,
    });
  }

  watch(customSearch, () => {
    setProps({ useSearchForm: !unref(customSearch) });
  });
</script>

<style lang="less" scoped>
  @import './index.less';
  .jeecg-basic-table-form-container {
    padding: 0;
  }
</style>
