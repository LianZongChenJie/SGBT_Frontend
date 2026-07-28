import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '设备名称',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '设备类型',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '楼层',
    dataIndex: 'punchTime',
    width: 140,
    resizable: true,
  },
  {
    title: '设备位置',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
  },
  {
    title: '状态',
    dataIndex: 'salaryMoney',
    width: 140,
    resizable: true,
    customRender: ({ value }) => {
      // 假设：1=人脸识别，2=普通，3=车牌识别, 4=电梯控制
      if (value === 1) {
        return '人脸识别';
      } else if (value === 2) {
        return '普通';
      } else if (value === 3) {
        return '车牌识别';
      } else {
        return '电梯控制';
      }
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '设备名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '设备类型',
    component: 'Select',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '楼层',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '设备位置',
    component: 'TreeSelect',
    componentProps: {
      placeholder: '无',
      treeData: [], // 先给空
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
      treeDefaultExpandAll: true,
      allowClear: true,
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
    label: '换班人姓名',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'keyWord',
    label: '换班日期',
    component: 'DatePicker',
    required: true,
    componentProps: {},
  },
];
