import { BasicColumn, FormSchema } from '/@/components/Table';
import { DescItem } from '/@/components/Description/index';

export const columns: BasicColumn[] = [
  {
    title: '出库申请单号',
    dataIndex: 'code',
    align: 'center',
  },
  {
    title: '类型',
    dataIndex: 'orderId',
    align: 'center',
    customRender: ({ record }) => {
      let v = record.orderId ? '工单' : '手工';
      return v;
    }
  },
  // {
  //   title: '仓库名称',
  //   dataIndex: 'warehouseName',
  //   align: 'center',
  // },
  {
    title: '审批状态',
    dataIndex: 'status',
    align: 'center',
  },
  {
    title: '申请人',
    dataIndex: 'createBy',
    align: 'center',
  },
  {
    title: '申请时间',
    dataIndex: 'time',
    align: 'center',
  },

  {
    title: '审批人',
    dataIndex: 'approvePeople',
    align: 'center',
  },
  {
    title: '审批时间',
    dataIndex: 'approveTime',
    align: 'center',
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'code',
    label: '出库申请单号',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '审批状态',
    component: 'Select',
    componentProps: {
      options: [
        { value: '待审批', label: '待审批' },
        { value: '审批通过', label: '审批通过' },
        { value: '审批不通过', label: '审批不通过' },
        { value: '已出库', label: '已出库' },
      ]
    },
    colProps: { span: 8 },
  },
];
export const applyFormList: BasicColumn[] = [
  { title: '物料名称', dataIndex: 'materialName', width: 150 },
  { title: '规格型号', dataIndex: 'specification', width: 120 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '库存数量', dataIndex: 'num', width: 100 },
  {
    title: '申请数量',
    dataIndex: 'quantity',
    width: 120,
    customCell: () => ({ style: { padding: '4px 8px' } }), // 紧凑样式
  },
];
export const spareColumns = [
  {
    title: '物料名称',
    dataIndex: 'materialName',
    //width: '17%',
  },
  {
    title: '物料分类',
    dataIndex: 'typeName',
    //width: '15%',
  },
  {
    title: '规格',
    dataIndex: 'specification',
    //width: '15%',
  },
  {
    title: '品牌',
    dataIndex: 'brand',
    //width: '15%',
  },
  {
    title: '单位',
    dataIndex: 'unit',
    //width: '15%',
  },
  {
    title: '数量',
    dataIndex: 'num',
    //width: '15%',
  },
];
export const schema: DescItem[] = [
  {
    field: 'code',
    label: '出库申请单号',
  },
  {
    field: 'orderId',
    label: '类型',
    render: (curVal, data) => {
      const type = curVal ? '工单' : '手工';
      return type;
    },
  },
  {
    field: 'createBy',
    label: '申请人',
  },
  {
    field: 'deptName',
    label: '申请部门',
  },
  {
    field: 'phone',
    label: '联系电话',
  },
  {
    field: 'approvePeople',
    label: '审批人',
  },
  {
    field: 'approveTime',
    label: '审批时间',
  },
  {
    field: 'description',
    label: '审批备注',
  },
  {
    field: 'orderId',
    label: '工单编号',
    show: (data) => {
      console.log(data);
      return data.orderId ? true : false;
    },
  },
];
export const applyFormListDetail: BasicColumn[] = [
  { title: '仓库名称', dataIndex: 'warehouseName' },
  { title: '物料分类', dataIndex: 'typeName' },
  { title: '物料名称', dataIndex: 'name' },
  { title: '品牌', dataIndex: 'brand' },
  { title: '规格', dataIndex: 'specification' },
  { title: '单位', dataIndex: 'unit' },
  {
    title: '申请数量',
    dataIndex: 'num',
  },
];
export const statusColor = {
  '待审批': '#909090',
  '审批通过': '#32e107',
  '审批不通过': '#f70909',
  '已出库': '#077ae1',
};
export const approveForm: FormSchema[] = [
  {
    field: 'evaluate',
    label: '审批',
    component: 'RadioButtonGroup',
    componentProps: {
      options: [
        { label: '通过', value: '1' },
        { label: '不通过', value: '0' },
      ],
    },
    defaultValue: '1',
  },
  {
    field: 'description',
    label: '备注',
    component: 'InputTextArea',
    componentProps: {
      //可以点击清除图标删除内容
      allowClear: true,
      //自适应内容高度，可设置为 true | false 或对象：{ minRows: 2, maxRows: 6 }
      autoSize: {
        //最小显示行数
        minRows: 5,
      },
    },
  },
];
