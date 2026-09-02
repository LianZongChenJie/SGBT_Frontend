import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import { useGlobSetting } from '/@/hooks/setting';

const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const prefix = import.meta.env.VITE_GLOB_API_URL_PREFIX;

export enum Api {
  listShebei = '/operation/energyDeviceInfo/list',

  list = '/operation/operationWhApplication/list',
  delete = '/operation/operationWhApplication/delete',

  save = '/operation/operationWhApplication/add',
  edit = '/operation/operationWhApplication/edit',
  get = '/operation/operationWhApplication/queryById',

  deleteBatch = '/operation/operationWhApplication/deleteBatch',
  exportXls = '/operation/operationWhApplication/exportXls',
  importExcel = '/operation/operationWhApplication/importExcel',
  revoke = '/operation/operationWhApplication/revoke',
  reopen = '/operation/operationWhApplication/reopen',
  history = '/operation/operationWhApplication/history',
  caozuoHistory = '/operation/baseFaultOpRecord/list',
  caozuoHistoryExportXls = '/operation/baseFaultOpRecord/exportXls',
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
export const getImportUrlFujian = `${baseUploadUrl}${prefix}/sys/common/upload`;
/**
 * 查询示例列表
 * @param params
 */
export const getDemoListAll = (params) => {
  return defHttp.get({ url: Api.list, params });
};
export const getCaozuoHistory = (params) => {
  return defHttp.get({ url: Api.caozuoHistory, params });
};
// 备件领用详细table列表
export const getSheetNoDetail = (params) => {
  return defHttp.get({ url: `/operation/operationWhApplication/${params.sheetNo}/detail`, params });
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
