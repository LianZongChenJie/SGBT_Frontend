import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
// import {render} from '/@/utils/common/renderUtils';
import dayjs from 'dayjs';
export const columns: BasicColumn[] = [
  {
    title: '资料名称',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '资料编码',
    dataIndex: 'keyWord',
    width: 130,
    resizable: true,
  },
  {
    title: '资料目录',
    dataIndex: 'punchTime',
    width: 140,
    resizable: true,
  },
  {
    title: '课室',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '课程时间',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '创建人',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '创建时间',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '资料简介',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'month',
    label: '选择月份',
    component: 'MonthPicker',
    required: true,
    defaultValue: dayjs().format('YYYY-MM'), // 默认当前月份
    componentProps: {
      trim: true,
      showTime: false,
      valueFormat: 'YYYY-MM',
      placeholder: '请选择月份',
    },
    colProps: { span: 8 },
  },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    required: true,
    componentProps: {
      showButton: false,
      labelKey: 'departName',
      rowKey: 'orgCode',
      placeholder: '请选择所属部门',
    },
    colProps: { span: 8 },
  },
  {
    field: 'employeeName',
    label: '姓名',
    component: 'Input',
    componentProps: {
      trim: true,
      placeholder: '请输入姓名',
    },
    colProps: { span: 8 },
  },
];
