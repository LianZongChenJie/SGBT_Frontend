import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/eoa/metting/eoaMetting/list',
  queryList = '/eoa/metting/eoaMetting/queryList',
  queryById = '/eoa/metting/eoaMetting/queryById',
  save = '/eoa/metting/eoaMetting/add',
  edit = '/eoa/metting/eoaMetting/edit',
  delete = '/eoa/metting/eoaMetting/delete',
  deleteBatch = '/eoa/metting/eoaMetting/deleteBatch',
  exportXls = '/eoa/metting/eoaMetting/exportXls',
  importExcel = '/eoa/metting/eoaMetting/importExcel',
  queryMetting = '/eoa/metting/eoaMetting/queryMetting',
  mettingInfo = '/eoa/metting/eoaMettingSign/mettingInfo',
  mettingSign = '/eoa/metting/eoaMettingSign/mettingSign',
  loadTreeData = '/sys/dict/loadTreeData',
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
 * 根据id查询
 * @param params
 */
export const queryById = (params) => {
  return defHttp.get({ url: Api.queryById, params }, { isTransformResponse: false });
};
/**
 * 查询列表
 * @param params
 */
export const queryList = (params) => {
  return defHttp.get({ url: Api.queryList, params }, { isTransformResponse: false });
};
/**
 * 查询会议
 * @param params
 */
export const queryMetting = (params?) => {
  return defHttp.get({ url: Api.queryMetting, params }, { isTransformResponse: false });
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
 * 删除
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
/**
 * 查询会议信息
 * @param params
 */
export const queryMettingInfo = (params) => {
  return defHttp.get({ url: Api.mettingInfo, params }, { isTransformResponse: false });
};
/**
 * 会议签到
 * @param params
 */
export const mettingSign = (params) => {
  return defHttp.post({ url: Api.mettingSign, params }, { isTransformResponse: false });
};
/**
 * 异步加载树信息
 * @param params
 */
export const loadTreeData = (params) => {
  return defHttp.get({ url: Api.queryById, params }, { isTransformResponse: false });
};
