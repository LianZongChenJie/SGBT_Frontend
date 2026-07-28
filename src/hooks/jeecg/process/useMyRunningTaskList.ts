/**
 * 额外写一份冗余代码，提供给eoa模块调用
 */
import { useListPage } from '/@/hooks/system/useListPage';
import { defHttp } from '/@/utils/http/axios';
import { BasicColumn, FormSchema } from '/@/components/Table';

/**
 * 接口地址定义
 */
const URL = {
  run: {
    list: '/act/task/list',
    claim: '/act/task/claim',
    taskEntrust: '/act/task/taskEntrust',
    getProcessNodeInfo: '/act/process/extActProcessNode/getProcessNodeInfo',
    getProcessTaskTransInfo: '/act/task/getProcessTaskTransInfo',
  },
  history: {
    list: '/act/task/taskHistoryList',
    getProcessNodeInfo: '/act/process/extActProcessNode/getHisProcessNodeInfo',
    getProcessTaskTransInfo: '/act/task/getHisProcessTaskTransInfo',
  },
  group: {
    list: '/act/task/taskGroupList',
    claim: '/act/task/claim',
    getProcessTaskTransInfo: '/act/task/getProcessTaskTransInfo',
  },
  processComplete: '/act/task/processComplete',
  processHistoryList: '/act/task/processHistoryList',
  taskEntrust: '/act/task/taskEntrust',
  taskComplaint: '/act/task/taskComplaint',
  afterAddSignTask: '/act/task/afterAddSignTask',
  beforeAddSignTask: '/act/task/beforeAddSignTask',
  claim: '/act/task/claim',
  notifyMeList: '/act/process/extActTaskNotification/list',
};
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
 * 获取流程节点信息
 * @param params
 */
export const taskNodeInfo = (type, params) => {
  return defHttp.get({ url: URL[type].getProcessNodeInfo, params });
};
/**
 * 获取流程列表信息
 * @param params
 */
export const list = (type, params) => {
  return defHttp.get({ url: URL[type].list, params });
};
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
      const srtArr = text.split(',');
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

/**
 * 用于列表渲染
 * @param urlObject
 */
export function useMyRunningTaskList(type) {
  const { tableContext } = useListPage({
    designScope: 'process-design',
    pagination: true,
    tableProps: {
      title: '',
      api: getDataList,
      columns: getColumns(),
      showIndexColumn: true,
      showTableSetting: false,
      canResize: false,
      scroll: { x: 1800 },
      actionColumn: { dataIndex: 'action', fixed: 'right', width: 150 },
      useSearchForm: TaskType.GROUP != type,
      formConfig: {
        schemas: getSearchFormSchema(),
        autoAdvancedCol: 3,
        baseColProps: { xs: 24, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 },
        actionColOptions: { xs: 24, sm: 12, md: 6, lg: 6, xl: 6, xxl: 6 },
      },
    },
  });
  const [registerTable, { reload }] = tableContext;

  /**
   * 数据请求接口
   * @param params
   */
  function getDataList(params) {
    return list(type, params);
  }

  /**
   * 列
   * 不同类型 列表列有少许差别
   */
  function getColumns() {
    if (TaskType.RUN == type) {
      return columns;
    } else if (TaskType.GROUP == type) {
      return columns_group;
    } else {
      return columns_history;
    }
  }

  /**
   * 查询条件
   */
  function getSearchFormSchema() {
    return searchFormSchema.filter((item) => !item.buss || item.buss === type);
  }

  /**
   * 获取流程节点信息
   */
  async function getTaskNodeInfo(record) {
    //查询条件
    const params = { taskId: record.id };
    const result = await taskNodeInfo(type, params);
    console.log('获取流程节点信息', result);
    const procInsId = record.processInstanceId || (result.records ? result.records.BPM_INST_ID : '');
    const formData: any = {
      taskId: record.id,
      taskDefKey: result.taskDefKey,
      procInsId: procInsId,
      dataId: result.dataId,
      tableName: result.tableName,
      permissionList: result.permissionList,
      subPermissionList: result.subPermissionList,
      vars: result.records,
    };
    let tempFormUrl = result.formUrl;
    console.log('获取流程节点表单URL', tempFormUrl);
    //节点配置表单URL，VUE组件类型对应的拓展参数
    if (tempFormUrl && tempFormUrl.indexOf('?') != -1 && !isURL(tempFormUrl) && tempFormUrl.indexOf('{{DOMAIN_URL}}') == -1) {
      tempFormUrl = result.formUrl.split('?')[0];
      console.log('获取流程节点表单URL（去掉参数）', tempFormUrl);
      const qv: any = getQueryVariable(result.formUrl);
      if (qv.edit == 1) {
        formData['disabled'] = false;
      }
      formData.extendUrlParams = qv;
    }
    //如果没有taskId参数，程序自动追加，用于设计器表单节点权限
    if (tempFormUrl != null && tempFormUrl.indexOf('{{DOMAIN_URL}}/desform/') != -1 && tempFormUrl.indexOf('taskId') == -1) {
      tempFormUrl = tempFormUrl.trim();
      if (tempFormUrl.endsWith('?')) {
        tempFormUrl = tempFormUrl + 'taskId=' + result.taskDefKey;
      } else {
        tempFormUrl = tempFormUrl + '&taskId=' + result.taskDefKey;
      }
    }
    return {
      formData,
      formUrl: tempFormUrl,
      isSignTask: result.isSignTask,
      assignee: result.assignee,
      taskIsHandel: result.taskIsHandel || false,
    };
  }

  /**
   * 获取历史任务信息
   */
  async function getHistoryTaskInfo(record) {
    return await getTaskInfoForHistory(record);
  }

  return {
    registerTable,
    reload,
    getTaskNodeInfo,
    getHistoryTaskInfo,
  };
}

export async function getTaskInfoForHistory(record) {
  //查询条件
  const params = { procInstId: record.processInstanceId };
  const result = await taskNodeInfo('history', params);
  console.log('获取历史任务信息', result);
  const formData: any = {
    dataId: result.dataId,
    taskId: record.id,
    taskDefKey: record.taskId,
    procInsId: record.processInstanceId,
    tableName: result.tableName,
    vars: result.records,
  };
  let tempFormUrl = result.formUrl;
  console.log('获取流程节点表单URL', tempFormUrl);
  //节点配置表单URL，VUE组件类型对应的拓展参数
  if (tempFormUrl && tempFormUrl.indexOf('?') != -1 && !isURL(tempFormUrl) && tempFormUrl.indexOf('{{DOMAIN_URL}}') == -1) {
    tempFormUrl = result.formUrl.split('?')[0];
    console.log('获取流程节点表单URL（去掉参数）', tempFormUrl);
    formData.extendUrlParams = getQueryVariable(result.formUrl);
  }
  return {
    formData,
    formUrl: tempFormUrl,
  };
}

/**
 * 获取URL上参数
 * @param url
 */
function getQueryVariable(url) {
  if (!url) return;

  let t,
    n,
    r,
    i = url.split('?')[1],
    s = {};
  (t = i.split('&')), (r = null), (n = null);
  for (const o in t) {
    const u = t[o].indexOf('=');
    u !== -1 && ((r = t[o].substr(0, u)), (n = t[o].substr(u + 1)), (s[r] = n));
  }
  return s;
}

/**
 * URL地址
 * @param {*} s
 */
function isURL(s) {
  return /^http[s]?:\/\/.*/.test(s);
}
