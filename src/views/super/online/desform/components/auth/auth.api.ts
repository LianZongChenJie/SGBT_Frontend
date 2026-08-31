import { unref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { replaceUrl } from '../../utils/desformUtils';

export enum Api {
  list = '/desform/auth/list',
  query = '/desform/auth/query',
  add = '/desform/auth/addAuth',
  edit = '/desform/auth/edit',
  updateFieldStatus = '/desform/auth/updateFieldStatus',
  removeById = '/desform/auth/delete',
  deleteByAuthComKey = '/desform/auth/deleteBatchByAuthComKey',

  updateBatch = '/desform/auth/updateBatch',
  queryByCodeAndAuthComKey = '/desform/auth/query/${desformCode}/${authComKey}',
}

function createAuthApi(permissionType: string) {
  function getUrl(api, code?) {
    if (code) {
      return `${api}/${permissionType}/${code}`;
    }
    return `${api}/${permissionType}`;
  }

  function getSaveOrUpdateUrl(isUpdate: boolean) {
    let url: string, method: string;
    if (unref(isUpdate)) {
      url = getUrl(Api.edit);
      method = 'put';
    } else {
      url = getUrl(Api.add);
      method = 'post';
    }
    return { url, method };
  }

  /**
   * 列表接口
   * @param params
   * @param desformCode
   */
  function list(params, desformCode) {
    let url = getUrl(Api.list, desformCode);
    return defHttp.get({ url, params });
  }

  /**
   * 查询接口（不分页）
   * @param params
   * @param desformCode
   */
  function query(params, desformCode) {
    let url = `${Api.query}/${desformCode}`;
    return defHttp.get({ url, params });
  }

  /**
   * 新增或修改
   * @param params
   * @param isUpdate
   */
  function saveOrUpdate(params, isUpdate) {
    const { url, method } = getSaveOrUpdateUrl(isUpdate);
    return defHttp.request({ url, method, params });
  }

  /**
   * 删除单个
   * @param id
   */
  function deleteOne(id) {
    return defHttp.delete({ url: Api.removeById, params: { id } }, { joinParamsToUrl: true });
  }

  /**
   * 更新状态
   * @param params
   */
  function updateStatus(params) {
    const { url, method } = getSaveOrUpdateUrl(true);
    return defHttp.request({ url, method, params }, { successMessageMode: 'none' });
  }

  /**
   * 更新 field 状态
   * @param params
   */
  function updateFieldStatus(params: Recordable) {
    const url = Api.updateFieldStatus
    return defHttp.request({url, method: 'put', params}, {successMessageMode: 'none'});
  }

  /**
   * 根据 authComKeys 删除
   * @param desformCode
   * @param authComKeys
   * @param params
   */
  function deleteByAuthComKey(desformCode: string, authComKeys: string, params: Recordable = {}) {
    let url = Api.deleteByAuthComKey;
    return defHttp.delete(
      {
        url,
        params: {
          ...params,
          desformCode,
          authComKeys,
        },
      },
      { joinParamsToUrl: true }
    );
  }

  return {
    list,
    query,
    saveOrUpdate,
    updateStatus,
    updateFieldStatus,
    delete: deleteOne,
    deleteByAuthComKey,
  };
}

export const dataAuthApi = createAuthApi('data');

export const buttonAuthApi = createAuthApi('button');

export const fieldAuthApi = createAuthApi('field');

export const settingAuthApi = {
  /**
   * 根据 desformCode 和 authComKey 查询权限
   * @param desformCode
   * @param authComKey
   * @param params
   */
  queryByCodeAndAuthComKey(desformCode, authComKey, params = {}) {
    let url = replaceUrl(Api.queryByCodeAndAuthComKey, { desformCode, authComKey });
    return defHttp.get({ url, params });
  },
  /**
   * 根据 desformCode 和 authComKey 批量更新数据
   */
  updateBatch: (params) => defHttp.post({ url: Api.updateBatch, params }),
};
