import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/planDutyEmployee',
  save = '/operation/planDutyEmployee',
  queryDepartTreeSync = '/sys/sysDepart/queryDepartTreeSync',
  searchBy = '/sys/sysDepart/searchBy',
}

export interface DutyEmployeePayload {
  beginDate: string;
  employeeId: number;
  planGroupId: number;
}

function toNumberValue(value: unknown): number | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

function toDateValue(value: unknown): string | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  return String(value);
}

export const getDemoList = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const saveOrUpdateDemo = (params: DutyEmployeePayload) => {
  return defHttp.post({ url: Api.save, params });
};

export const searchByKeywords = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.searchBy, params });
};

export const queryDepartTreeSync = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.queryDepartTreeSync, params });
};

export function buildDutyEmployeePayload(values: Record<string, unknown>): DutyEmployeePayload {
  return {
    beginDate: toDateValue(values.beginDate) || '',
    employeeId: toNumberValue(values.employeeId) || 0,
    planGroupId: toNumberValue(values.planGroupId) || 0,
  };
}
