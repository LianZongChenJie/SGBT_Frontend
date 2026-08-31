import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/operation/videoPatrolPlan/list',
  save = '/operation/videoPatrolPlan/add',
  edit = '/operation/videoPatrolPlan/edit',
  get = '/operation/videoPatrolPlan/queryById',
  delete = '/operation/videoPatrolPlan/delete',
  deleteBatch = '/operation/videoPatrolPlan/deleteBatch',
  exportXls = '/operation/videoPatrolPlan/exportXls',
  importExcel = '/operation/videoPatrolPlan/importExcel',
  updateStatus = '/operation/videoPatrolPlan/updateStatus',
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
 * 查询示例列表
 * @param params
 */
export const getDemoList = (params) => {
  return defHttp.get({ url: Api.list, params });
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

// 巡检计划启动暂停接口
export const setUpdateStatus = (params, handleSuccess) => {
  return defHttp.put({ url: Api.updateStatus, params }, { joinParamsToUrl: false }).then(() => {
    handleSuccess();
  });
};
