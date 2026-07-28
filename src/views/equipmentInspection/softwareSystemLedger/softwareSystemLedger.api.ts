import { defHttp } from '/@/utils/http/axios';

// API枚举
enum Api {
  list = '/modelInspection/inspectionSoftwareSystem/list',
  save = '/modelInspection/inspectionSoftwareSystem/add',
  edit = '/modelInspection/inspectionSoftwareSystem/edit',
  delete = '/modelInspection/inspectionSoftwareSystem/delete',
  export = '/modelInspection/inspectionSoftwareSystem/export',
}

// 获取软件系统台账列表
export const getSoftwareSystemLedgerList = (params) => defHttp.get({ url: Api.list, params });

// 保存软件系统台账
export const saveSoftwareSystemLedger = (params, type) => defHttp.post({ url: type === 'add' ? Api.save : Api.edit, params });

// 删除软件系统台账
export const deleteSoftwareSystemLedger = (params, handleSuccess) => defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(handleSuccess);

// 导出台账
export const exportSoftwareSystemLedger = (params) => defHttp.get({ url: Api.export, params }, { isReturnNativeResponse: true });
