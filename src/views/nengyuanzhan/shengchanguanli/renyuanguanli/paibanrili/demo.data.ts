import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
// import {render} from '/@/utils/common/renderUtils';
import dayjs from 'dayjs';
import { defHttp } from '/@/utils/http/axios';

export const getPlanGroupDdl = () =>
  defHttp.get({
    url: '/operation/energyPlanGroup/ddl',
  });
// import { h } from 'vue'
export const columns: BasicColumn[] = [
  {
    title: '员工姓名',
    dataIndex: 'employeeName',
    width: 170,
    resizable: true,
    slots: { customRender: 'employeeName' },
  },
  {
    title: '排班类型',
    dataIndex: 'calendarType',
    width: 170,
    resizable: true,
    customRender: ({ text }) => {
      const map = {
        1: '员工',
        2: '值班领导',
        3: '值班干部',
      };
      return map[text] || text;
    },
  },
  {
    title: '班次',
    dataIndex: 'planName',
    width: 170,
    resizable: true,
  },
  {
    title: '时间',
    dataIndex: 'period',
    width: 170,
    resizable: true,
  },
];
export const columns2: BasicColumn[] = [
  {
    title: '人员姓名',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },

  {
    title: '部门',
    dataIndex: 'punchTime',
    width: 140,
    resizable: true,
  },
  {
    title: '职位',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'month',
    label: '月份',
    component: 'MonthPicker',
    required: true,
    defaultValue: dayjs().format('YYYY-MM'), // 默认当月
    componentProps: {
      // picker: 'month',
      valueFormat: 'YYYY-MM',
      placeholder: '请选择月份',
    },
  },
  {
    field: 'orgCode',
    label: '部门',
    component: 'JSelectDept',
    required: true,
    componentProps: {
      showButton: false,
      style: {
        width: '100%',
      },
      labelKey: 'departName',
      rowKey: 'orgCode',
      placeholder: '请选择部门',
    },
  },
  {
    field: 'planGroupId',
    label: '班组',
    component: 'ApiSelect',
    required: false,
    componentProps: {
      api: getPlanGroupDdl,
      labelField: 'groupName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
      allowClear: true,
      placeholder: '请选择班组',
    },
  },
];
export const searchFormSchemaTable: FormSchema[] = [
  {
    field: 'month',
    label: '月份',
    component: 'DatePicker',
    defaultValue: dayjs().format('YYYY-MM'), // 默认当月
    componentProps: {
      // picker: 'month',
      style: {
        width: '100%',
      },
      valueFormat: 'YYYY-MM',
      placeholder: '请选择月份',
    },
  },
  {
    field: 'orgCode',
    label: '部门',
    component: 'JSelectDept',
    required: true,
    componentProps: {
      showButton: false,
      style: {
        width: '100%',
      },
      labelKey: 'departName',
      rowKey: 'orgCode',
      placeholder: '请选择部门',
    },
  },
  {
    field: 'planGroupId',
    label: '班组',
    component: 'ApiSelect',
    componentProps: {
      api: getPlanGroupDdl,
      labelField: 'groupName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
      allowClear: true,
      placeholder: '请选择班组',
    },
  },
];
export const searchFormSchema2: FormSchema[] = [
  {
    field: 'name',
    label: '姓名',
    component: 'Input',
    componentProps: {
      trim: true,
      placeholder: '请输入姓名',
    },
    colProps: { span: 8 },
  },
];
export function getFormSchema(onLeaderCountChange: (val: number) => void): FormSchema[] {
  return [
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
      field: 'leaderCount',
      label: '值班领导人数',
      component: 'InputNumber',
      required: true,
      componentProps: {
        min: 1,
        addonAfter: '人',
        style: { width: '100%' },
        onChange: (val: number) => {
          onLeaderCountChange(val);
        },
        placeholder: '请输入值班领导人数',
      },
    },
    {
      field: 'beginDate',
      label: '开始时间',
      component: 'DatePicker',
      required: true,
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        placeholder: '请选择开始时间',
      },
    },
    {
      field: 'leaderIds',
      label: '轮换顺序',
      // slot: 'rotationSlot',
      required: true,
      component: 'TreeSelect',
      componentProps: {
        // treeCheckable: true,
        // title: '下拉树',
        treeData: [], // 先给空
        fieldNames: {
          label: 'label',
          value: 'id',
          children: 'children',
        },
        placeholder: '请选择轮换顺序',
      },
    },
  ];
}
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
    field: 'leaderCount',
    label: '值班领导人数',
    component: 'InputNumber',
    required: true,
    componentProps: {
      min: 1,
      addonAfter: '人',
      style: { width: '100%' },
      placeholder: '请输入值班领导人数',
    },
  },
  {
    field: 'leaderIds',
    label: '轮换顺序',
    // slot: 'rotationSlot',
    required: true,
    component: 'TreeSelect',
    componentProps: {
      // treeCheckable: true,
      // title: '下拉树',
      treeCheckable: true, // ① 开启复选框
      multiple: true, // ② 多选模式（非常重要）
      showCheckedStrategy: 'SHOW_PARENT', // ③ 展示策略（推荐）
      treeData: [], // 先给空
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
      placeholder: '请选择轮换顺序',
    },
  },
  {
    field: 'beginDate',
    label: '开始时间',
    component: 'DatePicker',
    required: true,
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择开始时间',
    },
  },
];
export const formSchemaHuanban: FormSchema[] = [
  {
    field: 'id', // ⭐ 排班日历ID（后端PUT必传）
    label: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'shiftDate',
    label: '换班日期',
    component: 'DatePicker',
    required: true,
    slot: 'shiftDate',
    componentProps: {
      valueFormat: 'YYYY-MM-DD', // 拿到字符串格式
      placeholder: '请选择换班日期',
      // onChange: (date, dateString) => {
      //   console.log('shiftDate changed', dateString);
      // },
    },
  },
  {
    field: 'changeUserName',
    label: '换班人',
    component: 'Input',
    slot: 'changeUserName',
    // dynamicDisabled: true, // ⭐ 只展示
  },
  {
    field: 'newLeaderId',
    label: '替班人',
    component: 'TreeSelect',
    componentProps: {
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
      placeholder: '请选择替班人',
    },
  },
];
