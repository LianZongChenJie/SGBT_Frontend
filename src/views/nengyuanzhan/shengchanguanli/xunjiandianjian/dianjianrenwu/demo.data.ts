import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '状态',
    dataIndex: 'status',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      switch (text) {
        case 1:
          return '待执行';
          break;
        case 2:
          return '执行中';
          break;
        case 3:
          return '已完成';
          break;
        case 4:
          return '超时';
          break;
        case 5:
          return '已取消';
          break;
        default:
          break;
      }
    },
  },
  {
    title: '任务编号',
    dataIndex: 'taskCode',
    width: 130,
    resizable: true,
  },
  {
    title: '任务名称',
    dataIndex: 'taskName',
    width: 140,
    resizable: true,
  },
  {
    title: '计划名称',
    dataIndex: 'planName',
    width: 140,
    resizable: true,
  },
  {
    title: '任务计划序号',
    dataIndex: 'planSeq',
    width: 140,
    resizable: true,
  },
  {
    title: '任务计划开始时间',
    dataIndex: 'planStartTime',
    width: 140,
    resizable: true,
  },
  {
    title: '任务计划结束时间',
    dataIndex: 'planEndTime',
    width: 140,
    resizable: true,
  },
  {
    title: '实际开始时间',
    dataIndex: 'actualStartTime',
    width: 140,
    resizable: true,
  },
  {
    title: '实际结束时间',
    dataIndex: 'actualEndTime',
    width: 140,
    resizable: true,
  },
  {
    title: '点检用时(分钟)',
    dataIndex: 'durationMinutes',
    width: 140,
    resizable: true,
  },

  {
    title: '点检班组',
    dataIndex: 'teamName',
    width: 140,
    resizable: true,
  },
  {
    title: '点检人',
    dataIndex: 'chargerName',
    width: 140,
    resizable: true,
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 140,
    resizable: true,
  },
  {
    title: '设备编号',
    dataIndex: 'deviceCode',
    width: 140,
    resizable: true,
  },
  {
    title: '设备类型',
    dataIndex: 'category',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      switch (text) {
        case 1:
          return '设备';
          break;
        case 2:
          return '备件';
          break;
        case 3:
          return '工具';
          break;
        default:
          break;
      }
    },
  },
  {
    title: '规格型号',
    dataIndex: 'deviceModule',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '使用部门A',
  //   dataIndex: 'frequency',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '存放位置A',
  //   dataIndex: 'frequency',
  //   width: 140,
  //   resizable: true,
  // },
  {
    title: '应检项目',
    dataIndex: 'totalItems',
    width: 140,
    resizable: true,
  },
  {
    title: '未检项目',
    dataIndex: 'uncheckedCount',
    width: 140,
    resizable: true,
  },
  {
    title: '异常项目',
    dataIndex: 'abnormalItems',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '备注',
  //   dataIndex: 'remark',
  //   width: 140,
  //   resizable: true,
  // },
];

export const searchFormSchema: FormSchema[] = [
  // {
  //   field: 'tabType',
  //   label: '任务',
  //   component: 'Select',
  //   componentProps: {
  //     options: [
  //       { value: 1, label: '全部任务' },
  //       { value: 2, label: '我的任务' },
  //     ]
  //   },
  //   colProps: { span: 8 },
  // },
  {
    field: 'taskCode',
    label: '任务编号',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },
  {
    field: 'taskName',
    label: '任务名称',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },
  {
    field: 'bizType',
    label: '业务类型:',
    component: 'Select',
    defaultValue: 2,
    show: false,
    componentProps: {
      options: [
        { label: '点检', value: 1 },
        { label: '巡检', value: 2 },
      ],
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
    field: 'taskCode',
    label: '任务编号',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'taskName',
    label: '任务名称',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'planName',
    label: '计划名称',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'planSeq',
    label: '计划任务序号',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'planStartTime',
    label: '计划开始时间',
    component: 'DatePicker',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm',
      format: 'YYYY-MM-DD HH:mm',
      disabled: true,
    },
  },
  {
    field: 'planEndTime',
    label: '计划结束时间',
    component: 'DatePicker',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm',
      format: 'YYYY-MM-DD HH:mm',
      disabled: true,
    },
  },
  {
    field: 'teamId',
    label: '点检班组',
    required: true,
    colProps: { span: 12 },
    component: 'TreeSelect',
    componentProps: {
      disabled: false,
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'groupName',
        value: 'groupCode',
        children: 'children',
      },
    },
  },
  {
    field: 'chargerId',
    label: '点检人',
    component: 'TreeSelect',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      disabled: false,
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },

  {
    field: 'adjustType',
    label: '调整类型',
    component: 'Select',
    required: true,
    colProps: { span: 12 },
    // defaultValue: '0',
    componentProps: {
      options: [
        { label: '调整本次任务时间', value: 1 },
        { label: '修改本次点检任务执行人', value: 2 },
        { label: '跳过本次点检任务', value: 3 },
      ],
    },
  },
  {
    field: 'adjustEndDate',
    label: '调整日期',
    component: 'DatePicker',
    required: true,
    colProps: { span: 12 },
    ifShow: ({ values }) => {
      return values.adjustType === 1
    },
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
      format: 'YYYY-MM-DD',
    },
  },
  {
    field: 'adjustStartTime',
    label: '开始时间',
    component: 'TimePicker',
    required: true,
    colProps: { span: 12 },
    ifShow: ({ values }) => {
      return values.adjustType === 1
    },
    componentProps: {
      showTime: false,
      valueFormat: 'HH:mm',
      format: 'HH:mm',
    },
  },
  {
    field: 'adjustEndTime',
    label: '结束时间',
    component: 'TimePicker',
    required: true,
    colProps: { span: 12 },
    ifShow: ({ values }) => {
      return values.adjustType === 1
    },
    componentProps: {
      showTime: false,
      valueFormat: 'HH:mm',
      format: 'HH:mm',
    },
  },
  {
    field: 'teamId',
    label: '更改班组',
    required: true,
    colProps: { span: 12 },
    component: 'TreeSelect',
    ifShow: ({ values }) => {
      return values.adjustType === 2
    },
    componentProps: {
      disabled: false,
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'groupName',
        value: 'groupCode',
        children: 'children',
      },
    },
  },
  {
    field: 'chargerId',
    label: '点检人',
    component: 'TreeSelect',
    required: true,
    colProps: { span: 12 },
    ifShow: ({ values }) => {
      return values.adjustType === 2
    },
    componentProps: {
      disabled: false,
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'adjustment',
    label: '调整原因',
    component: 'InputTextArea',
    required: false,
    colProps: { span: 12 },
    componentProps: {
      rows:3
    },
  },
];
export const searchFormSchemaYulan: FormSchema[] = [
  {
    field: 'inspectionYear',
    label: '巡检项目名称',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },
  {
    field: 'inspectionYear',
    label: '巡检项目编号',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },
  {
    field: 'inspectionYear',
    label: '巡检分类',
    component: 'Select',
    componentProps: {
    },
    colProps: { span: 8 },
  },
];
export const columnsModalYulan: BasicColumn[] = [
  {
    title: '巡检项目名称',
    dataIndex: 'amount',
    width: 130,
    resizable: true,
  },
  {
    title: '巡检项目编号',
    dataIndex: 'factoryName',
    width: 140,
    resizable: true,
  },
  {
    title: '巡检分类',
    dataIndex: 'isRelated',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1){
        return '日计划'
      }else if (text === 2){
        return '周计划'
      }else if(text === 3){
        return '月计划'
      }else if(text === 4){
        return '季计划'
      }else if (text === 5) {
        return '年计划'
      }
    },
  },
  {
    title: '巡检内容',
    dataIndex: 'inspectionCycle',
    width: 140,
    resizable: true,
  },
  {
    title: '巡检结果',
    dataIndex: 'unit',
    width: 140,
    resizable: true,

  },
  {
    title: '是否正常',
    dataIndex: 'inspectionName',
    width: 170,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1){
        return '正常'
      }else if (text === 2){
        return '不正常'
      }else if(text === 3){
        return '已审核'
      }
    },
  },
  {
    title: '备注',
    dataIndex: 'inspectionGroup',
    width: 140,
    resizable: true,
  },
];
