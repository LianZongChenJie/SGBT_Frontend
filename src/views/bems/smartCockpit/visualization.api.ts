import { defHttp } from '/@/utils/http/axios';

enum Api {
  getEnergySupplyOverviewApi = '/sgai-bems/visualization/zhjsc/energySupplyOverview',
  getCarbonFootprintApi = '/sgai-bems/visualization/zhjsc/carbonFootprint',
  getEnvironmentalMonitoringApi = '/sgai-bems/visualization/zhjsc/environmentalMonitoring',
  getProductionOverviewApi = '/sgai-bems/visualization/zhjsc/productionOverview',
  getAlarmListApi = '/sgai-bems/visualization/zhjsc/alarmList',
  getDailyProductionDataApi = '/sgai-bems/visualization/zhjsc/dailyProductionData',
  getKeyEquipmentStatusApi = '/sgai-bems/visualization/zhjsc/operationStatusKeyEquipment',
}

/**
 * 供能概况
 */
export const getEnergySupplyOverviewApi = () => defHttp.get({ url: Api.getEnergySupplyOverviewApi });

/**
 * 碳足迹
 */
export const getCarbonFootprintApi = () => defHttp.get({ url: Api.getCarbonFootprintApi });

/**
 * 环境监测
 * @param params period：本周''、本月'本月'、本年'YEAR'
 */
export const getEnvironmentalMonitoringApi = (params) => defHttp.get({ url: Api.getEnvironmentalMonitoringApi, params });

/**
 * 生产概况
 * @param params period：本周''、本月'本月'、本年'YEAR'
 */
export const getProductionOverviewApi = (params) => defHttp.get({ url: Api.getProductionOverviewApi, params });

/**
 * 报警列表
 */
export const getAlarmListApi = () => defHttp.get({ url: Api.getAlarmListApi });

/**
 * 生产数据
 */
export const getDailyProductionDataApi = () => defHttp.get({ url: Api.getDailyProductionDataApi });

/**
 * 重点设备运行状况
 */
export const getKeyEquipmentStatusApi = () => defHttp.get({ url: Api.getKeyEquipmentStatusApi });
