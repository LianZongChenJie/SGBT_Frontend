import { defHttp } from '/@/utils/http/axios';

enum Api {
  getBoilerEnergyCarbonConversionApi = '/sgai-bems/visualization/tngl/boilerEnergyCarbonConversion',
  getBoilerSteamOutputApi = '/sgai-bems/visualization/tngl/boilerCarbonEmissionsIndex',
  getWaterTreatmentProductionApi = '/sgai-bems/visualization/tngl/waterTreatmentProduction',
  getPhotovoltaicEnergyIndexApi = '/sgai-bems/visualization/tngl/photovoltaicEnergyIndex',
  getPhotovoltaicPowerGenerationApi = '/sgai-bems/visualization/tngl/photovoltaicPowerGeneration',
  getBoilerEnergyConsumptionApi = '/sgai-bems/visualization/tngl/boilerEnergyConsumption',
}

/**
 * 锅炉能碳指标（锅炉能耗转换碳排放量）
 */
export const getBoilerEnergyCarbonConversionApi = () =>
  defHttp.get({ url: Api.getBoilerEnergyCarbonConversionApi });

/**
 * 锅炉能碳指标（蒸汽产量）
 */
export const getBoilerSteamOutputApi = () => defHttp.get({ url: Api.getBoilerSteamOutputApi });

/**
 * 水处理生产指标
 * @param params period：本周''、本月'本月'、本年'YEAR'
 */
export const getWaterTreatmentProductionApi = (params) =>
  defHttp.get({ url: Api.getWaterTreatmentProductionApi, params });

/**
 * 光伏能源
 * @param params period：本周''、本月'本月'、本年'YEAR'
 */
export const getPhotovoltaicEnergyIndexApi = (params) =>
  defHttp.get({ url: Api.getPhotovoltaicEnergyIndexApi, params });

/**
 * 生产数据（光伏发电量）
 * @param params period：本周''、本月'本月'、本年'YEAR'
 */
export const getPhotovoltaicPowerGenerationApi = (params) =>
  defHttp.get({ url: Api.getPhotovoltaicPowerGenerationApi, params });

/**
 * 锅炉的水、汽耗数据
 * @param params period：本周''、本月'本月'、本年'YEAR'
 */
export const getBoilerEnergyConsumptionApi = (params) =>
  defHttp.get({ url: Api.getBoilerEnergyConsumptionApi, params });
