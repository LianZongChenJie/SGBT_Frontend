import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  //考勤规则
  query = '/eoa/sign/rule/query',
  syncHoliday = '/eoa/sign/rule/syncHoliday',
  saveOrUpdateRule = '/eoa/sign/rule/saveOrUpdate',
  //打卡
  listInfo = '/eoa/sign/info/list',
  saveInfo = '/eoa/sign/info/add',
  editInfo = '/eoa/sign/info/edit',
  deleteBatchInfo = '/eoa/sign/info/deleteBatch',
  exportXlsInfo = '/eoa/sign/info/exportXls',
  statusAndRule = '/eoa/sign/info/statusAndRule',
  signNow = '/eoa/sign/info/signNow',
  //图表统计
  statisticsByMonth = '/eoa/sign/statistics/statisticsByMonth',
  //补卡
  patchList = '/eoa/sign/patch/list',
  deletePatchOne = '/eoa/sign/patch/delete',
  batchPatchDelete = '/eoa/sign/patch/deleteBatch',
  exportXlsPatchInfo = '/eoa/sign/patch/exportXls',
  getMissingSignInfo = '/eoa/sign/patch/getMissingSignInfo',
  getAbnormalSignInfoAndRule = '/eoa/sign/patch/getAbnormalSignInfoAndRule',
  addPatch = '/eoa/sign/patch/addPatch',
  addMissingPatch = '/eoa/sign/patch/addMissingPatch',
  queryPatchById = '/eoa/sign/patch/queryById',
  //外勤
  outList = '/eoa/sign/out/list',
  deleteOut = '/eoa/sign/out/delete',
  deleteOutBatch = '/eoa/sign/out/deleteBatch',
  exportOutXlsUrl = 'eoa/sign/out/exportXls',
  outAdd = '/eoa/sign/out/add',
  outEdit = '/eoa/sign/out/edit',
  queryOutById = '/eoa/sign/out/queryById',
  //考勤统计
  statisticsByMonthAll = '/eoa/sign/statistics/statisticsByMonthAll',
  statisticsExportXlsUrl = '/eoa/sign/statistics/exportXls',
}

/**
 * 打卡导出api
 * @param params
 */
export const getExportUrl = Api.exportXlsInfo;

/**
 * 导出补卡api
 */
export const getPatchExportUrl = Api.exportXlsPatchInfo;

/**
 * 导出外勤api
 */
export const getOutExportUrl = Api.exportOutXlsUrl;

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params) => {
  return defHttp.post({ url: Api.saveOrUpdateRule, params });
};

/**
 * 获取假期时间
 */
export const getSyncHoliday = (params) => {
  return defHttp.get({ url: Api.syncHoliday, params }, { isTransformResponse: false });
};

/**
 * 查询考勤规则
 */
export const queryRules = () => {
  return defHttp.get({ url: Api.query }, { isTransformResponse: false });
};

/**
 * 打卡列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.listInfo, params });

/**
 * 打卡批量删除
 * @param params
 * @param handleSuccess
 */
export const batchDelete = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatchInfo, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

/**
 * 打卡保存或者更新
 * @param params
 * @param isUpdate
 */
export const saveOrUpdateInfo = (params, isUpdate) => {
  let url = isUpdate ? Api.editInfo : Api.saveInfo;
  return defHttp.post({ url: url, params });
};

/**
 * 查询补卡状态
 */
export const statusAndRule = () => {
  return defHttp.get({ url: Api.statusAndRule }, { isTransformResponse: false });
};

/**
 * 立即打卡
 */
export const signNow = () => {
  return defHttp.post({ url: Api.signNow }, { isTransformResponse: false });
};

/**
 * 图表统计
 * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
 * @param params
 */
export const statisticsByMonth = (params) => {
  return defHttp.get({ url: Api.statisticsByMonth, params }, { isTransformResponse: false });
};

/**
 * 补卡列表
 * @param params
 */
export const patchList = (params) => {
  return defHttp.get({ url: Api.patchList, params });
};

/**
 * 补卡删除单个
 * @param params
 * @param handleSuccess
 */
export const deletePatchOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deletePatchOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除补卡
 * @param params
 * @param handleSuccess
 */
export const batchPatchDelete = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.batchPatchDelete, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

/**
 * 查询补缺卡信息
 * @param params
 */
export const getMissingSignInfo = (params) => {
  return defHttp.get({ url: Api.getMissingSignInfo, params }, { isTransformResponse: false });
};

/**
 * 查询补缺卡信息
 */
export const getSignInfoAndRule = () => {
  return defHttp.get({ url: Api.getAbnormalSignInfoAndRule }, { isTransformResponse: false });
};

/**
 * 添加补卡和补缺卡的信息
 * @param params
 * @param type 1 异常卡 2补缺卡
 */
export const addPatchOrMissingPatch = (params, type) => {
  const url = type == 1 ? Api.addPatch : Api.addMissingPatch;
  return defHttp.post({ url: url, params }, { isTransformResponse: false });
};
/**
 * 根据id查询补卡信息
 */
export const queryPatchById = (params) => {
  return defHttp.get({ url: Api.queryPatchById, params }, { isTransformResponse: false });
};

/**
 * 外勤列表
 * @param params
 */
export const outList = (params) => {
  return defHttp.get({ url: Api.outList, params });
};

/**
 * 外勤列表删除
 * @param params
 * @param handleSuccess
 */
export const deleteOutOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteOut, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 外勤列表批量删除
 * @param params
 * @param handleSuccess
 */
export const batchOutDelete = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteOutBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};

/**
 * 外勤统计列表
 * @param params
 */
export const statisticsByMonthAll = (params) => {
  if (params.monthValue) {
    return defHttp.get({ url: Api.statisticsByMonthAll, params });
  } else {
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  }
};

/**
 * 外勤保存或者更新
 * @param params
 * @param isUpdate
 */
export const outSaveOrUpdateInfo = (params, isUpdate) => {
  const url = isUpdate ? Api.outEdit : Api.outAdd;
  return defHttp.post({ url: url, params });
};
/**
 * 根据id查询外勤信息
 */
export const queryOutById = (params) => {
  return defHttp.get({ url: Api.queryOutById, params }, { isTransformResponse: false });
};
/**
 * 考勤统计列表
 * @param params
 */
export const getStatisticsExportXls = (params) => {
  return defHttp.get({ url: Api.statisticsExportXlsUrl, params, responseType: 'blob' }, { isTransformResponse: false });
};
