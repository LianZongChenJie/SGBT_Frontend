import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/eoa/cms/eoaCmsSite/list',
  queryById = '/eoa/cms/eoaCmsSite/queryById',
  save = '/eoa/cms/eoaCmsSite/add',
  edit = '/eoa/cms/eoaCmsSite/edit',
  exportXls = '/eoa/cms/eoaCmsSite/exportXls',
  importExcel = '/eoa/cms/eoaCmsSite/importExcel',
}
/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 根据id查询
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params });

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};
