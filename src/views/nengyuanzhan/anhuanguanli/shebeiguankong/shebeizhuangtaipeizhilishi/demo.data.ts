import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '下发时间',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '配置名称',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '创建人',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '创建时间',
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
    title: '任务状态',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '配置名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '状态',
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
