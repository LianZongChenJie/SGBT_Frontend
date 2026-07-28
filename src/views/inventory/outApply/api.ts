import { defHttp } from "@/utils/http/axios";


enum Api {
  list = '/jeecg-demo/admin/inventoryApprove/pageForPersonApprove',
  warehouse = '/jeecg-demo/admin/warehouse/listWithLimit',
  inventory = '/jeecg-demo/admin/inventory/getByWarehouseId',
  approveApply = '/jeecg-demo/admin/inventoryApprove/approveApply',
  approveApplyDetail = '/jeecg-demo/admin/inventoryApprove/detail',
  add = '/jeecg-demo/admin/warehouse/add',
  edit = '/jeecg-demo/admin/warehouse/edit',
  delete = '/jeecg-demo/admin/warehouse/delete',
  allOrganization = '/sys/sysDepart/searchBy',
  spareParts = '/jeecg-demo/admin/inventory/getByWarehouseId',
}

export const approveApply = (params: any) => {
  return defHttp.post({ url: Api.approveApply, params });
};
export const approveApplyDetail = (params: any) => {
  return defHttp.get({ url: Api.approveApplyDetail, params });
};
/**
 * 获取出库申请列表
 *
 * @param params 请求参数
 * @returns 返回外出申请列表数据
 */
export const getOutApplyList = (params: any) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 获取组织名称
 */
export const getAllOrganizationList = (params) => defHttp.get({ url: Api.allOrganization, params });
export const listApi = (params: any) => {
  if (params.code) {
    params.code = '*' + params.code + '*'
  }
  return defHttp.get({ url: Api.list, params });
};
export const getMaterialList = (params: any) => {
  return defHttp.get({ url: Api.inventory, params });
}
export const getLimitHouse = (params: any) => {
  return defHttp.get({ url: Api.warehouse, params });
}
export const deleteApi = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, {
    isTransformResponse: false,
    joinParamsToUrl: true
  })
    .then(() => {
      handleSuccess();
    });
};
export const getSparePartsList = (params: any) => {
  return defHttp.get({ url: Api.spareParts, params });
};
