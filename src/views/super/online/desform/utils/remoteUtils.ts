import type {Result} from "#/axios";
import {defHttp} from "@/utils/http/axios";

/**
 * 直接请求
 * @param url
 */
export const getAction = (url: string) => defHttp.get({url: url}, {isTransformResponse: false});

const getTransitURL = (url: string) => `/sys/common/transitRESTful?url=${encodeURIComponent(url)}`;
// 中转HTTP请求
const transitRESTful = {
  get: (url: string, params?: Recordable) => defHttp.get({
    url: getTransitURL(url),
    params: params,
  }, {isTransformResponse: false}),
};

type OptionsType = {
  value: string;
  label: string;
  text: string;
}[]

// 远端选项缓存
const REMOTE_OPTIONS_CACHE_MAP = new Map<string, Promise<OptionsType>>()

// 从缓存中获取远端字典选项
export async function queryRemoteOptionsCache(widget: Recordable) {
  const {options: {remoteFunc}} = widget
  const remoteUrl = remoteFunc.trim()
  let remoteOptions: OptionsType | undefined = undefined
  let doQuery = false
  if (REMOTE_OPTIONS_CACHE_MAP.has(remoteUrl)) {
    let tempPromise: Promise<OptionsType> | undefined = undefined
    try {
      tempPromise = REMOTE_OPTIONS_CACHE_MAP.get(remoteUrl)!
      remoteOptions = await tempPromise
      console.log('[远端选项] 从缓存中获取的:', remoteOptions)
    } catch (e) {
      // 如果缓存中的 Promise 被替换了，则说明其他控件率先重新发起了请求
      if (REMOTE_OPTIONS_CACHE_MAP.get(remoteUrl) !== tempPromise) {
        return queryRemoteOptionsCache(widget)
      }
      // 当缓存中的 Promise 被 reject 时，重新发起请求
      doQuery = true
    }
  } else {
    doQuery = true
  }
  if (doQuery) {
    try {
      const getPromise = queryRemoteOptions(widget)
      REMOTE_OPTIONS_CACHE_MAP.set(remoteUrl, getPromise)
      remoteOptions = await getPromise
      console.log('[远端选项] 从接口中获取的:', remoteOptions)
    } catch (e) {
      console.error('[远端选项] 查询失败', e)
      return []
    }
  }
  if (Array.isArray(remoteOptions)) {
    return convertRemoteOptions(widget, remoteOptions)
  }
  return []
}

interface MyResult<T = OptionsType> extends Result<T> {
  success: boolean;
}

interface MyPageResult<T = OptionsType> extends Omit<MyResult<T>, "result"> {
  result: {
    records: T;
  }
}

// 获取远端字典选项
export async function queryRemoteOptions(widget: Recordable): Promise<OptionsType> {
  const {options: {remoteFunc}} = widget
  const remoteUrl = remoteFunc.trim()
  // 内部请求直接请求，外部请求需要中转
  let response: OptionsType | MyResult | MyPageResult
  if (/^https?/.test(remoteUrl)) {
    response = await transitRESTful.get(remoteFunc)
  } else {
    response = await getAction(remoteFunc)
  }
  let remoteOptions: Nullable<OptionsType> = null
  // 返回值可能存在的情况：
  // 1、直接返回了个数组
  // 2、result是个数组
  // 3、result.records是个数组（后台包裹了分页对象）
  if (Array.isArray(response)) {
    remoteOptions = response
  } else if (response.success) {
    if (Array.isArray(response.result)) {
      remoteOptions = response.result
    } else if (response.result && Array.isArray(response.result.records)) {
      remoteOptions = response.result.records
    }
  }
  if (remoteOptions == null) {
    console.error('远端数据请求失败：', response)
    return Promise.reject(response)
  }
  return remoteOptions
}

function convertRemoteOptions(widget: Recordable, remoteOptions: Recordable[]): OptionsType {
  const {options: {props}} = widget
  return remoteOptions.map(item => {
    return {
      value: item[props.value],
      label: item[props.label],
      text: item[props.label],
      // children: item[options.props.children]
    }
  })
}
