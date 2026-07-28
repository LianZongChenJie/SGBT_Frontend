import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jeecg-demo/admin/call/page',
  callRecord = '/jeecg-demo/admin/call/recordingUrl/simple',
  textRecord = '/jeecg-demo/admin/call/text',
  detail = '/jeecg-demo/admin/call/detail',
}
/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 通话录音
 * @param params
 */
export const getCallRecord = (params) => {
  return defHttp.get({ url: Api.callRecord, params });
};
/**
 * 文字记录
 * @param params
 */
export const getTextRecord = (params) => {
  return defHttp.get({ url: Api.textRecord, params });
};
/**
 * 详情
 * @param params
 */
export const getDetail = (params) => {
  return defHttp.get({ url: Api.detail, params });
};
