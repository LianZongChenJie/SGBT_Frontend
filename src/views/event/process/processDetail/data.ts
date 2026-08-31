import { FormSchema } from '/@/components/Table';
// import { getAllRolesListNoByTenant, getAllTenantList } from './user.api';
import { getEventRole } from '../api';
export const nodeFormSchema: FormSchema[] = [
  {
    label: '编码',
    field: 'code',
    required: true,
    component: 'Input',
  },
  {
    label: '名称',
    field: 'name',
    required: true,
    component: 'Input',
  },
  {
    label: '排序号',
    field: 'sortNum',
    required: true,
    component: 'InputNumber',
    componentProps: {
      min: 1,
    },
  },
  {
    label: '描述',
    field: 'description',
    required: false,
    component: 'InputTextArea',
  },
];
export const edgeFormSchema: FormSchema[] = [
  {
    label: '角色',
    field: 'roleName',
    required: true,
    component: 'ApiSelect',
    componentProps: ({ formModel }) => {
      return {
        api: getEventRole,
        labelField: 'name',
        valueField: 'name',
        immediate: false,
        onChange: (_, values) => {
          formModel.roleId = values.id;
        },
      };
    },
    // componentProps: {
    //   //标题字段
    //   labelField: 'roleName',
    //   //值字段
    //   valueField: 'roleName',
    //   //返回结果字段
    //   resultField: 'records',

    // },
  },
  {
    label: '',
    field: 'roleId',
    component: 'Input',
    show: false,
  },
  {
    label: '排序号',
    field: 'sortNum',
    required: true,
    component: 'InputNumber',
    componentProps: {
      min: 1,
    },
  },
  {
    label: '按钮名称',
    field: 'name',
    required: true,
    component: 'Input',
  },
  {
    label: '别名',
    field: 'showName',
    required: true,
    component: 'Input',
  },
  {
    label: '执行器(业务流转类全名)',
    field: 'processor',
    required: true,
    component: 'Input',
    labelLength: 3,
  },
  {
    label: '描述',
    field: 'description',
    required: false,
    component: 'InputTextArea',
  },
  {
    label: '显示按钮',
    field: 'isShow',
    component: 'Switch',
    defaultValue: 'true',
    componentProps: {
      //开关大小，可选值：default small
      size: 'default',
      //非选中时的内容
      unCheckedChildren: '隐藏',
      //非选中时的值
      unCheckedValue: 'false',
      //选中时的内容
      checkedChildren: '显示',
      //选中时的值
      checkedValue: 'true',
      //是否禁用
      disabled: false,
    },
  },
];
// 基本设置表单
export const panelFormSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '流程编码',
    field: 'flowCode',
    required: true,
    component: 'Input',
  },
  {
    label: '流程名称',
    field: 'flowName',
    required: true,
    component: 'Input',
  },
  {
    label: '业务处理类(IService实现类全路径)',
    field: 'businessClassFullName',
    required: true,
    component: 'Input',
    labelLength: 5,
  },
  {
    label: '描述',
    field: 'description',
    required: false,
    component: 'InputTextArea',
  },
];
