import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '班次编码',
    dataIndex: 'planCode',
    width: 170,
    resizable: true,
  },
  {
    title: '班次名称',
    dataIndex: 'planName',
    width: 170,
    resizable: true,
  },
  {
    title: '上班时间',
    dataIndex: 'planStart',
    width: 130,
    resizable: true,
  },
  {
    title: '下班时间',
    dataIndex: 'planEnd',
    width: 130,
    resizable: true,
  },
  {
    title: '所属部门',
    dataIndex: 'sysOrgName',
    width: 140,
    resizable: true,
  },
  {
    title: '工时(小时)',
    dataIndex: 'workHours',
    width: 140,
    resizable: true,
  },
  {
    title: '上班可延时(分钟)',
    dataIndex: 'startDelay',
    width: 140,
    resizable: true,
  },
  {
    title: '下班可提前(分钟)',
    dataIndex: 'endAhead',
    width: 140,
    resizable: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'planName',
    label: '班次名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },

  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    componentProps: {
      showButton: false,
      multiple: false,
      checkStrictly: true,
      labelKey: 'departName',
      rowKey: 'orgCode',
      placeholder: '请选择所属部门',
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
    field: 'planName',
    label: '班次名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'planCode',
    label: '班次编码',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'planStart',
    label: '上班时间',
    component: 'DatePicker',
    required: true,
    componentProps: {
      picker: 'time',
      format: 'HH:mm',
      valueFormat: 'HH:mm',
    },
  },
  {
    field: 'planEnd',
    label: '下班时间',
    component: 'DatePicker',
    required: true,
    slot: 'planEndWithNextDay',
    componentProps: {
      picker: 'time',
      format: 'HH:mm',
      valueFormat: 'HH:mm',
    },
  },
  {
    field: 'planNextDay',
    label: '次日',
    component: 'Switch',
    required: false,
    show: false,
    componentProps: {
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    required: true,
    componentProps: {
      showButton: false,
      multiple: false,
      checkStrictly: true,
      labelKey: 'departName',
      rowKey: 'orgCode',
      placeholder: '请选择所属部门',
    },
  },
  {
    field: 'startDelay',
    label: '上班可延时',
    component: 'InputNumber',
    required: false,
    // suffix: '分钟',
    componentProps: {
      min: 0, // 必须 > 0
      addonAfter: '分钟',
      style: {
        width: '100%',
      },
    },
  },
  {
    field: 'endAhead',
    label: '下班可提前',
    component: 'InputNumber',
    required: false,
    componentProps: {
      min: 0, // 必须 > 0
      addonAfter: '分钟',
      style: {
        width: '100%',
      },
    },
  },
  {
    field: 'workHours',
    label: '工时',
    component: 'InputNumber',
    required: false,
    componentProps: {
      min: 0.5, // 必须 > 0
      precision: 1, // 小数位（按需）
      addonAfter: '小时',
      style: {
        width: '100%',
      },
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    required: false,
    componentProps: {},
  },
];
