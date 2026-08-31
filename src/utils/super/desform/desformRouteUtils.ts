import { router } from '/@/router';
import { defHttp } from '/@/utils/http/axios';
import { createLocalStorage } from '/@/utils/cache';

const ls = createLocalStorage();

/** 表单设计器路由类型 */
export enum DESFORM_ROUTE_TYPE {
  /** 跳转到表单 */
  form = '1',
  /** 跳转到菜单 */
  menu = '2',
  /** 跳转到外部链接 */
  href = '3',
}

/** 表单设计器路由跳转带过来的ID名字 */
export const DESFORM_ROUTE_DATA_ID = 'routeDataId';
export const DESFORM_ROUTE_FORM_CODE = 'routeFormCode';

/**
 * 获取当前路由或指定路由的 routeDataId
 *
 * @param $route 路由对象，默认为当前路由
 */
export function getDesformRouteDataId($route) {
  if (arguments.length === 0) {
    $route = router.currentRoute.value;
  }
  if ($route) {
    return $route.query[DESFORM_ROUTE_DATA_ID];
  }
  return null;
}

/**
 * 获取当前路由或指定路由的 routeFormCode
 *
 * @param $route 路由对象，默认为当前路由
 */
export function getDesformRouteFormCode($route) {
  if (arguments.length === 0) {
    $route = router.currentRoute.value;
  }
  if ($route) {
    return $route.query[DESFORM_ROUTE_FORM_CODE];
  }
  return null;
}

/**
 * 根据路由跳转带过来的ID来获取表单设计器的数据
 * @param desformCode
 * @param param 表单设计器路由跳转带过来的ID（可以直接传id字符串，也可以传 this.$route，自动从$route里获取id，如果不传就获取当前路由的参数）
 * @returns {Promise<void>}
 */
export async function getDesformDataByRouteDataId(desformCode, param) {
  if (!param) {
    param = router.currentRoute.value;
  }
  let id;
  if (typeof param == 'string') {
    id = param;
  } else if (typeof param.query === 'object') {
    id = getDesformRouteDataId(param);
    if (!id) {
      // 当前$route.query里没有带表单设计器路由ID，直接返回null
      return null;
    }
  } else {
    throw new Error('传递的参数不能识别，可以直接传id字符串，也可以传 this.$route，自动从$route里获取id，如果不传就获取当前路由的参数');
  }
  let url = `/desform/data/queryById?id=${id}&desformCode=${desformCode}`;
  let { success, result, message } = await defHttp.get({ url });
  if (success) {
    result.desformDataJson = JSON.parse(result.desformDataJson);
    return result;
  } else {
    throw new Error('表单设计器路由数据获取失败：' + message);
  }
}

// update-begin--author:sunjianlei---date:220230512---for： 【QQYUN-3874】【安全】加个新路由支持表单列表和表单填报页面采用表单ID来访问

// 通过 id 访问的表单设计器
export const DESFORM_VIEW_BY_ID_NAME = 'myapp-@appId-form-@formId';
export const isDesformViewById = (name: any) => name === DESFORM_VIEW_BY_ID_NAME;

/**
 * 通过 desformId 查询出 desformCode
 * @param desformId
 */
export async function queryDesformCodeById(desformId: string): Promise<string> {
  // 从缓存中获取
  let code = ls.get('DESFORM_ID_TO_CODE__' + desformId);
  if (code) {
    return code;
  }
  // 通过 id 查询 desformCode
  code = await defHttp.get(
    {
      url: '/desform/api/queryCodeById',
      params: { id: desformId },
    },
    { successMessageMode: 'none' }
  );
  if (code == null || code == '') {
    throw new Error('通过id查询表单code失败');
  }
  // 将结果缓存，由于code和id的对应关系不会变，所以无需设置过期时间
  ls.set('DESFORM_ID_TO_CODE__' + desformId, code);
  return code;
}

/**
 * 通过 desformCode 查询出 desformId
 * @param desformCode
 */
export async function queryDesformIdByCode(desformCode: string): Promise<string> {
  // 从缓存中获取
  let id = ls.get('DESFORM_CODE_TO_ID__' + desformCode);
  if (id) {
    return id;
  }
  // 通过 desformCode 查询 id
  id = await defHttp.get(
    {
      url: '/desform/api/queryIdByCode',
      params: { desformCode: desformCode },
    },
    { successMessageMode: 'none' }
  );
  if (id == null || id == '') {
    throw new Error('通过表单code查询id失败');
  }
  // 将结果缓存，由于code和id的对应关系不会变，所以无需设置过期时间
  ls.set('DESFORM_CODE_TO_ID__' + desformCode, id);
  return id;
}

// update-end--author:sunjianlei---date:220230512---for： 【QQYUN-3874】【安全】加个新路由支持表单列表和表单填报页面采用表单ID来访问
