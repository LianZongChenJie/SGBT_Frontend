import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/eoa/cms/eoaCmsArticle/list',
  save = '/eoa/cms/eoaCmsArticle/add',
  edit = '/eoa/cms/eoaCmsArticle/edit',
  deleteOne = '/eoa/cms/eoaCmsArticle/delete',
  deleteBatch = '/eoa/cms/eoaCmsArticle/deleteBatch',
  exportXls = '/eoa/cms/eoaCmsArticle/exportXls',
  importExcel = '/eoa/cms/eoaCmsArticle/importExcel',
  updateIsPublish = '/eoa/cms/eoaCmsArticle/updateIsPublish',
  treeList = '/eoa/cms/eoaCmsMenu/treeList',
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
 * 列表
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });
/**
 * 删除文章
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除文章
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
 * 是否发布
 * @param params
 */
export const updateIsPublish = (params) => defHttp.get({ url: Api.updateIsPublish, params }, { isTransformResponse: false });

/**
 * 保存或者更新
 * @param params
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};
/**
 * 查询栏目
 * @param params
 */
export const getCmsMenuList = (params?) => {
  return defHttp.get({ url: Api.treeList, params });
};
