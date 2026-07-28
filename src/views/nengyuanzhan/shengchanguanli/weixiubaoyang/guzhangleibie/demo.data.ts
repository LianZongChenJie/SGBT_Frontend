import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import { defHttp } from '@/utils/http/axios';
// import {getTreeListGuzhangleibie} from './demo.api'
// import {render} from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
  {
    title: '故障类别名称',
    dataIndex: 'categoryName',
    width: 170,
    resizable: true,
  },
  {
    title: '故障类别编码',
    dataIndex: 'categoryCode',
    width: 130,
    resizable: true,
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
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
    title: '备注',
    dataIndex: 'remark',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'categoryCode',
    label: '故障类别编码',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'categoryName',
    label: '故障类别名称',
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
    field: 'parentId',
    label: '上级类别',
    component: 'TreeSelect',
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
    field: 'categoryName',
    label: '故障类别名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'categoryCode',
    label: '故障类别编码',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'orderNum',
    label: '排序',
    component: 'InputNumber',
    required: true,
    componentProps: {
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
        { label: '启用', value: '0' },
        { label: '停用', value: '1' },
      ],
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
