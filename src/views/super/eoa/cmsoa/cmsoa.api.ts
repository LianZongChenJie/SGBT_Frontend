import { defHttp } from '/@/utils/http/axios';

enum Api {
  getSiteInfo = '/eoa/cms/eoaCmsSite/getSiteInfo',
  getUserNoticeInfo = '/sys/sysAnnouncementSend/getMyAnnouncementSend',
  queryPortalSite = '/eoa/cms/eoaPortalSite/queryPortal',
  editReadStatus = '/sys/sysAnnouncementSend/editByAnntIdAndUserId',
  recordReader = '/eoa/cms/eoaCmsArticleRead/recordReader',
  queryArticleById = '/eoa/cms/eoaCmsArticle/queryById',
  readList = '/eoa/cms/eoaCmsArticleRead/list',
  menuArticlelist = '/eoa/cms/eoaCmsArticle/menuArticlelist',
}
/**
 * 加载站点信息
 * @param params
 */
export const getSiteInfo = (params?) => defHttp.get({ url: Api.getSiteInfo, params }, { isTransformResponse: false });
/**
 * 加载我的通告信息
 * @param params
 */
export const getUserNoticeInfo = (params?) => defHttp.get({ url: Api.getUserNoticeInfo, params }, { isTransformResponse: false });
/**
 * 门户查询
 * @param params
 */
export const queryPortalSite = (params) => defHttp.get({ url: Api.queryPortalSite, params }, { isTransformResponse: false });
/**
 * 更新通知公告阅读状态
 * @param params
 */
export const editReadStatus = (params) => defHttp.put({ url: Api.editReadStatus, params }, { isTransformResponse: false });
/**
 * 查询文章
 * @param params
 */
export const queryArticleById = (params?) => defHttp.get({ url: Api.queryArticleById, params }, { isTransformResponse: false });
/**
 * 更新次数
 * @param params
 */
export const recordReader = (params?) => defHttp.get({ url: Api.recordReader, params }, { isTransformResponse: false });
/**
 * 记录列表
 * @param params
 */
export const readList = (params?) => defHttp.get({ url: Api.readList, params });
/**
 * 栏目文章列表
 * @param params
 */
export const menuArticlelist = (params?) => defHttp.get({ url: Api.menuArticlelist, params }, { isTransformResponse: false });
