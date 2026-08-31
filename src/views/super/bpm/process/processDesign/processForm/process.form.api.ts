import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/process/extActProcessForm/list',
  delete = '/act/process/extActProcessForm/delete',
  deleteBatch = '/act/process/extActProcessForm/deleteBatch',
  add = '/act/process/extActProcessForm/add',
  edit = '/act/process/extActProcessForm/edit',
}

/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 删除
 */
export const deleteOne = (params) => defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true });

/**
 * 表单操作
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  if (isUpdate) {
    return defHttp.put({ url: Api.edit, params });
  } else {
    return defHttp.post({ url: Api.add, params });
  }
};
