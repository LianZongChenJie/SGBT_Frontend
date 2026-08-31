import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/operation/baseRepairExperience/list',
  save = '/operation/baseRepairExperience/add',
  edit = '/operation/baseRepairExperience/edit',
  get = '/operation/baseRepairExperience/queryById',
  delete = '/operation/baseRepairExperience/delete',
  deleteBatch = '/operation/baseRepairExperience/deleteBatch',
  exportXls = '/operation/baseRepairExperience/exportXls',
  importExcel = '/operation/baseRepairExperience/importExcel',
  updateStatus = '/operation/baseRepairExperience/updateStatus',
  TreeListWeixiufangfa = '/operation/baseRepairMethod/list',
  TreeListWeixiuleibie = '/operation/baseRepairCategory/list',
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
export const saveUpdateStatus = (params, handleSuccess) => {
  return defHttp.put({ url: Api.updateStatus, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
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

// 维修方法
export const getTreeListWeixiufangfa = (params?) => defHttp.get({ url: Api.TreeListWeixiufangfa, params });
// 维修类别
export const getTreeListWeixiuleibie = (params?) => defHttp.get({ url: Api.TreeListWeixiuleibie, params });
