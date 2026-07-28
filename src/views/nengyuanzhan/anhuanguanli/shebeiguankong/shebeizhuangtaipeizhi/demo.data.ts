import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import {render} from '/@/utils/common/renderUtils';
// import { h } from 'vue';

export const columns: BasicColumn[] = [
  {
    title: '设备名称',
    dataIndex: 'employeeName',
    width: 170,
    resizable: true,
  },
  {
    title: '规格型号',
    dataIndex: 'idCard',
    width: 170,
    resizable: true,
  },
  {
    title: 'CAD图纸编码',
    dataIndex: 'position',
    width: 130,
    resizable: true,
  },
  {
    title: '部门',
    dataIndex: 'groupName',
    width: 140,
    resizable: true,
  },
  {
    title: '设备类型',
    dataIndex: 'planItemName',
    width: 140,
    resizable: true,
  },
  {
    title: '空间信息',
    dataIndex: 'beginDate',
    width: 140,
    resizable: true,
  },
  {
    title: '门禁状态',
    dataIndex: 'beginDate',
    width: 140,
    resizable: true,
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'employeeName',
    label: '配置名称',
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
    field: 'employeeId',
    label: '设备名称',
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'employeeId333',
    label: '规格型号',
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'employeeId222',
    label: 'CAD图纸编码',
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    componentProps: {
      style:{width:'100%'},
      showButton: false,
      labelKey: 'departName',
      rowKey: 'orgCode',
    },
  },
  {
    field: 'deviceTypeId',
    label: '设备类型',
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
    },
  },
  {
    field: 'employeeId3',
    label: '空间信息',
    component: 'Input',
    componentProps: {},
  },
  {
    field: 'employeeId1',
    label: '门禁状态',
    component: 'Select',
    componentProps: {},
  },
];
export const formSchemaList: FormSchema[] = [
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
    label: '配置名称',
    component: 'Input',
    componentProps: {},
  },
];
