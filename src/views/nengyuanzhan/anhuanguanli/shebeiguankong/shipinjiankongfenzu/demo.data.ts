import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
import { getPlaceTypes } from '@/views/nengyuanzhan/anhuanguanli/shebeiguankong/shipinjiankongfenzu/demo.api';

export const columns: BasicColumn[] = [
  {
    title: '摄像机组名称',
    dataIndex: 'groupName',
    width: 100,
  },
  // {
  //   title: '上一级名称',
  //   dataIndex: 'parentId',
  //   width: 150,
  // },
  {
    title: '所属部门',
    dataIndex: 'sysOrgCode',
    width: 200,
  },
  {
    title: '场所类型',
    dataIndex: 'placeType',
    width: 150,
    // slots: {customRender: 'post'},
  },
  {
    title: '创建人',
    width: 150,
    dataIndex: 'createBy',
  },
  {
    title: '创建日期',
    width: 150,
    dataIndex: 'createTime',
  },
  {
    title: '备注',
    width: 150,
    dataIndex: 'remark',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '摄像机组名称',
    field: 'groupName',
    component: 'Input',
    colProps: { span: 12 },
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
    field: 'groupName',
    label: '摄像机组名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  // {
  //   field: 'deviceTypeCode',
  //   label: '分类编码',
  //   component: 'Input',
  //   required: true,
  //   componentProps: {},
  // },
  {
    field: 'placeType',
    label: '场所类型',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: getPlaceTypes, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      labelField: 'label', // 下拉显示文字
      valueField: 'value', // 实际提交值
    },
  },

  {
    field: 'parentId',
    label: '上一级名称',
    required: false,
    component: 'TreeSelect',
    componentProps: {
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'groupName',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    required: true,
    componentProps: {
      showButton: false,
      style: {
        width: '100%',
      },
      labelKey: 'departName',
      rowKey: 'orgCode',
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
