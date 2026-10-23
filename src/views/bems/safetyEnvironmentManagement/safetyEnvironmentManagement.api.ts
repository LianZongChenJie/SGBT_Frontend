import { defHttp } from '/@/utils/http/axios';

enum Api {
  getDividedIntoSixApi = '/sgai-bems/visualization/ahgl/dividedIntoSix',
  getAlarmsByTypeNumberApi = '/sgai-bems/visualization/ahgl/alarmsByTypeNumber',
}

/**
 * 环境监测2 查询参数
 * @param byDay 是否按天做平均
 * @param startTime 开始日期 yyyy-MM-dd
 * @param endTime 结束日期 yyyy-MM-dd
 */
export interface DividedIntoSixParams {
  byDay: boolean;
  startTime: string;
  endTime: string;
}

/**
 * 环境监测2：按监测项 / 设备返回曲线数据
 */
export const getDividedIntoSixApi = (params: DividedIntoSixParams) =>
  defHttp.get({ url: Api.getDividedIntoSixApi, params });

/**
 * 报警组成：按周期（本周/本月/本年）返回各报警类型数量
 */
export const getAlarmsByTypeNumberApi = () => defHttp.get({ url: Api.getAlarmsByTypeNumberApi });
