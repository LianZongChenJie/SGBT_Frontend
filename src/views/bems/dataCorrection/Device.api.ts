import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  // categoryTree = '/bems/equipmentCategory/measuring/getTree',
  categoryTree = '/bems/equipmentCategory/measuring/getPermissionTree',
  // spaceTree = '/bems/space/getTree',
  spaceTree = '/bems/space/getPermissionTree',
  selectDevice = '/bems/deviceData/hour/listPage',
  editDataValue = '/bems/deviceData/hourDataAmend',
  recalculateApi = '/bems/meterPointData/calculateValue',

  dataAmendLogApi = '/bems/dataAmendLog/listPage'
}

/**
 * 静态数据列表
 */
export const staticDataList = (params) => {};
/**
 * 静态数据保存
 */
export const staticDataSave = (params) => {};

/**
 * 采集数据列表
 */
export const attributeDataList = (params) => {};

/**
 * 分类树
 * @param params
 */
export const categoryTree = (params) => defHttp.get({ url: Api.categoryTree, params });

/**
 * 空间树
 */
export const spaceTree = () => defHttp.get({ url: Api.spaceTree });

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {};
/**
 * 删除设备
 */
export const deleteDevice = (params, handleSuccess) => {};

/**
 * 查询设备
 */
export const selectDevice = (params) => defHttp.get({ url: Api.selectDevice, params });

/**
 * 切换自动算法
 */
export const updateAutomaticAlgorithm = (params) => {};

/**
 * 修改最终值
 */
export const editDataValue = (params) => defHttp.post({ url: Api.editDataValue, params });

/**
 * 重新计算
 */
export const recalculateApi = (params) => defHttp.post({ url: Api.recalculateApi, params });

/**
 * 日志
 */
export const dataAmendLogApi = (params) => defHttp.get({ url: Api.dataAmendLogApi, params }, { joinParamsToUrl: true });

/**
 * 空间数结构
 */
export const getSpaceTree = () => defHttp.get({ url: Api.spaceTree });