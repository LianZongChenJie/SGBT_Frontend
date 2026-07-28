import { FormSchema } from '/@/components/Table';
export const columns = [
  {
    title: '借款人',
    dataIndex: 'loanUserName',
    width: 100,
  },
  {
    title: '部门名称',
    dataIndex: 'departName',
    width: 100,
  },
  {
    title: '借款时间',
    dataIndex: 'loanTime',
    width: 100,
  },
  {
    title: '借款金额',
    dataIndex: 'loanAmount',
    width: 100,
  },
  {
    title: '借款用途',
    dataIndex: 'loanUsage',
    width: 100,
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    width: 100,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'loanUserName',
    label: '借款人',
    component: 'Input',
    colProps: { span: 6 },
  },
];
