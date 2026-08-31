import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import { SuccessMessageMode } from '/#/axios';
enum Api {
  list = '/eoa/officialdoc/oaOfficialdocIssued/list',
  save = '/eoa/officialdoc/oaOfficialdocIssued/add',
  edit = '/eoa/officialdoc/oaOfficialdocIssued/edit',
  queryById = '/eoa/officialdoc/oaOfficialdocIssued/queryById',
  deleteOne = '/eoa/officialdoc/oaOfficialdocIssued/delete',
  deleteBatch = '/eoa/officialdoc/oaOfficialdocIssued/deleteBatch',
  getCode = '/eoa/officialdoc/oaOfficialdocIssued/getCode',
  getTemplateAndUser = '/eoa/officialdoc/oaOfficialdocOrgancode/getTemplateAndUser',
  officialTemp = '/eoa/officialdoc/oaOfficialdocOrgancode/officialTemp',
  getStatistics = '/eoa/officialdoc/oaOfficialdocIssued/getStatistics',
  importExcel = '/eoa/officialdoc/oaOfficialdocIssued/importExcel',
  exportXls = '/eoa/officialdoc/oaOfficialdocIssued/exportXls',
  statisticsExportXlsUrl = '/eoa/officialdoc/oaOfficialdocIssued/issuedStatisticsExportXls',
  getDepartId = '/eoa/officialdoc/oaOfficialdocIssued/getDepartId',
  //流程
  startProcess = '/act/process/extActProcess/startMutilProcess',
}
/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;

/**
 * 发文统计额导出
 */
export const statisticsExportXlsUrl = Api.statisticsExportXlsUrl;

/**
 * 列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 根据id查询
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { isTransformResponse: false });

/**
 * 提交流程
 * @param params
 */
export const startProcess = (params) => {
  return defHttp.post({ url: Api.startProcess, params }, { isTransformResponse: false });
};
/**
 * 删除单个
 * @param params 参数
 * @param handleSuccess 成功回调
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除
 * @param params 参数
 * @param handleSuccess 成功回调
 */
export const batchDelete = (params, handleSuccess) => {
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
 * 保存或者更新
 * @param params 参数
 * @param isUpdate 是否更新
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  const messageMode: SuccessMessageMode = params?.status == '1' ? 'none' : 'success';
  return defHttp.post({ url: url, params }, { successMessageMode: messageMode });
};

/**
 * 获取文号
 * @param params {organId:机关代字的id}
 */
export const getCode = (params) => {
  return defHttp.get({ url: Api.getCode, params });
};

/**
 * 获取word在线访问路径
 * @param params {codeId:机关代字的id,text:official,code:文号}
 */
export const getTemplateAndUser = (params) => {
  return defHttp.get({ url: Api.getTemplateAndUser, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 判断是否起草正文
 * @param params {code:文号}
 */
export const officialTemp = (params) => {
  return defHttp.get({ url: Api.officialTemp, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 获取发文统计
 * @param params
 */
export const getStatistics = (params) => defHttp.get({ url: Api.getStatistics, params });

/**
 * 通过部门code获取部门id
 * @param params
 */
export const getDepartId = (params) => defHttp.get({ url: Api.getDepartId, params }, { joinParamsToUrl: true, isTransformResponse: false });
