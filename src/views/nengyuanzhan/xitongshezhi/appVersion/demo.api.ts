import { Modal } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/dimAppVersion/list',
  save = '/operation/dimAppVersion/add',
  edit = '/operation/dimAppVersion/edit',
  get = '/operation/dimAppVersion/queryById',
  delete = '/operation/dimAppVersion/delete',
  deleteBatch = '/operation/dimAppVersion/deleteBatch',
}

export interface AppVersionPayload {
  app?: string;
  forceUpgrade?: number;
  id?: string | number;
  remark?: string;
  status?: string;
  versionName?: string;
  versionNo?: string;
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

export const getDemoList = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const saveOrUpdateDemo = (params: AppVersionPayload, isUpdate: boolean) => {
  if (isUpdate) {
    return defHttp.put({ url: Api.edit, params });
  }
  return defHttp.post({ url: Api.save, params });
};

export const getDemoById = (params: { id: string | number }) => {
  return defHttp.get({ url: Api.get, params });
};

export const deleteDemo = (params: { id: string | number }, handleSuccess: () => void) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

export const batchDeleteDemo = (params: { ids: string }, handleSuccess: () => void) => {
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

export function buildAppVersionPayload(values: Record<string, unknown>): AppVersionPayload {
  const payload: AppVersionPayload = {
    app: toTrimmedString(values.app),
    forceUpgrade: toNumberValue(values.forceUpgrade),
    remark: toTrimmedString(values.remark),
    status: toTrimmedString(values.status),
    versionName: toTrimmedString(values.versionName),
    versionNo: toTrimmedString(values.versionNo),
  };

  if (values.id !== '' && values.id != null) {
    payload.id = values.id as string | number;
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as AppVersionPayload;
}
