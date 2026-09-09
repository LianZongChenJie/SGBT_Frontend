import { defHttp } from '/@/utils/http/axios';

enum Api {
  monitorSourceTree = '/bems/monitorSource/tree',
}

/**
 * 获取监测源树结构（用于渲染页签）
 */
export const getMonitorSourceTree = (params?) => defHttp.get({ url: Api.monitorSourceTree, params });
