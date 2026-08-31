import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { defHttp } from '@/utils/http/axios';
import { getTreeListGuzhangyuanyin, getTreeListShebeibuwei } from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/shebeiguzhangku/demo.api';
// import {render} from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
  {
    title: '故障条目名称',
    dataIndex: 'faultName',
    width: 170,
    resizable: true,
  },
  {
    title: '故障条目编码',
    dataIndex: 'faultCode',
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
    title: '故障类别',
    dataIndex: 'faultCategory',
    width: 140,
    resizable: true,
  },
  {
    title: '设备部位',
    dataIndex: 'devicePart',
    width: 140,
    resizable: true,
  },
  {
    title: '故障原因',
    dataIndex: 'faultReasonType',
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
      } else if (text === 1) {
        return '停用';
      }
    },
  },
  {
    title: '故障描述',
    dataIndex: 'faultDescription',
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
    field: 'faultCode',
    label: '故障条目编码',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'faultName',
    label: '故障条目名称',
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
    field: 'faultCode',
    label: '故障条目编码',
    component: 'Input',
    required: true,
    componentProps: {
      trim: true,
      maxlength: 64,
      placeholder: '请输入故障条目编码',
    },
  },
  {
    field: 'faultName',
    label: '故障条目名称',
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
    label: '故障类别',
    component: 'TreeSelect',
    required: true,
    componentProps: {
      disabled: false,
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'categoryName',
        value: 'id',
        children: 'children',
      },
    },
    // component: 'ApiTreeSelect',
    // required:true,
    // componentProps: {
    //   // api: () => defHttp.get({ url: '/operation/operationDimDeviceType/ddl' }), // 请求接口
    //   api: getTreeListGuzhangleibie, // 请求接口
    //   immediate: false, // 页面加载就请求接口
    //   allowClear: true, // 可以清空
    //   treeDefaultExpandAll: true, // 默认展开所有节点
    //   fieldNames: {
    //     label: 'categoryName',
    //     value: 'id',
    //     children: 'children',
    //   },
    // },
  },

  {
    field: 'partId',
    label: '设备部位',
    component: 'ApiSelect',
    required: false,
    componentProps: {
      api: getTreeListShebeibuwei, // 请求接口
      labelField: 'partName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      style: { width: '100%' },
    },
  },
  {
    field: 'reasonId',
    label: '故障原因',
    component: 'ApiSelect',
    required: false,
    componentProps: {
      api: getTreeListGuzhangyuanyin, // 请求接口
      labelField: 'reasonName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      style: { width: '100%' },
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
    field: 'faultDescription',
    label: '故障描述',
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
