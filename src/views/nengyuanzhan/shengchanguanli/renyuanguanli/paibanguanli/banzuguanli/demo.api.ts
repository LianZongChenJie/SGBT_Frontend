import { Modal } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/energyPlanGroup/list',
  save = '/operation/energyPlanGroup/add',
  edit = '/operation/energyPlanGroup/edit',
  get = '/operation/energyPlanGroup/queryById',
  delete = '/operation/energyPlanGroup/delete',
  deleteBatch = '/operation/energyPlanGroup/deleteBatch',
  treeList = '/operation/energyPlanGroup/ddl',
}

export interface GroupItemPayload {
  itemId: number;
  itemIndex: number;
}

export interface GroupPayload {
  cycleDays?: number;
  groupCode?: string;
  groupName?: string;
  id?: string | number;
  items?: GroupItemPayload[];
  leader?: string;
  sysOrgCode?: string;
}

function toTrimmedString(value: unknown): string | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue || undefined;
}

function toNumberValue(value: unknown): number | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

export const getDemoList = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const saveOrUpdateDemo = (params: GroupPayload, isUpdate: boolean) => {
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

export const getTreeListBanzu = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.treeList, params });
};

export function buildGroupPayload(values: Record<string, unknown>): GroupPayload {
  const payload: GroupPayload = {
    cycleDays: toNumberValue(values.cycleDays),
    groupCode: toTrimmedString(values.groupCode),
    groupName: toTrimmedString(values.groupName),
    leader: toTrimmedString(values.leader),
    sysOrgCode: toTrimmedString(values.sysOrgCode),
  };

  if (values.id !== '' && values.id != null) {
    payload.id = values.id as string | number;
  }

  if (Array.isArray(values.items)) {
    payload.items = values.items
      .map((item) => {
        const groupItem = item as Record<string, unknown>;
        const itemId = toNumberValue(groupItem.itemId);
        const itemIndex = toNumberValue(groupItem.itemIndex);
        if (itemId == null || itemIndex == null) {
          return null;
        }
        return {
          itemId,
          itemIndex,
        };
      })
      .filter((item): item is GroupItemPayload => item !== null);
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as GroupPayload;
}
