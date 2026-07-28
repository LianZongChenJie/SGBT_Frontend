import {defHttp} from '/@/utils/http/axios';

enum Api {
    list = '/operation/patrol/history/list',
    exportXls = '/operation/patrol/history/exportXls',
    importExcel = '/operation/patrol/history/importExcel',
    queryCameraRecords = '/operation/patrol/history/queryCameraRecords',
    queryAlarmRecords = '/operation/patrol/history/queryAlarmRecords',
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
 * 查询示例列表
 * @param params
 */
export const getDemoList = (params) => {
    return defHttp.get({url: Api.list, params});
};

export const getQueryCameraRecords = (params) => {
    return defHttp.get({url: Api.queryCameraRecords, params});
};
export const getQueryAlarmRecords = (params) => {
    return defHttp.get({url: Api.queryAlarmRecords, params});
};

