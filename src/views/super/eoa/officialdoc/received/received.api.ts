import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import {SuccessMessageMode} from "/#/axios";

enum Api {
  list = '/eoa/officialdoc/oaOfficialdocReceived/list',
  delete = '/eoa/officialdoc/oaOfficialdocReceived/delete',
  deleteBatch = '/eoa/officialdoc/oaOfficialdocReceived/deleteBatch',
  exportXlsUrl = '/eoa/officialdoc/oaOfficialdocReceived/exportXls',
  importExcelUrl = '/eoa/officialdoc/oaOfficialdocReceived/importExcel',
  add = '/eoa/officialdoc/oaOfficialdocReceived/add',
  edit = '/eoa/officialdoc/oaOfficialdocReceived/edit',
  queryById = '/eoa/officialdoc/oaOfficialdocReceived/queryById',
  startProcess = '/act/process/extActProcess/startMutilProcess',
  getList = '/eoa/officialdoc/oaOfficialdocDepartUser/getList',
  getReceiptCode = '/eoa/officialdoc/oaOfficialdocReceived/getReceiptCode',
  statisticsList = '/eoa/officialdoc/oaOfficialdocReceived/getReceivedStatistics',
  statisticsExport = '/eoa/officialdoc/oaOfficialdocReceived/receStatisticsExportXls',
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
export const list = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 根据id查询
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { isTransformResponse: false });
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

/**
 * 保存或者更新
 * @param params 参数
 * @param isUpdate 是否更新
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.add;
  const messageMode: SuccessMessageMode = params?.status == '1' ? 'none' : 'success';
  return defHttp.post({ url: url, params }, { successMessageMode: messageMode });
};

/**
 * 获取分发部门
 */
export const getListDepart = () => {
  return defHttp.get({ url: Api.getList });
};

/**
 * 获取收文编号
 */
export const getReceiptCode = () => {
  return defHttp.get({ url: Api.getReceiptCode });
};

/**
 * 公文收文统计导出Api
 */
export const getStatisticsExportUrl = Api.statisticsExport;

/**
 *公文收文统计列表查询
 */
export const statisticsList = (params) => {
  return defHttp.get({ url: Api.statisticsList, params });
};
