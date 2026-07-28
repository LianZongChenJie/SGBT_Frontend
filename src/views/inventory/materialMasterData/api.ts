import { defHttp } from "@/utils/http/axios";


enum Api {
    list = '/jeecg-demo/admin/material/list',
    add = '/jeecg-demo/admin/material/add',
    edit = '/jeecg-demo/admin/material/edit',
    delete = '/jeecg-demo/admin/material/delete',
    allMaterialClassification = '/jeecg-demo/admin/materialType/all'
}
/**
 * 获取所有物料分类
 */
export const getAllMaterialList = () => defHttp.get({ url: Api.allMaterialClassification });
export const listApi = (params: any) => {
    if (params.name) {
        params.name = '*' + params.name + '*'
    }
    return defHttp.get({ url: Api.list, params });
};
export const saveApi = (params: any, isUpdate: boolean) => {
    return defHttp.post({ url: isUpdate ? Api.edit : Api.add, params });
};
export const deleteApi = (params, handleSuccess) => {
    return defHttp.delete({ url: Api.delete, params }, { isTransformResponse: false, joinParamsToUrl: true })
        .then(() => {
            handleSuccess();
        });
};
