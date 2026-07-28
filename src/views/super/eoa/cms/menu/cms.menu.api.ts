import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/eoa/cms/eoaCmsMenu/treeList',
  save = '/eoa/cms/eoaCmsMenu/add',
  edit = '/eoa/cms/eoaCmsMenu/edit',
  delete = '/eoa/cms/eoaCmsMenu/delete',
  deleteBatch = '/eoa/cms/eoaCmsMenu/deleteBatch',
  exportXls = '/eoa/cms/eoaCmsMenu/exportXls',
  importExcel = '/eoa/cms/eoaCmsMenu/importExcel',
  duplicateCheck = '/sys/duplicate/check',
  selectTree = '/eoa/cms/eoaCmsMenu/selectTree',
}

/**
 * 查询栏目列表
 * @param params
 */
export const getCmsMenuList = (params) => {
  return defHttp.get({ url: Api.list, params });
};

/**
 * 删除栏目
 * @param params
 * @param handleSuccess
 */
export const deleteCmsMenu = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.delete, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除
 * @param params
 */
export const batchDeleteCmsMenu = (params, handleSuccess) => {
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
 * 保存或者更新栏目
 * @param params
 */
export const saveOrUpdateCmsMenu = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};

export const updateCmsMenu = (params) => {
  return defHttp.put({ url: Api.edit, params });
};

/**
 * 获取下拉树
 */
export const selectTreeData = (params?: Recordable) => defHttp.get<Recordable[]>({ url: Api.selectTree, params });

/**
 * 唯一校验
 * @param params
 */
export const duplicateCheck = (params) => defHttp.get({ url: Api.duplicateCheck, params }, { isTransformResponse: false });

/**
 * 导出api
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
