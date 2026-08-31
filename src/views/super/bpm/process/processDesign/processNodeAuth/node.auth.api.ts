import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/process/extActProcessNodePermission/list',
  delete = '/act/process/extActProcessNodePermission/delete',
  deleteBatch = '/act/process/extActProcessNodePermission/deleteBatch',
  add = '/act/process/extActProcessNodePermission/add',
  edit = '/act/process/extActProcessNodePermission/edit',

  getOnlineField = '/online/cgform/api/getAuthColumn/',
  getDesignField = '/desform/auth/query/',
  queryFormTypeByProcessid = '/act/process/extActProcessForm/queryFormTypeByProcessid',
  queryFormBizCodeByProcessid = '/act/process/extActProcessForm/queryFormBizCodeByProcessid',
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
 * 批量
 */
export const deleteBatch = (params) => defHttp.delete({ url: Api.deleteBatch, params }, { joinParamsToUrl: true });

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
 * 列表-online权限字段选择
 * @param params
 */
export const getOnlineFields = (code) => {
  let url = Api.getOnlineField + code;
  return defHttp.get({ url });
};

/**
 * 列表-设计器权限字段选择
 * @param params
 */
export const getDesignFields = (code) => {
  let url = Api.getDesignField + code + '?group=true';
  return defHttp.get({ url });
};

/**
 * 查询流程绑定的表单
 * @param processId
 */
export const queryFormTypeByProcessId = (processId) => {
  let params = { processId }; //查询条件
  return defHttp.get({ url: Api.queryFormTypeByProcessid, params });
};

/**
 * 查询表单对应的编码或是表名
 * @param processId
 */
export const queryFormBizCodeByProcessid = (processId, formType) => {
  //查询条件
  let params = { processId, formType };
  return defHttp.get({ url: Api.queryFormBizCodeByProcessid, params });
};
