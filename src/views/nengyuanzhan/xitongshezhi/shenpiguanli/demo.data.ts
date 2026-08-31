import { FormSchema } from '/@/components/Table';
import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';


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
    field: 'formName',
    label: '表单名称',
    component: 'Input',
    required: true,
    componentProps: {
      disabled: true,
    },
  },

  {
    field: 'scopeIds',
    label: '适用范围',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      mode: 'multiple', // ⭐ 开启多选
      api: getTreeListBanzu,
      labelField: 'groupName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
    },
  },
  {
    field: 'approvalIds',
    label: '审批人',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      mode: 'multiple',
      api: getTreeListRenyuan,
      labelField: 'label', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
    },
  },
  // {
  //   field: 'isEnable',
  //   label: '是否启用',
  //   component: 'Switch',
  //   required: true,
  //   componentProps: {
  //     //开关大小，可选值：default small
  //     size: 'default',
  //     //非选中时的内容
  //     unCheckedChildren: '停用',
  //     //非选中时的值
  //     unCheckedValue: 0,
  //     //选中时的内容
  //     checkedChildren: '启用',
  //     //选中时的值
  //     checkedValue: 1,
  //     //是否禁用
  //     disabled: false,
  //   },
  // },
  {
    field: 'remark',
    label: '备注',
    component: 'Input',
    required: false,
    componentProps: {},
  },
];

