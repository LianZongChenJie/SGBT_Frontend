import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
// import {render} from '/@/utils/common/renderUtils';
import { h } from 'vue';

export const columns: BasicColumn[] = [
  {
    title: '姓名',
    dataIndex: 'employeeName',
    width: 170,
    resizable: true,
  },
  {
    title: '证件号',
    dataIndex: 'idCard',
    width: 170,
    resizable: true,
  },
  {
    title: '岗位',
    dataIndex: 'position',
    width: 130,
    resizable: true,
  },
  {
    title: '当前班组',
    dataIndex: 'groupName',
    width: 140,
    resizable: true,
  },
  {
    title: '班次范围',
    dataIndex: 'planItemName',
    width: 140,
    resizable: true,
  },
  {
    title: '生效日期',
    dataIndex: 'beginDate',
    width: 140,
    resizable: true,
  },
];
export const searchFormSchema: FormSchema[] = [
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
    field: 'employeeId',
    label: '人员姓名',
    component: 'TreeSelect',
    componentProps: {
      treeData: [],
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
      placeholder: '请选择人员姓名',
    },
  },
  {
    field: 'planGroupId',
    label: '班组',
    component: 'TreeSelect',
    componentProps: {
      treeData: [],
      fieldNames: {
        label: 'groupName',
        value: 'id',
        children: 'children',
      },
      placeholder: '请选择班组',
    },
  },
  {
    field: 'beginDate',
    label: '生效日期',
    component: 'DatePicker',
    required: true,
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择生效日期',
    },
  },
  {
    field: 'describe',
    label: '班组信息',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    colProps: {
      span: 24,
    },
    //渲染 values当前表单所有值
    render: ({ values }) => {
      return h('div', { class: 'group-info' }, [
        h('div', { class: 'group-info__divider' }),
        h('div', { class: 'group-info__content' }, values.describe || '请选择班组后查看班组信息'),
      ]);
    },
  },
];
