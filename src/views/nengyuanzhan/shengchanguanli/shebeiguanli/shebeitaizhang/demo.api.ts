import { defHttp } from '/@/utils/http/axios';
import { useGlobSetting } from '/@/hooks/setting';
import { Modal } from 'ant-design-vue';

enum Api {
  get = '/operation/energyDeviceInfo/queryById',
  list = '/operation/energyDeviceInfo/list',
  TreeList = '/operation/operationDimDeviceType/ddl',
  searchBy = '/operation/energyDeviceInfo/searchBy',
  save = '/operation/energyDeviceInfo/add',
  edit = '/operation/energyDeviceInfo/edit',
  delete = '/operation/energyDeviceInfo/delete',
  deleteBatch = '/operation/energyDeviceInfo/deleteBatch',
  exportXls = '/operation/energyDeviceInfo/exportXls',
  importExcel = '/operation/energyDeviceInfo/importExcel',
}

const globSetting = useGlobSetting();
const staticFilePrefix = `${globSetting.domainUrl}${import.meta.env.VITE_GLOB_API_URL_PREFIX}/sys/common/static/`;

export interface DeviceLedgerPayload {
  id?: string | number;
  category?: string;
  cadCode?: string;
  cycle?: number;
  deviceModule?: string;
  deviceName?: string;
  devicePic?: string;
  deviceStatus?: number;
  deviceTypeId?: number;
  factory?: string;
  official?: string;
  purchaseDate?: string;
  remark?: string;
  serviceLife?: number;
  spaceId?: number;
  supplier?: string;
  sysOrgCode?: string;
  user?: string;
  warranty?: number;
}

interface IdParams {
  id: string | number;
}

interface BatchDeleteParams {
  ids: string;
}

interface DeviceLedgerQueryParams {
  category?: string;
  deviceName?: string;
  deviceTypeId?: string | number;
  pageNo?: number;
  pageSize?: number;
}

function toTrimmedString(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  return String(value).trim();
}

function toNumberValue(value: unknown): number | undefined {
  if (value === '' || value == null) return undefined;
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

function normalizeUploadPath(value: unknown): string | undefined {
  const filePath = toTrimmedString(value);
  if (!filePath) return undefined;
  if (filePath.startsWith(staticFilePrefix)) {
    return filePath.slice(staticFilePrefix.length);
  }
  return filePath;
}

/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 查询设备台账列表
 * @param params
 */
export const getDemoList = (params?: DeviceLedgerQueryParams & Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 保存或者更新设备台账
 * @param params
 */
export const saveOrUpdateDemo = (params: DeviceLedgerPayload, isUpdate: boolean) => {
  if (isUpdate) {
    return defHttp.put({ url: Api.edit, params });
  }
  return defHttp.post({ url: Api.save, params });
};

/**
 * 查询设备台账详情
 * @param params
 */
export const getDemoById = (params: IdParams) => {
  return defHttp.get({ url: Api.get, params });
};

/**
 * 删除设备台账
 * @param params
 */
export const deleteDemo = (params: IdParams, handleSuccess: () => void) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除设备台账
 * @param params
 */
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

export const searchByKeywords = (params?: Record<string, unknown>) => defHttp.get({ url: Api.searchBy, params });

export const list = (params?: Record<string, unknown>) => defHttp.get({ url: Api.list, params });

export const getTreeList = (params?: Record<string, unknown>) => defHttp.get({ url: Api.TreeList, params });

export function buildDevicePayload(values: Record<string, unknown>): DeviceLedgerPayload {
  const payload: DeviceLedgerPayload = {
    category: toTrimmedString(values.category) || '1',
    cadCode: toTrimmedString(values.cadCode),
    cycle: toNumberValue(values.cycle),
    deviceModule: toTrimmedString(values.deviceModule),
    deviceName: toTrimmedString(values.deviceName),
    devicePic: normalizeUploadPath(values.devicePic),
    deviceStatus: toNumberValue(values.deviceStatus),
    deviceTypeId: toNumberValue(values.deviceTypeId),
    factory: toTrimmedString(values.factory),
    official: toTrimmedString(values.official),
    purchaseDate: toTrimmedString(values.purchaseDate),
    remark: toTrimmedString(values.remark),
    serviceLife: toNumberValue(values.serviceLife),
    spaceId: toNumberValue(values.spaceId),
    supplier: toTrimmedString(values.supplier),
    sysOrgCode: toTrimmedString(values.sysOrgCode),
    user: toTrimmedString(values.user),
    warranty: toNumberValue(values.warranty),
  };

  if (values.id !== '' && values.id != null) {
    payload.id = values.id as string | number;
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as DeviceLedgerPayload;
}
