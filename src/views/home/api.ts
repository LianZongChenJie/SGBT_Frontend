import { defHttp } from '/@/utils/http/axios';

enum Api {
  sysDepart = '/sys/sysDepart/searchBy?keyWord=项目部',
  list = '/jeecg-demo/event/dashboard/all',
}

/**
 * 项目部列表
 * @param params
 */
export const getSysDepart = (params) => {
  return defHttp.get({ url: Api.sysDepart });
};

/**
 * 查询列表
 * @param params
 */
export const getList = (params: any) => {
  // console.log('params===',params.value)
  return defHttp.get({ url: Api.list, params });
};
