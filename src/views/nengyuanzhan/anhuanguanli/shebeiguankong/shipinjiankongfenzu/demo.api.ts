
import {defHttp} from '/@/utils/http/axios';
import {Modal} from 'ant-design-vue';

enum Api {
  get = '/operation/videoMonitorGroup/queryById',
  list = '/operation/videoMonitorGroup/list',
  searchBy = '/operation/videoMonitorGroup/searchBy',
  save = '/operation/videoMonitorGroup/add',
  edit = '/operation/videoMonitorGroup/edit',
  delete = '/operation/videoMonitorGroup/delete',
  deleteBatch = '/operation/videoMonitorGroup/deleteBatch',
  TreeList = '/operation/videoMonitorGroup/treeList',
  exportXls = '/operation/videoMonitorGroup/exportXls',
  groupList = '/operation/videoMonitorGroup/groupList',
  placeTypes = '/operation/videoMonitorGroup/placeTypes',

}
/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
/**
 * 查询示例列表
 * @param params
 */
export const getDemoList = (params) => {
  return defHttp.get({url: Api.list, params});
};


/**
 * 保存或者更新示例
 * @param params
 */
export const saveOrUpdateDemo = (params, isUpdate) => {
  if (isUpdate) {
    return defHttp.put({url: Api.edit, params});
  } else {
    return defHttp.post({url: Api.save, params});
  }
};

/**
 * 查询示例详情
 * @param params
 */
export const getDemoById = (params) => {
  return defHttp.get({url: Api.get, params});
};

/**
 * 删除示例
 * @param params
 */
export const deleteDemo = (params, handleSuccess) => {
  return defHttp.delete({url: Api.delete, data: params}, {joinParamsToUrl: true}).then(() => {
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
      return defHttp.delete({url: Api.deleteBatch, data: params}, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    },
  });
};



export const searchByKeywords = (params) => defHttp.get({ url: Api.searchBy, params });

/**
 * 获取部门树列表
 */
export const queryDepartTreeSync = (params?) => defHttp.get({url: Api.TreeList, params});
/**
 * 部门用户信息
 */
export const list = (params?) => defHttp.get({url: Api.list, params});
export const getTreeListShipinjiankongfenzu = (params?) => defHttp.get({url: Api.TreeList, params});

// 获取场所类型
export const getPlaceTypes = (params) => {
  return defHttp.get({url: Api.placeTypes, params});
};
