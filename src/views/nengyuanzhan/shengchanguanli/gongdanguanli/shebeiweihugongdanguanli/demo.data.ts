

import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '任务单号',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '工单类型',
    dataIndex: 'keyWord',
    width: 130,
    resizable: true,
  },
  {
    title: '优先级',
    dataIndex: 'punchTime',
    width: 140,
    resizable: true,
  },
  {
    title: '故障设备',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '问题描述',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '计划开始时间',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '计划结束时间',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '报修时间',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '创建人',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '修改时间',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '修改人',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '工单名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },

  {
    field: 'name',
    label: '设备系统',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
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
    label: '执行人',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '工单状态',
    component: 'Select',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '工单类型',
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
    label: '资料名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '资料简介',
    component: 'InputTextArea',
    required: true,
    componentProps: {},
  },
  {
    field: 'aaa',
    label: '资料上传',
    required: false,
    component: 'JImageUpload',
    componentProps: {
      text: '点击上传',

    },
  },
  {
    field: 'keyWord',
    label: '资料时长',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '资料目录',
    component: 'Select',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '课室',
    component: 'Select',
    required: true,
    componentProps: {},
  },
];

