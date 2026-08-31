import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/operation/videoPatrolTask/list',
  save = '/operation/videoPatrolTask/add',
  edit = '/operation/videoPatrolTask/edit',
  get = '/operation/videoPatrolTask/queryById',
  delete = '/operation/videoPatrolTask/delete',
  deleteBatch = '/operation/videoPatrolTask/deleteBatch',
  exportXls = '/operation/videoPatrolTask/exportTemplate',
  importExcel = '/operation/videoPatrolTask/importExcel',
  startTask = '/operation/videoPatrolTask/startTask',
  complete = '/operation/videoPatrolTask/complete',
  submitAlarm = '/operation/videoPatrolTask/submitAlarm',
  checkIn = '/operation/videoPatrolTask/checkIn',
  eventNames = '/operation/videoPatrolTask/eventNames',
  eventTypes = '/operation/videoPatrolTask/eventTypes',
  queryByCode = '/operation/videoDevice/queryByCode',
  patrolStart = '/operation/video/patrol/start',
  patrolState = '/operation/video/patrol/{patrolId}',
  patrolNext = '/operation/video/patrol/{patrolId}/next',
  patrolStop = '/operation/video/patrol/{patrolId}/stop',
}

export type PatrolStatus = 'RUNNING' | 'STOPPED' | 'FINISHED' | 'ERROR';

export interface PatrolCameraItem {
  cameraIndexCode: string;
  cameraName: string;
}

export interface PatrolStartRequest {
  cameras: PatrolCameraItem[];
  loop: boolean;
  staySeconds: number;
  streamType: 0 | 1;
}

export interface PatrolStateResponse {
  patrolId: string;
  status: PatrolStatus;
  stream?: string;
  wsFlvUrl?: string;
  httpFlvUrl?: string;
  currentIndex?: number;
  total?: number;
  cameraIndexCode?: string;
  cameraName?: string;
  nextSwitchAt?: number;
  message?: string;
}

function patrolUrl(template: string, patrolId: string) {
  return template.replace('{patrolId}', encodeURIComponent(patrolId));
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

/**
 * 保存或者更新示例
 * @param params
 */
export const saveOrUpdateDemo = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  if (isUpdate) {
    return defHttp.put({ url: url, params });
  } else {
    return defHttp.post({ url: url, params });
  }
};
export const saveCheckIn = (params, handleSuccess) => {
  return defHttp.post({ url: Api.checkIn, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
export const saveSubmitAlarm = (params) => {
  return defHttp.post({ url: Api.submitAlarm, params });
};

/**
 * 查询示例详情
 * @param params
 */
export const getDemoById = (params) => {
  return defHttp.get({ url: Api.get, params });
};
export const getStartTask = (params) => {
  return defHttp.get({ url: Api.startTask, params });
};
export const completeTask = (params) => {
  return defHttp.post({ url: Api.complete, params });
};

export const startVideoPatrol = (data: PatrolStartRequest) => {
  return defHttp.post<PatrolStateResponse>({ url: Api.patrolStart, params: data });
};

export const getVideoPatrolState = (patrolId: string) => {
  return defHttp.get<PatrolStateResponse>({ url: patrolUrl(Api.patrolState, patrolId) });
};

export const switchVideoPatrolNext = (patrolId: string) => {
  return defHttp.post<PatrolStateResponse>({ url: patrolUrl(Api.patrolNext, patrolId) });
};

export const stopVideoPatrol = (patrolId: string) => {
  return defHttp.post({ url: patrolUrl(Api.patrolStop, patrolId) });
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
// 告警获取事件名称
export const getEventNames = (params) => {
  return defHttp.get({ url: Api.eventNames, params });
};
// 告警获取事件类型
export const getEventTypes = (params) => {
  return defHttp.get({ url: Api.eventTypes, params });
};
export const getQueryByCode = (params) => {
  return defHttp.get({ url: Api.queryByCode, params });
};
