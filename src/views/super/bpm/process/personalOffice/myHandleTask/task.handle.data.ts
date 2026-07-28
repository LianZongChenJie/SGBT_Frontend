import { BasicColumn, FormSchema } from '/@/components/Table';

export enum TaskType {
  RUN = 'run',
  HIS = 'history',
  GROUP = 'group',
}

/**
 * 列表 列--running
 */
export const columns: BasicColumn[] = [
  {
    title: '业务标题',
    align: 'center',
    dataIndex: 'bpmBizTitle',
    slots: { customRender: 'bpmBizTitle' },
  },
  {
    title: '当前环节',
    align: 'center',
    width: 130,
    dataIndex: 'taskName',
  },
  {
    title: '流程名称',
    align: 'center',
    dataIndex: 'processDefinitionName',
    ellipsis: true,
  },
  {
    title: '流程实例',
    align: 'center',
    dataIndex: 'processInstanceId',
  },
  {
    title: '发起人',
    width: 110,
    align: 'center',
    dataIndex: 'processApplyUserName',
  },
  {
    title: '开始时间',
    align: 'center',
    dataIndex: 'taskBeginTime',
  },
  {
    title: '流程编号',
    align: 'center',
    dataIndex: 'processDefinitionId',
    ellipsis: true,
  },
  {
    title: '任务ID',
    align: 'center',
    dataIndex: 'taskId',
  },
];

/**
 * 列表 列--group
 */
export const columns_group: BasicColumn[] = [
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
    title: '任务ID',
    align: 'center',
    dataIndex: 'taskId',
  },
  {
    title: '发起人',
    align: 'center',
    dataIndex: 'processApplyUserName',
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
    title: '当前环节',
    align: 'center',
    dataIndex: 'taskName',
  },
];

/**
 * 列表 列-history
 */
export const columns_history: BasicColumn[] = [
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
    ellipsis: true,
  },
  {
    title: '流程名称',
    align: 'center',
    dataIndex: 'processDefinitionName',
    ellipsis: true,
  },
  {
    title: '流程实例',
    align: 'center',
    width: 100,
    dataIndex: 'processInstanceId',
  },
  {
    title: '任务ID',
    align: 'center',
    dataIndex: 'taskId',
  },
  {
    title: '发起人',
    align: 'center',
    width: 100,
    dataIndex: 'processApplyUserName',
  },
  {
    title: '办理人',
    align: 'center',
    width: 100,
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
    width: 100,
    dataIndex: 'durationStr',
  },
  // {
  //   title: '当前环节',
  //   align: 'center',
  //   width: 120,
  //   dataIndex: 'taskName',
  // },
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
    label: '流程名',
    field: 'processDefinitionName',
    component: 'Input',
  },
  {
    label: '发起人',
    field: 'userName',
    component: 'JSelectUserByDept',
    componentProps: {
      labelKey: 'realname',
      rowKey: 'username',
      showButton: false,
      isRadioSelection: true,
    },
    buss: 'run',
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
 * 列表 流程历史跟踪
 */
export const taskTraceColumns: BasicColumn[] = [
  {
    title: '名称',
    dataIndex: 'name',
    customRender: function ({ text }) {
      if (text == 'start1') {
        return '开始';
      } else if (text == 'end') {
        return '结束';
      } else {
        return text;
      }
    },
  },
  {
    title: '流程实例ID',
    dataIndex: 'processInstanceId',
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
  },
  {
    title: '负责人',
    dataIndex: 'assigneeName',
  },
  {
    title: '处理结果',
    dataIndex: 'deleteReason',
  },
  {
    title: '处理意见',
    fixed: 'right',
    width: 350,
    dataIndex: 'remarks',
    slots: { customRender: 'remarks' },
  },
];

/**
 * 提醒我的列表（催办）
 */
export const notifyMeColumns: BasicColumn[] = [
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
    title: '催办时间',
    align: 'center',
    dataIndex: 'opTime',
  },
  {
    title: '催办类型',
    align: 'center',
    dataIndex: 'notifyType',
    customRender: function ({ text }) {
      if (!text) {
        return '';
      }
      let srtArr = text.split(',');
      let value = '';
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
