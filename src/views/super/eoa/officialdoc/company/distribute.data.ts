import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '标题',
    align: 'center',
    dataIndex: 'title',
  },
  {
    title: '文号',
    align: 'center',
    dataIndex: 'code',
  },
  {
    title: '起草正文',
    align: 'center',
    dataIndex: 'downUrl',
    slots: { customRender: 'fileSlot' },
  },
  {
    title: '分发日期',
    align: 'center',
    dataIndex: 'distributeDate',
    customRender: ({ text }) => {
      return !text ? '' : text.length > 10 ? text.substr(0, 10) : text;
    },
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status',
    customRender: ({ text }) => {
      if (text === '0') {
        return '未处理';
      } else {
        return '已处理';
      }
    },
  },
];

/**
 * 公司收文列表查询
 */
export const searchFormSchema: FormSchema[] = [
  {
    label: '标题',
    field: 'title',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '文号',
    field: 'code',
    component: 'Input',
    colProps: { span: 6 },
  },
];
