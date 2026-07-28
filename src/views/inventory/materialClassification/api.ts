import {defHttp} from "@/utils/http/axios";

enum Api {
    list = '/jeecg-demo/admin/materialType/list',
    add = '/jeecg-demo/admin/materialType/add',
    edit = '/jeecg-demo/admin/materialType/edit',
    delete = '/jeecg-demo/admin/materialType/delete',
}

export const listApi = (params: any) => {
    if (params.name) {
        params.name = '*' + params.name + '*'
    }
    return defHttp.get({url: Api.list, params});
};
export const saveApi = (params: any, isUpdate: boolean) => {
    return defHttp.post({url: isUpdate ? Api.edit : Api.add, params});
};
export const deleteApi = (params, handleSuccess) => {
    return defHttp.delete({url: Api.delete, params}, {isTransformResponse: false, joinParamsToUrl: true})
        .then(() => {
            handleSuccess();
        });
};
