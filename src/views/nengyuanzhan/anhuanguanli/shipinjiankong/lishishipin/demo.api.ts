import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/videoDevice/getUrl',
}

export const getDemoList = (params) => {
  return defHttp.post({ url: Api.list, params });
};
