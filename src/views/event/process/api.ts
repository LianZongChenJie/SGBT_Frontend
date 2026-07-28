import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/jeecg-demo/admin/eventStatusFlow/list',
  add = '/jeecg-demo/admin/eventStatusFlow/save',
  eventRole = '/jeecg-demo/admin/eventRole/all',
  enable = '/jeecg-demo/admin/eventStatusFlow/enable',
  disable = '/jeecg-demo/admin/eventStatusFlow/disable',
  delete = '/jeecg-demo/admin/eventStatusFlow/remove',
  update = '/jeecg-demo/admin/eventStatusFlow/modify',
}
/**
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 新增
 * @param params
 */
export const addProcess = (params) => {
  return defHttp.post({ url: Api.add, params });
};
/**
 * 更新
 * @param params
 */
export const updateProcess = (params) => {
  return defHttp.post({ url: Api.update, params });
};

/**
 * 获取事件角色
 *
 * @returns 返回事件角色的信息
 */
export const getEventRole = () => {
  return defHttp.get({ url: Api.eventRole });
};
/**
 * 启用某个进程
 *
 * @param params 包含进程ID的对象
 * @returns 启用进程的响应数据
 */
export const enableProcess = (params) => {
  return defHttp.post({ url: Api.enable + '?id=' + params.id });
};
/**
 * 禁用指定进程
 *
 * @param params 参数对象，必须包含id属性
 * @returns 返回禁用进程的响应数据
 */
export const disableProcess = (params) => {
  return defHttp.post({ url: Api.disable + '?id=' + params.id });
};
/**
 * 单条删除
 * @param params
 */
export const deletePosition = (params) => {
  return defHttp.post({ url: Api.delete, data: params }, { joinParamsToUrl: true });
};
