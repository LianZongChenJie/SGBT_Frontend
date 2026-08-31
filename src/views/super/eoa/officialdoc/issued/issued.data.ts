import { BasicColumn, FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';

/**
 * 发文草稿箱列表
 */
export const columns: BasicColumn[] = [
  {
    title: '标题',
    dataIndex: 'title',
    width: 100,
  },
  {
    title: '机关代字',
    dataIndex: 'organId_dictText',
    width: 100,
  },
  {
    title: '文号',
    dataIndex: 'code',
    width: 100,
  },
  {
    title: '起草正文',
    dataIndex: 'downUrl',
    width: 100,
    slots: { customRender: 'fileSlot' },
  },
  {
    title: '密级',
    dataIndex: 'secretLevel_dictText',
    width: 100,
  },
  {
    title: '缓急',
    dataIndex: 'urgency_dictText',
    width: 100,
  },
  {
    title: '打印份数',
    dataIndex: 'printingNumber',
    width: 100,
  },
];

/**
 * 发文列表
 */
export const bpmColumns: BasicColumn[] = [
  ...columns,
  {
    title: '流程状态',
    width: 120,
    dataIndex: 'bpmStatus_dictText',
  },
];

/**
 * 发文经办文件查询列表
 */
export const handleColumns: BasicColumn[] = [
  {
    title: '标题',
    dataIndex: 'title',
    width: 150,
  },
  {
    title: '机关代字',
    dataIndex: 'organId_dictText',
    width: 150,
  },
  {
    title: '文号',
    dataIndex: 'code',
    width: 150,
  },
  {
    title: '拟稿单位',
    align: 'center',
    width: 100,
    dataIndex: 'draftDept_dictText',
  },
  {
    title: '发文日期',
    align: 'center',
    dataIndex: 'createTime',
    width: 100,
    customRender: function ({ record }) {
      return !record.createTime ? '' : record.createTime.length > 10 ? record.createTime.substr(0, 10) : record.createTime;
    },
  },
  {
    title: '办理状态',
    align: 'center',
    width: 100,
    dataIndex: 'bpmStatus_dictText',
  },
];

/**
 * 公文发文统计列表
 */
export const statisticsColumn: BasicColumn[] = [
  {
    title: '部门',
    dataIndex: 'department',
    width: 150,
  },
  {
    title: '发文量',
    dataIndex: 'issuedNumber',
    width: 150,
  },
];

/**
 * 公文发文查询列表
 */
export const searchFormSchema: FormSchema[] = [
  {
    label: '标题',
    field: 'title',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '机关代字',
    field: 'organId',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'oa_officialdoc_organcode,organ_name,id',
    },
    colProps: { span: 8 },
  },
];

/**
 * 公文发文统计查询
 */
export const searchStatisticsSchema: FormSchema[] = [
  {
    label: '部门',
    field: 'departCode',
    component: 'JTreeSelect',
    componentProps: {
      dict: 'sys_depart,depart_name,id',
      pidField: 'parent_id',
    },
    colProps: { span: 8 },
  },
  {
    label: '发文日期',
    field: 'createTime',
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
    label: '文号',
    field: 'code',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '发文日期',
    field: 'createTime',
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
