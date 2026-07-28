import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '巡检对象类型',
    align: "center",
    dataIndex: 'objectTypeText',
    width: 100
  },
  {
    title: '具体设备/空间类型',
    align: "center",
    dataIndex: 'objectSubtypeName',
    width: 150
  },
  {
    title: '巡检项',
    align: "center",
    dataIndex: 'itemName',
  },
  {
    title: '巡检内容',
    align: "center",
    dataIndex: 'contentName',
  },
  {
    title: '结果类型',
    align: "center",
    dataIndex: 'resultType',
    width: 90
  },
  {
    title: '选项值',
    align: "center",
    dataIndex: 'optionValues',
    width: 110
  }
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'contentName',
    label: '巡检内容',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'objectTypeText',
    label: '巡检对象类型',
    component: 'Select',
    componentProps: {
      options: [
        { value: '', label: '请选择对象类型' },
        { value: '设备', label: '设备' },
        { value: '空间', label: '空间' },
        { value: '系统', label: '系统' },
        { value: '其他', label: '其他' },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'resultType',
    label: '结果类型',
    component: 'Select',
    componentProps: {
      options: [
        { value: '', label: '请选择结果类型' },
        { value: 'OPTION', label: '选项' },
        { value: 'PERCENTAGE', label: '百分比' },
        { value: 'TEXT', label: '文本' },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'objectSubtypeName',
    label: '具体类型',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'itemName',
    label: '巡检项',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'optionValues',
    label: '选项值',
    component: 'Input',
    colProps: { span: 8 },
  },
];
