import { Modal } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import { filterObj } from '@/utils/common/compUtils';

export const DEVICE_TYPE_CATEGORY = '1';

export interface DeviceTypeRecord {
  id?: string | number;
  parentId?: string | number;
  parentName?: string;
  deviceTypeName?: string;
  deviceTypeCode?: string;
  deviceTypeCategory?: string;
  remark?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

export interface DeviceTypeQueryParams extends Partial<DeviceTypeRecord> {
  ids?: string;
  keyWord?: string;
  pid?: string | number;
  primaryKey?: string | number;
  pageNo?: number;
  pageSize?: number;
}

enum Api {
  get = '/operation/operationDimDeviceType/queryById',
  list = '/operation/operationDimDeviceType/list',
  queryDepartTreeSync = '/operation/operationDimDeviceType/queryTreeSync',
  searchBy = '/operation/operationDimDeviceType/searchBy',
  save = '/operation/operationDimDeviceType/add',
  edit = '/operation/operationDimDeviceType/edit',
  delete = '/operation/operationDimDeviceType/delete',
  deleteBatch = '/operation/operationDimDeviceType/deleteBatch',
  treeList = '/operation/operationDimDeviceType/ddl',
  exportXls = '/operation/operationDimDeviceType/exportXls',
  importExcel = '/operation/operationDimDeviceType/importExcel',
}

function normalizeId(value?: string | number) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? value : parsedValue;
}

function normalizeText(value?: string) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

export function buildDeviceTypePayload(values: Partial<DeviceTypeRecord> = {}) {
  return filterObj({
    id: normalizeId(values.id),
    parentId: normalizeId(values.parentId),
    deviceTypeCategory: values.deviceTypeCategory || DEVICE_TYPE_CATEGORY,
    deviceTypeName: normalizeText(values.deviceTypeName),
    deviceTypeCode: normalizeText(values.deviceTypeCode),
    remark: normalizeText(values.remark),
  });
}

export const getExportUrl = Api.exportXls;

export const getImportUrl = Api.importExcel;

export const getDemoList = (params?: DeviceTypeQueryParams) => {
  return defHttp.get({ url: Api.list, params });
};

export const saveOrUpdateDemo = (params: Partial<DeviceTypeRecord>, isUpdate: boolean) => {
  if (isUpdate) {
    return defHttp.put({ url: Api.edit, params });
  }

  return defHttp.post({ url: Api.save, params });
};

export const getDemoById = (params: Pick<DeviceTypeRecord, 'id'>) => {
  return defHttp.get({ url: Api.get, params });
};

export const deleteDemo = (params: Pick<DeviceTypeRecord, 'id'>, handleSuccess: Fn) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

export const batchDeleteDemo = (params: Pick<DeviceTypeQueryParams, 'ids'>, handleSuccess: Fn) => {
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

export const searchByKeywords = (params: Pick<DeviceTypeQueryParams, 'keyWord'>) => {
  return defHttp.get({ url: Api.searchBy, params });
};

export const queryDepartTreeSync = (params?: Pick<DeviceTypeQueryParams, 'ids' | 'pid' | 'primaryKey'>) => {
  return defHttp.get({ url: Api.queryDepartTreeSync, params });
};

export const getTreeList = () => {
  return defHttp.get({ url: Api.treeList });
};
