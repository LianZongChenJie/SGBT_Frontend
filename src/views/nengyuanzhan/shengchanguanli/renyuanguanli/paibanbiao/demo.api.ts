import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/planCalendar/byMonth',
  queryByEmployeeId = '/operation/planCalendar/planItem/queryByEmployeeId',
  replace = '/operation/planCalendar/exchange/replace',
  multi = '/operation/planCalendar/exchange/multi',
  single = '/operation/planCalendar/exchange/single',
  doublChange = '/operation/planCalendar/exchange/doublChange',
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

export const getDemoList1 = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const saveReplace = (params: Record<string, unknown>) => {
  return defHttp.post({ url: Api.replace, params });
};

export const saveMulti = (params: Record<string, unknown>) => {
  return defHttp.post({ url: Api.multi, params });
};

export const saveDoublChange = (params: Record<string, unknown>) => {
  return defHttp.post({ url: Api.doublChange, params });
};

export const saveSingle = (params: Record<string, unknown>) => {
  return defHttp.post({ url: Api.single, params });
};

export const getTreeListTihuanbanci = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.queryByEmployeeId, params });
};

export function buildScheduleExchangePayload(activeKey: string, values: Record<string, unknown>) {
  const basePayload = {
    employeeId: toNumberValue(values.employeeId),
    planDate: toDateValue(values.planDate),
  };

  switch (activeKey) {
    case '1':
      return {
        ...basePayload,
        itemId: toNumberValue(values.itemId),
      };
    case '2':
      return {
        ...basePayload,
        newPlanDate: toDateValue(values.newPlanDate),
      };
    case '3':
      return {
        ...basePayload,
        targetDate: toDateValue(values.targetDate),
        targetEmployeeId: toNumberValue(values.targetEmployeeId),
      };
    case '4':
      return {
        ...basePayload,
        targetEmployeeId: toNumberValue(values.targetEmployeeId),
      };
    default:
      return basePayload;
  }
}
