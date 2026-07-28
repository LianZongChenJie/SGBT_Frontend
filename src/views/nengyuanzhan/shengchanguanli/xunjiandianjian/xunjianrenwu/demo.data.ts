import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getTreeListXunjianfenlei } from '@/views/nengyuanzhan/shengchanguanli/xunjiandianjian/xunjianxiangmu/demo.api';
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
    dataIndex: 'teamName',
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
    title: '计划开始时间',
    dataIndex: 'planStartTime',
    width: 140,
    resizable: true,
  },
  {
    title: '计划结束时间',
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
    title: '巡检用时(分钟)',
    dataIndex: 'durationMinutes',
    width: 140,
    resizable: true,
  },

  {
    title: '巡检班组',
    dataIndex: 'teamName',
    width: 140,
    resizable: true,
  },
  {
    title: '巡检人',
    dataIndex: 'chargerName',
    width: 140,
    resizable: true,
  },
  {
    title: '应检设备',
    dataIndex: 'deviceTotalCount',
    width: 140,
    resizable: true,
  },
  {
    title: '跳过设备数',
    dataIndex: 'skipCount',
    width: 140,
    resizable: true,
  },
  {
    title: '漏检设备数',
    dataIndex: 'missedCount',
    width: 140,
    resizable: true,
  },
  {
    title: '异常设备数',
    dataIndex: 'abnormalCount',
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
    field: 'taskCode',
    label: '任务编号',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'taskName',
    label: '任务名称',
    component: 'Input',
    componentProps: {},
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
    label: '巡检班组',
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
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'chargerId',
    label: '巡检人',
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
        { label: '调整本次巡检任务时间', value: 1 },
        { label: '修改本次巡检执行人', value: 2 },
        { label: '跳过本次巡检任务', value: 3 },
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
      return values.adjustType === 1;
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
      return values.adjustType === 1;
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
      return values.adjustType === 1;
    },
    componentProps: {
      showTime: false,
      valueFormat: 'HH:mm',
      format: 'HH:mm',
    },
  },
  {
    field: 'teamId1',
    label: '更改班组',
    required: true,
    colProps: { span: 12 },
    component: 'TreeSelect',
    ifShow: ({ values }) => {
      return values.adjustType === 2;
    },
    componentProps: {
      disabled: false,
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
    field: 'chargerId1',
    label: '巡检人',
    component: 'TreeSelect',
    required: true,
    colProps: { span: 12 },
    ifShow: ({ values }) => {
      return values.adjustType === 2;
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
    field: 'remark',
    label: '调整原因',
    component: 'InputTextArea',
    required: false,
    colProps: { span: 24 },
    componentProps: {
      rows: 3,
    },
  },

  // {
  //   field: 'sysOrgCode',
  //   label: '所属部门',
  //   component: 'JSelectDept',
  //   componentProps: {
  //     showButton: false,
  //     style: {
  //       width: '100%',
  //     },
  //     labelKey: 'departName',
  //     rowKey: 'orgCode',
  //   },
  // },
];
export const searchFormSchemaYulan: FormSchema[] = [
  {
    field: 'itemName',
    label: '巡检项目名称',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'itemCode',
    label: '巡检项目编号',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'categoryId',
    label: '巡检分类',
    component: 'ApiSelect',
    required: false,
    colProps: { span: 8 },
    componentProps: {
      api: getTreeListXunjianfenlei,
      labelField: 'name', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
    },
  },
];
// export const columnsModalYulan: BasicColumn[] = [
//   {
//     title: '巡检项目名称',
//     dataIndex: 'amount',
//     width: 130,
//     resizable: true,
//   },
//   {
//     title: '巡检项目编号',
//     dataIndex: 'factoryName',
//     width: 140,
//     resizable: true,
//   },
//   {
//     title: '巡检分类',
//     dataIndex: 'isRelated',
//     width: 140,
//     resizable: true,
//     customRender: ({ text }) => {
//       if (text === 1){
//         return '日计划'
//       }else if (text === 2){
//         return '周计划'
//       }else if(text === 3){
//         return '月计划'
//       }else if(text === 4){
//         return '季计划'
//       }else if (text === 5) {
//         return '年计划'
//       }
//     },
//   },
//   {
//     title: '巡检内容',
//     dataIndex: 'inspectionCycle',
//     width: 140,
//     resizable: true,
//   },
//   {
//     title: '巡检结果',
//     dataIndex: 'unit',
//     width: 140,
//     resizable: true,
//
//   },
//   {
//     title: '是否正常',
//     dataIndex: 'inspectionName',
//     width: 170,
//     resizable: true,
//     customRender: ({ text }) => {
//       if (text === 1){
//         return '正常'
//       }else if (text === 2){
//         return '不正常'
//       }else if(text === 3){
//         return '已审核'
//       }
//     },
//   },
//   {
//     title: '备注',
//     dataIndex: 'inspectionGroup',
//     width: 140,
//     resizable: true,
//   },
// ];
export const columnsModalYulan: BasicColumn[] = [
  {
    title: '巡检项目名称',
    dataIndex: 'itemName',
    width: 130,
    resizable: true,
  },
  {
    title: '巡检项目编号',
    dataIndex: 'itemCode',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '巡检分类',
  //   dataIndex: 'categoryName',
  //   width: 140,
  //   resizable: true,
  // },
  {
    title: '巡检分类',
    dataIndex: 'categoryId',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1) {
        return '日计划';
      } else if (text === 2) {
        return '周计划';
      } else if (text === 3) {
        return '月计划';
      } else if (text === 4) {
        return '季计划';
      } else if (text === 5) {
        return '年计划';
      }
    },
  },
  {
    title: '巡检内容',
    dataIndex: 'content',
    width: 140,
    resizable: true,
  },
  {
    title: '巡检结果',
    dataIndex: 'resultType',
    width: 240,
    resizable: true,
    slots: { customRender: 'resultType' },
  },
  {
    title: '是否正常',
    dataIndex: 'isAbnormal',
    width: 170,
    resizable: true,
    slots: { customRender: 'isAbnormal' }, // ⭐ 自定义渲染
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 140,
    resizable: true,
    slots: { customRender: 'remark' }, // ⭐ 自定义渲染
  },
];
