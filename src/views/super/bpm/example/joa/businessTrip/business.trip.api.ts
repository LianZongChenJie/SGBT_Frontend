import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/joa/joaBusinesStrip/list',
  queryById = '/joa/joaBusinesStrip/queryById',
  save = '/joa/joaBusinesStrip/add',
  edit = '/joa/joaBusinesStrip/edit',
  deleteOne = '/joa/joaBusinesStrip/delete',
  deleteBatch = '/joa/joaBusinesStrip/deleteBatch',
  getDepartName = '/sys/sysDepart/listAll',
}
/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 获取部门名称
 * @param params
 */
export const getDepartName = (params) => defHttp.get({ url: Api.getDepartName, params });
/**
 * 根据id查询
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params }, { isTransformResponse: false });
/**
 * 删除一个
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除
 * @param params
 */
export const batchDelete = (params, handleSuccess) => {
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
