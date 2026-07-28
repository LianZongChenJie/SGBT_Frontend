import { defHttp } from "@/utils/http/axios";


enum Api {
    list = '/jeecg-demo/admin/warehouse/list',
    add = '/jeecg-demo/admin/warehouse/add',
    edit = '/jeecg-demo/admin/warehouse/edit',
    delete = '/jeecg-demo/admin/warehouse/delete',
    allOrganization = '/sys/sysDepart/searchBy'
}
/**
 * 获取组织名称
 */
export const getAllOrganizationList = (params) => defHttp.get({ url: Api.allOrganization, params });
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
