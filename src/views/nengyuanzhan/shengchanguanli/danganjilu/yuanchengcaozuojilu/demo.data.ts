import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getTreeListsbfl } from '@/views/nengyuanzhan/anhuanguanli/shebeiguankong/shebeizhuangtaipeizhi/demo.api';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 120,
    resizable: true,
  },
  // {
  //   title: '设备分类',
  //   dataIndex: 'deviceCategory',
  //   width: 130,
  //   resizable: true,
  // },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    width: 130,
    resizable: true,

  },
  // {
  //   title: '设备位置',
  //   dataIndex: 'deviceLocation',
  //   width: 130,
  //   resizable: true,
  // },
  // {
  //   title: '执行操作',
  //   dataIndex: 'punchTime',
  //   width: 140,
  //   resizable: true,
  // },
  {
    title: '操作人',
    dataIndex: 'operator',
    width: 140,
    resizable: true,
  },
  {
    title: '时间',
    dataIndex: 'operateTime',
    width: 140,
    resizable: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 240,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'deviceName',
    label: '设备名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },

  {
    field: 'deviceType',
    label: '设备类型',
    component: 'ApiSelect', // ⭐ 官方推荐
    colProps: { span: 8 },
    componentProps: {
      api: getTreeListsbfl, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      labelField: 'label', // 下拉显示文字
      valueField: 'id',        // 实际提交值
      placeholder: '请选择设备类型',
    },
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
    field: 'deviceName',
    label: '设备名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '资料简介',
    component: 'InputTextArea',
    required: true,
    componentProps: {},
  },
  {
    field: 'aaa',
    label: '资料上传',
    required: false,
    component: 'JImageUpload',
    componentProps: {
      text: '点击上传',

    },
  },
  {
    field: 'keyWord',
    label: '资料时长',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '资料目录',
    component: 'Select',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '课室',
    component: 'Select',
    required: true,
    componentProps: {},
  },
];
