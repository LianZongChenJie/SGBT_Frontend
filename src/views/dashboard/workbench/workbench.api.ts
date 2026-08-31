import { defHttp } from '/@/utils/http/axios';
enum Api {
  pointDataForToDayApi = '/bems/dataQueue/getPointDataForToDay',
  deviceRunStateStatisticsApi = '/bems/device/deviceRunStateStatistics',
  getTokenApi = '/third/login/investmentPromotionSystem',
}
/**
 * 获取项目名称等信息
 * @param params
 */
export const getPointDataForToDay = () => defHttp.get({ url: Api.pointDataForToDayApi, params: { configPath: 'workbench:energy:electricity' } });
/**
 * 获取项目名称等信息
 * @param params
 */
export const getDeviceRunStateStatistics = () => defHttp.get({ url: Api.deviceRunStateStatisticsApi });
export const getToken = () => defHttp.post({ url: Api.getTokenApi });
