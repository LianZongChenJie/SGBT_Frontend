import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import { useGlobSetting } from '/@/hooks/setting';

const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const prefix = import.meta.env.VITE_GLOB_API_URL_PREFIX;
export enum Api {
  listShebei = '/operation/energyDeviceInfo/list',
  editTiaozheng = '/operation/inspectionPlan/adjust',
  list = '/operation/baseRepairOrder/list',
  save = '/operation/baseRepairOrder/add',
  edit = '/operation/baseRepairOrder/edit',
  get = '/operation/baseRepairOrder/queryById',
  delete = '/operation/baseRepairOrder/delete',
  deleteBatch = '/operation/baseRepairOrder/deleteBatch',
  exportXls = '/operation/baseRepairOrder/exportXls',
  importExcel = '/operation/baseRepairOrder/importExcel',
  acceptOrder = '/operation/baseRepairOrder/acceptOrder',
  execute = '/operation/baseRepairOrder/execute',
  getBanzu = '/operation/energyPlanGroup/queryById',
  accept = '/operation/baseRepairOrder/accept',
  assign = '/operation/baseRepairOrder/assign',
  queryProgress = '/operation/baseFaultOrder/queryProgress',
  workloadList = '/operation/baseRepairWorkload/list',

  // 备件明细
  beijianmingxiList = '/operation/baseRepairSpareDetail/list',

  /*附件接口*/
  gongdanfujianList = '/operation/baseRepairAttachment/list',

  // 巡检-点检项目（根据ids批量）-列表查询
  listYulan = '/operation/inspectionItem/itemList',

  kaiqiChexiao = '/operation/inspectionPlan/cancel',
  shenhe = '/operation/inspectionPlan/audit',
}

/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
// 导入附件
export const getImportUrlFujian = `${baseUploadUrl}${prefix}/sys/common/upload`;

export const saveKaiqiChexiao = (params, handleSuccess) => {
  return defHttp.post({ url: Api.kaiqiChexiao, params }).then(() => {
    handleSuccess();
  });
};
export const saveShenhe = (params, handleSuccess) => {
  return defHttp.post({ url: Api.shenhe, params }).then(() => {
    handleSuccess();
  });
};

/**
 * 查询示例列表
 * @param params
 */
export const getDemoListAll = (params) => {
  return defHttp.get({ url: Api.list, params });
};
export const getBanzufuzeren = (params) => {
  return defHttp.get({ url: Api.getBanzu, params });
};
export const saveAccept = (params) => {
  return defHttp.post({ url: Api.accept, params });
};
export const saveAssign = (params) => {
  return defHttp.post({ url: Api.assign, params });
};

/*查询备件明细*/
export const getBeijianmingxiList = (params) => {
  return defHttp.get({ url: Api.beijianmingxiList, params });
};
export const getQueryProgress = (params) => {
  return defHttp.get({ url: Api.queryProgress, params });
};
export const getRepairWorkloadList = (params) => {
  return defHttp.get({ url: Api.workloadList, params });
};
/*附件*/
export const getGongdanfujianList = (params) => {
  return defHttp.get({ url: Api.gongdanfujianList, params });
};
/*巡检项目预览*/
export const getDemoListYulan = (params) => {
  return defHttp.get({ url: Api.listYulan, params });
};

/*巡检项目预览*/
export const getDemoListSheBei = (params) => {
  return defHttp.get({ url: Api.listShebei, params });
};
export const getDemoList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 保存或者更新示例
 * @param params
 */
export const saveOrUpdateDemo = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  if (isUpdate) {
    return defHttp.put({ url: url, params });
  } else {
    return defHttp.post({ url: url, params });
  }
};
// 接单
export const saveAcceptOrder = (params, handleSuccess) => {
  return defHttp.put({ url: Api.acceptOrder, params }).then(() => {
    handleSuccess();
  });
};
//执行维修工单提交
export const saveExecute = (params) => {
  return defHttp.post({ url: Api.execute, params });
};
export const saveOrUpdateDemoTiaozheng = (params, isUpdate) => {
  if (isUpdate) {
    return defHttp.post({ url: Api.editTiaozheng, params });
  }
};

/**
 * 查询示例详情
 * @param params
 */
export const getDemoById = (params) => {
  return defHttp.get({ url: Api.get, params });
};

/**
 * 删除示例
 * @param params
 */
export const deleteDemo = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除示例
 * @param params
 */
export const batchDeleteDemo = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
        handleSuccess();
      });
    },
  });
};
