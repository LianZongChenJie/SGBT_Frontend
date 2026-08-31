import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '设备名称',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  // {
  //   title: '设备经度',
  //   dataIndex: 'name',
  //   width: 170,
  //   resizable: true,
  // },
  // {
  //   title: '设备纬度',
  //   dataIndex: 'keyWord',
  //   width: 130,
  //   resizable: true,
  // },
  {
    title: '设备状态',
    dataIndex: 'punchTime',
    width: 140,
    resizable: true,
  },
  {
    title: '厂家',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '设备责任人',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '设备使用人',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '设备位置',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '购置日期',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '使用寿命',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '设备图片',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '保修期',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '巡检点检周期',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '供应商',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '二维码',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '状态',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '创建人',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '创建时间',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '修改人',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '修改时间',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },{
    title: '备注',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '设备名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '设备状态',
    component: 'Select',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },

  {
    field: 'name',
    label: '厂家',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
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
    field: 'name',
    label: '维修工单名称',
    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入维修工单名称',
    },
  },
  {
    field: 'keyWord',
    label: '问题类型',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择问题类型',
    },
  },
  {
    field: 'keyWord',
    label: '优先级',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择优先级',
    },
  },
  {
    field: 'keyWord',
    label: '选择设备',
    component: 'Select',
    required: true,
    componentProps: {
      placeholder: '请选择',
    },
  },
  {
    field: 'keyWord',
    label: '问题描述',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      placeholder: '请输入内容',
    },
  },
  {
    field: 'keyWord',
    label: '厂家',
    required: true,
    component: 'Input',
    componentProps: {
      placeholder: '请输入厂家',
    },
  },
  {
    field: 'keyWord',
    label: '设备使用人',
    required: true,
    component: 'Input',
    componentProps: {
      placeholder: '请输入设备使用人',
    },
  },

  {
    field: 'birthday',
    label: '备注',
    component: 'InputTextArea',
    defaultValue: '',
    componentProps: {
      placeholder: '请输入',
    },
  },
];
