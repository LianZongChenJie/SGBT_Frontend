import { defHttp } from '/@/utils/http/axios';

enum Api {
  /** 海康摄像头分组包（分组 + 摄像头） */
  cameraPackageGroup = '/bems/hikvision/camera/packageGroup',
  /** 海康摄像头本地播放地址 */
  cameraLocalPlayUrl = '/bems/hikvision/camera/localPlayUrl',
  /** 海康摄像头分页列表 */
  cameraPage = '/bems/hikvision/camera/page',
  /** 海康摄像头播放心跳续期（streamKey 取摄像头唯一编码 cameraIndexCode） */
  cameraHeartbeat = '/bems/hikvision/camera/heartbeat',
}

/** 摄像头 / 分组树节点 */
export interface MonitorTreeNode {
  /** 唯一标识（分组或摄像头编码） */
  key?: string | number;
  /** 名称 */
  title?: string;
  name?: string;
  value?: string | number;
  /** 是否为摄像头节点：'true' 表示摄像头，分组节点无该字段 */
  camera?: string | boolean;
  /** 设备编码 */
  deviceCode?: string;
  /** 摄像头编码 */
  cameraCode?: string;
  /** 海康摄像头唯一编码 */
  cameraIndexCode?: string;
  indexCode?: string;
  /** 视频流地址（若节点直接返回） */
  url?: string;
  /** 在线状态：1-在线 0-离线（兼容布尔/字符串） */
  online?: number | string | boolean;
  status?: number | string;
  children?: MonitorTreeNode[];
  [key: string]: any;
}

/** 摄像头分组树 - 摄像头对象（海康资源树） */
export interface PackageVideo {
  /** 摄像头唯一编码 */
  indexCode?: string;
  /** 摄像头名称 */
  name: string;
  /** 在线状态：0-离线 1-在线 */
  online?: number | string | boolean;
  [key: string]: any;
}

/** 摄像头分组树 - 分组对象（区域/分组通用，海康资源树） */
export interface PackageGroup {
  /** 区域唯一编码 */
  indexCode: string;
  /** 区域名称 */
  name: string;
  /** 直接挂载的摄像头列表 */
  videoList?: PackageVideo[];
  /** 子区域列表 */
  children?: PackageGroup[];
  [key: string]: any;
}

/** 获取海康摄像头分组包（分组 + 摄像头树） */
export const getCameraPackageGroup = (params?) => defHttp.get({ url: Api.cameraPackageGroup, params });

/** 获取海康摄像头本地播放地址（入参为摄像头 indexCode） */
export const getCameraLocalPlayUrl = (params: { cameraIndexCode: string }) =>
  defHttp.get({ url: Api.cameraLocalPlayUrl, params });

/**
 * 摄像头播放心跳续期
 * 播放期间按固定间隔上报 streamKey（取摄像头唯一编码 cameraIndexCode），避免服务端提前回收视频流
 * 说明：joinParamsToUrl 让 streamKey 同时出现在 query 与 JSON body 中，
 * 兼容后端 @RequestParam 与 @RequestBody 两种接收方式（避免出现“流标识不能为空”）
 */
export const sendCameraHeartbeat = (params: { streamKey: string }) =>
  defHttp.post({ url: Api.cameraHeartbeat, params }, { joinParamsToUrl: true, errorMessageMode: 'none' });

/** 摄像头分页列表记录 */
export interface CameraRecord {
  id?: string | number;
  /** 摄像头名称 */
  cameraName?: string;
  /** 海康摄像头唯一编码 */
  cameraIndexCode?: string;
  cameraCode?: string;
  indexCode?: string;
  /** 所属区域 */
  regionName?: string;
  /** 监控点类型：0-枪机，1-半球，2-快球，3-带云台枪机 */
  cameraType?: number | string;
  /** 在线状态：1-在线 0-离线（兼容布尔/字符串） */
  online?: number | string | boolean;
  status?: number | string;
  updateTime?: string;
  [key: string]: any;
}

/** 分页获取海康摄像头列表 */
export const getCameraPage = (params?: { pageNo?: number; pageSize?: number; [key: string]: any }) =>
  defHttp.get({ url: Api.cameraPage, params });
