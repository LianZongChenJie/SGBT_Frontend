import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/dimAlarmAudio/list',
  edit = '/operation/dimAlarmAudio/edit',
  upload = '/sys/common/upload',
}

export const getUpLoad = Api.upload;

export const list = (params?: Record<string, unknown>) => defHttp.get({ url: Api.list, params });

export const saveOrUpdate = (params: Record<string, unknown>) => {
  return defHttp.put({ url: Api.edit, params });
};
