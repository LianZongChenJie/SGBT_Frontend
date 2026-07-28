import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/planCalendar/changeHistory',
}

export const getDemoList = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};
