import { defHttp } from '/@/utils/http/axios';

enum Api {
  list = '/modelInspection/knowledgeItem/listFlat',
  detail = '/modelInspection/knowledgeItem/detail',
  add = '/modelInspection/knowledgeItem/add',
  edit = '/modelInspection/knowledgeItem/edit',
  delete = '/modelInspection/knowledgeItem/delete',
}

export const listInspectionItemKnowledge = (params) => defHttp.get({ url: Api.list, params });

export const queryInspectionItemKnowledgeDetail = (params) => defHttp.get({ url: Api.detail, params });

export const addInspectionItemKnowledge = (params) => defHttp.post({ url: Api.add, params });

export const editInspectionItemKnowledge = (params) => defHttp.put({ url: Api.edit, params });

export const deleteInspectionItemKnowledge = (params) => defHttp.delete({ url: Api.delete, params }, { joinParamsToUrl: true });
