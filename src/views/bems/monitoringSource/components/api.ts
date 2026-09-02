import { defHttp } from '/@/utils/http/axios';
enum Api {
  getDeviceListApi = '/bems/deviceAttribute/listByDeviceCodes',
  controlDeviceApi = '/bems/deviceAttribute/control',
  getDeviceListByCategoryId = '/bems/device/findByCategoryId',
  getDeviceByCategoryId = '/bems/deviceAttribute/getByDeviceId',
  queryGasData = '/bems/gasAndHydrogen/queryGasData',
  queryHydrogenData = '/bems/gasAndHydrogen/queryHydrogenData',

  queryBemsData = '/bems/gasAndHydrogen/queryBemsData',
  queryBfxtsclData = '/bems/gasAndHydrogen/queryBfxtsclData',
  queryCqhqData = '/bems/gasAndHydrogen/queryCqhqData',
  queryCqqqjyqData = '/bems/gasAndHydrogen/queryCqqqjyqData',
  queryEldbData = '/bems/gasAndHydrogen/queryEldbData',
  queryGfData = '/bems/gasAndHydrogen/queryGfData',
  queryGl1Data = '/bems/gasAndHydrogen/queryGl1Data',
  queryGl2Data = '/bems/gasAndHydrogen/queryGl2Data',
  queryGl3Data = '/bems/gasAndHydrogen/queryGl3Data',
  queryGlfjData = '/bems/gasAndHydrogen/queryGlfjData',
  queryGrxtzjData = '/bems/gasAndHydrogen/queryGrxtzjData',
  queryLdData = '/bems/gasAndHydrogen/queryLdData',
  queryNyzData = '/bems/gasAndHydrogen/queryNyzData',
  queryYsclqData = '/bems/gasAndHydrogen/queryYsclqData',
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
 * 获取燃气数据
 * @param params
 */
export const queryGasData = (params) => defHttp.get({ url: Api.queryGasData, params });
/**
 * 获取氢气数据
 * @param params
 */
export const queryHydrogenData = (params) => defHttp.get({ url: Api.queryHydrogenData, params });
/**
 * 获取Bems数据
 * @param params
 */
export const queryBemsData = (params) => defHttp.get({ url: Api.queryBemsData, params });
/**
 * 获取北方稀土水处理数据
 * @param params
 */
export const queryBfxtsclData = (params) => defHttp.get({ url: Api.queryBfxtsclData, params });
/**
 * 获取掺氢-混气数据
 * @param params
 */
export const queryCqhqData = (params) => defHttp.get({ url: Api.queryCqhqData, params });
/**
 * 获取掺氢氢气减压撬数据
 * @param params
 */
export const queryCqqqjyqData = (params) => defHttp.get({ url: Api.queryCqqqjyqData, params });
/**
 * 获取光伏数据
 * @param params
 */
export const queryGfData = (params) => defHttp.get({ url: Api.queryGfData, params });
/**
 * 获取1#锅炉数据
 * @param params
 */
export const queryGl1Data = (params) => defHttp.get({ url: Api.queryGl1Data, params });
/**
 * 获取2#锅炉数据
 * @param params
 */
export const queryGl2Data = (params) => defHttp.get({ url: Api.queryGl2Data, params });
/**
 * 获取3#锅炉数据
 * @param params
 */
export const queryGl3Data = (params) => defHttp.get({ url: Api.queryGl3Data, params });
/**
 * 获取锅炉辅机数据
 * @param params
 */
export const queryGlfjData = (params) => defHttp.get({ url: Api.queryGlfjData, params });
/**
 * 获取光热系统主机数据
 * @param params
 */
export const queryGrxtzjData = (params) => defHttp.get({ url: Api.queryGrxtzjData, params });
/**
 * 获取零氮数据
 * @param params
 */
export const queryLdData = (params) => defHttp.get({ url: Api.queryHydrogenData, params });
/**
 * 获取能源站数据
 * @param params
 */
export const queryNyzData = (params) => defHttp.get({ url: Api.queryNyzData, params });
/**
 * 获取雨水处理器数据
 * @param params
 */
export const queryYsclqData = (params) => defHttp.get({ url: Api.queryYsclqData, params });
/**
 * 获取二楼电表数据
 * @param params
 */
export const queryEldbData = (params) => defHttp.get({ url: Api.queryEldbData, params });

