import { BasicColumn, FormSchema } from '/@/components/Table';
import { getAllRoles } from './renter.api.ts';
export const columns: BasicColumn[] = [
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '描述',
    dataIndex: 'description',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '名称', //显示label
    field: 'name', //查询字段
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
    label: '名称',
    field: 'name',
    required: true,
    component: 'Input',
  },
  {
    label: '描述',
    field: 'description',
    required: false,
    component: 'InputTextArea',
  },
];
export const userFormSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '绑定用户',
    field: 'ids',
    component: 'ApiSelect',
    defaultValue: [],
    componentProps: {
      mode: 'multiple',
      api: getAllRoles,
      labelField: 'realname',
      valueField: 'id',
      immediate: false,
      // 确保值以数组形式处理
      numberToString: true,
    },
  },
];
