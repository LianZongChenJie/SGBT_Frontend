import { defHttp } from '/@/utils/http/axios';

enum Api {
  /** 海康摄像头分组包（分组 + 摄像头） */
  cameraPackageGroup = '/bems/hikvision/camera/packageGroup',
  /** 海康摄像头本地播放地址 */
  cameraLocalPlayUrl = '/bems/hikvision/camera/localPlayUrl',
  /** 海康摄像头分页列表 */
  cameraPage = '/bems/hikvision/camera/page',
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

/** 获取海康摄像头分组包（分组 + 摄像头树） */
export const getCameraPackageGroup = (params?) => defHttp.get({ url: Api.cameraPackageGroup, params });

/** 获取海康摄像头本地播放地址（入参为摄像头 indexCode） */
export const getCameraLocalPlayUrl = (params: { cameraIndexCode: string }) =>
  defHttp.get({ url: Api.cameraLocalPlayUrl, params });

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
