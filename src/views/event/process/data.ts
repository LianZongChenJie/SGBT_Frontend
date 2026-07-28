import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '流程编码',
    dataIndex: 'flowCode',
    align: 'center',
  },
  {
    title: '流程名称',
    dataIndex: 'flowName',
    align: 'center',
  },
  {
    title: '描述',
    dataIndex: 'description',
    align: 'center',
  },
  {
    title: '业务处理类',
    dataIndex: 'businessClassFullName',
    align: 'center',
  },
  {
    title: '是否启用',
    dataIndex: 'isEnable',
    align: 'center',
    width: 100,
    format: (value) => {
      return value ? '启用' : '禁用';
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '流程编码', //显示label
    field: 'flowCode', //查询字段
    component: 'JInput', //渲染的组件
  },
];
