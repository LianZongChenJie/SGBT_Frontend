import { BasicColumn, FormSchema } from '/@/components/Table';
import { getAllMaterialList, getAllWarehouseList, getLimitWarehouseList } from './api';

export const columns: BasicColumn[] = [
    {
        title: '仓库名称',
        dataIndex: 'warehouseName',
        align: "center",
    },
    {
        title: '物料分类',
        dataIndex: 'typeName',
        align: "center",
    },
    {
        title: '物料名称',
        dataIndex: 'materialName',
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
    },
    {
        title: '可申请数量',
        dataIndex: 'num',
        align: "center",

    },
    {
        title: '库存数据',
        customRender: ({ record }) => {
            // 可申请数量 = 库存数量(num) - 使用中数量(usingNum)
            const availableNum = (record.num || 0) + (record.usingNum || 0);
            return availableNum > 0 ? availableNum : 0;
        },
    }
];
export const detailColumns: BasicColumn[] = [
    {
        title: '单号',
        dataIndex: 'code',
        align: "center",
    },
    {
        title: '出入库类型',
        dataIndex: 'type',
        align: "center",
        customRender: ({ record }) => {
            let v = record.type ? (record.type == 'in' ? '入库' :(record.type == 'out' ? '出库' :'退库') ) : '';
            return v;
        }
    },
    {
        title: '可申请数量',
        dataIndex: 'num',
        align: "center",

    },
    {
        title: '价格',
        dataIndex: 'price',
        align: "center",
        customRender: ({ record }) => {
            let v = record.price ? Number(record.price).toFixed(2) : '';
            return v;
        }
    },
    {
        title: '时间 ',
        dataIndex: 'time',
        align: "center",
    },
    {
        title: '操作人',
        dataIndex: 'personName',
        align: "center",
    }
];
export const inventoryDetailColumns: BasicColumn[] = [
    {
        title: '单号',
        dataIndex: 'code',
        align: "center",
    },
    {
        title: '物料分类',
        dataIndex: 'materialTypeName',
        align: "center",
    },
    {
        title: '物料名称',
        dataIndex: 'materialName',
        align: "center",
    },
    {
        title: '仓库名称',
        dataIndex: 'warehouseName',
        align: "center",
    },
    {
        title: '出入库类型',
        dataIndex: 'type',
        align: "center",
        customRender: ({ record }) => {
          let v = record.type ? (record.type == 'in' ? '入库' : record.type == 'out' ? '出库' : '退库') : '';
            return v;
        }
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

    },
    {
        title: '数量',
        dataIndex: 'num',
        align: "center",

    },
    {
        title: '价格',
        dataIndex: 'price',
        align: "center",
        customRender: ({ record }) => {
            let v = record.price ? Number(record.price).toFixed(2) : '';
            return v;
        }
    },
    {
        title: '时间 ',
        dataIndex: 'time',
        align: "center",
    },
    {
        title: '操作人',
        dataIndex: 'personName',
        align: "center",
    }
];
export const searchFormDetailSchema: FormSchema[] = [
    {
        field: 'warehouseName',
        label: '仓库名称',
        component: 'ApiSelect',
        colProps: { span: 8 },
        componentProps: () => {
            return {
                api: getLimitWarehouseList,
                numberToString: true,
                labelField: 'name',
                valueField: 'name',
                immediate: false,
            }
        },
    },
    {
        field: 'materialName',
        label: '物料名称',
        component: 'Input',
        colProps: { span: 8 },
    },
    {
        field: 'materialTypeName',
        label: '物料分类',
        component: 'Input',
        colProps: { span: 8 },
    },
    {
        field: 'time',
        component: 'RangePicker',
        label: '时间',
        componentProps: {
            valueType: 'Date',
        },
        colProps: {
            span: 8,
        },
    }];

export const formSchema: FormSchema[] = [
    {
        label: '主键',
        field: 'id',
        component: 'Input',
        show: false,
    },
    {
        label: '仓库名称',
        field: 'warehouseId',
        component: 'ApiSelect',
        required: true,
        componentProps: ({ formModel }) => {
            return {
                api: getAllWarehouseList,
                numberToString: true,
                labelField: 'name',
                valueField: 'id',
                immediate: false,
                onChange: (_, values) => {
                    console.log(values)
                    if (!values) {
                        formModel.warehouseName = '';
                        return;
                    }
                    formModel.warehouseName = values.label;
                    // warehouseVal.warehouseId = values.value;
                    // warehouseVal.warehouseName = values.label;
                }
            }
        },
    },
    {
        label: '仓库名称2',
        field: 'warehouseName',
        component: 'Input',
        show: false
    },
    {
        label: '物料名称',
        field: 'materialId',
        component: 'Select',
        required: true,
        slot: 'materialName',
        // componentProps: () => {
        //     return {
        //         api: getAllMaterialList,
        //         numberToString: true,
        //         labelField: 'name',
        //         valueField: 'id',
        //         immediate: false,
        //     }
        // },

    },
    // {
    //     label: '规格',
    //     field: 'specification',
    //     component: 'Input',
    //     required: true,
    // },
    // {
    //     label: '单位',
    //     field: 'unit',
    //     component: 'Input',
    //     required: true,
    // },
    {
        label: '价格',
        field: 'price',
        component: 'InputNumber',
        componentProps: () => {
            return {
                min: 0
            }
        },
        required: true,
    },
    {
        label: '数量',
        field: 'num',
        component: 'InputNumber',
        componentProps: () => {
            return {
                min: 1
            }
        },
        required: true,
    }
];
