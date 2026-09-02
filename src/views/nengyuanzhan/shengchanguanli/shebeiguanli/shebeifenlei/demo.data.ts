import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
import { DEVICE_TYPE_CATEGORY } from './demo.api';

export const columns: BasicColumn[] = [
  {
    title: '上一级名称',
    dataIndex: 'parentName',
    width: 180,
  },
  {
    title: '设备分类名称',
    dataIndex: 'deviceTypeName',
    width: 180,
  },
  {
    title: '设备分类编码',
    dataIndex: 'deviceTypeCode',
    width: 160,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 220,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 180,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '分类名称',
    field: 'deviceTypeName',
    component: 'Input',
    componentProps: {
      placeholder: '请输入分类名称',
      allowClear: true,
    },
    colProps: { span: 8 },
  },
  {
    label: '分类编码',
    field: 'deviceTypeCode',
    component: 'Input',
    componentProps: {
      placeholder: '请输入分类编码',
      allowClear: true,
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
    field: 'deviceTypeCategory',
    label: 'deviceTypeCategory',
    component: 'Input',
    defaultValue: DEVICE_TYPE_CATEGORY,
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
    field: 'deviceTypeName',
    label: '分类名称',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      placeholder: '请输入分类名称',
      maxlength: 50,
      allowClear: true,
    },
  },
  {
    field: 'deviceTypeCode',
    label: '分类编码',
    colProps: { span: 12 },

    component: 'Input',
    required: true,
    componentProps: {
      placeholder: '请输入分类编码',
      maxlength: 50,
      allowClear: true,
    },
  },
  {
    field: 'parentId',
    label: '上一级分类',
    colProps: { span: 12 },

    component: 'TreeSelect',
    componentProps: {
      treeData: [],
      allowClear: true,
      placeholder: '请选择上一级分类',
      treeDefaultExpandAll: true,
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'remark',
    colProps: { span: 12 },

    label: '备注',
    component: 'InputTextArea',
    componentProps: {
      placeholder: '请输入备注',
      maxlength: 200,
      rows: 4,
      showCount: true,
    },
  },
];
