import { defHttp } from '/@/utils/http/axios';

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
  // 添加审批人
  addMultiInstance: '/act/task/addMultiInstance',
};

/**
 * 列表
 * @param params
 */
export const list = (type, params) => defHttp.get({ url: URL[type].list, params });

/**
 * 列表
 * @param params
 */
export const taskNodeInfo = (type, params) => defHttp.get({ url: URL[type].getProcessNodeInfo, params });

/**
 * 任务流转信息
 * @param params
 * @param type
 */
export const taskTransInfo = (params, type = 'run') => defHttp.get({ url: URL[type].getProcessTaskTransInfo, params });

/**
 * 流程任务办理
 * @param params
 */
export const taskComplete = (params) => defHttp.post({ url: URL.processComplete, params });

/**
 * 流程历史跟踪
 * @param params
 */
export const taskTraceList = (params) => defHttp.get({ url: URL.processHistoryList, params });

/**
 * 任务委托
 * @param params
 */
export const taskEntrust = (params) => defHttp.put({ url: URL.taskEntrust, params });

/**
 * 任务转办
 * @param params
 */
export const taskComplaint = (params) => defHttp.put({ url: URL.taskComplaint, params });

/**
 * 任务签收
 * @param params
 */
export const taskClaim = (params) => defHttp.put({ url: URL.claim, params });

/**
 * 催办-提醒我的记录
 * @param params
 */
export const taskNotifyMeList = (params) => defHttp.get({ url: URL.notifyMeList, params });

/**
 * 任务向后加签
 * @param params
 */
export const afterAddSignTask = (params) => defHttp.put({ url: URL.afterAddSignTask, params });

/**
 * 任务向前加签
 * @param params
 */
export const beforeAddSignTask = (params) => defHttp.put({ url: URL.beforeAddSignTask, params });
/**
 * 添加审批人
 * @param params
 */
export const addMultiInstance = (params) => defHttp.put({ url: URL.addMultiInstance, params },{isTransformResponse: false});
