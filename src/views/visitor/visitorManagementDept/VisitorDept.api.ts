import { defHttp } from '/@/utils/http/axios';

enum Api {
  getVisitorListApi = '/visitor/list',
  addVisitorApi = '/visitor/add',
}

/**
 * 获取访客列表数据
 */
export const getVisitorListApi = (params) => defHttp.get({ url: Api.getVisitorListApi, params }, { joinParamsToUrl: true });

/**
 * 新增访客
 */
export const addVisitorApi = (params) => defHttp.post({ url: Api.addVisitorApi, params });
