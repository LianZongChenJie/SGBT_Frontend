import { defHttp } from '/src/utils/http/axios';
import { Modal } from 'ant-design-vue';
enum Api {
  list = '/joa/biz/extBizLeave/list',
  add = '/joa/biz/extBizLeave/add',
  edit = '/joa/biz/extBizLeave/edit',
  delete = '/joa/biz/extBizLeave/delete',
  deleteBatch = '/joa/biz/extBizLeave/deleteBatch',
  queryById = '/joa/biz/extBizLeave/queryById',
  startProcess = '/act/process/extActProcess/startMutilProcess',
  invalidProcess = '/act/task/invalidBizProcess',
  queryFlowDataByCodeAndId = '/act/process/extActFlowData/queryFlowDataByCodeAndId',
  taskEntrust = '/act/task/taskEntrust',
  checkNotify = '/act/process/extActFlowData/checkNotify',
}
/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 根据id查询
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { isTransformResponse: false });
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.add;
  return defHttp.post({ url: url, params });
};
/**
 * 删除
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除
 * @param params
 */
export const batchDelete = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then((res) => {
        handleSuccess(res);
      });
    },
  });
};
/**
 * 提交流程
 * @param params
 */
export const startProcess = (params) => {
  return defHttp.post({ url: Api.startProcess, params }, { isTransformResponse: false });
};
/**
 * 作废流程
 * @param params
 */
export const invalidProcess = (params, handleSuccess) => {
  return defHttp.put({ url: Api.invalidProcess, params }).then(() => {
    handleSuccess();
  });
};
/**
 * 查询流程数据
 * @param params
 */
export const queryFlowData = (params, handleSuccess) => {
  return defHttp.get({ url: Api.queryFlowDataByCodeAndId, params }, { isTransformResponse: false }).then((res) => {
    handleSuccess(res);
  });
};
/**
 * 查询催办
 * @param params
 */
export const checkNotify = (params) => {
  return defHttp.get({ url: Api.checkNotify, params }, { isTransformResponse: false });
};
/**
 * 委派
 * @param params
 */
export const taskEntrust = (params) => defHttp.put({ url: Api.taskEntrust, params }, { isTransformResponse: false });
