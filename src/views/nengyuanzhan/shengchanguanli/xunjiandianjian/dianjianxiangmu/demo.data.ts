import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getTreeListDianjianbuwei,getTreeListDianjianfangfa } from './demo.api';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '点检项目名称',
    dataIndex: 'itemName',
    width: 170,
    resizable: true,
  },
  {
    title: '点检项目编号',
    dataIndex: 'itemCode',
    width: 170,
    resizable: true,
  },
  {
    title: '点检部位',
    dataIndex: 'areaName',
    width: 170,
    resizable: true,
  },
  {
    title: '点检方法',
    dataIndex: 'methodName',
    width: 170,
    resizable: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      return text === '1' || text === 1 ? '启用' : '停用';
    },
  },
  {
    title: '点检内容',
    dataIndex: 'content',
    width: 140,
    resizable: true,
  },
  {
    title: '判断标准',
    dataIndex: 'judgmentCriteria',
    width: 140,
    resizable: true,
  },
  {
    title: '判定结果类型',
    dataIndex: 'resultType',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 'text') {
        return '长文本';
      } else if (text === 'radio') {
        return '单选';
      } else if (text === 'numerical') {
        return '数值';
      } else if (text === 'checkbox') {
        return '多选';
      }
    },
  },

  {
    title: '判定结果选项',
    dataIndex: 'optionName',
    width: 140,
    resizable: true,
    // customRender: ({ text }) => {
    //   const map = {
    //     1: '是',
    //     2: '否',
    //   };
    //   return map[text];
    // },
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
    field: 'itemCode',
    label: '点检项目编号',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },
  {
    field: 'itemName',
    label: '点检项目名称',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },
  {
    field: 'bizType',
    label: '业务类型:',
    component: 'Select',
    defaultValue:1,
    show:false,
    componentProps: {
      options: [
        {label:'点检',value:1},
        {label:'巡检',value:2},
      ]
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
    field: 'bizType',
    label: '业务类型:',
    component: 'Select',

    defaultValue: 1,
    show: false,
    componentProps: {
      options: [
        { label: '点检', value: 1 },
        { label: '巡检', value: 2 },
      ],
    },
    colProps: { span: 12 },
  },
  {
    field: 'itemCode',
    label: '点检项目编号',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      disabled: false,
    },
  },
  {
    field: 'itemName',
    label: '点检项目名称',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {},
  },
  {
    field: 'areaId',
    label: '点检部位',
    component: 'ApiSelect',
    colProps: { span: 12 },
    required: false,
    componentProps: {
      api: getTreeListDianjianbuwei,
      labelField: 'areaName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
    },
  },
  {
    field: 'methodId',
    label: '点检方法',
    component: 'ApiSelect',
    required: false,
    colProps: { span: 12 },
    componentProps: {
      api: getTreeListDianjianfangfa,
      labelField: 'methodName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
    },
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioGroup',
    required: false,
    colProps: { span: 24 },
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 0 },
      ],
    },
  },
  {
    field: 'content',
    label: '点检内容',
    component: 'InputTextArea',
    colProps: { span: 24 },
    required: false,
    componentProps: {
      rows: 3,
      style: { width: '100%' },
    },
  },
  {
    field: 'judgmentCriteria',
    label: '判定标准',
    component: 'InputTextArea',
    colProps: { span: 24 },
    required: false,
    componentProps: {
      rows: 3,
      style: { width: '100%' },
    },
  },
  {
    field: 'resultType',
    label: '判定结果类型',
    component: 'RadioButtonGroup',
    required: false,
    defaultValue: 'numerical',
    componentProps: {
      options: [
        { label: '数值', value: 'numerical' },
        { label: '长文本格式', value: 'text' },
        { label: '单选', value: 'radio' },
        { label: '多选', value: 'checkbox' },
      ],
    },
  },

  {
    field: 'fieldName',
    label: '字段名称',
    component: 'Input',
    required: false,
    componentProps: {},
  },

  {
    field: 'limitUpper',
    label: '上限',
    component: 'InputNumber',
    required: false,
    componentProps: {
      style: { width: '100%' },
    },
    ifShow: ({ values }) => {
      return values.resultType == 'numerical';
    },
  },
  {
    field: 'limitLower',
    label: '下限',
    component: 'InputNumber',
    required: false,
    componentProps: {
      style: { width: '100%' },
    },
    ifShow: ({ values }) => {
      return values.resultType == 'numerical';
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    required: false,
    componentProps: {
      rows: 3,
    },
  },
  {
    field: 'optionLabel1',
    label: '选项1',
    component: 'Input',
    ifShow: ({ values }) => {
      return values.resultType == 'radio' || values.resultType == 'checkbox';
    },
    labelWidth: 140,
    colProps: {
      span: 20,
    },
  },
  {
    field: '0',
    component: 'Input',
    ifShow: ({ values }) => {
      return values.resultType == 'radio' || values.resultType == 'checkbox';
    },
    label: '',
    colProps: {
      span: 4,
    },
    slot: 'addForm',
  },
];

