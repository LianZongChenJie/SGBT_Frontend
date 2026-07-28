import { defHttp } from '/@/utils/http/axios';
enum Api {
  getDeviceListApi = '/bems/deviceAttribute/listByDeviceCodes',
  controlDeviceApi = '/bems/deviceAttribute/control',
  getDeviceListByCategoryId = '/bems/device/findByCategoryId',
  getDeviceByCategoryId = '/bems/deviceAttribute/getByDeviceId',
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