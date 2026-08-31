import { Modal } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/operation/anomalyRule/list',
  save = '/operation/anomalyRule/add',
  edit = '/operation/anomalyRule/edit',
  get = '/operation/anomalyRule/queryById',
  delete = '/operation/anomalyRule/delete',
  deleteBatch = '/operation/anomalyRule/deleteBatch',
  exportXls = '/operation/anomalyRule/exportXls',
  categoryList = '/operation/alarmCategory/categoryList',
  eventList = '/operation/alarmEvent/eventList',
  levelList = '/operation/anomalyLevel/levelList',
}

export const getDemoList = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.list, params });
};

export const getExportUrl = Api.exportXls;

export const saveOrUpdateDemo = (params: Record<string, unknown>, isUpdate: boolean) => {
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

export const getTreeListGaojingleixing = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.categoryList, params });
};

export const getTreeListGaojingshijian = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.eventList, params });
};

export const getTreeListGaojingdengji = (params?: Record<string, unknown>) => {
  return defHttp.get({ url: Api.levelList, params });
};
