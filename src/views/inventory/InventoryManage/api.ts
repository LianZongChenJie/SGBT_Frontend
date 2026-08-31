import { defHttp } from '@/utils/http/axios';
import { saveAs } from 'file-saver';
enum Api {
    list = '/jeecg-demo/admin/inventory/list',
    add = '/jeecg-demo/admin/inventoryRecord/in',
    allMaterial = '/jeecg-demo/admin/material/all',
    allWarehouse = '/jeecg-demo/admin/warehouse/all',
    limitWarehouse = '/jeecg-demo/admin/warehouse/listWithLimit',
    detailListApi = '/jeecg-demo/admin/inventoryRecord/list',
    importXls = '/jeecg-demo/admin/inventoryRecord/excelIn',
}
/**
 * 导入地址
 */
// export const importUrl = (data: any) => {
//     const formData = new FormData();
//     formData.append('file', data.file);
//     formData.append('warehouseId', data.data.warehouseId);
//     formData.append('tableDataId', data.data.warehouseName);
//     return defHttp.uploadMyFile({ url: Api.importXls, formData });
// }
export const uploadMyFile = (data: any) => {
    return defHttp.uploadMyFile(Api.importXls, data);
};
/**
 * 获取所有物料
 */
export const getAllMaterialList = () => defHttp.get({ url: Api.allMaterial });
/**
 * 获取所有仓库名称
 */
export const getAllWarehouseList = () => defHttp.get({ url: Api.allWarehouse });
/**
 * 获取部分仓库名称
 */
export const getLimitWarehouseList = () => defHttp.get({ url: Api.limitWarehouse });
export const listApi = (params: any) => {
    if (params.materialName) {
        params.materialName = '*' + params.materialName + '*';
    }
    if (params.typeName) {
        params.typeName = '*' + params.typeName + '*';
    }
    return defHttp.get({ url: Api.list, params });
};
export const saveApi = (params: any) => {
    return defHttp.post({ url: Api.add, params });
};
export const detailListApi = (params: any) => {
    if (params.materialName) {
        params.materialName = '*' + params.materialName + '*';
    }
    if (params.materialTypeName) {
        params.materialTypeName = '*' + params.materialTypeName + '*';
    }
    return defHttp.get({ url: Api.detailListApi, params });
};
// export const getExportUrl = (params: any) => {
//     return defHttp.post({ url: Api.exportXls, params, responseType: 'blob', }, { joinParamsToUrl: true }, { isTransformResponse: false });
// };
export const getExportUrl = async (params: any, filename = '导出数据.xlsx', url: String) => {
    try {
        const res = await defHttp.post(
            {
                url: url,
                params,
                responseType: 'blob',
            },
            {
                joinParamsToUrl: true,
                isReturnNativeResponse: true, // 获取完整 Response
                isTransformResponse: false,   // 禁止默认数据转换
            }
        );

        const blob = new Blob([res.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        console.log(blob);
        saveAs(blob, filename);
    } catch (err) {
        console.error('导出失败', err);
    }
};
