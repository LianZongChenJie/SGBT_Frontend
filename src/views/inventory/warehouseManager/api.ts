import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/jeecg-demo/admin/inventoryApprove/pageForWarehouseManager',
  approveApplyDetail = '/jeecg-demo/admin/inventoryApprove/detail',
  outbound = '/jeecg-demo/admin/inventoryApprove/confirm',
  backList = '/jeecg-demo/admin/inventoryBack/getForm',
  backSave = '/jeecg-demo/admin/inventoryBack/doBack',
}

/**
 * 出库申请代办分页
 *
 * @param params 请求参数
 * @returns 返回外出申请列表数据
 */
export const getOutApplyList = (params: any) => {
  if (params.code) {
    params.code = '*' + params.code + '*'
  }
  return defHttp.get({ url: Api.list, params });
};

/**
 * 出库申请代办详情
 *
 * @param params 请求参数
 * @returns 返回审批申请详情
 */
export const approveApplyDetail = (params: any) => {
  return defHttp.get({ url: Api.approveApplyDetail, params });
};
export const outbound = (id: any) => {
  return defHttp.post({ url: Api.outbound + '?approveId=' + id });
};
/**
 * 出库退回
 *
 * @param params 请求参数
 * @returns 返回审批申请详情
 */
export const getBackList = (params: any) => {
  return defHttp.get({ url: Api.backList, params });
};
export const approveApply = (params: any) => {
  return defHttp.post({ url: Api.backSave, params });
};
