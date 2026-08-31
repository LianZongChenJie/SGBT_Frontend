import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '工单号',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '备件名称',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '备件编号',
    dataIndex: 'keyWord',
    width: 130,
    resizable: true,
  },
  {
    title: '常规型号',
    dataIndex: 'punchTime',
    width: 140,
    resizable: true,
  },
  {
    title: '申请数量',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '申请时间',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '申请人',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '审批状态',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '工单号',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '备件名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '时间范围',
    component: 'RangePicker',
    componentProps: {

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
    field: 'name',
    label: '工单号',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '备件名称',
    component: 'InputTextArea',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '备件编号',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '规格型号',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '申请人',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '申请时间',
    component: 'DatePicker',
    required: true,
    componentProps: {},
  },

  {
    field: 'keyWord',
    label: '备注',
    component: 'InputTextArea',
    required: false,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '审批状态',
    component: 'Select',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '创建时间',
    component: 'DatePicker',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '创建人',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '修改时间',
    component: 'DatePicker',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '修改人',
    component: 'Input',
    required: true,
    componentProps: {},
  },
];

export const formShenpi: FormSchema[] = [
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
    field: 'name',
    label: '申请人',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '申请时间',
    component: 'DatePicker',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '维修工单号',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '故障设备ID',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '故障设备名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '更换原因',
    component: 'InputTextArea',
    required: true,
    componentProps: {},
  },

  {
    field: 'keyWord',
    label: '申请备件ID',
    component: 'Input',
    required: false,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '备件名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '是否同意',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      Options:[
        {lablel:'同意',value:1},
        {lablel:'不同意',value:2},
      ]
    },
  },

];
