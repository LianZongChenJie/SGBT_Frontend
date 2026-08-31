import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/jeecg-demo/mdm/space/list',
  save = '/jeecg-demo/mdm/space/add',
  edit = '/jeecg-demo/mdm/space/edit',
  detail = '/jeecg-demo/mdm/space/queryById',
  deleteNode = '/jeecg-demo/mdm/space/delete',
  getTreeData = '/jeecg-demo/mdm/space/getTree',
  sysDepart = '/sys/sysDepart/searchBy?keyWord=项目部',
}
/**
 * 列表接口
 * @param params
 */
export const detail = (params) => defHttp.get({ url: Api.detail, params }, { joinParamsToUrl: true });
/**
 * 删除
 */
export const deleteNode = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteNode, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};
export const getTreeData = (params) => defHttp.get({ url: Api.getTreeData, params });
/**
 * 项目部列表
 * @param params
 */
export const getSysDepart = (params) => {
  return defHttp.get({ url: Api.sysDepart, params });
};
