import type { RequestOptions } from '/#/axios';
import { unref } from 'vue';
import { defHttp } from '/@/utils/http/axios';

export enum Api {
  list = '/desform/route/list',
  delete = '/desform/route/delete',
  deleteBatch = '/desform/route/deleteBatch',
  add = '/desform/route/add',
  edit = '/desform/route/edit',
}

/** 列表页面使用的Api */
export const pageApi = {
  /**
   * 列表接口
   * @param desformCode
   * @param params
   */
  list: (desformCode, params?) => defHttp.get({ url: Api.list, params: { desformCode, ...params } }),
  /**
   * 删除单个
   * @param id
   */
  delete: (id: string) => pageApi.batchDelete([id]),
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
   * @param options 其他选项
   */
  saveOrUpdate(params, isUpdate, options?: RequestOptions) {
    if (unref(isUpdate)) {
      return defHttp.put({ url: Api.edit, params }, { ...options });
    } else {
      return defHttp.post({ url: Api.add, params }, { ...options });
    }
  },
};
