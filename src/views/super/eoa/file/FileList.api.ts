import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';
import { useGlobSetting } from '/@/hooks/setting';

const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const domainUrl = globSetting.domainUrl;

enum Api {
  list = '/eoa/files/getFileList',
  add = '/eoa/files/addSysFile',
  fileOperate = '/eoa/files/fileOperate',
  edit = '/eoa/files/edit',
  searchFolder = '/eoa/files/searchFolder',
  getCurrentUserTenantForFile = '/sys/tenant/getCurrentUserTenantForFile',
  generateMyFile = '/eoa/files/generateMyFile',
  delete = '/eoa/files/deleteFileById',
  batchDeleteFile = '/eoa/files/batchDeleteFile',
  getIzRootFolderList = '/eoa/files/getIzRootFolderList',
  createAFolder = '/eoa/files/createAFolder',
  queryUserByIds = '/sys/user/queryByIds',
  copyFiles = '/eoa/files/copyFiles',
  moveFiles = '/eoa/files/moveFiles',
  getShareFolder = '/eoa/files/getShareFolder',
  entrustedFolder = '/eoa/files/entrustedFolder',
  changeAuth = '/eoa/files/changeAuth',
  deleteAuth = '/eoa/files/deleteAuth',
  deleteShareFolder = '/eoa/files/deleteShareFolder',
  addAuthUser = '/eoa/files/addAuthUser',
  removeCompletely = '/eoa/files/removeCompletely',
  uploadUrl = '/sys/common/upload',
  editSysFile = '/eoa/files/editSysFile',
  getFileDetail = '/eoa/files/getFileDetail',
  getDetailLog = '/eoa/files/getDetailLog',
  updateDownNum = '/eoa/files/updateDownNum',
  getAuth = '/eoa/files/getAuth',
  batchReductionFile = '/eoa/files/batchReductionFile',
  getPNameByPId = '/eoa/files/getPNameByPId',
  getRecycleBinList = '/eoa/files/getRecycleBinList',
  shareFile = '/eoa/files/shareFile',
  addMyFiles = '/eoa/files/addMyFiles',
  getTenantId = '/eoa/files/getTenantId',
  getShareFileList = '/eoa/files/getShareFileList',
  //更新阅读数量
  updateReadCount = '/eoa/files/updateReadCount'
}

/**
 * 下载文件路径
 */
export const downLoadFiles = `${domainUrl}/eoa/files/downLoadFiles`;

/**
 * 下载分享文件路径
 */
export const downLoadShareFiles = `${domainUrl}/eoa/files/downLoadShareFiles`;

/**
 * 上传路径
 */
export const uploadUrl = `${baseUploadUrl}/eoa/files/uploadSysFile`;

/**
 * 列表接口
 * @param params
 */
export const list = (params) => {
  return defHttp.get({ url: Api.list, params }, { isTransformResponse: false });
};

/**
 * 列表接口 回收站列表接口
 * @param params
 */
export const getRecycleBinList = (params) => {
  return defHttp.get({ url: Api.getRecycleBinList, params }, { isTransformResponse: false });
};

/**
 * 分享列表接口
 * @param params
 */
export const getShareFileList = (params) => {
  return defHttp.get({ url: Api.getShareFileList, params }, { isTransformResponse: false });
};

/**
 * 搜索文件夹接口不带分页
 * @param params
 */
export const searchFolder = (params) => {
  return defHttp.get({ url: Api.searchFolder, params }, { isTransformResponse: false });
};

/**
 * 保存文件
 * @param params
 */
export const saveFile = (params) => {
  return defHttp.post({ url: Api.add, params }, { isTransformResponse: false, joinParamsToUrl: true });
};

/**
 * 获取文件名称
 * @param params
 */
export const getCurrentUserTenant = () => {
  return defHttp.get({ url: Api.getCurrentUserTenantForFile }, { isTransformResponse: false });
};

/**
 * 获取我的文件
 * @param params
 */
