import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import {
  buildEmployeeEditPayload,
  type EnergyEmployeeCreatePayload,
  type EnergyEmployeeEditPayload,
} from './employeePayload';

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

export type EnergyEmployeePayload = EnergyEmployeeCreatePayload[] | EnergyEmployeeEditPayload;

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

export const buildEmployeePayload = buildEmployeeEditPayload;
