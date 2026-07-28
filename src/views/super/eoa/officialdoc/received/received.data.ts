import { BasicColumn, FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';

export const columns: BasicColumn[] = [
  {
    title: '来文单位',
    dataIndex: 'sourceUnit',
    width: 150,
  },
  {
    title: '收文日期',
    dataIndex: 'receiptDate',
    width: 150,
    customRender: function ({ record }) {
      return !record.receiptDate ? '' : record.receiptDate.length > 10 ? record.receiptDate.substr(0, 10) : record.receiptDate;
    },
  },
  {
    title: '文件标题',
    dataIndex: 'title',
    width: 150,
  },
  {
    title: '密级',
    dataIndex: 'secretLevel_dictText',
    width: 80,
  },
  {
    title: '缓急',
    dataIndex: 'urgency_dictText',
    width: 80,
  },
  {
    title: '收文编号',
    dataIndex: 'receiptCode',
    width: 150,
  },
  {
    title: '来文字号',
    dataIndex: 'issuedCode',
    width: 120,
  },
  {
    title: '公文内容',
    dataIndex: 'officialContents',
    width: 130,
    slots: { customRender: 'fileSlot' },
  },
  {
    title: '发文附件',
    dataIndex: 'fileUrl',
    width: 140,
    slots: { customRender: 'fileSlot' },
  },
  {
    title: '传阅部门',
    dataIndex: 'circulationDepts_dictText',
    width: 140,
  },
];

export const bpmColumns: BasicColumn[] = [
  ...columns,
  {
    title: '流程状态',
    width: 120,
    dataIndex: 'bpmStatus_dictText',
  },
];

/**
 * 公文收文统计列表
 */
export const statisticsColumn: BasicColumn[] = [
  {
    title: '收文单位',
    dataIndex: 'department',
    width: 150,
  },
  {
    title: '收文量',
    dataIndex: 'receivedNumber',
    width: 150,
  },
];

/**
 *公文收文经办文件产讯
 */
export const handleColumn: BasicColumn[] = [
  {
    title: '来文单位',
    dataIndex: 'sourceUnit',
  },
  {
    title: '来文日期',
    dataIndex: 'receiptDate',
    customRender: function ({ record }) {
      return !record.receiptDate ? '' : record.receiptDate.length > 10 ? record.receiptDate.substr(0, 10) : record.receiptDate;
    },
  },
  {
    title: '来文字号',
    dataIndex: 'issuedCode',
  },
  {
    title: '文件标题',
    dataIndex: 'title',
  },
  {
    title: '办理状态',
    dataIndex: 'bpmStatus_dictText',
  },
];

/**
 * 公文收文列表、草稿箱查询
 */
export const searchFormSchema: FormSchema[] = [
  {
    label: '来文单位',
    field: 'sourceUnit',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '收文日期',
    field: 'receiptDate',
    component: 'RangePicker',
    componentProps: {
      valueType: 'Date',
    },
    colProps: { span: 8 },
  },
];

/**
 * 公文收文统计查询
 */
export const searchStatisticsSchema: FormSchema[] = [
  {
    label: '收文单位',
    field: 'sourceUnit',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '收文日期',
    field: 'receiptDate',
    component: 'RangePicker',
    componentProps: {
      valueType: 'Date',
    },
    colProps: { span: 8 },
  },
];

/**
 * 公文收文经办文件查询
 */
export const searchHandleSchema: FormSchema[] = [
  {
    label: '文件标题',
    field: 'title',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '来文字号',
    field: 'issuedCode',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '来文单位',
    field: 'sourceUnit',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '收文日期',
    field: 'receiptDate',
    component: 'RangePicker',
    componentProps: {
      valueType: 'Date',
    },
    colProps: { span: 8 },
  },
  {
    label: '办理状态',
    field: 'bpmStatus',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'bpm_status',
    },
    colProps: { span: 8 },
  },
];
