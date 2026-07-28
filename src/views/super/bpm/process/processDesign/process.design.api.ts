import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/act/process/extActProcess/listProcess',
  delete = '/act/process/extActProcess/delete',
  deleteBatch = '/act/process/extActProcess/deleteBatch',
  deployProcess = '/act/process/extActProcess/deployProcess',
  uploadProcess = '/act/process/extActProcess/uploadProcess',
  copyProcess = '/act/process/extActProcess/copyProcess',
  edit = '/act/process/extActProcess/edit',
}

/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 编辑
 */
export const edit = (params) => defHttp.put({ url: Api.edit, params });

/**
 * 发布
 */
export const publish = (params) => defHttp.put({ url: Api.deployProcess, params });

/**
 * 删除
 */
export const deleteOne = (params) => defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true });

/**
 * 复制
 */
export const copy = (params) => defHttp.get({ url: Api.copyProcess, params });

export const uploadProcess = Api.uploadProcess;
