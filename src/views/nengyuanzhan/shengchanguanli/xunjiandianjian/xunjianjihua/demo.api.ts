import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import { useGlobSetting } from '/@/hooks/setting';

const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const prefix = import.meta.env.VITE_GLOB_API_URL_PREFIX;
export enum Api {
  listShebei = '/operation/energyDeviceInfo/list',

  list = '/operation/inspectionPlan/list',
  save = '/operation/inspectionPlan/add',
  edit = '/operation/inspectionPlan/edit',
  editTiaozheng = '/operation/inspectionPlan/adjust',
  get = '/operation/inspectionPlan/queryById',
  delete = '/operation/inspectionPlan/delete',
  deleteBatch = '/operation/inspectionPlan/deleteBatch',
  exportXls = '/operation/inspectionPlan/exportXls',
  importExcel = '/operation/inspectionPlan/importExcel',

  xunjianmingxiList = '/operation/inspectionPlanDetail/list',
  saveingxi = '/operation/inspectionPlanDetail/add',
  editingxi = '/operation/inspectionPlanDetail/edit',
  getingxi = '/operation/inspectionPlanDetail/queryById',
  deleteMingxi = '/operation/inspectionPlanDetail/delete',
  deleteBatchingxi = '/operation/inspectionPlanDetail/deleteBatch',
  exportXlsingxi = '/operation/inspectionPlanDetail/exportTemplate',
  importExcelingxi = '/operation/inspectionPlanDetail/importExcel',

  xunjianjihuafujianList = '/operation/inspectionPlanAttachment/list',
  saveXunjianjihuafujian = '/operation/inspectionPlanAttachment/add',
  editXunjianjihuafujian = '/operation/inspectionPlanAttachment/edit',
  getXunjianjihuafujian = '/operation/inspectionPlanAttachment/queryById',
  deleteXunjianjihuafujian = '/operation/inspectionPlanAttachment/delete',
  deleteBatchXunjianjihuafujian = '/operation/inspectionPlanAttachment/deleteBatch',
  exportXlsFujian = `/operation/inspectionPlanAttachment/download/url/batch`,
  exportXlsFujianOne = `/operation/inspectionPlanAttachment/download/url/single`,
  // exportXlsFujian = `operation/inspectionPlanAttachment/download/url/batch`,
  fileInfo = '/operation/remote/getFileInfo',

  //   执行周期规则
  listGuize = '/operation/scheduleRule/list',
  saveGuize = '/operation/scheduleRule/add',
  editGuize = '/operation/scheduleRule/edit',

  getGuize = '/operation/scheduleRule/queryById',
  deleteGuize = '/operation/scheduleRule/delete',
  deleteBatchGuize = '/operation/scheduleRule/deleteBatch',
  exportXlsGuize = '/operation/scheduleRule/exportTemplate',
  importExcelGuize = '/operation/scheduleRule/importExcel',

  // 巡检-点检项目（根据ids批量）-列表查询
  listYulan = '/operation/inspectionItem/itemList',

  kaiqiChexiao = '/operation/inspectionPlan/cancel',
  shenhe = '/operation/inspectionPlan/audit',
}

/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
export const getExportUrlFujianOne = Api.exportXlsFujianOne;
export const getExportUrlFujian = Api.exportXlsFujian;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
// 导入附件
export const getImportUrlFujian = `${baseUploadUrl}${prefix}/sys/common/upload`;

export const saveKaiqiChexiao = (params, handleSuccess?) => {
  return defHttp.post({ url: Api.kaiqiChexiao, params }).then(() => {
    if (typeof handleSuccess === 'function') {
      handleSuccess();
    }
  });
};
export const saveShenhe = (params, handleSuccess?) => {
  return defHttp.post({ url: Api.shenhe, params }).then(() => {
    if (typeof handleSuccess === 'function') {
      handleSuccess();
    }
  });
};

/**
 * 查询示例列表
 * @param params
 */
export const getDemoList = (params) => {
  return defHttp.get({ url: Api.list, params });
};
export const getFileInfo = (params) => {
  return defHttp.get({ url: Api.fileInfo, params });
};

/*巡检项目预览*/
export const getDemoListYulan = (params) => {
  return defHttp.get({ url: Api.listYulan, params });
};

export const getDemoListGuize = (params) => {
  return defHttp.get({ url: Api.listGuize, params });
};
/*巡检项目预览*/
export const getDemoListSheBei = (params) => {
  return defHttp.get({ url: Api.listShebei, params });
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
export const saveOrUpdateDemoGuize = (params, isUpdate) => {
  let url = isUpdate ? Api.editGuize : Api.saveGuize;
  if (isUpdate) {
    return defHttp.put({ url: url, params });
  } else {
    return defHttp.post({ url: url, params });
  }
};
export const saveOrUpdateDemoTiaozheng = (params, isUpdate) => {
  if (isUpdate) {
    return defHttp.post({ url: Api.editTiaozheng, params });
  }
};
export const saveOrUpdateDemoXunjianjihuafujian = (params, isUpdate) => {
  let url = isUpdate ? Api.editXunjianjihuafujian : Api.saveXunjianjihuafujian;
  if (isUpdate) {
    return defHttp.put({ url: url, params });
  } else {
    return defHttp.post({ url: url, params });
  }
};

/**
 * 查询示例详情
 * @param params
 */
export const getDemoById = (params) => {
  return defHttp.get({ url: Api.get, params });
};
export const getDemoByIdGuize = (params) => {
  return defHttp.get({ url: Api.getGuize, params });
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
export const deleteDemoGuize = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteGuize, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
export const deleteDemoMingxi = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteMingxi, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
export const deleteDemoXunjianjihuafujian = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteXunjianjihuafujian, data: params }, { joinParamsToUrl: true }).then(() => {
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
export const batchDeleteDemoGuize = (params, handleSuccess) => {
  Modal.confirm({
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp.delete({ url: Api.deleteBatchGuize, data: params }, { joinParamsToUrl: true }).then(() => {
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
