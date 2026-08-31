import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/process/extActListener/list',
  save = '/act/process/extActListener/add',
  edit = '/act/process/extActListener/edit',
  delete = '/act/process/extActListener/delete',
  changeStatus = '/act/process/extActListener/changeStatus',
}
/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return isUpdate ? defHttp.put({ url: url, params }) : defHttp.post({ url: url, params });
};
/**
 * 删除监听
 * @param params
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 修改状态
 * @param params
 */
export const changeStatus = (params, handleSuccess) => {
  return defHttp.put({ url: Api.changeStatus, data: params }).then(() => {
    handleSuccess();
  });
};
