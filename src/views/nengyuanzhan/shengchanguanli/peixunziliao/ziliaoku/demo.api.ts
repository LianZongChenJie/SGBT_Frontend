import { Modal } from 'ant-design-vue';
import { useGlobSetting } from '/@/hooks/setting';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/trainingMaterial/list',
  save = '/operation/trainingMaterial/add',
  edit = '/operation/trainingMaterial/edit',
  get = '/operation/trainingMaterial/queryById',
  delete = '/operation/trainingMaterial/delete',
  deleteBatch = '/operation/trainingMaterial/deleteBatch',
  exportXls = '/operation/trainingMaterial/exportXls',
  treeListCatalogue = '/operation/trainingCatalogue/catalogueList',
  treeListClassroom = '/operation/trainingClassroom/classroomList',
}

const globSetting = useGlobSetting();
const staticFilePrefix = `${globSetting.domainUrl}${globSetting.urlPrefix}/sys/common/static/`;

export interface TrainingMaterialPayload {
  catalogueId?: number;
  classroomId?: number;
  description?: string;
  filePath?: string;
  id?: number;
  materialTime?: number;
  title?: string;
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

function toIntegerValue(value: unknown): number | undefined {
  const numericValue = toNumberValue(value);
  if (numericValue == null || !Number.isInteger(numericValue)) {
    return undefined;
  }
  return numericValue;
}

function normalizeUploadPath(value: unknown): string | undefined {
  const uploadValue = Array.isArray(value) ? value.join(',') : value;
  const filePath = toTrimmedString(uploadValue);
  if (!filePath) {
    return undefined;
  }
  if (filePath.startsWith(staticFilePrefix)) {
    return filePath.slice(staticFilePrefix.length);
  }
  return filePath;
}

export const getDemoList = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const getExportUrl = Api.exportXls;

export const saveOrUpdateDemo = (params: TrainingMaterialPayload, isUpdate: boolean) => {
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
  return Modal.confirm({
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

export const getTreeListZiliaomulu = (params?: Record<string, unknown>) => defHttp.get({ url: Api.treeListCatalogue, params });

export const getTreeListZiliaokeshi = (params?: Record<string, unknown>) => defHttp.get({ url: Api.treeListClassroom, params });

export function buildTrainingMaterialPayload(values: Record<string, unknown>): TrainingMaterialPayload {
  const payload: TrainingMaterialPayload = {
    catalogueId: toIntegerValue(values.catalogueId),
    classroomId: toIntegerValue(values.classroomId),
    description: toTrimmedString(values.description),
    filePath: normalizeUploadPath(values.filePath),
    materialTime: toNumberValue(values.materialTime),
    title: toTrimmedString(values.title),
  };

  const id = toIntegerValue(values.id);
  if (id != null) {
    payload.id = id;
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as TrainingMaterialPayload;
}
