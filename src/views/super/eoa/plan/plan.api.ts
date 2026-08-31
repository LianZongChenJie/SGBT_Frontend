import { defHttp } from '/@/utils/http/axios';
import { Modal } from 'ant-design-vue';

enum Api {
  list = '/eoa/plan/list',
  queryById = '/eoa/plan/queryById',
  save = '/eoa/plan/add',
  edit = '/eoa/plan/edit',
  deletePlan = '/eoa/plan/delete',
  deleteBatch = '/eoa/plan/deleteBatch',
  exportXls = '/eoa/plan/exportXls',
  importExcel = '/eoa/plan/importExcel',
  queryMyPlan = '/eoa/plan/myPlanlist',
  queryMyJoinPlan = '/eoa/plan/queryMyPlan',
  getPlanList = '/eoa/plan/getPlanList',
  getPlanListByPage = '/eoa/plan/getPlanListByPage',
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
 * 根据id查询
 * @param params
 */
export const queryById = (params) => defHttp.get({ url: Api.queryById, params });
/**
 * 删除角色
 */
export const deletePlan = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.deletePlan, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
};
/**
 * 批量删除角色
 * @param params
 */
export const batchDeletePlan = (params, handleSuccess) => {
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
 * 保存或者更新计划
 * @param params
 */
export const saveOrUpdatePlan = (params, isUpdate) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({ url: url, params });
};
/**
 * 我创建参与的计划
 * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
 * @param params
 */
export const queryMyPlan = (params) => defHttp.get({ url: Api.queryMyPlan, params });
/**
 * 我参与的计划
 * @param params
 */
export const queryMyJoinPlan = (params) => defHttp.get({ url: Api.queryMyJoinPlan, params }, { isTransformResponse: false });

/**
 * 查询我（当前登录用户）参与的日程/负责的日程/分类
 * @param params
 */
export const getPlanList = (params) => defHttp.get({ url: Api.getPlanList, params },{ isTransformResponse: false });

/**
 * 分页查询我（当前登录用户）参与的日程/负责的日程/分类
 * @param params
 */
export const getPlanListByPage = (params) => defHttp.get({ url: Api.getPlanListByPage, params },{ isTransformResponse: false });
