<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @cancel="handleCancel" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" style="padding-right: 20px" />

    <a-divider orientation="left">巡检明细</a-divider>
    <BasicTable @register="registerTable" :rowSelection="rowSelectionMingxi">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">添加</a-button>
        <!--        <a-button v-if="hasPermission('energy:energy_device_info:exportXls')" preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl,exportParams)">-->
        <!--          导出-->
        <!--        </a-button>-->
        <!--        <a-dropdown v-if="checkedKeys.length > 0">-->
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

      <template #isPhoto="{ record }">
        <a-radio-group v-model:value="record.isPhoto">
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
      </template>
      <template #saoma="{ record }">
        <a-radio-group v-model:value="record.isScan">
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
      </template>
    </BasicTable>

    <a-divider orientation="left">上传附件</a-divider>
    <BasicTable @register="registerTableUpdate" :rowSelection="rowSelectionFujian">
      <template #tableTitle>
        <!--        <BasicUpload :maxSize="20000" :maxNumber="10"  :api="uploadApi" class="my-5" :accept="['png/*']" />-->
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="handleUploadAttachment">上传文档 </j-upload-button>
        <!--        <j-upload-button type="primary" preIcon="ant-design:import-outlined"  @click="handleImport">上传文档 </j-upload-button>-->

        <!--        <a-button v-if="hasPermission('energy:energy_device_info:exportXls')" preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl,exportParams)">-->
        <!--          导出-->
        <!--        </a-button>-->
        <!--        <a-dropdown v-if="checkedKeysUpdate.length > 0">-->
        <!--          <template #overlay>-->
        <!--            <a-menu>-->
        <!--              <a-menu-item @click="batchHandleDeleteFujian">-->
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
        <TableAction :actions="getActionsUpdate(record)" />
      </template>
    </BasicTable>

    <DemoModalYulan :isDisabled="isDisabled" @register="registerModalYulan" @success="reload"></DemoModalYulan>
    <DemoModalShezhi :isDisabled="isDisabled" @register="registerModalSet" @success="getXjxmRows"></DemoModalShezhi>
    <DemoModalSheBei :isDisabled="isDisabled" @register="registerModalAdd" @success="getShebeiID"></DemoModalSheBei>
    <DemoModalZhixingzhouqiguize :isDisabled="isDisabled" @register="registerModalGuize" @success="getGuize"></DemoModalZhixingzhouqiguize>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { defHttp } from '/@/utils/http/axios';

  import { BasicUpload } from '/@/components/Upload';
  import { nextTick, ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useMessage } from '/@/hooks/web/useMessage';

  const [registerModalYulan, { openModal: openModalYulan }] = useModal();
  const [registerModalSet, { openModal: openModalShezhi }] = useModal();
  const [registerModalAdd, { openModal: openModalAdd }] = useModal();
  const [registerModalGuize, { openModal: openModalGuize }] = useModal();
  const { hasPermission } = usePermission();
  const { createMessage } = useMessage();
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { getDemoById, saveOrUpdateDemo, batchDeleteDemo, getImportUrlFujian, deleteDemoMingxi } from './demo.api';
  import DemoModalYulan from './DemoModalYulan.vue';
  import DemoModalShezhi from './DemoModalShezhi.vue';
  import DemoModalSheBei from './DemoModalSheBei.vue';
  import DemoModalZhixingzhouqiguize from './DemoModalZhixingzhouqiguize.vue';
  import { getExportUrl } from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeitaizhang/demo.api';
  import { BasicColumn, BasicTable, TableAction, useTable } from '@/components/Table';
  import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
  import { useListPage } from '@/hooks/system/useListPage';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
  import { getFileAccessHttpUrl } from '@/utils/common/compUtils';
  import { render } from '@/utils/common/renderUtils';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const selectedRowKeys = ref<Array<string | number>>([]);
  const selectedRowsMingxi = ref<any[]>([]);
  const selectedRowsFujian = ref<any[]>([]);
  const checkedKeys = ref<Array<string | number>>([]);
  const checkedKeysUpdate = ref<Array<string | number>>([]);
  const tableData = ref<any[]>([]);
  const attachmentTableData = ref<any[]>([]);
  const addList = ref<any[]>([]);
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const formSchema: FormSchema[] = [
    {
      field: 'id',
      label: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'createBy',
      label: 'createBy',
      component: 'Input',
      show: false,
    },
    {
      field: 'createTime',
      label: 'createTime',
      component: 'Input',
      show: false,
    },
    {
      field: 'baseTitle',
      component: 'Divider',
      label: '基础信息',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'planCode',
      label: '计划编号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'planName',
      label: '计划名称',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        style: { width: '100%' },
      },
    },
    {
      field: 'startTime',
      label: '计划开始时间',
      component: 'DatePicker',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'endTime',
      label: '计划结束时间',
      component: 'DatePicker',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'planType',
      label: '计划类型',
      component: 'Select',
      required: true,
      // defaultValue: 1,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        options: [
          { label: '小时计划', value: 1 },
          { label: '日计划', value: 2 },
          { label: '周计划', value: 3 },
          { label: '月计划', value: 4 },
          { label: '季计划', value: 5 },
          { label: '年计划', value: 6 },
        ],
      },
    },
    {
      label: '执行周期规则id',
      field: 'ruleId',
      component: 'InputSearch',
      colProps: { span: 12 },
      show: false,
      componentProps: {
        disabled: false,
        readonly: true,
        //搜索之后触发事件
        onSearch: (value: any) => {
          //搜索之后的逻辑处理
          console.log(value);
          handleGuize();
        },
      },
    },
    {
      label: '执行周期规则',
      field: 'ruleName',
      component: 'InputSearch',
      colProps: { span: 12 },
      componentProps: {
        placeholder: '请选择执行周期规则',
        disabled: false,
        readonly: true,
        //搜索之后触发事件
        onSearch: (value: any) => {
          //搜索之后的逻辑处理
          console.log(value);
          handleGuize();
        },
      },
    },
    {
      field: 'ruleDescription',
      label: '执行规则描述',
      component: 'InputTextArea',
      required: false,
      colProps: { span: 24 },
      // labelWidth:140,
      componentProps: {
        rows: 3,
        style: { width: '100%' },
        disabled: true,
      },
    },
    {
      field: 'status',
      label: '计划状态',
      component: 'RadioGroup',
      required: true,
      defaultValue: 1,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        options: [
          { label: '开启', value: 1 },
          { label: '关闭', value: 0 },
        ],
      },
    },
    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      // labelWidth:140,
      // colProps: {span: 24},
      required: true,
      componentProps: {
        disabled: false,
        rows: 3,
        style: { width: '100%' },
      },
    },

    {
      field: 'baseTitle1',
      component: 'Divider',
      label: '巡检人员',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'teamId',
      label: '巡检班组',
      required: true,
      colProps: { span: 12 },
      component: 'TreeSelect',
      componentProps: {
        disabled: false,
        // treeCheckable: true,
        // title: '下拉树',
        treeData: [], // 先给空
        fieldNames: {
          label: 'groupName',
          value: 'id',
          children: 'children',
        },
      },
    },
    {
      field: 'chargerId',
      label: '巡检负责人',
      component: 'TreeSelect',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        // treeCheckable: true,
        // title: '下拉树',
        treeData: [], // 先给空
        fieldNames: {
          label: 'label',
          value: 'id',
          children: 'children',
        },
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, setProps }] = useForm({
    labelWidth: 150,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
  });
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
      width: 130,
      resizable: true,
      slots: { customRender: 'isPhoto' }, // ⭐ 插槽名
    },
    {
      title: '扫码登记',
      dataIndex: 'saoma',
      width: 130,
      resizable: true,
      slots: { customRender: 'saoma' }, // ⭐ 插槽名
    },
    {
      title: '巡检项目',
      dataIndex: 'amount',
      width: 130,
      resizable: true,
    },
  ];
  const columnsTableUpdata: BasicColumn[] = [
    {
      title: 'id',
      dataIndex: 'id',
      width: 130,
      resizable: true,
      ifShow: false,
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      width: 130,
      resizable: true,
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      width: 130,
      resizable: true,
      ifShow: () => {
        return isUpdate.value;
      },
    },
    {
      title: '上传者',
      dataIndex: 'createBy',
      width: 130,
      resizable: true,
      ifShow: () => {
        return isUpdate.value;
      },
    },
    {
      title: '文档大小',
      dataIndex: 'fileSize',
      width: 130,
      resizable: true,
    },
    {
      title: '存储地址',
      dataIndex: 'fileUrl',
      width: 130,
      resizable: true,
    },
  ];
  const { tableContext: tableContextMingxi } = useListPage({
    tableProps: {
      title: '',
      // api: getXunjianmingxiList,
      rowKey: 'deviceId',
      columns: columnsTable,
      formConfig: {
        // schemas: searchFormSchema,
        // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
        // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
        autoAdvancedCol: 2,
      },
      striped: true,
      bordered: true,
      showIndexColumn: true,
      // rowSelection: { type: 'checkbox' }, //默认是 checkbox 多选，可以设置成 radio 单选
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload: reloadMingxi, setTableData }] = tableContextMingxi;

  const { tableContext: tableContextFujian } = useListPage({
    tableProps: {
      title: '',
      // api: getXunjianjihuafujianList,
      rowKey: 'id',
      columns: columnsTableUpdata,
      formConfig: {
        // schemas: searchFormSchema,
        autoAdvancedCol: 2,
      },
      striped: true,
      bordered: true,
      showIndexColumn: true,
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
      },
    },
    exportConfig: {
      name: '下载模版',
      url: getExportUrl,
    },
    importConfig: {
      // 上传
      url: getImportUrlFujian,
      success: (res) => {
        const record = buildAttachmentRow(res);
        if (!record.fileUrl) {
          return;
        }
        attachmentTableData.value = mergeAttachmentRows([record]);
        setTableDataFujian(attachmentTableData.value);
        checkedKeysUpdate.value = [];
        selectedRowsFujian.value = attachmentTableData.value;
      },
    },
  });
  const [registerTableUpdate, { setTableData: setTableDataFujian }] = tableContextFujian;

  async function handleUploadAttachment(data) {
    try {
      const originalName = data.file?.name || '';
      const res = await defHttp.uploadFile(
        { url: getImportUrlFujian },
        { file: data.file, filename: buildSafeUploadFileName(originalName) },
        { isReturnResponse: true }
      );
      const record = buildAttachmentRow(res, originalName);
      if (!record.fileUrl) {
        createMessage.error('文件上传失败');
        return;
      }
      attachmentTableData.value = mergeAttachmentRows([record]);
      setTableDataFujian(attachmentTableData.value);
      checkedKeysUpdate.value = [];
      selectedRowsFujian.value = attachmentTableData.value;
    } catch (error) {
      createMessage.error('文件上传失败');
    }
  }

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    const formDisabled = !!(data?.disabled ?? props.isDisabled);
    setTableData([]);
    tableData.value = [];
    attachmentTableData.value = [];
    selectedRowsMingxi.value = [];
    selectedRowsFujian.value = [];
    setTableDataFujian([]);
    checkedKeys.value = [];
    checkedKeysUpdate.value = [];
    setModalProps({ confirmLoading: true, showOkBtn: !formDisabled });
    setProps({ disabled: formDisabled });
    const treeDataRenyuan = await getTreeListRenyuan();
    const treeData = await getTreeListBanzu();
    updateSchema([
      {
        field: 'teamId',
        componentProps: {
          treeData,
        },
      },
      {
        field: 'chargerId',
        componentProps: {
          treeData: treeDataRenyuan,
        },
      },
    ]);
    setModalProps({ confirmLoading: false, showOkBtn: !formDisabled });
    isUpdate.value = !!data?.isUpdate;
    // = await getXunjianmingxiList;
    if (data.createBy) {
      await setFieldsValue({ createBy: data.createBy });
    }
    if (data.createTime) {
      await setFieldsValue({ createTime: data.createTime });
    }
    if (unref(isUpdate)) {
      //获取详情
      data.record = await getDemoById({ id: data.record.id });
      //表单赋值
      const planDetails = (data.record.planDetails || []).map((item) => normalizePlanDetailRow(item));
      const planAttachments = data.record.planAttachments || [];
      setTableData(planDetails);
      tableData.value = planDetails;
      attachmentTableData.value = planAttachments;
      selectedRowsMingxi.value = planDetails;
      selectedRowsFujian.value = planAttachments;
      setTableDataFujian(planAttachments);
      checkedKeys.value = planDetails.map((item) => item.deviceId);
      checkedKeysUpdate.value = planAttachments.map((item) => item.id);
      // console.log(checkedKeys,'00000000000');
      // 设置 table 勾选
      await nextTick();
      // setSelectedRowKeys(selectKeys)
      await setFieldsValue({
        ...data.record,
        ruleName: data.record.ruleName ?? data.record.cycleRule,
      });
      setModalProps({ confirmLoading: false });
    }
  });

  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  function getActions(record) {
    return [
      {
        label: '添加',
        ifShow: !record.amount || record.amount === undefined || record.amount == null,
        onClick: handleTianjia.bind(null, record),
        // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },

      {
        label: '预览',
        ifShow: record.amount > 0,
        onClick: handleYulan.bind(null, record),
      },
      {
        label: '设置',
        ifShow: record.amount > 0,
        onClick: handleShezhi.bind(null, record),
        // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
      // {
      //   label: '删除',
      //   popConfirm: {
      //     title: '是否确认删除',
      //     confirm: handleDelete.bind(null, record),
      //   },
      //   auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      // },
    ];
  }

  function getActionsUpdate(record) {
    return [
      // {
      //   label: '编辑',
      //   onClick: handleEdit.bind(null, record),
      //   // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      // },
      // {
      //   label: '预览',
      //   onClick: handleDetail.bind(null, record),
      // },
      // {
      //   label: '删除',
      //   popConfirm: {
      //     title: '是否确认删除',
      //     confirm: handleDeleteFujian.bind(null, record),
      //   },
      //   // auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      // },
    ];
  }

  /**
   * 选择列配置
   */
  const rowSelectionMingxi = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };
  const rowSelectionFujian = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeysUpdate,
    onChange: onSelectChangeUpdate,
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], selectedRows) {
    console.log('checkedKeys111------>', checkedKeys, selectedRows);
    checkedKeys.value = selectedRowKeys;
    selectedRowsMingxi.value = selectedRows;
  }

  function onSelectChangeUpdate(selectedRowKeys: (string | number)[], selectedRows) {
    console.log('checkedKeys222------>', checkedKeys);
    checkedKeysUpdate.value = selectedRowKeys;
    selectedRowsFujian.value = selectedRows;
  }

  /**
   * 新增事件
   */
  const isDisabled = ref(false);

  function handleAdd() {
    isDisabled.value = false;
    openModalAdd(true, {
      isUpdate: false,
    });
  }

  function handleGuize() {
    isDisabled.value = false;
    openModalGuize(true, {
      isUpdate: false,
    });
  }

  function handleYulan(record) {
    isDisabled.value = true;
    openModalYulan(true, {
      // record: addList.value,
      record,
      isUpdate: true,
      // deviceId:record.deviceId
    });
  }

  const id = ref(null);

  function handleTianjia(record) {
    isDisabled.value = true;
    id.value = record.id;
    openModalShezhi(true, {
      record,
      isUpdate: false,
    });
  }
  function handleShezhi(record) {
    isDisabled.value = true;
    id.value = record.id;
    openModalShezhi(true, {
      record,
      isUpdate: true,
      // selectedRows:addList.value
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
    openModalYulan(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDemoMingxi({ id: record.id }, reloadMingxi);
  }

  async function handleDeleteFujian(record) {
    // await deleteDemoXunjianjihuafujian({ id: record.id }, reloadFujian);
  }

  /**
   * 批量删除事件
   */
  // async function batchHandleDelete() {
  //   await batchDeleteDemo({ ids: checkedKeys.value }, reload);
  // }
  async function batchHandleDelete() {
    await batchDeleteDemo({ ids: selectedRowKeys.value.join(',') }, () => {
      selectedRowKeys.value = [];
      reloadMingxi();
    });
    // clearSelected();
  }

  async function batchHandleDeleteFujian() {
    // await batchDeleteDemoXunjianjihuafujian({ ids: selectedRowKeys.value }, () => {
    //   checkedKeysUpdate.value = [];
    //   reloadFujian();
    // });
    // clearSelected();
  }

  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      // 业务类型: 1-点检, 2-巡检
      values.bizType = 2;
      values.details = tableData.value;
      values.attachments = attachmentTableData.value;

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

  function reload() {}

  function getShebeiID(rows) {
    const normalizedRows = (rows || []).map((item) => normalizePlanDetailRow(item));
    // console.log(rows,tableData.value,'999999999');
    // tableData.value 是当前表格数据
    const oldData = tableData.value || [];

    // 创建一个 Map，用 deviceId 去重
    const map = new Map<string | number, any>();

    // 先把已有数据加入 map
    oldData.forEach((item) => {
      map.set(item.deviceId, item);
    });

    // 再把新数据加入 map，如果 deviceId 已存在就会覆盖（不会新增）
    normalizedRows.forEach((item) => {
      if (!map.has(item.deviceId)) {
        map.set(item.deviceId, item);
      }
    });

    // 转成数组
    const newData = Array.from(map.values());

    // 更新 tableData 和 table
    tableData.value = newData;
    selectedRowsMingxi.value = newData;
    setTableData(tableData.value);

    // 可选：清空勾选
    checkedKeys.value = [];

    console.log('合并后的数据', tableData.value);
  }

  function getGuize(row) {
    // console.log(row, '3333');
    setFieldsValue({
      ruleId: row.id,
      ruleName: row.ruleName,
      ruleDescription: row.ruleDescription,
    });
  }

  function getXjxmRows(rows) {
    addList.value = rows;
    let Ids = addList.value.map((item) => item.id);
    let itemIds = `${Ids}`;
    // 设置巡检项目数 多少项
    if (tableData.value.length > 0) {
      tableData.value.forEach((item) => {
        if (item.id === id.value) {
          item.amount = rows.length;
          item.itemIds = itemIds;
        }
      });
      console.log(tableData.value, 'aaaaaaaaaaaaaaaaaa');
      setTableData([...tableData.value]); // 重新 set
    }
  }
  function handleCancel() {
    isUpdate.value = false;
  }

  function normalizePlanDetailRow(row) {
    const itemIds = row.itemIds ? String(row.itemIds) : '';
    const amount = row.amount ?? (itemIds ? itemIds.split(',').filter(Boolean).length : 0);
    return {
      ...row,
      deviceId: Number(row.deviceId ?? row.id),
      isPhoto: row.isPhoto ?? 0,
      isScan: row.isScan ?? 0,
      itemIds,
      amount,
    };
  }

  function mergeAttachmentRows(rows) {
    const map = new Map();
    [...(attachmentTableData.value || []), ...(rows || [])].forEach((item) => {
      const key = item.id ?? item.fileUrl ?? item.filePath ?? item.fileName;
      map.set(String(key), item);
    });
    return Array.from(map.values());
  }

  function buildAttachmentRow(res, originalName = '') {
    const uploadResult = res?.result || {};
    const filePath = res?.message || uploadResult.url || uploadResult.fileUrl || uploadResult.filePath || '';
    const fileUrl = filePath ? getFileAccessHttpUrl(filePath) : '';
    const fileName = originalName || uploadResult.fileName || uploadResult.name || filePath.substring(filePath.lastIndexOf('/') + 1);
    return {
      id: Date.now(),
      fileName,
      filePath,
      fileUrl,
      fileSize: uploadResult.fileSize || uploadResult.size || '',
    };
  }

  function buildSafeUploadFileName(fileName = '') {
    const lastDotIndex = fileName.lastIndexOf('.');
    const ext = lastDotIndex >= 0 ? fileName.substring(lastDotIndex).replace(/[^A-Za-z0-9.]/g, '') : '';
    return `attachment_${Date.now()}${ext || ''}`;
  }
</script>
