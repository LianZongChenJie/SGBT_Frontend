import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '版本号',
    dataIndex: 'code',
    align: 'center',
  },
  {
    title: '更新内容',
    dataIndex: 'content',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '版本号', //显示label
    field: 'code', //查询字段
    component: 'JInput', //渲染的组件
  },
];

export const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '版本号',
    field: 'code',
    required: true,
    component: 'Input',
  },
  {
    label: '内容',
    field: 'content',
    required: false,
    component: 'InputTextArea',
  },
];
