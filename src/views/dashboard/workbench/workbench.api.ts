import { defHttp } from '/@/utils/http/axios';

export type WorkbenchPeriod = 'today' | 'week' | 'month';

export interface WorkbenchStatusItem {
  count?: number;
  percentage?: number;
  statusCode?: number;
  statusName?: string;
}

export interface WorkbenchDeviceStatusResult {
  statuses?: WorkbenchStatusItem[];
  total?: number;
}

export interface WorkbenchTaskResult {
  bizType?: number;
  completionRate?: number;
  deviceStatuses?: WorkbenchStatusItem[];
  deviceTotal?: number;
  endTime?: string;
  period?: WorkbenchPeriod;
  startTime?: string;
  taskStatuses?: WorkbenchStatusItem[];
  taskTotal?: number;
}

export interface WorkbenchRepairResult {
  orderTotal?: number;
  statuses?: WorkbenchStatusItem[];
  todayNewCount?: number;
}

enum Api {
  deviceStatusApi = '/operation/workbench/deviceStatus',
  inspectionTaskApi = '/operation/workbench/inspectionTask',
  maintenanceTaskApi = '/operation/workbench/maintenanceTask',
  todayRepairApi = '/operation/workbench/todayRepair',
}

export const getWorkbenchDeviceStatus = () => defHttp.get<WorkbenchDeviceStatusResult>({ url: Api.deviceStatusApi });

export const getWorkbenchInspectionTask = (period: WorkbenchPeriod) =>
  defHttp.get<WorkbenchTaskResult>({ url: Api.inspectionTaskApi, params: { period } });

export const getWorkbenchMaintenanceTask = (period: WorkbenchPeriod) =>
  defHttp.get<WorkbenchTaskResult>({ url: Api.maintenanceTaskApi, params: { period } });

export const getWorkbenchTodayRepair = () => defHttp.get<WorkbenchRepairResult>({ url: Api.todayRepairApi });
