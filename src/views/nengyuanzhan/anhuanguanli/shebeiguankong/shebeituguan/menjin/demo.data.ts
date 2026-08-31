import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  // {
  //   title: '设备名称',
  //   dataIndex: 'name',
  //   width: 170,
  //   resizable: true,
  // },
  // {
  //   title: '设备类型',
  //   dataIndex: 'name',
  //   width: 170,
  //   resizable: true,
  // },
  // {
  //   title: 'CAD编码',
  //   dataIndex: 'keyWord',
  //   width: 130,
  //   resizable: true,
  // },
  // {
  //   title: '门编码',
  //   dataIndex: 'punchTime',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '楼层',
  //   dataIndex: 'punchTime',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '设备位置',
  //   dataIndex: 'salaryMoney',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '状态',
  //   dataIndex: 'salaryMoney',
  //   width: 140,
  //   resizable: true,
  //   customRender: ({ value }) => {
  //     // 假设：1=常闭，2=正常，3=常开
  //     if (value === 1) {
  //       return '常闭';
  //     } else if (value === 2) {
  //       return '正常';
  //     } else {
  //       return '常开';
  //     }
  //   },
  // },
  {
    title: '设备名称',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '所属系统',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '运行状态',
    dataIndex: 'name',
    width: 170,
    resizable: true,
      customRender: ({ value }) => {
        // if (value === 1) {
        //   return '常闭';
        // } else if (value === 2) {
        //   return '正常';
        // } else {
        //   return '常开';
        // }
      },
  },
  {
    title: '负责人',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '闸机状态',
    dataIndex: 'name',
    width: 170,
    resizable: true,
    customRender: ({ value }) => {
      // if (value === 1) {
      //   return '常闭';
      // } else if (value === 2) {
      //   return '正常';
      // } else {
      //   return '常开';
      // }
    },
  },
  {
    title: '道闸状态',
    dataIndex: 'name',
    width: 170,
    resizable: true,
    customRender: ({ value }) => {
      // if (value === 1) {
      //   return '常闭';
      // } else if (value === 2) {
      //   return '正常';
      // } else {
      //   return '常开';
      // }
    },
  },
  {
    title: 'NB锁状态',
    dataIndex: 'name',
    width: 170,
    resizable: true,
    customRender: ({ value }) => {
      // if (value === 1) {
      //   return '常闭';
      // } else if (value === 2) {
      //   return '正常';
      // } else {
      //   return '常开';
      // }
    },
  },
  {
    title: '门锁状态',
    dataIndex: 'name',
    width: 170,
    resizable: true,
    customRender: ({ value }) => {
      // if (value === 1) {
      //   return '常闭';
      // } else if (value === 2) {
      //   return '正常';
      // } else {
      //   return '常开';
      // }
    },
  },
  {
    title: '创建时间',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '创建人',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
  {
    title: '修改时间',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },{
    title: '修改人',
    dataIndex: 'name',
    width: 170,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '设备系统分类',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '区域名称',
    component: 'Select',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: 'CAD编码',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '门编码',
    component: 'Input',
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
