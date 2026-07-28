import { defHttp } from '/@/utils/http/axios';

export enum Api {
  list = '/online/cgform/button/list/',
  delete = '/online/cgform/button/delete',
  deleteBatch = '/online/cgform/button/deleteBatch',
  save = '/online/cgform/button/add',
  edit = '/online/cgform/button/edit',
}

export const list = (code: string, params) => defHttp.get({ url: Api.list + code, params });

// 执行删除操作
export function doBatchDelete(idList: string[]) {
  return defHttp.delete(
    {
      url: Api.deleteBatch,
      params: {
        ids: idList.join(','),
      },
    },
    { joinParamsToUrl: true }
  );
}

/**
 * 保存或者更新
 */
export const saveOrUpdate = (params, isUpdate: boolean) => {
  if (isUpdate) {
    return defHttp.put({ url: Api.edit, params });
  } else {
    return defHttp.post({ url: Api.save, params });
  }
};
