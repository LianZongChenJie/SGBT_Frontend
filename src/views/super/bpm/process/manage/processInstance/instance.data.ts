import { FormSchema } from '/@/components/Table';

export const columns = [
  {
    title: '流程名称',
    dataIndex: 'prcocessDefinitionName',
    width: 180,
    ellipsis: true,
  },
  {
    title: '业务标题',
    dataIndex: 'bpmBizTitle',
  },
  {
    title: '当前任务',
    dataIndex: 'name',
  },
  {
    title: '流程实例',
    dataIndex: 'processInstanceId',
    width: 180,
  },
  {
    title: '办理人',
    dataIndex: 'assigneeName',
    width: 100,
  },
  {
    title: '流程ID',
    dataIndex: 'processDefinitionId',
    width: 150,
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
  },
  {
    title: '发起人',
    dataIndex: 'startUserName',
    width: 100,
  },
  {
    title: '耗时',
    dataIndex: 'spendTimes',
  },
  {
    title: '状态',
    dataIndex: 'isSuspended',
    width: 80,
    customRender: ({ text }) => {
      return text === 'true' ? '已暂停' : '已启动';
    },
  },
];
/**
 * 列表查询form
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'processInstanceId',
    label: '流程实例ID',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'startUserId',
    label: '流程发起人',
    component: 'JSelectUserByDept',
    componentProps: {
      labelKey: 'realname',
      rowKey: 'username',
      showButton: false,
      maxSelectCount: 1,
    },
    colProps: { span: 6 },
  },
];
