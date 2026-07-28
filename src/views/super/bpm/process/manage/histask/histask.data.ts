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
    dataIndex: 'processDefinitionName',
    width: 180,
  },
  {
    title: '流程实例',
    dataIndex: 'processInstanceId',
    width: 180,
  },
  {
    title: '任务名称',
    dataIndex: 'taskName',
  },
  {
    title: '发起人',
    dataIndex: 'processApplyUserName',
  },
  {
    title: '办理人',
    dataIndex: 'taskAssigneeName',
  },
  {
    title: '开始时间',
    dataIndex: 'taskBeginTime',
  },
  {
    title: '结束时间',
    dataIndex: 'taskEndTime',
  },
  {
    title: '耗时',
    dataIndex: 'durationStr',
  },
  {
    title: '流程编号',
    dataIndex: 'processDefinitionId',
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
    field: 'processDefinitionName',
    label: '流程名称',
    component: 'Input',
    colProps: { span: 6 },
  },
];