export const generateMyFile = (params) => {
  return defHttp.put({ url: Api.generateMyFile, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 编辑文件
 * @param params
 */
export const updateFile = (params) => {
  return defHttp.put({ url: Api.fileOperate, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 编辑文件
 * @param params
 */
export const edit = (params) => {
  return defHttp.put({ url: Api.edit, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 更新flag
 * @param params
 */
export const deleteFile = (params) => {
  return defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 批量更新flag
 * @param params
 */
export const batchDeleteFile = (params) => {
  return defHttp.delete({ url: Api.batchDeleteFile, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 获取一级文件夹
 * @param params
 */
export const getIzRootFolderList = (params) => {
  return defHttp.get({ url: Api.getIzRootFolderList, params }, { isTransformResponse: false });
};

/**
 * 创建一级文件夹
 * @param params
 */
export const createAFolder = (params) => {
  return defHttp.put({ url: Api.createAFolder, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 通过多个用户id查询用户
 * @param params
 */
export const queryUserByIds = (params) => {
  return defHttp.get({ url: Api.queryUserByIds, params }, { isTransformResponse: false });
};

/**
 * 移动文件
 * @param params
 */
export const moveFiles = (params) => {
  return defHttp.post({ url: Api.moveFiles, params }, { isTransformResponse: false });
};

/**
 * 复制文件
 * @param params
 */
export const copyFiles = (params) => {
  return defHttp.post({ url: Api.copyFiles, params }, { isTransformResponse: false });
};

/**
 * 获取分享文件夹
 * @param params
 */
export const getShareFolder = (params) => {
  return defHttp.get({ url: Api.getShareFolder, params }, { isTransformResponse: false });
};

/**
 * 变更管理员
 * @param params
 */
export const entrustedFolder = (params) => {
  return defHttp.post({ url: Api.entrustedFolder, params }, { isTransformResponse: false });
};

/**
 * 更改权限
 * @param params
 */
export const changeAuth = (params) => {
  return defHttp.post({ url: Api.changeAuth, params }, { isTransformResponse: false });
};

/**
 * 退出共享文件夹/移除共享文件夹
 * @param params
 */
export const deleteAuth = (params) => {
  return defHttp.delete({ url: Api.deleteAuth, params }, { isTransformResponse: false, joinParamsToUrl: true });
};

/**
 * 删除共享文件夹
 * @param params
 */
export const deleteShareFolder = (params) => {
  return defHttp.delete({ url: Api.deleteShareFolder, params }, { isTransformResponse: false });
};

/**
 * 添加好友权限(邀请好友)
 * @param params
 */
export const addAuthUser = (params) => {
  return defHttp.post({ url: Api.addAuthUser, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 彻底删除
 * @param params
 */
export const removeCompletely = (params) => {
  return defHttp.delete({ url: Api.removeCompletely, params }, { joinParamsToUrl: true, isTransformResponse: false });
};

/**
 * 上传文件
 * @param params
 */
export const uploadFile = (params) => {
  //update-begin---author:wangshuai---date:2023-12-27---for:【QQYUN-7763】知识库，上传新版本报错---
  let headers = {
    'Content-Type': 'multipart/form-data;boundary = ' + new Date().getTime(),
  };
  return defHttp.post({ url: Api.uploadUrl, params, headers }, { isTransformResponse: false });
  //update-end---author:wangshuai---date:2023-12-27---for:【QQYUN-7763】知识库，上传新版本报错---
};

/**
 * 权限修改并添加公告
 * @param params
 */
export const editSysFile = (params) => {
  return defHttp.put({ url: Api.editSysFile, params }, { isTransformResponse: false });
};

/**
 * 获取文件详情
 * @param params
 */
export const getFileDetail = (params) => {
  return defHttp.get({ url: Api.getFileDetail, params }, { isTransformResponse: false });
};

/**
 * 获取日志
 * @param params
 */
export const getDetailLog = (params) => {
  return defHttp.get({ url: Api.getDetailLog, params }, { isTransformResponse: false });
};

/**
 * 更新下载数
 * @param params
 */
export const updateDownNum = (params) => {
  return defHttp.put({ url: Api.updateDownNum, params }, { isTransformResponse: false });
};

/**
 * 获取权限
 * @param params
 */
export const getAuth = (params) => {
  return defHttp.get({ url: Api.getAuth, params }, { isTransformResponse: false });
};

/**
 * 批量还原
 * @param params
 */
export const batchReductionFile = (params) => {
  return defHttp.put({ url: Api.batchReductionFile, params }, { isTransformResponse: false });
};

/**
 * 根据id获取父级名称
 * @param params
 */
export const getPNameByPId = (params) => {
  return defHttp.get({ url: Api.getPNameByPId, params }, { isTransformResponse: false });
};

/**
 * 获取分享文件
 * @param params
 */
export const getShareFile = (params) => {
  return defHttp.get({ url: Api.shareFile, params }, { isTransformResponse: false });
};

/**
 * 添加到我的文件
 * @param params
 */
export const addMyFiles = (params) => {
  return defHttp.post({ url: Api.addMyFiles, params }, { isTransformResponse: false });
};

/**
 * 获取租户id
 * @param params
 */
export const getTenantId = (params) => {
  return defHttp.get({ url: Api.getTenantId, params }, { isTransformResponse: false });
};

/**
 * 更新阅读数量
 * @param params
 */
export const updateReadCount = (params) =>{
  return defHttp.put({ url: Api.updateReadCount, params }, { isTransformResponse: false, joinParamsToUrl: true });
}
