import { BasicColumn, FormSchema } from '/@/components/Table';
import { getAllMaterialList } from './api';

export const columns: BasicColumn[] = [
    {
        title: '物料编码',
        dataIndex: 'code',
        align: "center",
    },
    {
        title: '物料分类',
        dataIndex: 'typeName',
        align: "center",
    },
    {
        title: '物料名称',
        dataIndex: 'name',
        align: "center",

    },
    {
        title: '规格',
        dataIndex: 'specification',
        align: "center",
    },
    {
        title: '品牌',
        dataIndex: 'brand',
        align: "center",
    },
    {
        title: '单位',
        dataIndex: 'unit',
        align: "center",
    }
];

export const searchFormSchema: FormSchema[] = [
    {
        field: 'name',
        label: '物料名称	',
        component: 'Input',
        colProps: { span: 8 },
    },
    {
        field: 'typeName',
        label: '物料分类	',
        component: 'ApiSelect',
        componentProps: () => {
            return {
                api: getAllMaterialList,
                numberToString: true,
                labelField: 'name',
                valueField: 'name',
                immediate: false,
            }
        },
        colProps: { span: 8 },
    }];
export const formSchema: FormSchema[] = [
    {
        label: '主键',
        field: 'id',
        component: 'Input',
        show: false,
    },
    {
        label: '物料分类',
        field: 'typeId',
        component: 'ApiSelect',
        required: true,
        componentProps: ({ formModel }) => {
            return {
                //mode: 'multiple',
                api: getAllMaterialList,
                numberToString: true,
                labelField: 'name',
                valueField: 'id',
                immediate: false,
                onChange: (_, values) => {
                    console.log(values)
                    if (!values) {
                        formModel.typeName = '';
                        return;
                    }
                    formModel.typeName = values.label;
                }
            }
        },

    },
    {
        label: '物料分类2',
        field: 'typeName',
        component: 'Input',
        show: false,
    },
    {
        label: '物料名称',
        field: 'name',
        component: 'Input',
        required: true,
    },
    {
        label: '规格',
        field: 'specification',
        component: 'Input',
        required: true,
    },
    {
        label: '品牌',
        field: 'brand',
        component: 'Input',
        required: true,
    },
    {
        label: '单位',
        field: 'unit',
        component: 'Input',
        required: true,
    }
];
