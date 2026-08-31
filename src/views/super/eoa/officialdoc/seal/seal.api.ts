import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import { useGlobSetting } from '/@/hooks/setting';

const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;

enum Api {
  list = '/eoa/officialdoc/oaOfficialdocSeal/list',
  save = '/eoa/officialdoc/oaOfficialdocSeal/add',
  edit = '/eoa/officialdoc/oaOfficialdocSeal/edit',
  deleteOne = '/eoa/officialdoc/oaOfficialdocSeal/delete',
  deleteBatch = '/eoa/officialdoc/oaOfficialdocSeal/deleteBatch',
  importExcel = '/eoa/officialdoc/oaOfficialdocSeal/importExcel',
  exportXls = '/eoa/officialdoc/oaOfficialdocSeal/exportXls',
  updateSealPassWord = '/eoa/officialdoc/oaOfficialdocSeal/updateSealPassWord',

  getSignature = '/eoa/officialdoc/oaOfficialdocIssued/getSignature',
  verifyPassword = '/eoa/officialdoc/oaOfficialdocSeal/verifyPassword',
}

/**
 * 上传父路径
 */
export const uploadUrl = `${baseUploadUrl}/eoa/officialdoc/oaOfficialdocSeal/uploadImage`;

/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 列表接口
 * @param params
 */
export const list = (params) => defHttp.get({ url: Api.list, params });

/**
 * 删除单个
 * @param params
 * @param handleSuccess
 */
export const deleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 批量删除
 * @param params
 * @param handleSuccess
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
 * @param isUpdate
 */
export const saveOrUpdate = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};

/**
 * 修改密码
 * @param params
 */
export const updateSealPassWord = (params) => {
  return defHttp.put(
    { url: Api.updateSealPassWord, data: params },
    {
      joinParamsToUrl: true,
      isTransformResponse: false,
    }
  );
};
/**
 * 获取签章
 * @param params
 */
export const getSignature = (params) => defHttp.get({ url: Api.getSignature, params },{ isTransformResponse: false });
/**
 * 校验密码
 * @param params
 */
export const verifyPassword = (params) => defHttp.get({ url: Api.verifyPassword, params },{ isTransformResponse: false });