import {defHttp} from '/@/utils/http/axios';
import {Modal} from 'ant-design-vue';

enum Api {
  majorList = '/modelInspection/inspectionMajor/list',
  saveMajor = '/modelInspection/inspectionMajor/add',
  updateMajor = '/modelInspection/inspectionMajor/edit',
  delete = '/modelInspection/inspectionMajor/delete',
  deleteBatch = '/equipmentInspection/inspectionContent/deleteBatch',
  export = '/equipmentInspection/inspectionContent/export',
  taskList = '/modelInspection/inspectionTemplate/listFlatByMajorId',
  objectTypeList = '/modelInspection/inspectionObjectType/list',
  objectTypeListChild = '/modelInspection/inspectionObjectType/children',
  createTemplate = '/modelInspection/inspectionTemplate/createTemplate',
  deleteInspectionContent = '/modelInspection/inspectionTemplateContent/delete',
  batchSaveAll = '/modelInspection/inspectionTemplate/batchSaveAll',
  getDetail = '/modelInspection/inspectionTemplate/getDetail',
}

/**
 * 查询专业列表
 * @param params
 */
export const majorList = () => {
  return defHttp.get({url: Api.majorList});
};

/**
 * 查询列表
 * @param params
 */
export const taskList = (params) => {
  return defHttp.get({url: Api.taskList, params});
};

/**
 * 保存或者更新
 * @param params
 */
export const saveMajor = (params, type: string) => {
  return defHttp.post({url: type === 'save' ? Api.saveMajor : Api.updateMajor, params});
};

/**
 * 创建巡检模板
 * @param params
 * @param type
 */
export const createTemplate = (params, type: string) => {
  console.log("创建巡检模板参数:", params);
  console.log("创建巡检模板类型:", type);
  return defHttp.post({url: type === 'add' ? Api.createTemplate : Api.batchSaveAll, params});
};

// 删除专业
export const deleteMajor = (params, handleSuccess) => {
  return defHttp.delete({url: Api.delete, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
};

/**
 * 删除
 * @param params
 * @param handleSuccess
 */
export const deleteInspectionContent = (params, handleSuccess) => {
  return defHttp.delete({url: Api.deleteInspectionContent, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除
 * @param params
 */
export const batchDeleteInspectionContent = (params, handleSuccess) => {
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
export const exportInspectionContent = (params) => {
  return defHttp.get({url: Api.export, params}, {isReturnNativeResponse: true});
};

// 查询巡检对象类型
export const objectTypeList = () => {
  return defHttp.get({url: Api.objectTypeList}, { isTransformResponse: false });
};

// 查询巡检对象子类型
export const objectTypeListChild = (params) => {
  return defHttp.get({url: Api.objectTypeListChild, params}, { isTransformResponse: false });
};

/**
 * 查询巡检内容详情
 * @param params
 */
export const getDetail = (params) => {
  return defHttp.get({url: Api.getDetail, params});
};
