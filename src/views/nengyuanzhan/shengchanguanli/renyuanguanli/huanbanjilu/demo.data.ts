import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '换班人',
    dataIndex: 'employeeName',
    width: 130,
    resizable: true,
  },
  {
    title: '换班日期',
    dataIndex: 'planDate',
    width: 140,
    resizable: true,
  },
  {
    title: '原班次',
    dataIndex: 'planName',
    width: 140,
    resizable: true,
  },
  {
    title: '替班日期',
    dataIndex: 'targetPlanDate',
    width: 140,
    resizable: true,
  },
  {
    title: '更换班次',
    dataIndex: 'newPlanName',
    width: 140,
    resizable: true,
  },
  {
    title: '替班人',
    dataIndex: 'targetEmployeeName',
    width: 140,
    resizable: true,
  },
  {
    title: '操作人',
    dataIndex: 'createBy',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'employeeName',
    label: '换班人姓名',
    component: 'Input',
    componentProps: {
      trim: true,
      placeholder: '请输入换班人姓名',
    },
    colProps: { span: 8 },
  },

  {
    field: 'planDate',
    label: '换班日期',
    component: 'DatePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择换班日期',
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
