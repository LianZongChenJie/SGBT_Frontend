import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/modelInspection/inspectionPlan/list',
  GetPlanDetail = '/patrol/plan/detail',
  SavePlan = '/modelInspection/inspectionPlan/add',
  UpdatePlan = '/modelInspection/inspectionPlan/edit',
  DeletePlan = '/modelInspection/inspectionPlan/delete',
  CopyPlan = '/patrol/plan/copy',
  DisablePlan = '/modelInspection/inspectionPlan/deactivate',
  EnablePlan = '/modelInspection/inspectionPlan/activate',
  GetPlanObjectList = '/patrol/plan/object/queryPageWithLimit',
  GetPlanContentList = '/patrol/plan/content/queryPageWithLimit',
  GetInspectTemplateList = '/patrol/template/queryAll',
  SavePlanObject = '/patrol/plan/object/save',
  SavePlanTemplate = '/patrol/plan/template/save',
  SavePlanInspectItem = '/patrol/plan/inspectitem/save',
  DeletePlanInspectItem = '/patrol/plan/inspectitem/del',
  GetMdmSpaceCascadeTree = '/modelInspection/mdmSpace/getCascadeTree',
  GetInspectionDetails = '/modelInspection/inspectionPlan/getInspectionDetails',
  GetRouteMaintenanceList = '/modelInspection/inspectionPlan/getRouteMaintenanceList',
  GetFullDetail = '/modelInspection/inspectionPlan/getFullDetail',
  GetPlanLogList = '/modelInspection/inspectionPlanLog/list',
  SavePlanLog = '/modelInspection/inspectionPlanLog/add',
}

export function getPlanList(params) {
  return defHttp.get({ url: Api.list, params });
}

export function getPlanDetail(params) {
  return defHttp.get({ url: Api.GetPlanDetail, params });
}

export function savePlan(data) {
  return defHttp.post({ url: Api.SavePlan, data });
}

export function updatePlan(data) {
  return defHttp.put({ url: Api.UpdatePlan, data });
}

export function deletePlan(params) {
  return defHttp.delete({ url: Api.DeletePlan, params }, { joinParamsToUrl: true });
}

export function copyPlan(params) {
  return defHttp.post({ url: Api.CopyPlan, params });
}
//停用计划
export function disablePlan(params) {
  return defHttp.post({ url: Api.DisablePlan, params }, { joinParamsToUrl: true });
}
    // 启用计划
export function enablePlan(params) {
  return defHttp.post({ url: Api.EnablePlan, params }, { joinParamsToUrl: true });
}

export function getPlanObjectList(params) {
  return defHttp.get({ url: Api.GetPlanObjectList, params });
}

export function getPlanContentList(params) {
  return defHttp.get({ url: Api.GetPlanContentList, params });
}

export function getInspectTemplateList(params?) {
  return defHttp.get({ url: Api.GetInspectTemplateList, params });
}

export function savePlanObject(data) {
  return defHttp.post({ url: Api.SavePlanObject, data });
}

export function savePlanTemplate(data) {
  return defHttp.post({ url: Api.SavePlanTemplate, data });
}

export function savePlanInspectItem(data) {
  return defHttp.post({ url: Api.SavePlanInspectItem, data });
}

export function deletePlanInspectItem(params) {
  return defHttp.post({ url: Api.DeletePlanInspectItem, params });
}
// 查询巡检区域
export function getMdmSpaceCascadeTree(params) {
  return defHttp.get({ url: Api.GetMdmSpaceCascadeTree, params });
}



// 查询巡检计划详情
export function getFullDetail(params) {
  return defHttp.get({ url: Api.GetFullDetail, params });
}

// 查询巡检对象详情
export function getInspectionDetails(params) {
  return defHttp.get({ url: Api.GetInspectionDetails, params });
}
// 查询巡检维护路线详情
export function getRouteMaintenanceList(params) {
  return defHttp.post({ url: Api.GetRouteMaintenanceList, params });
}

// 查询巡检日志列表
export function getPlanLogList(params) {
  return defHttp.get({ url: Api.GetPlanLogList, params });
}

// 保存巡检日志
export function savePlanLog(data) {
  return defHttp.post({ url: Api.SavePlanLog, data });
}
