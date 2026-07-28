import { defHttp } from '/@/utils/http/axios';

const url = {
  save: '/desform/superQuery/save',
  update: '/desform/superQuery/update',
  remove: '/desform/superQuery/remove',
  rename: '/desform/superQuery/rename',
  copy: '/desform/superQuery/copy',
  list: '/desform/superQuery/list',
  updateSelected: '/desform/superQuery/updateSelected',
};
export function useSuperQueryCurd(props?) {
  async function saveSuperQuery(data) {
    let params = {
      ...data,
      code: props.routeCode,
    };

    const res = await defHttp.post({ url: url.save, params }, { isTransformResponse: false });
    if (res.success) {
      return { id: res.result, code: props.routeCode };
    } else {
      console.error('保存有误', res.message);
    }
    return {};
  }

  async function copySuperQuery(data) {
    let params = {
      ...data,
    };

    const res = await defHttp.post({ url: url.copy, params }, { isTransformResponse: false });
    if (res.success) {
      return { id: res.result, code: props.routeCode };
    } else {
      console.error('复制有误', res.message);
    }
    return {};
  }

  async function udapteSuperQueryTitle(data) {
    let params = {
      ...data,
    };
    const res = await defHttp.post({ url: url.rename, params }, { isTransformResponse: false });
    if (!res.success) {
      console.error('修改有误', res.message);
    }
    return {};
  }

  async function updateSuperQuery(data) {
    let params = {
      ...data,
    };
    await defHttp.post({ url: url.update, params }, { isTransformResponse: false });
  }

  // code selected id
  async function updateSelected(data) {
    let params = {
      ...data,
      code: props.routeCode,
    };
    await defHttp.post({ url: url.updateSelected, params }, { isTransformResponse: false });
  }

  async function removeSuperQuery(id) {
    let params = {
      id: id,
    };
    await defHttp.delete({ url: url.remove, data: params }, { joinParamsToUrl: true });
  }

  async function querySuperQueryList() {
    if(!props.routeCode){
      console.error("加载高级查询配置失败：code为空！")
      return []
    }

    console.info(" ==>==>==> 加载表单的高级查询配置, code:", props.routeCode)
    let params = {
      code: props.routeCode,
    };
    const data = await defHttp.get({ url: url.list, params }, { isTransformResponse: false });
    if (data.success) {
      return data.result;
    }
    return [];
  }

  return {
    saveSuperQuery,
    udapteSuperQueryTitle,
    copySuperQuery,
    updateSuperQuery,
    removeSuperQuery,
    querySuperQueryList,
    updateSelected,
  };
}

/**
 * 获取分组筛选和高级查询参数
 * @param superQueryParams
 */
export function getSuperQueryGroup(superQueryParams) {
  //update-begin---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：查询使用superQueryGroup---
  if (superQueryParams && superQueryParams.superQueryParams) {
    let queryGroupFilter = {
      matchType: superQueryParams.matchType,
      superQueryGroup: superQueryParams.superQueryParams
    }
    return encodeURIComponent(JSON.stringify(queryGroupFilter));
  }
  //update-begin---author:wangshuai---date:2024-06-03---for:【TV360X-784】当筛选不到数据时移除筛选条件，会导致数据无法正常查出来。---
  if (superQueryParams && !superQueryParams.superQueryParams) {
    return {};
  }
  //update-end---author:wangshuai---date:2024-06-03---for:【TV360X-784】当筛选不到数据时移除筛选条件，会导致数据无法正常查出来。---
  return superQueryParams;
  //update-end---author:wangshuai---date:2023-12-29---for:【QQYUN-6815】视图列表查询未支持筛选组功能：查询使用superQueryGroup---
}
