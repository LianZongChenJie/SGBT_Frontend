import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
enum Api {
  list = '/act/process/extActDesignFlowData/list',
  save = '/act/process/extActDesignFlowData/add',
  edit = '/act/process/extActDesignFlowData/edit',
  delete = '/act/process/extActDesignFlowData/delete',
  queryFormDataById = '/desform/data/queryById',
  deleteBatch = '/act/process/extActDesignFlowData/deleteBatch',
  startProcess = '/act/process/extActProcess/startDesFormMutilProcess',
}

/**
 * 列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 提交流程
 * @param params
 */
export const startDesFormProcess = (params, handleSuccess) => {
  Modal.confirm({
    title: '提示',
    content: '确认提交流程吗?',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.get({ url: Api.queryFormDataById, params }, { isTransformResponse: false }).then((res) => {
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
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return isUpdate
    ? defHttp.put({ url: url, params }, { isTransformResponse: false })
    : defHttp.post({ url: url, params }, { isTransformResponse: false });
};
/**
 * 删除监听
 * @param params
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
