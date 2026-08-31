import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/eoa/metting/eoaMettingRoom/list',
  save = '/eoa/metting/eoaMettingRoom/add',
  edit = '/eoa/metting/eoaMettingRoom/edit',
  get = '/eoa/metting/eoaMettingRoom/queryById',
  delete = '/eoa/metting/eoaMettingRoom/delete',
  deleteBatch = '/eoa/metting/eoaMettingRoom/deleteBatch',
  exportXls = '/eoa/metting/eoaMettingRoom/exportXls',
  importExcel = '/eoa/metting/eoaMettingRoom/importExcel',
  queryFlowSelect = '/eoa/metting/eoaMetting/queryFlowSelect',
  meetingDeviceList = '/eoa/metting/eoaMettingRoom/queryEoaMettingDeviceByMainId',
  queryMettingRoom = '/eoa/metting/eoaMettingRoom/queryMettingRoom',
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
 * 查询列表
 * @param params
 */
export const getList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
/**
 * 查询会议室
 * @param params
 */
export const queryMettingRoom = (params) => {
  return defHttp.get({ url: Api.queryMettingRoom, params }, { isTransformResponse: false });
};
/**
 * 查询会议设备
 * @param params
 */
export const getDeviceList = (params) => {
  return defHttp.get({ url: Api.meetingDeviceList, params }, { isTransformResponse: false });
};
/**
 * 查询数据字典数据
 * @param params
 */
export const queryFlowSelect = () => {
  return defHttp.get({ url: Api.queryFlowSelect });
};

/**
 * 保存或者更新会议室
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};

/**
 * 查询详情
 * @param params
 */
export const getById = (params) => {
  return defHttp.get({ url: Api.get, params });
};

/**
 * 删除租户
 * @param params
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除会议室
 * @param params
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
