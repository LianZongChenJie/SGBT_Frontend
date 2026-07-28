import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/operation/inspectionTask/list',
  listByTaskId = '/operation/inspectionTaskDetail/listByTaskId',
  detailExecute = '/operation/inspectionTaskDetail/detailExecute',
  save = '/operation/inspectionTask/add',
  edit = '/operation/inspectionTask/edit',
  get = '/operation/inspectionTask/queryById',
  delete = '/operation/inspectionTask/delete',
  deleteBatch = '/operation/inspectionTask/deleteBatch',
  exportXls = '/operation/inspectionTask/exportXls',
  importExcel = '/operation/inspectionTask/importExcel',
  exportDetail = '/operation/inspectionTask/exportDetail',

  adjust = '/operation/inspectionTask/adjust',
  jump = '/operation/inspectionTaskDetail/jump',
  skip = '/operation/inspectionTask/skip',
  queryDetail = '/operation/inspectionTask/queryDetail',
  insExecute = '/operation/inspectionTask/insExecute',
  saveInsDraft = '/operation/inspectionTask/saveInsDraft',
  DetailImage = '/operation/inspectionTaskDetail/saveDetailImage',
  imageByDetailId = '/operation/inspectionTaskDetail/imageByDetailId',

}

/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
export const getExportDetail = Api.exportDetail;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 查询示例列表
 * @param params
 */
export const getDemoList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
export const getListByTaskId = (params) => {
  return defHttp.get({ url: Api.listByTaskId, params });
};
export const saveDetailExecute = (params) => {
  return defHttp.post({ url: Api.detailExecute, params });
};
export const saveDetailImage = (params) => {
  return defHttp.post({ url: Api.DetailImage, params });
};
export const getImageByDetailId = (params) => {
  return defHttp.get({ url: Api.imageByDetailId, params });
};
export const getJump = (params) => {
  return defHttp.post({ url: Api.jump, params });
};
export const saveExecute = (params) => {
  return defHttp.post({ url: Api.insExecute, params });
};
export const SaveInsDraft = (params) => {
  return defHttp.post({ url: Api.saveInsDraft, params });
};
export const getSkip = (params) => {
  return defHttp.post({ url: Api.skip, params });
};
export const getQueryDetail = (params) => {
  return defHttp.get({ url: Api.queryDetail, params });
};

/**
 * 保存或者更新示例
 * @param params
 */
export const saveOrUpdateDemo = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  if (isUpdate) {
    return defHttp.put({ url: url, params });
  } else {
    return defHttp.post({ url: url, params });
  }
};

/**
 * 任务调整
 * @param params
 */
export const saveAdjust = (params) => {
  return defHttp.post({ url: Api.adjust, params });
};

/**
 * 查询示例详情
 * @param params
 */
export const getDemoById = (params) => {
  return defHttp.get({ url: Api.get, params });
};

/**
 * 删除示例
 * @param params
 */
export const deleteDemo = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除示例
 * @param params
 */
export const batchDeleteDemo = (params, handleSuccess) => {
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
