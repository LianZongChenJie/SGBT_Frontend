import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/act/process/extActExpression/list',
  save = '/act/process/extActExpression/add',
  edit = '/act/process/extActExpression/edit',
  delete = '/act/process/extActExpression/delete',
  deleteBatch = '/act/process/extActExpression/deleteBatch',
}
/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return isUpdate ? defHttp.put({ url: url, params }) : defHttp.post({ url: url, params });
};
/**
 * 删除监听
 * @param params
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
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
