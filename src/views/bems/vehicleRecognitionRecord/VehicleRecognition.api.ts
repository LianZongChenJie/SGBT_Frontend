import { defHttp } from '/@/utils/http/axios';

enum Api {
  // 车辆识别记录分页列表
  getVehicleRecognitionRecordListApi = '/bems/vehicleRecognitionRecord/listPage',
}

/**
 * 获取车辆识别记录分页列表
 * @param params 查询参数
 */
export const getVehicleRecognitionRecordListApi = (params) =>
  defHttp.get({ url: Api.getVehicleRecognitionRecordListApi, params });
