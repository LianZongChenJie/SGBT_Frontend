import { defHttp } from '/@/utils/http/axios';

/** 表单设计器的Api */
export enum Api {
  queryById = '/desform/queryById',
  list = '/desform/data/list',
  getColumns = '/desform/getColumns',
  queryByCode = '/desform/queryByCode',
  delete = '/desform/data/${desformCode}/delete',
  deleteBatch = '/desform/data/${desformCode}/deleteBatch',
  // 对接流程地址
  startProcess = '/act/process/extActProcess/startDesFormMutilProcess',
}

/** 列表页面使用的Api */
export const pageApi = {
  /**
   * 列表接口
   * @param params
   */
  list(params) {
    return defHttp.get(
      { url: Api.list, params },
      {
        successMessageMode: 'none',
        errorMessageMode: 'modal',
        isTransformResponse: false,
      }
    );
  },
  /**
   * 获取列配置
   * @param desformCode
   * @param params 额外参数
   * @param options 额外选项
   */
  getColumns(desformCode, params?, options?) {
    return defHttp.get(
      {
        url: Api.getColumns,
        params: { desformCode, ...params },
      },
      {
        errorMessageMode: 'modal',
        ...options,
      }
    );
  },
  /**
   * 删除单个
   * @param desformCode
   * @param id
   * @param onClearSelected 清除选中
   */
  delete: (desformCode, id: string, onClearSelected) => pageApi.batchDelete(desformCode, [id]).then(()=>{
    onClearSelected();
  }),
  /**
   * 批量删除
   * @param desformCode
   * @param idList
   */
  batchDelete(desformCode, idList: string[]) {
    return defHttp.delete(
      {
        url: Api.deleteBatch.replace('${desformCode}', desformCode),
        params: {
          ids: idList.join(','),
        },
      },
      { joinParamsToUrl: true }
    );
  },
};

/** 通过 desformCode 更新或删除表单设计器字段列表 */
export const updateWidgetByKeyModel = (desformCode, value, action, widget) => defHttp.put({
  url: `/desform/api/${desformCode}/updateWidget`,
  params: {
    ...value, action, widget,
  }
})
