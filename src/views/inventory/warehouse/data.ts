import { FormSchema } from '/@/components/Table';
import { getAllOrganizationList } from './api';

export const formSchema: FormSchema[] = [
    {
        label: '主键',
        field: 'id',
        component: 'Input',
        show: false,
    },
    {
        label: '名称',
        field: 'name',
        component: 'Input',
        show: true,
        required: true
    },
    {
        label: '编码',
        field: 'code',
        component: 'Input',
        required: true,
    },
    {
        label: '位置分类',
        field: 'locationClassification',
        component: 'Input',
        required: true,
    },
    {
        label: '管理组织名称',
        field: 'orgId',
        component: 'ApiSelect',
        required: true,
        componentProps: ({ formModel }) => {
            return {
                //mode: 'multiple',
                api: async () => {
                    const organizations = await getAllOrganizationList({ keyWord: '项目部' });
                    return organizations; // 返回完整数据供选择器渲染
                },
                numberToString: true,
                labelField: 'departName',
                valueField: 'id',
                immediate: false,
                onChange: (_, values) => {
                    console.log(values)
                    if (!values) {
                        formModel.orgName = '';
                        return;
                    }
                    formModel.orgName = values.label;
                }
            }
        },

    },
    {
        label: '管理组织名称2',
        field: 'orgName',
        component: 'Input',
        show: false
    },
    {
        label: '备注',
        field: 'description',
        component: 'Input',
    },
];
