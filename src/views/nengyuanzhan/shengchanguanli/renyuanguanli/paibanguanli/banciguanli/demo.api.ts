import { defHttp } from '/@/utils/http/axios';
import { queryDepartTreeSync } from '/@/api/common/api';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/operation/energyPlanItem/list',
  save = '/operation/energyPlanItem/add',
  edit = '/operation/energyPlanItem/edit',
  get = '/operation/energyPlanItem/queryById',
  delete = '/operation/energyPlanItem/delete',
  deleteBatch = '/operation/energyPlanItem/deleteBatch',
  exportXls = '/operation/energyPlanItem/exportXls',
  importExcel = '/operation/energyPlanItem/importExcel',
  TreeList = '/operation/energyPlanItem/ddl',
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
export const getDemoList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 保存或者更新示例
 * @param params
 */
export const saveOrUpdateDemo = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  if (isUpdate) {
    return defHttp.put({ url: url, params });
  } else {
    return defHttp.post({ url: url, params });
  }
};

/**
 * 查询示例详情
 * @param params
 */
export const getDemoById = (params) => {
  return defHttp.get({ url: Api.get, params });
};

/**
 * 删除示例
 * @param params
 */
export const deleteDemo = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除示例
 * @param params
 */
export const batchDeleteDemo = (params, handleSuccess) => {
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

export const getTreeListBanci = (params?) => defHttp.get({ url: Api.TreeList, params });

function normalizeDeptCode(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatDeptNameByMap(value: unknown, deptMap: Map<string, string>) {
  const ids = normalizeDeptCode(value);
  if (!ids.length) {
    return '';
  }
  return ids.map((item) => deptMap.get(item) || item).join(',');
}

export async function resolveDeptNameMap(values: unknown) {
  const ids = [...new Set(normalizeDeptCode(values))];
  if (!ids.length) {
    return new Map<string, string>();
  }

  const list =
    (await queryDepartTreeSync({
      ids: ids.join(','),
      primaryKey: 'orgCode',
    })) || [];

  return new Map(
    list.map((item) => {
      const code = String(item.orgCode || item.id || item.key || '');
      const name = item.departName || item.title || item.label || code;
      return [code, name];
    })
  );
}

export async function resolveDeptName(value: unknown) {
  const ids = normalizeDeptCode(value);
  if (!ids.length) {
    return '';
  }
  const deptMap = await resolveDeptNameMap(ids);
  return formatDeptNameByMap(ids, deptMap);
}
