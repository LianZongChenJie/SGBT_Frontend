import { BasicColumn, FormSchema } from '/@/components/Table';
import { JVxeColumn, JVxeTypes } from '/@/components/jeecg/JVxeTable/types';

export const columns: BasicColumn[] = [
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '位置',
    dataIndex: 'position',
  },
  {
    title: '容纳人数',
    dataIndex: 'peopleNumber',
  },
  {
    title: '规模',
    dataIndex: 'scale_dictText',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    label: 'id',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'position',
    label: '位置',
    component: 'Input',
    required: true,
  },
  {
    field: 'scale',
    label: '规模',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'meeting_scale',
    },
  },
  {
    field: 'type',
    label: '类型',
    component: 'Select',
    defaultValue: 'common',
    componentProps: {
      options: [
        { label: '普通会议室', value: 'common' },
        { label: '临时会议室', value: 'temp' },
      ],
    },
  },
  {
    field: 'peopleNumber',
    label: '容纳人数',
    component: 'InputNumber',
  },
  {
    field: 'manageDepart',
    label: '管理部门',
    component: 'JSelectDept',
    componentProps: {
      sync: false,
      checkStrictly: true,
      defaultExpandLevel: 2,
    },
  },
  {
    field: 'officeLocation',
    label: '办公地点',
    component: 'Input',
  },
  {
    field: 'processStatus',
    label: '流程审批',
    component: 'RadioGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        {
          label: '是',
          value: '1',
        },
        {
          label: '否',
          value: '0',
        },
      ],
    },
  },
  {
    field: 'fitProcess',
    label: '适用流程',
    component: 'Select',
    componentProps: {
      options: [],
    },
    ifShow: ({ values }) => {
      return values.processStatus === '1';
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
  },
];

export const subColumns: JVxeColumn[] = [
  {
    title: '设备名称',
    key: 'deviceName',
    type: JVxeTypes.input,
    defaultValue: '',
    placeholder: '请输入${title}',
    validateRules: [{ required: true, message: '${title}不能为空' }],
  },
  {
    title: '设备数量',
    key: 'deviceNumber',
    type: JVxeTypes.inputNumber,
    defaultValue: '',
    placeholder: '请输入${title}',
  },
  {
    title: '设备说明',
    key: 'deviceDesc',
    type: JVxeTypes.input,
    defaultValue: '',
    placeholder: '请输入${title}',
  },
];
