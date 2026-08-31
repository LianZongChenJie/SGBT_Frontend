import {defHttp} from '/@/utils/http/axios';
import {Modal} from 'ant-design-vue';

enum Api {
  list = '/jeecg-demo/event/event/queryPageList',
  transfer = '/jeecg-demo/event/event/transferData',
  edit = '/sys/position/edit',
  get = '/sys/position/queryById',
  delete = '/sys/position/delete',
  importExcel = '/sys/position/importExcel',
  exportXls = '/sys/position/exportXls',
  deleteBatch = '/sys/position/deleteBatch',
}

/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;

export const getImportUrl = Api.importExcel;
/**
 * 查询列表
 * @param params
 */
export const getEventOrderList = (params) => {
  return defHttp.get({url: Api.list, params});
};

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdateEvent = (params) => {
  let data = {
    eventCode: '开始-待处理',
    businessData: params
  }
  return defHttp.post({url: Api.transfer, data});
};
export const transferCommit = (params) => {
  let data = {
    eventCode: '待处理-已转工单',
    businessData: params
  }
  return defHttp.post({url: Api.transfer, data});
};

/**
 * 查询详情
 * @param params
 */
export const detail = (params) => {
  console.log(params)
  return defHttp.get({url: Api.get, params});
};

/**
 * 单条删除
 * @param params
 */
export const deletePosition = (params, handleSuccess) => {
  return defHttp.delete({url: Api.delete, data: params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除
 * @param params
 */
export const batchDeletePosition = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({
        url: Api.deleteBatch,
        data: params
      }, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    },
  });
};
export const getAllUser = () => {

}
/**
 * 自定义上传
 * @param customUpload
 */
export const customUpload = (params) => {
  defHttp.uploadFile({url: Api.importExcel}, params);
};
