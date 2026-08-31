import { defHttp } from '/@/utils/http/axios';

enum Api {
  getVisitorListApi = '/visitor/list',
  auditVisitorApi = '/visitor/audit',
}

/**
 * 获取访客列表数据（审核用）
 */
export const getVisitorListApi = (params) => defHttp.get({ url: Api.getVisitorListApi, params }, { joinParamsToUrl: true });

/**
 * 审核访客申请
 * @param id 访客记录ID
 * @param status 1-同意 2-拒绝
 */
export const auditVisitorApi = (id: number | string, status: string) =>
  defHttp.post({ url: Api.auditVisitorApi, params: { id, status } }, { joinParamsToUrl: true });
