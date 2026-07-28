import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jeecg-demo/event/order/findOrderPage',
  save = '/jeecg-demo/event/order/transferData',
  transfer = '/jeecg-demo/event/order/transferData',
  edit = '/sys/position/edit',
  get = '/jeecg-demo/event/order/detail',
  process = '/jeecg-demo/event/order/record',
  user = '/jeecg-demo/event/order/getUserByRole',
  spareParts = '/jeecg-demo/admin/inventory/getByWarehouseId',
  saveSpareParts = '/jeecg-demo/admin/inventory/findProjectInventory',
  getMermaid = '/jeecg-demo/event/flow/visual/mermaid',
}
/**
 * 查询备件
 * @param params
 */
export const getSparePartsList = (params: any) => {
  if (params.isTimeout === false) {
    params.isTimeout = undefined;
  }

  return defHttp.get({ url: Api.spareParts, params });
};

/**
 * 查询列表
 * @param params
 */
export const getEventOrderList = (params: any) => {
  if (params.timeRange) {
    params.createdTimeStart = params.timeRange[0];
    params.createdTimeEnd = params.timeRange[1];
    delete params.timeRange;
  }
  return defHttp.get({ url: Api.list, params });
};
/**
 * 查询流程
 * @param params
 */
export const getEventProcessList = (params: any) => {
  return defHttp.get({ url: Api.process, params });
};
export const getUserList = (params: any) => {
  return defHttp.get({ url: Api.user, params });
};
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdateEvent = (params: any) => {
  let data = {
    eventCode: '开始-待接单',
    businessData: params
  }
    ;
  return defHttp.post({ url: Api.save, data });
};
export const defaultTransfer = (params: any, code: any) => {
  let data = {
    eventCode: code,
    businessData: params
  }
  return defHttp.post({ url: Api.transfer, data });
}
export const checkCommit = (params: any) => {
  let event = '待验收-待评价'
  if (params.redio === 'N') {
    event = '待验收-验收不通过'
  }
  let data = {
    eventCode: event,
    businessData: params
  }
  return defHttp.post({ url: Api.transfer, data });
};
export const takeOrder = (params: any) => {
  let data = {
    eventCode: '待接单-待分配',
    businessData: params
  }
  return defHttp.post({ url: Api.transfer, data });
};
/**
 * 查询详情
 * @param params
 */
export const detail = (params: any) => {
  return defHttp.get({ url: Api.get, params });
};
// 获取流程图
export const getMermaid = (params: any) => {
  return defHttp.get({ url: Api.getMermaid, params });
};


