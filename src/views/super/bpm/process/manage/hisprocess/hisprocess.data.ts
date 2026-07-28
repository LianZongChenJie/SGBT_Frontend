import { FormSchema } from '/@/components/Table';

export const columns = [
  {
    title: '业务标题',
    dataIndex: 'bpmBizTitle',
    width: 180,
    ellipsis: true,
  },
  {
    title: '流程名称',
    dataIndex: 'prcocessDefinitionName',
  },
  {
    title: '流程实例',
    dataIndex: 'processInstanceId',
    width: 180,
  },
  {
    title: '发起人',
    dataIndex: 'startUserName',
  },
  {
    title: '开始日期',
    dataIndex: 'startTime',
  },
  {
    title: '流程编号',
    dataIndex: 'processDefinitionId',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
  },
  {
    title: '耗时',
    dataIndex: 'spendTimes',
  },
  {
    title: '状态',
    dataIndex: 'bpmStatus',
    customRender: ({ text }) => {
      switch (text) {
        case '1':
          return '待提交';
        case '2':
          return '处理中';
        case '3':
          return '已完成';
        case 'rejectProcess':
          return '已驳回';
        case 'callBackProcess':
          return '已取回';
        case 'invalidProcess':
          return '已作废';
      }
      return text;
    },
  },
];
/**
 * 列表查询form
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'processDefinitionId',
    label: '流程编号',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'processName',
    label: '流程名称',
    component: 'Input',
    colProps: { span: 6 },
  },
];
