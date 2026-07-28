import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/joa/joaLoan/list',
  queryByTripApplyNo = '/joa/joaLoan/queryByTripApplyNo',
  queryTripByApplyNo = '/joa/joaBusinesStrip/queryByTripApplyNo',
  save = '/joa/joaLoan/add',
  edit = '/joa/joaLoan/edit',
  deleteOne = '/joa/joaLoan/delete',
  deleteBatch = '/joa/joaLoan/deleteBatch',
}
/**
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 根据借款信息
 * @param params
 */
export const queryByTripApplyNo = (params) => defHttp.get({ url: Api.queryByTripApplyNo, params }, { isTransformResponse: false });
/**
 * 根据出差信息
 * @param params
 */
export const queryTripByApplyNo = (params) => defHttp.get({ url: Api.queryTripByApplyNo, params }, { isTransformResponse: false });
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
