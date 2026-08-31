import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { defHttp } from '@/utils/http/axios';
import { getTreeListWeixiufangfa, getTreeListWeixiuleibie } from './demo.api';
import { getTreeListShebeibuwei } from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/shebeiguzhangku/demo.api';
// import {render} from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
  {
    title: '维修经验名称',
    dataIndex: 'experienceName',
    width: 170,
    resizable: true,
  },
  {
    title: '维修经验编码',
    dataIndex: 'experienceCode',
    width: 130,
    resizable: true,
  },
  {
    title: '设备类型',
    dataIndex: 'deviceTypeName',
    width: 140,
    resizable: true,
  },
  {
    title: '维修部位',
    dataIndex: 'repairPart',
    width: 140,
    resizable: true,
  },
  {
    title: '维修方法',
    dataIndex: 'repairMethod',
    width: 140,
    resizable: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text == 0) {
        return '启用';
      } else if (text == 1) {
        return '停用';
      }
    },
  },
  {
    title: '维修描述',
    dataIndex: 'description',
    width: 140,
    resizable: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'experienceCode',
    label: '维修经验编码',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'experienceName',
    label: '维修经验名称',
    component: 'Input',
    componentProps: {
      trim: true,
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
    field: 'experienceCode',
    label: '维修经验编码',
    component: 'Input',
    required: true,
    componentProps: {
      trim: true,
      maxlength: 64,
      placeholder: '请输入维修经验编码',
    },
  },
  {
    field: 'experienceName',
    label: '维修经验名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },

  {
    field: 'deviceTypeId',
    label: '设备类型',
    component: 'ApiTreeSelect',
    required: true,
    componentProps: {
      api: () => defHttp.get({ url: '/operation/operationDimDeviceType/ddl' }), // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },

  {
    field: 'categoryId',
    label: '维修类别',
    component: 'ApiTreeSelect',
    required: true,
    componentProps: {
      api: getTreeListWeixiuleibie, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
      fieldNames: {
        label: 'categoryName', // 下拉显示文字
        value: 'id', // 实际提交值
        children: 'children',
      },
    },
  },
  {
    field: 'partId',
    label: '维修部位',
    component: 'ApiTreeSelect',
    required: false,
    componentProps: {
      api: getTreeListShebeibuwei, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
      fieldNames: {
        label: 'partName', // 下拉显示文字
        value: 'id', // 实际提交值
        children: 'children',
      },
    },
  },
  {
    field: 'methodId',
    label: '维修方法',
    component: 'ApiTreeSelect',
    required: false,
    componentProps: {
      api: getTreeListWeixiufangfa, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
      fieldNames: {
        label: 'methodName',
        value: 'id',
        children: 'children',
      },
    },
  },

  {
    field: 'status',
    label: '状态',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: [
        { label: '启用', value: 0 },
        { label: '停用', value: 1 },
      ],
    },
  },
  {
    field: 'description',
    label: '维修描述',
    component: 'InputTextArea',
    required: false,
    componentProps: {
      rows: 3,
      style: { width: '100%' },
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    required: false,
    componentProps: {
      rows: 3,
      style: { width: '100%' },
    },
  },
];
