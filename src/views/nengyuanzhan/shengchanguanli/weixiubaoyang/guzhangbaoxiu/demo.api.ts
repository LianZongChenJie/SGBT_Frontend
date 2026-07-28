import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

export enum Api {
  listShebei = '/operation/energyDeviceInfo/list',

  list = '/operation/baseFaultOrder/list',
  save = '/operation/baseFaultOrder/add',
  edit = '/operation/baseFaultOrder/edit',
  get = '/operation/baseFaultOrder/queryById',
  weixiuxinxiOrGenghuanbeijian = '/operation/baseRepairOrder/queryById',
  delete = '/operation/baseFaultOrder/delete',
  deleteBatch = '/operation/baseFaultOrder/deleteBatch',
  exportXls = '/operation/baseFaultOrder/exportXls',
  importExcel = '/operation/baseFaultOrder/importExcel',
  assignTask = '/operation/baseFaultOrder/assignTask',
  auditPass = '/operation/baseFaultOrder/auditPass',
  auditReject = '/operation/baseFaultOrder/auditReject',
  revoke = '/operation/baseFaultOrder/revoke',
  reopen = '/operation/baseFaultOrder/reopen',
  history = '/operation/baseFaultAuditLog/history',
  caozuoHistory = '/operation/baseFaultOpRecord/list',
  caozuoHistoryExportXls = '/operation/baseFaultOpRecord/exportXls',

  xunjianmingxiList = '/operation/inspectionPlanDetail/list',


  xunjianjihuafujianList = '/operation/inspectionPlanAttachment/list',


  deleteBatchXunjianjihuafujian = '/operation/inspectionPlanAttachment/deleteBatch',
  importExcelFujian = '/operation/inspectionPlanAttachment/importExcel',
}

/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
export const getCaozuoHistoryExportXls = Api.caozuoHistoryExportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
export const getImportUrlFujian = Api.importExcelFujian;
/**
 * 查询示例列表
 * @param params
 */
export const getDemoListAll = (params) => {
  return defHttp.get({ url: Api.list, params });
};
export const getHistoryShenhejilu = (params) => {
  return defHttp.get({ url: Api.history, params });
};
export const getCaozuoHistory = (params) => {
  return defHttp.get({ url: Api.caozuoHistory, params });
};
/*查询巡检明细*/
export const getXunjianmingxiList = (params) => {
  return defHttp.get({ url: Api.xunjianmingxiList, params });
};
/*查询巡检计划附件*/
export const getXunjianjihuafujianList = (params) => {
  return defHttp.get({ url: Api.xunjianjihuafujianList, params });
};

/*巡检项目预览*/
export const getDemoListSheBei = (params) => {
  return defHttp.get({ url: Api.listShebei, params });
};
export const getDemoList = (params) => {
  return defHttp.get({ url: Api.listShebei, params });
};
export const getWeixiuxinxiOrGenghuanbeijian = (params) => {
  return defHttp.get({ url: Api.weixiuxinxiOrGenghuanbeijian, params });
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

export const saveAssignTask = (params) => {
    return defHttp.post({ url: Api.assignTask, params });
};
export const saveAuditPass = (params) => {
    return defHttp.post({ url: Api.auditPass, params });
};
export const saveAuditReject = (params) => {
    return defHttp.post({ url: Api.auditReject, params });
};
export const saveRevoke = (params,handleSuccess) => {
    return defHttp.post({ url: Api.revoke, params },{ joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
export const saveReopen = (params,handleSuccess) => {
    return defHttp.post({ url: Api.reopen, params },{ joinParamsToUrl: true }).then(() => {
      handleSuccess();
    });
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
export const batchDeleteDemoXunjianjihuafujian = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp
        .delete(
          {
            url: Api.deleteBatchXunjianjihuafujian,
            data: params,
          },
          { joinParamsToUrl: true }
        )
        .then(() => {
          handleSuccess();
        });
    },
  });
};
