import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/eoa/officialdoc/oaOfficialdocOrgancode/list',
  delete = '/eoa/officialdoc/oaOfficialdocOrgancode/delete',
  deleteBatch = '/eoa/officialdoc/oaOfficialdocOrgancode/deleteBatch',
  exportXlsUrl = '/eoa/officialdoc/oaOfficialdocOrgancode/exportXls',
  importExcelUrl = '/eoa/officialdoc/oaOfficialdocOrgancode/importExcel',
  add = '/eoa/officialdoc/oaOfficialdocOrgancode/add',
  edit = '/eoa/officialdoc/oaOfficialdocOrgancode/edit',
}

/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXlsUrl;
/**
 * 导入api
 * @param params
 */
export const getImportUrl = Api.importExcelUrl;
/**
 *机关代字列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 删除
 */

export const deleteOragnCode = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除
 */

export const deleteBatch = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

/**
 * 新增
 */
export const save = (params) => {
  return defHttp.post({ url: Api.add, params });
};

/**
 * 修改
 */
export const update = (params) => {
  return defHttp.put({ url: Api.edit, params });
};
