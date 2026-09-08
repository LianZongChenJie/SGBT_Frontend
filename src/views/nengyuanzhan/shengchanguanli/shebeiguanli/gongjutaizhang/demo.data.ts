import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
import { renderTablePreviewImage } from '../../../utils/renderTablePreviewImage';
import { TOOL_LEDGER_CATEGORY } from './demo.api';

export const columns: BasicColumn[] = [
  {
    title: '工具名称',
    dataIndex: 'deviceName',
    width: 180,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '工具编码',
    dataIndex: 'deviceCode',
    width: 180,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '工具型号',
    dataIndex: 'deviceModule',
    width: 160,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '工具类型',
    dataIndex: 'deviceTypeName',
    width: 160,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '库存数量',
    dataIndex: 'invQty',
    width: 120,
    resizable: true,
  },
  {
    title: '品牌',
    dataIndex: 'factory',
    width: 140,
    resizable: true,
  },
  {
    title: '所属部门',
    dataIndex: 'orgName',
    width: 160,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '所属库房',
    dataIndex: 'spaceName',
    width: 160,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '使用状态',
    dataIndex: 'deviceStatus',
    width: 130,
    resizable: true,
    customRender: ({ text }) => {
      if (text == 1) return '在途';
      if (text == 2) return '待维修';
      if (text == 3) return '维修中';
      if (text == 4) return '入库';
      return '-';
    },
  },
  {
    title: '工具责任人',
    dataIndex: 'official',
    width: 140,
    resizable: true,
  },
  {
    title: '工具使用人',
    dataIndex: 'user',
    width: 140,
    resizable: true,
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
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
    title: '工具图片',
    dataIndex: 'devicePic',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      return renderTablePreviewImage({
        text,
        width: 100,
        height: 60,
        style: {
          width: '100px',
          height: '60px',
          objectFit: 'cover',
          borderRadius: '4px',
        },
      });
    },
  },
  {
    title: '巡检周期(月)',
    dataIndex: 'cycle',
    width: 140,
    resizable: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 180,
    resizable: true,
    ellipsis: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '工具名称',
    field: 'deviceName',
    component: 'Input',
    componentProps: {
      placeholder: '请输入工具名称',
      allowClear: true,
    },
    colProps: { span: 12 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'deviceCode',
    label: 'deviceCode',
    component: 'Input',
    show: false,
  },
  {
    field: 'category',
    label: 'category',
    component: 'Input',
    show: false,
    defaultValue: TOOL_LEDGER_CATEGORY,
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
    field: 'deviceName',
    label: '工具名称',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      maxlength: 80,
      placeholder: '请输入工具名称',
    },
  },
  {
    field: 'deviceTypeId',
    label: '工具类型',
    component: 'TreeSelect',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      treeData: [],
      placeholder: '请选择工具类型',
      allowClear: true,
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'invQty',
    label: '库存数量',
    component: 'InputNumber',
    colProps: { span: 12 },
    componentProps: {
      min: 0,
      precision: 0,
      style: { width: '100%' },
      placeholder: '请输入库存数量',
    },
  },
  {
    field: 'deviceModule',
    label: '工具型号',
    colProps: { span: 12 },
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入工具型号',
    },
  },
  {
    field: 'factory',
    label: '品牌',
    colProps: { span: 12 },
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入品牌',
    },
  },
  {
    field: 'supplier',
    label: '供应商',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入供应商',
    },
  },
  {
    field: 'official',
    label: '工具责任人',
    colProps: { span: 12 },
    component: 'TreeSelect',
    componentProps: {
      allowClear: true,
      treeData: [],
      placeholder: '请选择工具责任人',
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'user',
    label: '工具使用人',
    colProps: { span: 12 },
    component: 'TreeSelect',
    componentProps: {
      allowClear: true,
      treeData: [],
      placeholder: '请选择工具使用人',
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'spaceId',
    label: '所属库房',
    colProps: { span: 12 },
    component: 'TreeSelect',
    componentProps: {
      treeData: [],
      allowClear: true,
      placeholder: '请选择所属库房',
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    colProps: { span: 12 },
    component: 'JSelectDept',
    componentProps: {
      showButton: false,
      style: {
        width: '100%',
      },
      labelKey: 'departName',
      rowKey: 'orgCode',
    },
  },
  {
    field: 'cadCode',
    label: 'CAD 编码',
    colProps: { span: 12 },
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入 CAD 编码',
    },
  },
  {
    field: 'deviceStatus',
    label: '使用状态',
    colProps: { span: 12 },
    component: 'RadioGroup',
    required: true,
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '在途', value: 1 },
        { label: '待维修', value: 2 },
        { label: '维修中', value: 3 },
        { label: '入库', value: 4 },
      ],
    },
  },
  {
    field: 'purchaseDate',
    label: '购置日期',
    colProps: { span: 12 },
    component: 'DatePicker',
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择购置日期',
    },
  },
  {
    field: 'serviceLife',
    label: '使用寿命(月)',
    colProps: { span: 12 },
    component: 'InputNumber',
    componentProps: {
      min: 0,
      precision: 0,
      style: { width: '100%' },
      placeholder: '请输入使用寿命',
    },
  },
  {
    field: 'warranty',
    label: '保修期(月)',
    colProps: { span: 12 },
    component: 'InputNumber',
    componentProps: {
      min: 0,
      precision: 0,
      style: { width: '100%' },
      placeholder: '请输入保修期',
    },
  },
  {
    field: 'cycle',
    label: '巡检点检周期(月)',
    colProps: { span: 12 },
    component: 'InputNumber',
    componentProps: {
      min: 0,
      precision: 0,
      style: { width: '100%' },
      placeholder: '请输入巡检点检周期',
    },
  },
  {
    field: 'lo',
    label: '工具经度',
    component: 'Input',
    colProps: { span: 12 },
    componentProps: {
      maxlength: 50,
      placeholder: '请输入工具经度',
    },
  },
  {
    field: 'la',
    label: '工具纬度',
    component: 'Input',
    colProps: { span: 12 },
    componentProps: {
      maxlength: 50,
      placeholder: '请输入工具纬度',
    },
  },
  {
    field: 'devicePic',
    label: '工具图片',
    colProps: { span: 12   },
    component: 'JImageUpload',
    componentProps: {
      text: '上传图片',
      disabled: false,
      fileMax: 1,
    },
  },
  {
    field: 'remark',
    label: '备注',
    colProps: { span: 12 },
    component: 'InputTextArea',
    componentProps: {
      maxlength: 200,
      rows: 4,
      showCount: true,
      placeholder: '请输入备注',
    },
  },
];
