import { Modal } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import { filterObj } from '@/utils/common/compUtils';

export const TOOL_TYPE_CATEGORY = '3';

export interface ToolTypeRecord {
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

export interface ToolTypeQueryParams extends Partial<ToolTypeRecord> {
  ids?: string;
  keyWord?: string;
  pid?: string | number;
  primaryKey?: string | number;
  pageNo?: number;
  pageSize?: number;
}

enum Api {
  get = '/operation/toolsType/queryById',
  list = '/operation/toolsType/list',
  queryDepartTreeSync = '/operation/toolsType/queryTreeSync',
  searchBy = '/operation/toolsType/searchBy',
  save = '/operation/toolsType/add',
  edit = '/operation/toolsType/edit',
  delete = '/operation/toolsType/delete',
  deleteBatch = '/operation/toolsType/deleteBatch',
  treeList = '/operation/toolsType/ddl',
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

export function buildToolTypePayload(values: Partial<ToolTypeRecord> = {}) {
  return filterObj({
    id: normalizeId(values.id),
    parentId: normalizeId(values.parentId),
    deviceTypeCategory: values.deviceTypeCategory || TOOL_TYPE_CATEGORY,
    deviceTypeName: normalizeText(values.deviceTypeName),
    deviceTypeCode: normalizeText(values.deviceTypeCode),
    remark: normalizeText(values.remark),
  });
}

export const getDemoList = (params?: ToolTypeQueryParams) => {
  return defHttp.get({ url: Api.list, params });
};

export const saveOrUpdateDemo = (params: Partial<ToolTypeRecord>, isUpdate: boolean) => {
  if (isUpdate) {
    return defHttp.put({ url: Api.edit, params });
  }

  return defHttp.post({ url: Api.save, params });
};

export const getDemoById = (params: Pick<ToolTypeRecord, 'id'>) => {
  return defHttp.get({ url: Api.get, params });
};

export const deleteDemo = (params: Pick<ToolTypeRecord, 'id'>, handleSuccess: Fn) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

export const batchDeleteDemo = (params: Pick<ToolTypeQueryParams, 'ids'>, handleSuccess: Fn) => {
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

export const searchByKeywords = (params: Pick<ToolTypeQueryParams, 'keyWord'>) => {
  return defHttp.get({ url: Api.searchBy, params });
};

export const queryDepartTreeSync = (params?: Pick<ToolTypeQueryParams, 'ids' | 'pid' | 'primaryKey'>) => {
  return defHttp.get({ url: Api.queryDepartTreeSync, params });
};

export const getTreeListGongju = () => {
  return defHttp.get({ url: Api.treeList });
};
