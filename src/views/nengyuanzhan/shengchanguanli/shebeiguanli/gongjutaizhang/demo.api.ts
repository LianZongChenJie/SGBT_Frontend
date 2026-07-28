import { Modal } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import { useGlobSetting } from '/@/hooks/setting';

export const TOOL_LEDGER_CATEGORY = '3';

enum Api {
  get = '/operation/tools/queryById',
  list = '/operation/tools/list',
  treeList = '/operation/toolsType/ddl',
  save = '/operation/tools/add',
  edit = '/operation/tools/edit',
  delete = '/operation/tools/delete',
  deleteBatch = '/operation/tools/deleteBatch',
}

const globSetting = useGlobSetting();
const staticFilePrefix = `${globSetting.domainUrl}${import.meta.env.VITE_GLOB_API_URL_PREFIX}/sys/common/static/`;

export interface ToolLedgerPayload {
  id?: string | number;
  category?: string;
  deviceCode?: string;
  cadCode?: string;
  cycle?: number;
  deviceModule?: string;
  deviceName?: string;
  devicePic?: string;
  deviceStatus?: number;
  deviceTypeId?: number;
  factory?: string;
  invQty?: number;
  la?: string;
  lo?: string;
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

interface ToolLedgerQueryParams {
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

  if (Array.isArray(value)) {
    const joinedValue = value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .join(',');
    return joinedValue || undefined;
  }

  if (typeof value === 'object') {
    const item = value as Record<string, unknown>;
    const candidate = item.value ?? item.id ?? item.code ?? item.label ?? '';
    const normalizedValue = String(candidate ?? '').trim();
    return normalizedValue || undefined;
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

export const getDemoList = (params?: ToolLedgerQueryParams & Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const saveOrUpdateDemo = (params: ToolLedgerPayload, isUpdate: boolean) => {
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

export function buildToolPayload(values: Record<string, unknown>): ToolLedgerPayload {
  const payload: ToolLedgerPayload = {
    category: toTrimmedString(values.category) || TOOL_LEDGER_CATEGORY,
    deviceCode: toTrimmedString(values.deviceCode),
    cadCode: toTrimmedString(values.cadCode),
    cycle: toNumberValue(values.cycle),
    deviceModule: toTrimmedString(values.deviceModule),
    deviceName: toTrimmedString(values.deviceName),
    devicePic: normalizeUploadPath(values.devicePic),
    deviceStatus: toNumberValue(values.deviceStatus),
    deviceTypeId: toNumberValue(values.deviceTypeId),
    factory: toTrimmedString(values.factory),
    invQty: toNumberValue(values.invQty),
    la: toTrimmedString(values.la),
    lo: toTrimmedString(values.lo),
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

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as ToolLedgerPayload;
}
