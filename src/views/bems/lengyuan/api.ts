import { defHttp } from '/@/utils/http/axios';
enum Api {
  getDeviceListApi = '/bems/deviceAttribute/listByDeviceCodes',
  controlDeviceApi = '/bems/deviceAttribute/control',
}
export const getDeviceList = (params) => defHttp.get({ url: Api.getDeviceListApi, params });
/**
 * 设备属性控制
 * @param params
 */
export const controlDeviceApi = (params) => defHttp.post({ url: Api.controlDeviceApi, params })