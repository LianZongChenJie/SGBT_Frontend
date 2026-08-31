import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
enum Api {
  list = '/eoa/wps/oaWpsFile/getWpsFileList',
  getViewUrlDbPath = '/eoa/wps/oaWpsFile/getViewUrlDbPath',
  delete = '/eoa/officialdoc/oaOfficialdocOrgancode/deleteWord',
  deleteBatch = '/eoa/officialdoc/oaOfficialdocOrgancode/deleteWordBatch',
  exportXls = '/eoa/wps/oaWpsFile/exportXls',
  uploadWord = 'eoa/wps/oaWpsFile/uploadWord',
  createWpsTemplate = '/eoa/wps/oaWpsFile/createWpsTemplate',
  getViewUrlWebPath = '/eoa/wps/oaWpsFile/getViewUrlWebPath',
  createTemplateFile = '/eoa/wps/oaWpsFile/createTemplateFile',
}

/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;

/**
 * 导入api
 * @param params
 */
export const getImportUrl = Api.uploadWord;

/**
 * 模板管理列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 公文模板管理新增接口
 */
export const createWpsTemplate = () => {
  return defHttp.get({ url: Api.createWpsTemplate }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 删除公文模板
 */
export const deleteTemplate = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除公文模板
 * @param params
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
 * 获取wps文件预览链接
 */
export const getViewWpsUrl = (params) => {
  return defHttp.get({ url: Api.getViewUrlDbPath, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 通过web链接获取wps文件预览路径
 * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
 */
export const getViewUrlWebPath = (params) => {
  console.log(params);
  return defHttp.get({ url: Api.getViewUrlWebPath, params }, { joinParamsToUrl: true });
};

/**
 * 创建wps/excel/pdf模板
 */
export const createTemplateFile = (params) => {
  return defHttp.get({ url: Api.createTemplateFile, params }, { joinParamsToUrl: true, isTransformResponse: false });
};
