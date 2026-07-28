import { BasicColumn, FormSchema } from '/@/components/Table';

/**
 * 列表
 */
export const columns: BasicColumn[] = [
  {
    title: '业务标题',
    align: 'center',
    dataIndex: 'bpmBizTitle',
    ellipsis: true,
  },
  {
    title: '流程编号',
    align: 'center',
    dataIndex: 'processDefinitionId',
  },
  {
    title: '流程名称',
    align: 'center',
    dataIndex: 'processDefinitionName',
  },
  {
    title: '流程实例',
    align: 'center',
    dataIndex: 'processInstanceId',
  },
  {
    title: '任务名称',
    align: 'center',
    dataIndex: 'taskName',
  },
  {
    title: '发起人',
    align: 'center',
    dataIndex: 'processApplyUserName',
  },
  {
    title: '办理人',
    align: 'center',
    dataIndex: 'taskAssigneeName',
  },
  {
    title: '开始时间',
    align: 'center',
    dataIndex: 'taskBeginTime',
  },
  {
    title: '结束时间',
    align: 'center',
    dataIndex: 'taskEndTime',
  },
  {
    title: '耗时',
    align: 'center',
    dataIndex: 'durationStr',
  },
];

/**
 * 查询条件
 */
export const searchFormSchema: FormSchema[] = [
  {
    label: '业务标题',
    field: 'bpmBizTitle',
    component: 'Input',
  },
  {
    label: '流程名称',
    field: 'processDefinitionName',
    component: 'Input',
  },
  {
    label: '流程编号',
    field: 'processDefinitionId',
    component: 'Input',
  },
  // {
  //   label: '应用ID',
  //   field: 'lowAppId',
  //   component: 'Input',
  // },
];
