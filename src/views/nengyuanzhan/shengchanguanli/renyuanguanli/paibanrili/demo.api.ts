import { defHttp } from '/@/utils/http/axios';

enum Api {
  planLeaders = '/operation/planCalendar/planLeaders',
  list = '/operation/planCalendar/planEmployees',
  leaderByDay = '/operation/planCalendar/planLeadersByDay',
  saveLeader = '/operation/planCalendar/leader',
  changeLeader = '/operation/planCalendar/leader',
}

export interface PlanLeaderPayload {
  beginDate: string;
  leaderCount: number;
  leaderIds: number[];
}

export interface ChangeLeaderPayload {
  id: number;
  newLeaderId: number;
}

function toNumberValue(value: unknown): number | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

export const getDemoList = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const getPaibanList = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.leaderByDay, params });
};

export const getPlanLeaders = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.planLeaders, params });
};

export const saveOrUpdateDemo = (params: PlanLeaderPayload) => {
  return defHttp.post({ url: Api.saveLeader, params });
};

export const saveOrUpdateDemo1 = (params: ChangeLeaderPayload) => {
  return defHttp.put({ url: Api.changeLeader, params });
};

export function buildPlanLeaderPayload(values: Record<string, unknown>): PlanLeaderPayload {
  return {
    beginDate: String(values.beginDate || ''),
    leaderCount: toNumberValue(values.leaderCount) || 0,
    leaderIds: Array.isArray(values.leaderIds)
      ? values.leaderIds.map((item) => toNumberValue(item)).filter((item): item is number => item != null)
      : [],
  };
}

export function buildChangeLeaderPayload(values: Record<string, unknown>): ChangeLeaderPayload {
  return {
    id: toNumberValue(values.id) || 0,
    newLeaderId: toNumberValue(values.newLeaderId) || 0,
  };
}
