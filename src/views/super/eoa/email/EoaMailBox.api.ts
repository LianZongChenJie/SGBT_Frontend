import { defHttp } from '/@/utils/http/axios';

enum Api {
  //收件箱
  inboxList = '/eoa/email/eoaMailboxInfo/sendList',
  addEmail = '/eoa/email/eoaMailboxInfo/addEmail',
  edit = '/eoa/email/eoaMailboxInfo/edit',
  deleteOne = '/eoa/email/eoaMailboxInfo/delete',
  deleteBatch = '/eoa/email/eoaMailboxInfo/deleteBatch',
  saveEmail = '/eoa/email/eoaMailboxInfo/saveEmail',
  emailCount = '/eoa/email/eoaMailboxInfo/emailCount',
  updateMailboxType = '/eoa/email/eoaMailboxInfo/updateMailboxType',
  mailboxCategory = '/eoa/email/eoaMailboxInfo/mailboxCategory',
  updateBatchReadFlag = '/eoa/email/eoaMailboxInfo/updateBatchReadFlag',
  updateEmailDelete = '/eoa/email/eoaMailboxInfo/updateEmailDelete',
  editByEmailIdAndUserId = '/eoa/email/eoaMailboxInfo/editByEmailIdAndUserId',
  receiverPageList = '/eoa/email/eoaMailboxInfo/receiverPageList',
  //标签
  addCategory = '/eoa/email/eoaMailboxCategory/add',
  deleteCategory = '/eoa/email/eoaMailboxCategory/delete',
  getLabelName = '/eoa/email/eoaMailboxCategory/getLabelName',
  check = '/eoa/email/eoaMailboxCategory/check',
  //
  editCategory = '/eoa/email/eoaMailboxCategory/edit',
  //发件箱
  sendList = '/eoa/email/eoaMailboxInfo/list',
  updateEmailStatus = '/eoa/email/eoaMailboxInfo/updateEmailStatus',
  emailWithdraw = '/eoa/email/eoaMailboxInfo/emailWithdraw',
  articleReadList = '/eoa/cms/eoaCmsArticleRead/list',
  //垃圾箱
  selectDustbin = '/eoa/email/eoaMailboxInfo/selectDustbin',
  revertList = '/eoa/email/eoaMailboxInfo/revertList',
  //查询
  queryById = '/eoa/email/eoaMailboxInfo/queryById',
}

/**
 * 收件箱列表
 * @param params
 */
export const inboxList = (params) => defHttp.get({ url: Api.inboxList, params });
/**
 * 收件箱列表不处理请求
 * @param params
 */
export const inboxListNotTransform = (params) =>
  defHttp.get(
    {
      url: Api.inboxList,
      params,
    },
    { isTransformResponse: false }
  );

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
 */
export const batchDelete = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 发送邮箱
 * @param params
 */
export const addEmail = (params) => {
  return defHttp.post({ url: Api.addEmail, params }, { isTransformResponse: false });
};

/**
 * 保存邮箱到草稿
 * @param params
 */
export const saveEmail = (params) => {
  return defHttp.post({ url: Api.saveEmail, params }, { isTransformResponse: false });
};

/**
 * 保存邮箱到草稿
 * @param params
 */
export const emailCount = (params) => {
  return defHttp.get({ url: Api.emailCount, params }, { isTransformResponse: false });
};

/**
 * 保存邮箱到草稿
 * @param params
 */
export const getLabelName = (params) => {
  return defHttp.get({ url: Api.getLabelName, params }, { isTransformResponse: false });
};

/**
 * 分类是否重复
 * @param params
 */
export const checkCategory = (params) => {
  return defHttp.get({ url: Api.check, params }, { isTransformResponse: false });
};

/**
 * 分类添加
 * @param params
 */
export const addCategory = (params) => {
  return defHttp.post({ url: Api.addCategory, params });
};

/**
 * 分类添加
 * @param params
 */
export const deleteCategory = (params) => {
  return defHttp.delete({ url: Api.deleteCategory, params }, { joinParamsToUrl: true });
};

/**
 * 添加或修改邮箱种类
 * @param params
 */
export const updateMailboxType = (params) => {
  return defHttp.put({ url: Api.updateMailboxType, params });
};

/**
 * 通过收件id删除邮箱种类
 * @param params
 */
export const mailboxCategory = (params) => {
  return defHttp.put({ url: Api.mailboxCategory, params });
};

/**
 * 通过收件id修改已读状态
 * @param params
 */
export const updateBatchReadFlag = (params, handleSuccess) => {
  return defHttp.put({ url: Api.updateBatchReadFlag, params }).then(() => {
    handleSuccess();
  });
};

/**
 * 通过收件id修改已读状态
 * @param params
 */
export const updateEmailDelete = (params, handleSuccess) => {
  return defHttp.put({ url: Api.updateEmailDelete, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 发送回执邮件
 * @param params
 */
export const editByEmailIdAndUserId = (params) => {
  return defHttp.put(
    { url: Api.editByEmailIdAndUserId, params },
    {
      joinParamsToUrl: true,
      isTransformResponse: false,
    }
  );
};

/**
 * 发送回执邮件
 * @param params
 */
export const receiverPageList = (params) => {
  return defHttp.get({ url: Api.receiverPageList, params }, { isTransformResponse: false });
};

/**
 * 发件箱列表
 * @param params
 */
export const sendList = (params) => {
  return defHttp.get({ url: Api.sendList, params });
};

/**
 * 删除邮件箱
 * @param params
 * @param handleSuccess
 */
export const updateEmailStatus = (params, handleSuccess) => {
  return defHttp.put({ url: Api.updateEmailStatus, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};

/**
 * 撤回
 * @param params
 */
export const emailWithdraw = (params) => {
  return defHttp.get({ url: Api.emailWithdraw, params }, { isTransformResponse: false });
};

/**
 * 收件箱点击小眼睛预览
 * @param params
 */
export const receiverPage = (params) => {
  return defHttp.get({ url: Api.receiverPageList, params });
};

/**
 * 垃圾箱列表
 * @param params
 */
export const selectDustbin = (params) => {
  return defHttp.get({ url: Api.selectDustbin, params });
};

/**
 * 恢复
 * @param params
 */
export const revertList = (params) => {
  return defHttp.post({ url: Api.revertList, params });
};

/**
 * 恢复
 * @param params
 */
export const editCategory = (params, handleSuccess) => {
  return defHttp.put({ url: Api.editCategory, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};


/**
 * 查询单个邮件
 * @param params
 */
export const selectOne = (id) => {
  return defHttp.get({ url: Api.queryById, params:{id} });
};
