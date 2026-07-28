import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '启用',
    key: 'switch',
    width: 60,
    slots: { customRender: 'switch' },
  },
  { title: '路由名称', dataIndex: 'routeName' },
  { title: '跳转类型', dataIndex: 'routeType_dictText' },
  { title: '路由地址', dataIndex: 'routePath', ellipsis: true },
];

export const searchFormSchemas: FormSchema[] = [
  {
    label: '路由名称',
    field: 'routeName',
    component: 'JInput',
  },
  {
    label: '跳转类型',
    field: 'routeType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'desform_route_type',
      // placeholder: '请选择跳转类型',
    },
  },
];

export const formSchemas: FormSchema[] = [
  {
    label: '路由名称',
    field: 'routeName',
    component: 'Input',
    required: true,
  },
  {
    label: '跳转类型',
    field: 'routeType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'desform_route_type',
      getPopupContainer: () => document.body,
    },
    required: true,
  },
  {
    // 表单跳转时填表单的code；
    // 菜单跳转填菜单路径；
    // 外部跳转填全链接
    label: '路由地址',
    field: 'routePath',
    component: 'Input',
    required: true,
  },
];
