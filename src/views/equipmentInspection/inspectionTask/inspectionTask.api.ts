import {defHttp} from '/@/utils/http/axios';
import {Modal} from 'ant-design-vue';

enum Api {
  list = '/modelInspection/inspectionTask/list',
  save = '/equipmentInspection/inspectionTask/save',
  delete = '/modelInspection/inspectionTask/delete',
  deleteBatch = '/equipmentInspection/inspectionTask/deleteBatch',
  export = '/equipmentInspection/inspectionTask/export',
  executionFeedback = '/modelInspection/inspectionTask/executionFeedback',
  resultSummary = '/modelInspection/inspectionTask/resultSummary',
  issueRepairRelations = '/modelInspection/inspectionTask/issueRepairRelations',
  listByTaskId = '/modelInspection/inspectionTaskLog/listByTaskId',
}

/**
 * 查询列表
 * @param params
 */
export const getInspectionTaskList = (params) => {
  return defHttp.get({url: Api.list, params});
};

/**
 * 保存或者更新
 * @param params
 */
export const saveInspectionTask = (params) => {
  return defHttp.post({url: Api.save, params});
};

/**
 * 删除
 * @param params
 * @param handleSuccess
 */
export const deleteInspectionTask = (params, handleSuccess) => {
  return defHttp.delete({url: Api.delete, data: params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除
 * @param params
 */
export const batchDeleteInspectionTask = (params, handleSuccess) => {
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
    }
  });
};

/**
 * 导出
 * @param params
 */
export const exportInspectionTask = (params) => {
  return defHttp.get({url: Api.export, params}, {isReturnNativeResponse: true});
};

/**
 * 执行反馈
 * @param params
 */
export const executionFeedbackInspectionTask = (params) => {
  return defHttp.get({url: Api.executionFeedback, params}, {joinParamsToUrl: true});
};

/**
 * 结果总结
 * @param params
 */
export const resultSummaryInspectionTask = (params) => {
  return defHttp.get({url: Api.resultSummary, params}, {joinParamsToUrl: true});
};

//异常与报修关联
export const issueRepairRelationsInspectionTask = (params) => {
  return defHttp.get({url: Api.issueRepairRelations, params}, {joinParamsToUrl: true});
};

/**
 * 查询操作记录
 * @param params
 */
export const listByTaskIdInspectionTask = (params) => {
  return defHttp.get({url: Api.listByTaskId, params}, {joinParamsToUrl: true});
};
