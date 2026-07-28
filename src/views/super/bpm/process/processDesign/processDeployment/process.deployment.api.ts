import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/process/extActProcess/processDeploymentList',
  delete = '/act/process/extActProcess/deleteDeployment',
  active = '/act/process/active/',
  suspend = '/act/process/suspend/',
  downProcessXml = '/act/process/downProcessXml',
  getNodeList = '/act/process/extActProcessNodeDeployment/list',
}

/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 删除
 */
export const deleteOne = (params) => defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true });

/**
 * 激活
 * @param params
 */
export const active = (id) => {
  let url = Api.active + id;
  return defHttp.get({ url });
};

/**
 * 挂起
 * @param params
 */
export const suspend = (id) => {
  let url = Api.suspend + id;
  return defHttp.get({ url });
};

/**
 * 下载地址
 */
export const downProcessXmlUrl = Api.downProcessXml;

/**
 * 流程节点列表
 * @param params
 */
export const getNodeList = (params) => defHttp.get({ url: Api.getNodeList, params });
