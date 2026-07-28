import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/jeecg-demo/event_tenant/list',
  save = '/jeecg-demo/event_tenant/add',
  edit = '/jeecg-demo/event_tenant/edit',
  deleteSingle = '/jeecg-demo/event_tenant/delete',
  getTreeData = '/jeecg-demo/event_tenant/tenantCheckedTree',
  saveTreeData = '/jeecg-demo/event_tenant/defineSpace',
  allRoles = '/jeecg-demo/event/order/getAllUser',
  saveRoles = '/jeecg-demo/event_tenant/defineUser',
  editRoles = '/jeecg-demo/event_tenant/checkedUser',
}
/**
 * 列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 删除
 */
export const deleteSingle = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteSingle, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除
 * @param params
 */
export const batchDeleteCategory = (params, handleSuccess) => {
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
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};

export const getTreeData = (params) => defHttp.get({ url: Api.getTreeData, params }, { joinParamsToUrl: true });
export const saveTreeData = (params) => {
  return defHttp.post({ url: Api.saveTreeData, params });
};
/**
 * 获取全部角色
 * @param params
 */
export const getAllRoles = () => defHttp.get({ url: Api.allRoles });
/**
 * 保存绑定角色
 * @param params
 */
export const saveRoles = (params) => {
  return defHttp.post({ url: Api.saveRoles, params });
};
/**
 * 获取绑定角色
 * @param params
 */
export const getRoles = (params) => defHttp.get({ url: Api.editRoles, params }, { joinParamsToUrl: true });
