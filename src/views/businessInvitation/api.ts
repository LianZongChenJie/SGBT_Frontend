import { defHttp } from '/@/utils/http/axios';
enum Api {
  getTokenApi = '/third/login/investmentPromotionSystem',
}

/**
 * 获取告警等级数据
 */
export const getToken = () => defHttp.post({ url: Api.getTokenApi });
