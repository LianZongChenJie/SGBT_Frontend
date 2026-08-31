import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  get = '/operation/videoDevice/queryById',
  list = '/operation/videoDevice/list',
  save = '/operation/videoDevice/add',
  edit = '/operation/videoDevice/edit',
  delete = '/operation/videoDevice/delete',
  deleteBatch = '/operation/videoDevice/deleteBatch',
  exportXls = '/operation/videoDevice/exportXls',
  importExcel = '/operation/videoDevice/importExcel',
  queryDeviceTree = '/operation/videoMonitorGroup/queryDeviceTree',
  deviceTypeTree = '/operation/operationDimDeviceType/ddl',
}
/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;

let videoGroupNameMapPromise: Promise<Record<string, string>> | null = null;

function flattenVideoGroups(list = [], nameMap: Record<string, string> = {}) {
  list.forEach((item) => {
    if (item?.id != null && item?.groupName) {
      nameMap[String(item.id)] = item.groupName;
    }
    if (Array.isArray(item?.children) && item.children.length > 0) {
      flattenVideoGroups(item.children, nameMap);
    }
  });
  return nameMap;
}

async function getVideoGroupNameMap() {
  if (!videoGroupNameMapPromise) {
    videoGroupNameMapPromise = defHttp
      .get({ url: '/operation/videoMonitorGroup/treeList' })
      .then((result) => flattenVideoGroups(result || []))
      .catch(() => {
        videoGroupNameMapPromise = null;
        return {};
      });
  }
  return videoGroupNameMapPromise;
}
/**
 * 查询示例列表
 * @param params
 */
export const getDemoList = async (params) => {
  const [result, videoGroupNameMap] = await Promise.all([defHttp.get({ url: Api.list, params }), getVideoGroupNameMap()]);

  if (Array.isArray(result?.records)) {
    result.records = result.records.map((item) => ({
      ...item,
      videoGroupName: item?.videoGroupName || videoGroupNameMap[String(item?.videoGroupId)] || '',
    }));
  }

  return result;
};

/**
 * 保存或者更新示例
 * @param params
 */
export const saveOrUpdateDemo = (params, isUpdate) => {
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

// 获取分组下的摄像头树
export const getTreeListDeviceTree = (params?) => defHttp.get({ url: Api.queryDeviceTree, params });

// 获取设备类型树
export const getDeviceTypeTreeList = (params?) => defHttp.get({ url: Api.deviceTypeTree, params });
