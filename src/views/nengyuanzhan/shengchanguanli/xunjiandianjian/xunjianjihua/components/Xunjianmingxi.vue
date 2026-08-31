<template>
  <div>
    <a-divider orientation="left">巡检明细</a-divider>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <!--        <a-button v-if="hasPermission('energy:energy_device_info:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">跳过巡检</a-button>-->
        <a-button
          v-if="hasPermission('operation:operation_inspection_plan:exportXls')"
          preIcon="ant-design:export-outlined"
          type="primary"
          @click="handleExportXls('单表示例', getExportUrl, exportParams)"
        >
          导出
        </a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DemoModalYulan :isDisabled="isDisabled" @register="registerModalYulan" @success="reload"></DemoModalYulan>
  </div>
</template>
<script lang="ts" setup>
  import { usePermission } from '/@/hooks/web/usePermission';
  import DemoModalYulan from '../DemoModalYulan.vue';

  const { hasPermission } = usePermission();
  import { watch, ref, computed, unref, onMounted } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { saveOrUpdateDemo } from '../demo.api';
  import { BasicColumn, BasicTable, useTable, TableAction } from '@/components/Table';
  import { getExportUrl, getImportUrl } from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeitaizhang/demo.api';
  import { render } from '@/utils/common/renderUtils';

  const props = defineProps({
    data: { type: Object, default: () => ({}) },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const checkedKeys = ref<Array<string | number>>([]);
  //自定义接受参数

  const columnsTable: BasicColumn[] = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      width: 170,
      resizable: true,
      ellipsis: true,
    },
    {
      title: '设备编码',
      dataIndex: 'deviceCode',
      width: 170,
      resizable: true,
      ellipsis: true,
    },
    {
      title: '设备型号',
      dataIndex: 'deviceModule',
      width: 170,
      resizable: true,
      ellipsis: true,
    },
    {
      title: '所属部门',
      dataIndex: 'sysOrgCode',
      width: 170,
      resizable: true,
      ellipsis: true,
      // dict:'sys_depart,org_code,depart_name',
    },
    {
      title: '设备位置',
      dataIndex: 'spaceId',
      width: 140,
      resizable: true,
    },
    // {
    //   title: '设备经度',
    //   dataIndex: 'lo',
    //   width: 170,
    //   resizable: true,
    // },
    // {
    //   title: '设备纬度',
    //   dataIndex: 'la',
    //   width: 130,
    //   resizable: true,
    // },
    {
      title: '设备状态',
      dataIndex: 'deviceStatus',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (text == 1) {
          return '在途';
        } else if (text == 2) {
          return '待维修';
        } else if (text == 3) {
          return '维修中';
        } else if (text == 4) {
          return '入库';
        }
      },
    },
    {
      title: '厂家',
      dataIndex: 'factory',
      width: 140,
      resizable: true,
    },
    {
      title: '设备责任人',
      dataIndex: 'official',
      width: 140,
      resizable: true,
    },
    {
      title: '设备使用人',
      dataIndex: 'user',
      width: 140,
      resizable: true,
    },

    {
      title: '购置日期',
      dataIndex: 'purchaseDate',
      width: 140,
      resizable: true,
    },
    {
      title: '使用寿命',
      dataIndex: 'serviceLife',
      width: 140,
      resizable: true,
    },
    {
      title: '设备图片',
      dataIndex: 'devicePic',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (!text) {
          return text;
        }
        return render.renderImage({ text });
      },
    },
    {
      title: '保修期(月)',
      dataIndex: 'warranty',
      width: 140,
      resizable: true,
    },
    // {
    //   title: '巡检点检周期(月)',
    //   dataIndex: 'cycle',
    //   width: 140,
    //   resizable: true,
    // },
    {
      title: '供应商',
      dataIndex: 'supplier',
      width: 140,
      resizable: true,
    },
    {
      title: '二维码',
      dataIndex: '',
      width: 140,
      resizable: true,
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   width: 140,
    //   resizable: true,
    //   customRender: ({ text }) => {
    //     if (text === 1) {
    //       return '在途';
    //     } else if (text === 2) {
    //       return '待维修';
    //     } else if (text === 3) {
    //       return '维修中';
    //     } else {
    //       return '入库';
    //     }
    //   },
    // },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   width: 140,
    //   resizable: true,
    // },
    {
      title: '是否拍照',
      dataIndex: 'isPhoto',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (text == 1) {
          return '是';
        } else if (text == 0) {
          return '否';
        }
      },
    },
    {
      title: '扫码登记',
      dataIndex: 'isScan',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (text == 1) {
          return '是';
        } else if (text == 0) {
          return '否';
        }
      },
    },
  ];
  const [registerTable, { reload, setTableData }] = useTable({
    // api: getXunjianmingxiList,
    rowKey: 'id',
    columns: columnsTable,
    // formConfig: {
    //   labelWidth: 120,
    //   schemas: searchFormSchema,
    //   autoSubmitOnEnter: true,
    // },
    striped: true,
    useSearchForm: false,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    // beforeFetch: (params) => {
    //   return Object.assign({column: 'createTime', order: 'desc'}, params);
    // },
    actionColumn: {
      width: 150,
      title: '巡检项目',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });
  const [registerModalYulan, { openModal: openModalYulan }] = useModal();

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '查看巡检项目',
        onClick: handleDetail.bind(null, record),
      },
      // {
      //   label: '删除',
      //   auth: 'energy:energy_device_info:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      //   popConfirm: {
      //     title: '是否确认删除',
      //     confirm: handleDelete.bind(null, record),
      //   },
      // },
    ];
  }
  /**
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    console.log('checkedKeys------>', checkedKeys);
    checkedKeys.value = selectedRowKeys;
  }

  function handleDetail(record) {
    props.isDisabled = true;
    openModalYulan(true, {
      record,
      isUpdate: true,
    });
  }
  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateDemo(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  onMounted(() => {
    watch(
      () => props.data,
      async (newValue) => {
        console.log(newValue.planDetails, '巡检明细');
        setTableData(newValue.planDetails || []);
      },
      { deep: true, immediate: true }
    );
  });
</script>
