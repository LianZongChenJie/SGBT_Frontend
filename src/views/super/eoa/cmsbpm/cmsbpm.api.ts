import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/eoa/cms/eoaCmsSite/getSiteInfo',
  commUseList = '/joa/designform/designFormCommuse/getCommuseByUserId',
  queryByCode = '/desform/queryByCode',
  add = '/act/process/extActDesignFlowData/add',
  emailList = '/eoa/email/eoaMailboxInfo/sendList',
  applyProcesslist = '/act/task/myApplyProcessList',
  getPieDate = '/joa/dataStatistics/getPieDate',
  getChartDate = '/joa/dataStatistics/getChartDate',
  taskList = '/act/task/list',
  ccHistoryList = '/act/task/taskAllCcHistoryList',
  taskGroupList = '/act/task/taskGroupList',
  taskEntrust = '/act/task/taskEntrust',
  claim = '/act/task/claim',
  invalidProcess = '/act/task/invalidProcess',
  backProcess = '/act/task/callBackProcess',
}
/**
 * 加载站点信息
 * @param params
 */
export const list = (params?) => defHttp.get({ url: Api.list, params });
/**
 * 常用流程
 * @param params
 */
export const queryCommUseList = (params?) => defHttp.get({ url: Api.commUseList, params }, { isTransformResponse: false });
/**
 * 根据code查询
 * @param params
 */
export const queryByCode = (params?) => defHttp.get({ url: Api.queryByCode, params }, { isTransformResponse: false });
/**
 * 根据code查询
 * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
 * @param params
 */
export const save = (params?) => defHttp.post({ url: Api.add, params }, { isTransformResponse: false });
/**
 * 加载站点信息
 * @param params
 */
export const emailList = (params?) => defHttp.get({ url: Api.emailList, params }, { isTransformResponse: false });
/**
 * 我的流程申请列表
 * @param params
 */
export const applyProcesslist = (params?) => defHttp.get({ url: Api.applyProcesslist, params });
/**
 * 获取饼图数据
 * @param params
 */
export const getPieData = (params?) => defHttp.get({ url: Api.getPieDate, params }, { isTransformResponse: false });
/**
 * 获取图表数据
 * @param params
 */
export const getChartData = (params?) => defHttp.get({ url: Api.getChartDate, params }, { isTransformResponse: false });
/**
 * 待办任务
 * @param params
 */
export const taskList = (params?) => defHttp.get({ url: Api.taskList, params });
/**
 * 抄送任务
 * @param params
 */
export const ccHistoryList = (params?) => defHttp.get({ url: Api.ccHistoryList, params });
/**
 * 组任务
 * @param params
 */
export const taskGroupList = (params?) => defHttp.get({ url: Api.taskGroupList, params });
/**
 * 委派
 * @param params
 */
export const taskEntrust = (params, handleSuccess) => {
  return defHttp.put({ url: Api.taskEntrust, params }).then((e) => {
    handleSuccess();
  });
};
/**
 * 签收
 * @param params
 */
export const taskClaim = (params) => {
  return defHttp.put({ url: Api.claim, params }, { isTransformResponse: false });
};
/**
 * 作废
 * @param params
 */
export const invalidProcess = (params) => defHttp.put({ url: Api.invalidProcess, params });
/**
 * 取回
 * @param params
 */
export const backProcess = (params) => defHttp.put({ url: Api.backProcess, params });
