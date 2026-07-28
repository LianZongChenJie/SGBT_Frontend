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
  {
    title: '设备类型',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '门编码',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '图纸编码',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '设备位置',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '门禁状态',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '门状态',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '通讯状态',
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
    label: '图纸编码',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '门编码',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '门状态',
    component: 'Select',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '门禁状态',
    component: 'Select',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '通讯状态',
    component: 'Select',
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
    label: '换班人姓名',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '换班日期',
    component: 'DatePicker',
    required: true,
    componentProps: {},
  },
];
