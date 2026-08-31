import { unref } from 'vue';
import { defHttp } from '/@/utils/http/axios';

/** 表单设计器的Api */
export enum Api {
  list = '/desform/list',
  delete = '/desform/delete',
  deleteBatch = '/desform/deleteBatch',
  exportXlsUrl = 'desform/exportXls',
  importExcelUrl = 'desform/importExcel',

  // 表单接口
  add = '/desform/add',
  edit = '/desform/edit',
  templet = '/desform/templet/packageOptions',

  // 配置地址
  editAllStatus = '/desform/url/editAllStatus',
  queryAllStatus = '/desform/url/queryAllStatus',
}

/** Online表单接口
 *  NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ== */
export enum CgformApi {
  headList = '/online/cgform/head/list',
  // 通过 headId 查询字段
  fieldListByHeadId = '/online/cgform/field/listByHeadId',
  fieldListByHeadCode = '/online/cgform/field/listByHeadCode',
}

/** 列表页面使用的Api */
export const pageApi = {
  /**
   * 列表接口
   * @param params
   */
  list: (params) => defHttp.get({ url: Api.list, params }),
  /**
   * 删除单个
   * @param id
   */
  delete: (id: string) => defHttp.delete({ url: Api.delete, params: { id: id } },{ joinParamsToUrl: true }),
  /**
   * 批量删除
   * @param idList
   */
  batchDelete(idList: string[]) {
    return defHttp.delete(
      {
        url: Api.deleteBatch,
        params: {
          ids: idList.join(','),
        },
      },
      { joinParamsToUrl: true }
    );
  },
};

/** 表单使用的Api */
export const formApi = {
  /**
   * 新增或修改
   * @param params 要提交的表单数据
   * @param isUpdate 是否修改
   */
  saveOrUpdate(params, isUpdate) {
    if (isUpdate) {
      return defHttp.put({url: Api.edit, params, timeout: 60000});
    } else {
      return defHttp.post({ url: Api.add, params, timeout: 60000}, { successMessageMode: 'none' });
    }
  },
  /** 查询表单设计器模板 */
  queryTemplet: (params?) => {
    return defHttp.get({ url: Api.templet, params: { returnJson: true, ...params } }, { isTransformResponse: false });
  },
  /** 查询online表单 */
  queryCgformList: (params?) => {
    return defHttp.get({ url: CgformApi.headList, params: { pageNo: 1, pageSize: 9999, ...params } }, { isTransformResponse: false });
  },
};

/** online表单api */
export const onlineApi = {
  /**
   * 通过 headCode 查询online表单的字段
   * @param headCode headCode
   * @param params
   */
  fieldListByHeadCode(headCode: string, params?) {
    return defHttp.get(
      {
        url: '/online/cgform/field/listByHeadCode',
        params: { headCode, ...params },
      },
      {
        successMessageMode: 'none',
        isTransformResponse: false,
      }
    );
  },
};

/** 配置地址弹窗Api */
export const addressApi = {
  /**
   * 修改按钮状态
   * @param desformCode
   * @param params
   */
  editAllStatus: (desformCode, params?) => defHttp.put({ url: Api.editAllStatus, params: { desformCode, ...params } }),
  /**
   * 查询按钮状态
   * @param desformCode
   * @param params
   */
  queryAllStatus: (desformCode, params?) => defHttp.get({ url: Api.queryAllStatus, params: { desformCode, ...params } }),
};

/** 表单设计器模板的Api */
export enum TempletApi {
  list = '/desform/templet/list',
  deleteBatch = '/desform/templet/deleteBatch',
  add = '/desform/templet/add',
  edit = '/desform/templet/edit',
}

/** 模板页面使用的Api */
export const templetApi = {
  /**
   * 列表接口
   * @param params
   */
  list: (params) => defHttp.get({ url: TempletApi.list, params }),
  /**
   * 删除单个
   * @param id
   */
  delete: (id: string) => templetApi.batchDelete([id]),
  /**
   * 批量删除
   * @param idList
   */
  batchDelete(idList: string[]) {
    return defHttp.delete(
      {
        url: TempletApi.deleteBatch,
        params: {
          ids: idList.join(','),
        },
      },
      { joinParamsToUrl: true }
    );
  },
  /**
   * 新增或修改
   * @param params 要提交的表单数据
   * @param isUpdate 是否修改
   */
  saveOrUpdate(params, isUpdate) {
    if (unref(isUpdate)) {
      return defHttp.put({ url: TempletApi.edit, params });
    } else {
      return defHttp.post({ url: TempletApi.add, params });
    }
  },
};
