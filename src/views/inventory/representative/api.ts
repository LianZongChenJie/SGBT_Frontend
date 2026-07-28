import { defHttp } from '@/utils/http/axios';

enum Api {
  list = '/jeecg-demo/admin/inventoryApprove/pageForMyTodo',
  approveApplyDetail = '/jeecg-demo/admin/inventoryApprove/detail',
  approvePass = '/jeecg-demo/admin/inventoryApprove/approved',
  approveNotPass = '/jeecg-demo/admin/inventoryApprove/approvalRejection',
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

export const approve = (params: any) => {
  console.log(params.id);
  const newParams = { id: params.id, description: params.description };

  if (params.evaluate === '1') {
    return defHttp.post({ url: Api.approvePass, params: newParams });
  } else {
    return defHttp.post({ url: Api.approveNotPass, params: newParams });
  }
};
