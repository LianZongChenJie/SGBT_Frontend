import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/task/taskAllCcHistoryList',
}

/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
