import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/operation/videoDevice/getStreamUrl',
  save = '/operation/anomalyRule/add',
  edit = '/operation/anomalyRule/edit',
  get = '/operation/anomalyRule/queryById',
  delete = '/operation/anomalyRule/delete',
  deleteBatch = '/operation/anomalyRule/deleteBatch',
  exportXls = '/operation/anomalyRule/exportXls',
  importExcel = '/operation/anomalyRule/importExcel',
  categoryList = '/operation/alarmCategory/categoryList',
  eventList = '/operation/alarmEvent/eventList',
  levelList = '/operation/anomalyLevel/levelList',
  ptzControl = '/operation/videoDevice/ptzControl',
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
// 云台控制
export const setPtzControl = (params) => {
  return defHttp.post({ url: Api.ptzControl, params });
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

// 告警类型
export const getTreeListGaojingleixing = (params?) => defHttp.get({ url: Api.categoryList, params });
// 告警事件
export const getTreeListGaojingshijian = (params?) => defHttp.get({ url: Api.eventList, params });
// 告警等级
export const getTreeListGaojingdengji = (params?) => defHttp.get({ url: Api.levelList, params });
