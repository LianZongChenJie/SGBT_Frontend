import { defHttp } from '/@/utils/http/axios';

enum Api {
  monitorSourceTree = '/bems/monitorSource/tree',
  // 监测源顶部统计（设备数量、设备类别数量、采集点位数、好的数据数）
  deviceStatistics = '/bems/deviceStatistics/statistics',
}

/**
 * 获取监测源树结构（用于渲染页签）
 */
export const getMonitorSourceTree = (params?) => defHttp.get({ url: Api.monitorSourceTree, params });

/**
 * 获取监测源统计数据
 * 返回字段：deviceCount(设备数量)、categorycount(设备类别数量)、
 * attributeCount(采集点位数)、goodQualityCount(好的数据数)
 */
export const getDeviceStatistics = (params?) => defHttp.get({ url: Api.deviceStatistics, params });
