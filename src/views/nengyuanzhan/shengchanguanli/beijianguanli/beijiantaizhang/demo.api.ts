import { Modal } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import { useGlobSetting } from '/@/hooks/setting';

export const SPARE_PARTS_CATEGORY = '2';

enum Api {
  get = '/operation/spareParts/queryById',
  list = '/operation/spareParts/list',
  treeList = '/operation/operationDimDeviceType/ddl',
  save = '/operation/spareParts/add',
  edit = '/operation/spareParts/edit',
  delete = '/operation/spareParts/delete',
  deleteBatch = '/operation/spareParts/deleteBatch',
}

const globSetting = useGlobSetting();
const staticFilePrefix = `${globSetting.domainUrl}${import.meta.env.VITE_GLOB_API_URL_PREFIX}/sys/common/static/`;

export interface SparePartsPayload {
  id?: string | number;
  category?: string;
  deviceCode?: string;
  deviceModule?: string;
  deviceName?: string;
  devicePic?: string;
  deviceTypeId?: number;
  factory?: string;
  remark?: string;
  supplier?: string;
  unit?: string;
}

interface IdParams {
  id: string | number;
}

interface BatchDeleteParams {
  ids: string;
}

interface SparePartsQueryParams {
  category?: string;
  deviceName?: string;
  deviceTypeId?: string | number;
  pageNo?: number;
  pageSize?: number;
}

function toTrimmedString(value: unknown): string | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue || undefined;
}

function toNumberValue(value: unknown): number | undefined {
  if (value === '' || value == null) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

function normalizeUploadPath(value: unknown): string | undefined {
  const filePath = toTrimmedString(value);
  if (!filePath) {
    return undefined;
  }

  if (filePath.startsWith(staticFilePrefix)) {
    return filePath.slice(staticFilePrefix.length);
  }

  return filePath;
}

export const getDemoList = (params?: SparePartsQueryParams & Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const saveOrUpdateDemo = (params: SparePartsPayload, isUpdate: boolean) => {
  if (isUpdate) {
    return defHttp.put({ url: Api.edit, params });
  }

  return defHttp.post({ url: Api.save, params });
};

export const getDemoById = (params: IdParams) => {
  return defHttp.get({ url: Api.get, params });
};

export const deleteDemo = (params: IdParams, handleSuccess: () => void) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

export const batchDeleteDemo = (params: BatchDeleteParams, handleSuccess: () => void) => {
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

export const getTreeList = () => {
  return defHttp.get({ url: Api.treeList });
};

export function buildSparePartsPayload(values: Record<string, unknown>): SparePartsPayload {
  const payload: SparePartsPayload = {
    category: toTrimmedString(values.category) || SPARE_PARTS_CATEGORY,
    deviceCode: toTrimmedString(values.deviceCode),
    deviceModule: toTrimmedString(values.deviceModule),
    deviceName: toTrimmedString(values.deviceName),
    devicePic: normalizeUploadPath(values.devicePic),
    deviceTypeId: toNumberValue(values.deviceTypeId),
    factory: toTrimmedString(values.factory),
    remark: toTrimmedString(values.remark),
    supplier: toTrimmedString(values.supplier),
    unit: toTrimmedString(values.unit),
  };

  if (values.id !== '' && values.id != null) {
    payload.id = values.id as string | number;
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as SparePartsPayload;
}
