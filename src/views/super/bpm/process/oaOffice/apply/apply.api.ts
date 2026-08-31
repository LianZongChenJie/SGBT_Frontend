import { defHttp } from '/@/utils/http/axios';

enum Api {
  add = '/act/process/extActDesignFlowData/add',
  addCommUse = '/joa/designform/designFormCommuse/commUseDesignAdd',
  queryByCode = '/desform/queryByCode',
  roleDegisnList = '/joa/designform/designFormCommuse/roleDegisnList',
  commUseList = '/joa/designform/designFormCommuse/getCommuseByUserId',
  onlineList = '/joa/designform/designFormCommuse/queryOnlineFormList',
}

/**
 * 列表接口
 * @param params
 */
export const roleDegisnList = (params?) => defHttp.get({ url: Api.roleDegisnList, params }, { isTransformResponse: false });
/**
 * 常用流程
 * @param params
 */
export const getCommUseList = () => defHttp.get({ url: Api.commUseList }, { isTransformResponse: false });
/**
 * online列表
 */
export const getOnlineList = () => defHttp.get({ url: Api.onlineList }, { isTransformResponse: false });
/**
 * 根据流程编码查询
 * @param params
 */
export const queryByCode = (params) => defHttp.get({ url: Api.queryByCode, params }, { isTransformResponse: false });

/**
 * 往设计表单和流程的关系表中，插入一条数据
 * @param params
 */
export const addDesignFlowData = (params) => {
  return defHttp.post({ url: Api.add, params }, { isTransformResponse: false });
};
/**
 * 保存常用流程
 * @param params
 */
export const addCommUse = (params) => {
  return defHttp.post({ url: Api.addCommUse, params }, { isTransformResponse: false });
};
/**
 * 查询online表单数据
 * @param params
 */
export const queryOnlineDynamicData = (config) => {
  return defHttp.get(config, { isTransformResponse: false });
};
