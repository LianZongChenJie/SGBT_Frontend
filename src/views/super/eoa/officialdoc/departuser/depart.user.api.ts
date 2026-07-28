import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/eoa/officialdoc/oaOfficialdocDepartUser/list',
  delete = '/eoa/officialdoc/oaOfficialdocDepartUser/delete',
  deleteBatch = '/eoa/officialdoc/oaOfficialdocDepartUser/deleteBatch',
  exportXlsUrl = '/eoa/officialdoc/oaOfficialdocDepartUser/exportXls',
  importExcelUrl = '/eoa/officialdoc/oaOfficialdocDepartUser/importExcel',
  getUsersByDepartId = '/sys/sysDepart/getUsersByDepartId',
  add = '/eoa/officialdoc/oaOfficialdocDepartUser/add',
  edit = '/eoa/officialdoc/oaOfficialdocDepartUser/edit',
}

/**
 * 导出excel
 */
export const getExportUrl = Api.exportXlsUrl;

/**
 * 导入excel
 */
export const getImportUrl = Api.importExcelUrl;

/**
 * 查询分发人员列表
 * @param params
 */
export const list = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 分发人员删除接口
 */

export const deleteDepartUser = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 分发人员批量删除
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
