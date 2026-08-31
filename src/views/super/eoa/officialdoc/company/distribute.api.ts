import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/eoa/officialdoc/oaOfficialdocDistribute/list',
  getDepartId = '/eoa/officialdoc/oaOfficialdocIssued/getDepartId',

  delete = '/eoa/officialdoc/oaOfficialdocDistribute/delete',
  deleteBatch = '/eoa/officialdoc/oaOfficialdocDistribute/deleteBatch',
  exportXlsUrl = '/eoa/officialdoc/oaOfficialdocDistribute/exportXls',
  importExcelUrl = '/eoa/officialdoc/oaOfficialdocDistribute/importExcel',

  queryPageList = '/eoa/officialdoc/oaOfficialdocDepartUser/list',
  forward = '/eoa/officialdoc/oaOfficialdocDistribute/forward',
  updateStatus = '/eoa/officialdoc/oaOfficialdocDistribute/updateStatus',
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
 *列表接口
 * @param params
 */
export const list = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 *列表接口
 * @param params
 */
export const queryPageList = (params) => {
  return defHttp.get({ url: Api.queryPageList, params });
};

/**
 *根据部门code查询部门id
 * @param params
 * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
 */
export const getDepartIdByCode = (params) => {
  return defHttp.get({ url: Api.getDepartId, params });
};

/**
 * 删除
 */
export const deleteReceived = (params, handleSuccess) => {
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
 * 修改状态
 * @param params
 */
export const updateStatus = (params) => defHttp.put({ url: Api.updateStatus, params }, { isTransformResponse: false });

/**
 * 转发
 * @param params
 */
export const forward = (params) => defHttp.put({ url: Api.forward, params }, { isTransformResponse: false });
