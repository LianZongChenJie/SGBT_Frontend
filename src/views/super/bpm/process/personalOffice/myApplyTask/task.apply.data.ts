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
    title: '流程名称',
    align: 'center',
    dataIndex: 'prcocessDefinitionName',
    ellipsis: true,
  },

  {
    title: '流程实例',
    align: 'center',
    dataIndex: 'processInstanceId',
  },
  {
    title: '发起人',
    align: 'center',
    width: 120,
    dataIndex: 'startUserName',
  },
  {
    title: '开始日期',
    align: 'center',
    dataIndex: 'startTime',
  },
  {
    title: '结束时间',
    align: 'center',
    dataIndex: 'endTime',
  },
  {
    title: '耗时',
    align: 'center',
    width: 150,
    dataIndex: 'spendTimes',
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'bpmStatus',
    width: 120,
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
  {
    title: '流程编号',
    align: 'center',
    dataIndex: 'processDefinitionId',
    ellipsis: true,
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
    field: 'processName',
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

/**
 * 催办列表
 */
export const notifyColumns: BasicColumn[] = [
  {
    title: '流程名称',
    align: 'center',
    dataIndex: 'procName',
  },
  {
    title: '任务名称',
    align: 'center',
    dataIndex: 'taskName',
  },
  {
    title: '任务处理人',
    align: 'center',
    dataIndex: 'taskAssignee',
  },
  {
    title: '催办时间',
    align: 'center',
    dataIndex: 'opTime',
  },
  {
    title: '催办类型',
    align: 'center',
    dataIndex: 'notifyType',
    customRender: function ({ text }) {
      var srtArr = text.split(',');
      var value = '';
      if (srtArr.includes('1')) {
        value += ',页面通知';
      }
      if (srtArr.includes('2')) {
        value += ',邮件';
      }
      return value.substring(1);
    },
  },
  {
    title: '催办说明',
    align: 'center',
    dataIndex: 'remarks',
  },
];
