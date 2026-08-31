import { defHttp } from '/@/utils/http/axios';

enum Api {
  hisProcessNodeInfo = '/act/process/extActProcessNode/getHisProcessNodeInfo',
  processHistoryList = '/act/task/processHistoryList',
  hisProcessTaskTransInfo = '/act/task/getHisProcessTaskTransInfo',
  skipNode = '/act/processInstance/skipNode',
  taskEntrust = '/act/task/taskEntrust',
  getAllTask = '/act/processInstance/getAllTask',
  reassign = '/act/processInstance/reassign',
  bizHisProcessNodeInfo = '/act/process/extActProcessNode/getBizHisProcessNodeInfo',
  getNotifyList = '/act/process/extActTaskNotification/mylist',
  notifyMeList = '/act/process/extActTaskNotification/list',
  taskNotification = '/act/process/extActTaskNotification/taskNotification',
  getBizProcessNodeInfo = '/act/process/extActProcessNode/getBizProcessNodeInfo',
  getProcessTaskTransInfo = '/act/task/getProcessTaskTransInfo',
  processComplete = '/act/task/processComplete',
  suspend = '/act/processInstance/suspend',
  restart = '/act/processInstance/restart',
  claim = '/act/task/claim',
  getProcessInfo = '/act/process/extActFlowData/getProcessInfo',
}

/**
 * 获取流程节点历史信息
 * @param params
 */
export const hisProcessNodeInfo = (params) => {
  return defHttp.get({ url: Api.hisProcessNodeInfo, params }, { isTransformResponse: false });
};

/**
 * 获取流程历史信息
 * @param params
 */
export const getProcessHistoryList = (params) => defHttp.get({ url: Api.processHistoryList, params }, { isTransformResponse: false });

/**
 * 获取流程历史流转信息
 * @param params
 */
export const getHisProcessTaskTransInfo = (params) => defHttp.get({ url: Api.hisProcessTaskTransInfo, params }, { isTransformResponse: false });

/**
 * 委派
 * @param params
 */
export const taskEntrust = (params, handleSuccess?) => {
  return defHttp.put({ url: Api.taskEntrust, params }, { isTransformResponse: false }).then((res) => {
    handleSuccess && handleSuccess(res);
  });
};
/**
 * 获取所有任务节点
 * @param params
 */
export const getAllTask = (params) => defHttp.get({ url: Api.getAllTask, params });
/**
 * 跳转节点
 * @param params
 */
export const skipNode = (params) => defHttp.get({ url: Api.skipNode, params });
/**
 * 获取业务流程节点信息
 * @param params
 */
export const getBizHisProcessNodeInfo = (params) => defHttp.get({ url: Api.bizHisProcessNodeInfo, params }, { isTransformResponse: false });
/**
 * 获取我催办的流程列表
 * @param params
 */
export const getNotifyList = (params) => defHttp.get({ url: Api.getNotifyList, params });
/**
 * 获取催办我的流程列表
 * @param params
 */
export const getNotifyMeList = (params) => defHttp.get({ url: Api.notifyMeList, params });
/**
 * 催办
 * @param params
 */
export const saveOrUpdateNotify = (params) => {
  return defHttp.post({ url: Api.taskNotification, params });
};
/**
 * 获取业务流程节点信息
 * @param params
 */
export const getBizProcessNodeInfo = (params) => {
  return defHttp.get({ url: Api.getBizProcessNodeInfo, params }, { isTransformResponse: false });
};
/**
 * 获取业务流转信息
 * @param params
 */
export const getProcessTaskTransInfo = (params) => {
  return defHttp.get({ url: Api.getProcessTaskTransInfo, params }, { isTransformResponse: false });
};
/**
 * 流程办理
 * @param params
 */
export const processComplete = (params) => {
  return defHttp.post({ url: Api.processComplete, params }, { isTransformResponse: false });
};
/**
 * 挂起
 * @param params
 */
export const suspend = (params) => {
  return defHttp.get({ url: Api.suspend, params }, { isTransformResponse: false });
};
/**
 * 解挂
 * @param params
 */
export const restart = (params) => {
  return defHttp.get({ url: Api.restart, params }, { isTransformResponse: false });
};
/**
 * 签收
 * @param params
 */
export const claim = (params) => {
  return defHttp.put({ url: Api.claim, params }, { isTransformResponse: false });
};
/**
 * 获取流程信息
 * @param params
 */
export const getProcessInfo = (params) => {
  return defHttp.get({ url: Api.getProcessInfo, params }, { isTransformResponse: false });
};
