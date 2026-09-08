<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled" class="pr3">
      <template #faultDesc="{ model, field }">
        <div style="display: flex; align-items: flex-start; gap: 8px; width: 100%">
          <a-textarea v-model:value="model.faultDesc" :rows="3" style="flex: 1" placeholder="请输入故障描述" />
          <a style="white-space: nowrap; margin-top: 6px" @click="openFaultLib"> 故障库 </a>
        </div>
      </template>

      <template #tableSlotBeijian>
        <BasicTable @register="registerTableBeijian">
          <template #tableTitle>
            <!--            <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleBeijian">添加</a-button>-->
            <!--            <a-button preIcon="ant-design:export-outlined" type="primary"-->
            <!--                      @click="handleExportXls('单表示例', getExportUrl, exportParams)"-->
            <!--            >导入-->
            <!--            </a-button>-->
            <!--          </template>-->
            <!--            <a-dropdown v-if="checkedKeys.length > 0">-->
            <!--              <template #overlay>-->
            <!--                <a-menu>-->
            <!--                  <a-menu-item v-if="!hasPermission('operation:operation_inspection_point_plan:deleteBatch')"-->
            <!--                               @click="batchHandleDelete">-->
            <!--                    <Icon icon="ant-design:delete-outlined" />-->
            <!--                    批量删除-->
            <!--                  </a-menu-item>-->
            <!--                </a-menu>-->
            <!--              </template>-->
            <!--              <a-button>-->
            <!--                批量操作-->
            <!--                <Icon icon="ant-design:down-outlined" />-->
            <!--              </a-button>-->
            <!--            </a-dropdown>-->
          </template>
          <!--          <template #action="{ record }">-->
          <!--            <TableAction :actions="getActions(record)" />-->
          <!--          </template>-->

          <template #qty="{ text, record }">
            <a-input-number v-model:value="record.qty" style="width: 100%" placeholder="请输入"></a-input-number>
          </template>
          <template #remark="{ text, record }">
            <div style="display: flex; align-items: flex-start; gap: 8px; width: 100%">
              <a-textarea v-model:value="record.remark" :rows="1" style="flex: 1" placeholder="请输入" />
            </div>
          </template>
        </BasicTable>
      </template>
      <template #tableSlotFujian>
        <BasicTable @register="registerTableUpdate" :rowSelection="rowSelectionFujian">
          <template #tableTitle>
            <!--        <BasicUpload :maxSize="20000" :maxNumber="10"  :api="uploadApi" class="my-5" :accept="['png/*']" />-->
            <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">上传文档 </j-upload-button>
            <!--        <j-upload-button type="primary" preIcon="ant-design:import-outlined"  @click="handleImport">上传文档 </j-upload-button>-->

            <!--            <a-button v-if="hasPermission('energy:energy_device_info:exportXls')" preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl,exportParams)">-->
            <!--              批量下载-->
            <!--            </a-button>-->
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
      </template>
    </BasicForm>

    <DemoModalBeijian :isDisabled="isDisabled" @register="registerModalBeijian" @success="getShebeiID"></DemoModalBeijian>
    <DemoModalBeijianlingyong
      :isDisabled="isDisabled"
      @register="registerModalBeijianlingyong"
      @success="getBeijianlingyongID"
    ></DemoModalBeijianlingyong>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import DemoModalBeijian from '@/views/nengyuanzhan/shengchanguanli/beijianguanli/beijiantaizhang/DemoModalBeijian.vue';
  import DemoModalBeijianlingyong from '@/views/nengyuanzhan/shengchanguanli/beijianguanli/beijianlingyong/DemoModalBeijianlingyong.vue';

  const [registerModalBeijian, { openModal: openModalBeijian }] = useModal();
  const [registerModalBeijianlingyong, { openModal: openModalBeijianlingyong }] = useModal();
  const { hasPermission } = usePermission();
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { getDemoById, getImportUrlFujian, getSheetNoDetail } from './demo.api';
  import { saveOrUpdateDemoLingyong } from '@/views/nengyuanzhan/shengchanguanli/beijianguanli/chukutaizhang/demo.api';
  import { getUserData } from '@/views/system/usersetting/UserSetting.api';
  import { queryTreeList } from '@/api/common/api';
  import { getExportUrl } from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeitaizhang/demo.api';
  import { BasicColumn, BasicTable, TableAction, useTable } from '@/components/Table';
  import { useListPage } from '@/hooks/system/useListPage';
  import { filterObj } from '@/utils/common/compUtils';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';

  const checkedKeysUpdate = ref<Array<string | number>>([]);
  const checkedKeys = ref<Array<string | number>>([]);
  const selectedRowsFujian = ref<any[]>([]);
  const exportParams = computed(() => {
    let paramsForm = {
      // id: id.value,
    };
    if (checkedKeysUpdate.value && checkedKeysUpdate.value.length > 0) {
      paramsForm['selections'] = checkedKeysUpdate.value.join(',');
    }
    return filterObj(paramsForm);
  });
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
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
  ];
  const { tableContext: tableContextFujian, onImportXls } = useListPage({
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
        ifShow: false,
      },
    },
    exportConfig: {
      name: '下载模版',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrlFujian,
      success: (res) => {
        const filePath = res?.message || res?.result?.url || res?.result?.fileUrl || res?.result?.filePath || '';
        if (!filePath) {
          return;
        }
        const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
        const rows = [
          ...selectedRowsFujian.value,
          {
            id: Date.now(),
            fileName,
            filePath,
            fileSize: res?.result?.fileSize || '',
          },
        ];
        selectedRowsFujian.value = rows;
        checkedKeysUpdate.value = [];
        setTableDataFujian(rows);
      },
    },
  });
  const [registerTableUpdate, { setTableData: setTableDataFujian }] = tableContextFujian;
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  function onSelectChange(selectedRowKeys: (string | number)[]) {
    console.log('checkedKeys------>', checkedKeys);
    checkedKeys.value = selectedRowKeys;
  }

  const rowSelectionFujian = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeysUpdate,
    onChange: onSelectChangeUpdate,
  };

  function getActionsUpdate(record) {
    return [
      {
        label: '下载',
        // onClick: handleEdit.bind(null, record),
        // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
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

  function onSelectChangeUpdate(selectedRowKeys: (string | number)[], selectedRows) {
    console.log('checkedKeys222------>', checkedKeys);
    checkedKeysUpdate.value = selectedRowKeys;
    selectedRowsFujian.value = selectedRows;
  }

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
      label: '基本信息',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    // {
    //   field: 'sheetNo',
    //   label: '出库单号',
    //   component: 'Input',
    //   required: true,
    //   colProps: { span: 12 },
    //   componentProps: {
    //     disabled: true,
    //   },
    // },
    {
      field: 'subject',
      label: '出库主题',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
      },
    },
    {
      field: 'sheetType',
      label: '出库类型',
      component: 'Select',
      required: true,
      colProps: { span: 12 },
      defaultValue: '2',
      componentProps: {
        disabled: true,
        options: [
          { label: '普通出库', value: '1' },
          { label: '领用出库', value: '2' },
        ],
      },
    },
    {
      field: 'opDate',
      label: '出库日期',
      component: 'DatePicker',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        valueFormat: 'YYYY-DD-MM',
        disabled: false,
        style: { width: '100%' },
      },
    },
    {
      field: 'applicant',
      label: '出库申请人',
      component: 'TreeSelect',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
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
    {
      field: 'applicant',
      label: '出库申请人',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    // {
    //   field: 'sysOrgCode1',
    //   label: '所在部门',
    //   component: 'JSelectDept',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps:{
    //     disabled: true,
    //     showButton: false,
    //     style: {
    //       width: '100%',
    //     },
    //     labelKey:'departName',
    //     rowKey:'orgCode'
    //   }
    // },
    {
      field: 'sheetNo',
      label: '领用单号',
      component: 'Input',
      required: true,
      // ifShow: ({ values }) => {
      //   return values.sheetType === '2';
      // },
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        readonly: true,
        //搜索之后触发事件
        // onSearch: (value: any) => {
        //   //搜索之后的逻辑处理
        //   console.log(value);
        //   handleBeijianlingyong();
        // },
      },
    },

    // {
    //   field: 'deptNaaame',
    //   label: '仓库名称',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },
    // {
    //   field: 'deptN2e',
    //   label: '仓库管理员',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },
    // {
    //   field: 'chargerId',
    //   label: '出库人员',
    //   component: 'TreeSelect',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     style: { width: '100%' },
    //     disabled: false,
    //     // treeCheckable: true,
    //     // title: '下拉树',
    //     treeData: [], // 先给空
    //     fieldNames: {
    //       label: 'label',
    //       value: 'id',
    //       children: 'children',
    //     },
    //   },
    // },
    // {
    //   field: 'sysOrgCode',
    //   label: '所在部门',
    //   component: 'JSelectDept',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps:{
    //     disabled: true,
    //     showButton: false,
    //     style: {
    //       width: '100%',
    //     },
    //     labelKey:'departName',
    //     rowKey:'orgCode'
    //   }
    // },

    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      required: false,
      colProps: { span: 24 },
      componentProps: {
        rows: 3,
        disabled: false,
        style: { width: '100%' },
      },
    },

    {
      field: 'baseTitle2',
      component: 'Divider',
      label: '备件明细',
      componentProps: {
        //是否虚线
        dashed: false,
        //分割线标题的位置（left | right | center）
        orientation: 'left',
        //文字是否显示为普通正文样式
        plain: true,
        //水平还是垂直类型（horizontal | vertical）
        type: 'horizontal',
      },
    },
    {
      field: 'tableSlot',
      label: '',
      component: 'Input',
      slot: 'tableSlotBeijian',
      colProps: { span: 24 },
    },
    //
    // {
    //   field: 'baseTitle3',
    //   component: 'Divider',
    //   label: '附件',
    //   componentProps: {
    //     //是否虚线
    //     dashed: false,
    //     //分割线标题的位置（left | right | center）
    //     orientation: 'left',
    //     //文字是否显示为普通正文样式
    //     plain:true,
    //     //水平还是垂直类型（horizontal | vertical）
    //     type:'horizontal',
    //   },
    // },
    // {
    //   field: 'tableSlot1',
    //   label: '',
    //   component: 'Input',
    //   slot: 'tableSlotFujian',
    //   colProps: { span: 24 },
    //
    // },
  ];
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, clearValidate, getFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 150,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    const treeDataRenyuan = await getTreeListRenyuan();
    updateSchema([
      {
        field: 'applicant',
        componentProps: {
          treeData: treeDataRenyuan,
        },
      },
    ]);
    await resetFields();
    let userObj = await getUserData();
    console.log(userObj.result, '获取用户信息');
    let dept = await queryTreeList({ ids: userObj.result.departIds });
    console.log(dept, '获取部门');
    let obj = {
      reporterName: userObj.result.username,
      reporterId: userObj.result.id,
      deptName: dept[0].departName,
      deptId: dept[0].id,
      contactPhone: userObj.result.phone,
    };
    console.log(obj, 'aaaaaaaaaaaaa');
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    await setFieldsValue({
      ...obj,
    });
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
      let arr = await getSheetNoDetail({ sheetNo: data.record.sheetNo });
      console.log(arr, '获取的table');
      //表单赋值

      await setFieldsValue({
        ...data.record,
      });
      clearValidate();
      await setTableData(arr);
    }
  });
  const columnsTableBeijian: BasicColumn[] = [
    {
      title: '备件编码',
      dataIndex: 'deviceCode',
      width: 170,
      resizable: true,
    },
    {
      title: '备件名称',
      dataIndex: 'deviceName',
      width: 170,
      resizable: true,
    },
    {
      title: '规格型号',
      dataIndex: 'deviceModule',
      width: 130,
      resizable: true,
    },
    {
      title: '备件类型',
      dataIndex: 'deviceTypeName',
      width: 130,
      resizable: true,
    },
    {
      title: '品牌',
      dataIndex: 'supplier',
      width: 140,
      resizable: true,
    },
    {
      title: '设备厂家',
      dataIndex: 'factory',
      width: 140,
      resizable: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 140,
      resizable: true,
    },
    {
      title: '当前库存',
      dataIndex: 'invQty',
      width: 140,
      resizable: true,
    },
    {
      title: '申领数量',
      dataIndex: 'applyQty',
      width: 140,
      resizable: true,
    },
    {
      title: '已出库数量',
      dataIndex: 'outQty',
      width: 140,
      resizable: true,
    },
    {
      title: '本次出库数量(必填)',
      dataIndex: 'qty',
      width: 140,
      resizable: true,
      fixed: 'right',
      slots: { customRender: 'qty' },
    },

    // {
    //   title: '存放位置',//后端给的是设备位置
    //   dataIndex: 'spaceId',
    //   width: 140,
    //   resizable: true,
    // },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   width: 140,
    //   resizable: true,
    //   slots: { customRender: 'remark' },
    // },
  ];
  const [registerTableBeijian, { setTableData, getDataSource }] = useTable({
    title: '',
    // api: getDemoListAll,
    columns: columnsTableBeijian,
    formConfig: {
      //labelWidth: 120,
      // schemas: searchFormSchema,
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
    useSearchForm: false,
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
    pagination: false, // 🔥 直接不显示分页
    // beforeFetch: (params) => {
    //   return {
    //     ...params,
    //     // tabType: activeKey.value,
    //   };
    // },
    // actionColumn: {
    //   width: 150,
    //   title: '操作',
    //   dataIndex: 'action',
    //   slots: { customRender: 'action' },
    //   fixed: 'right',
    // },
  });

  function getActions(record) {
    return [
      // {
      //   label: '下载',
      //   // onClick: handleEdit.bind(null, record),
      //   // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      // },
      // {
      //   label: '预览',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDeleteBeijian.bind(null, record),
        },
        // auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '领用出库' : '领用出库'));

  function handleBeijianlingyong() {
    openModalBeijianlingyong(true, {
      isUpdate: false,
    });
  }

  function handleBeijian() {
    openModalBeijian(true, {
      isUpdate: false,
    });
  }

  function getShebeiID(record) {
    console.log(record, '子组件传过来的设备数组');
    setTableData(record);
  }

  function getBeijianlingyongID(record) {
    console.log(record, '子组件传过来的备件领用单号');
    setFieldsValue({
      applicationNo: record.sheetNo,
    });
  }

  function handleDeleteBeijian(record) {
    let arr = getDataSource();
    arr.forEach((item, index) => {
      if (item.id === record.id) {
        arr.splice(index, 1);
      }
    });
    setTableData(arr);
  }

  /**
   * 新增事件
   */
  const isDisabled = ref(false);

  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      // console.log(values, 'bbbbbbbbbb');
      setModalProps({ confirmLoading: true });
      //提交表单
      let arr = getDataSource().map((item) => {
        return {
          deviceId: item.id,
          qty: item.qty,
        };
      });
      let obj = {
        // ...values,
        applicationNo: values.sheetNo,
        spareParts: arr,
        subject: values.subject,
      };
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateDemoLingyong(obj, false);

      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
