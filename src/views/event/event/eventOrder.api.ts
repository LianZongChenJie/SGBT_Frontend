import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jeecg-demo/event/event/queryPageList',
  //save = '/jeecg-demo/event/event/transferData',
  transfer = '/jeecg-demo/event/event/transferData',
  edit = '/sys/position/edit',
  get = '/jeecg-demo/event/event/detail',
  process = '/jeecg-demo/event/event/record',
  limitProject = '/jeecg-demo/admin/eventUserRole/findProjectDeptWithUserLimit',
  findAllCustomerUser = '/jeecg-demo/event_tenant/findAllCustomerUser',
  userSelf = '/jeecg-demo/event_tenant/userSelf',
  sysDepart = '/jeecg-demo/mdm/space/getPropById',
}

export const getLimitProject = (params: any) => {
  return defHttp.get({ url: Api.limitProject, params });
};
/**
 * 查询列表
 * @param params
 */
export const getEventOrderList = (params: any) => {
  if (params.contractPeople) {
    params.contractPeople = '*' + params.contractPeople + '*'
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
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdateEvent = (params: any) => {
  let data = {
    eventCode: '开始-待处理',
    businessData: params
  }
    ;
  return defHttp.post({ url: Api.transfer, data });
};
//转工单
export const transferCommit = (params: any) => {
  let data = {
    eventCode: '待处理-已转工单',
    businessData: params
  }
  return defHttp.post({ url: Api.transfer, data });
};
//待处理
export const processCommit = (params: any) => {
  let data = {
    eventCode: '待处理-已完成',
    businessData: params
  }
  return defHttp.post({ url: Api.transfer, data });
};
//待评价
export const appraiseCommit = (params: any) => {
  let data = {
    eventCode: '待评价-已完成',
    businessData: params
  }
  return defHttp.post({ url: Api.transfer, data });
};

export const userSelectCommit = (params: any) => {
  let data = {
    eventCode: '待分配-进行中',
    businessData: params
  }
  return defHttp.post({ url: Api.transfer, data });
};
export const checkCommit = (params: any) => {
  let data = {
    eventCode: '待验收-待评价',
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
  console.log(params)
  return defHttp.get({ url: Api.get, params });
};

export const findAllCustomerUser = () => {
  return defHttp.get({ url: Api.findAllCustomerUser });
};
export const userSelf = () => {
  return defHttp.get({ url: Api.userSelf });
};
/**
 * 项目部
 * @param params
 */
export const getSysDepart = (params) => {
  return defHttp.get({ url: Api.sysDepart, params });
};
