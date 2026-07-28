import { Modal } from 'ant-design-vue';
import { useGlobSetting } from '/@/hooks/setting';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/course/list',
  save = '/operation/course/add',
  edit = '/operation/course/edit',
  get = '/operation/course/queryById',
  delete = '/operation/course/delete',
  deleteBatch = '/operation/course/deleteBatch',
  exportXls = '/operation/course/exportXls',
  treeListCatalogue = '/operation/courseSubject/subjectList',
}

const globSetting = useGlobSetting();
const staticFilePrefix = `${globSetting.domainUrl}${globSetting.urlPrefix}/sys/common/static/`;

export interface CoursePayload {
  classroomId?: number;
  coverImage?: string;
  credits?: number;
  description?: string;
  durationMinutes?: number;
  id?: number;
  materialIds?: string;
  status?: number;
  subjectId?: number;
  teacherName?: string;
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

export const saveOrUpdateDemo = (params: CoursePayload, isUpdate: boolean) => {
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

export const getTreeListKechengmulu = (params?: Record<string, unknown>) => defHttp.get({ url: Api.treeListCatalogue, params });

export function buildCoursePayload(values: Record<string, unknown>): CoursePayload {
  const payload: CoursePayload = {
    classroomId: toIntegerValue(values.classroomId),
    coverImage: normalizeUploadPath(values.coverImage),
    credits: toIntegerValue(values.credits),
    description: toTrimmedString(values.description),
    durationMinutes: toIntegerValue(values.durationMinutes),
    materialIds: toTrimmedString(values.materialIds),
    status: toIntegerValue(values.status),
    subjectId: toIntegerValue(values.subjectId),
    teacherName: toTrimmedString(values.teacherName),
    title: toTrimmedString(values.title),
  };

  const id = toIntegerValue(values.id);
  if (id != null) {
    payload.id = id;
  }

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as CoursePayload;
}
