import { defHttp } from '/@/utils/http/axios';

enum Api {
  getVisitorRecordListApi = '/visitor/record',
}

/**
 * 获取访客通行记录列表
 */
export const getVisitorRecordListApi = (params) => defHttp.get({ url: Api.getVisitorRecordListApi, params });
