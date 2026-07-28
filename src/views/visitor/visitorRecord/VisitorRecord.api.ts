import { defHttp } from '/@/utils/http/axios';

enum Api {
  getVisitorRecordListApi = '/visitor/record',
}

/**
 * 获取访客通行记录列表数据
 */
export const getVisitorRecordListApi = (params) => defHttp.get({ url: Api.getVisitorRecordListApi, params }, { joinParamsToUrl: true });
