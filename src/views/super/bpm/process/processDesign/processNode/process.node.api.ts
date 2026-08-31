import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/process/extActProcessNode/list',
  delete = '/act/process/extActProcessNode/delete',
  deleteBatch = '/act/process/extActProcessNode/deleteBatch',
  add = '/act/process/extActProcessNode/add',
  edit = '/act/process/extActProcessNode/edit',
  batchSavePermission = '/act/process/extActProcessNodePermission/saveOrUpdateBatch'
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

/**
 * 批量保存节点权限
 * @param params
 */
export const batchSavePermission = (params) => {
  return defHttp.post({ url: Api.batchSavePermission, params });
}