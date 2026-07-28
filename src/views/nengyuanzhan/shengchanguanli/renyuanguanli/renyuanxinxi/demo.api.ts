import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/operation/energyEmployee/list',
  save = '/operation/energyEmployee/add',
  edit = '/operation/energyEmployee/edit',
  get = '/operation/energyEmployee/queryById',
  delete = '/operation/energyEmployee/delete',
  deleteBatch = '/operation/energyEmployee/deleteBatch',
  TreeList = '/operation/energyEmployee/ddl',
  searchBy = '/operation/energyEmployee/searchBy',
  exportXls = '/operation/energyEmployee/exportXls',
  importExcel = '/operation/energyEmployee/importExcel',
}

export interface EnergyEmployeePayload {
  id?: string | number;
  employeeName: string;
  employeeCode: string;
  employeeType: string;
  company: string;
  idCard: string;
  position: string;
  sysOrgCode: string;
  contactNo: string;
}

interface IdParams {
  id: string | number;
}

interface BatchDeleteParams {
  ids: string;
}

interface EnergyEmployeeQueryParams {
  company?: string;
  contactNo?: string;
  employeeCode?: string;
  employeeName?: string;
  employeeType?: string;
  id?: string | number;
  idCard?: string;
  position?: string;
  sysOrgCode?: string;
}

export interface TreeSelectDTO {
  id: string | number;
  label?: string;
  title?: string;
  openId?: string;
  parentId?: string | number;
  status?: string;
  children?: TreeSelectDTO[];
}

function toTrimmedString(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .join(',');
  }
  if (typeof value === 'object') {
    const item = value as Record<string, unknown>;
    const candidate = item.value ?? item.id ?? item.code ?? item.label ?? '';
    return String(candidate ?? '').trim();
  }
  return String(value).trim();
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
 * 查询示例列表
 * @param params
 */
export const getDemoList = (params?: EnergyEmployeeQueryParams & Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 保存或者更新示例
 * @param params
 */
export const saveOrUpdateDemo = (params: EnergyEmployeePayload, isUpdate: boolean) => {
  if (isUpdate) {
    return defHttp.put({ url: Api.edit, params });
  } else {
    return defHttp.post({ url: Api.save, params });
  }
};

/**
 * 查询示例详情
 * @param params
 */
export const getDemoById = (params: IdParams) => {
  return defHttp.get({ url: Api.get, params });
};

/**
 * 删除示例
 * @param params
 */
export const deleteDemo = (params: IdParams, handleSuccess: () => void) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除示例
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

export const getTreeListRenyuan = (params?: Record<string, unknown>) => defHttp.get<TreeSelectDTO[]>({ url: Api.TreeList, params });

export function buildEmployeePayload(values: Record<string, unknown>): EnergyEmployeePayload {
  const payload: EnergyEmployeePayload = {
    employeeName: toTrimmedString(values.employeeName),
    employeeCode: toTrimmedString(values.employeeCode),
    employeeType: toTrimmedString(values.employeeType),
    company: toTrimmedString(values.company),
    idCard: toTrimmedString(values.idCard),
    position: toTrimmedString(values.position),
    sysOrgCode: toTrimmedString(values.sysOrgCode),
    contactNo: toTrimmedString(values.contactNo),
  };

  if (values.id) {
    payload.id = values.id as string | number;
  }

  return payload;
}
