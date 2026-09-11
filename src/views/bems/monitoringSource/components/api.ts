import { defHttp } from '/@/utils/http/axios';
enum Api {
  getDeviceListApi = '/bems/deviceAttribute/listByDeviceCodes',
  controlDeviceApi = '/bems/deviceAttribute/control',
  getDeviceListByCategoryId = '/bems/device/findByCategoryId',
  getDeviceByCategoryId = '/bems/deviceAttribute/getByDeviceId',
  // 统一按设备分页查询属性数据（点击标签页时调用）
  queryPage = '/bems/deviceAttribute/queryPage',
  // 历史趋势查询（回风二氧化碳/回风温度等）
  returnAirCo2Trend = '/bems/echarts/returnAirCo2Trend/query',
}
export const getDeviceList = (params) => defHttp.get({ url: Api.getDeviceListApi, params });
/**
 * 设备属性控制
 * @param params
 */
export const controlDeviceApi = (params) => defHttp.post({ url: Api.controlDeviceApi, params });
/**
 * 根据分类ID查询设备列表
 * @param params
 */
export const getDeviceListByCategoryId = (params) => defHttp.get({ url: Api.getDeviceListByCategoryId, params });
/**
 * 根据设备ID查询设备属性
 * @param params
 */
export const getDeviceByCategoryId = (params) => defHttp.get({ url: Api.getDeviceByCategoryId, params });
/**
 * 分页查询设备属性（统一接口，按 deviceId 查询，GET）
 * @param params 需包含 deviceId
 */
export const getDeviceAttributePage = (params) => defHttp.get({ url: Api.queryPage, params });

/**
 * 历史趋势查询（回风二氧化碳/回风温度等）
 * @param params deviceIds / attributeName / granularity，可选 startTime、endTime
 */
export const getReturnAirCo2Trend = (params) => defHttp.get({ url: Api.returnAirCo2Trend, params });

