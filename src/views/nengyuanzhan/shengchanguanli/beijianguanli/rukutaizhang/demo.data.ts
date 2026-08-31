import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { defHttp } from '@/utils/http/axios';
import { render } from '@/utils/common/renderUtils';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '入库主题',
    dataIndex: 'subject',
    width: 150,
    resizable: true,
  },
  {
    title: '入库类型',
    dataIndex: 'sheetType',
    width: 170,
    resizable: true,
    customRender: ({ text }) => {
      if (text === '1') {
        return '普通入库';
      } else if (text ==='2') {
        return '领用退还';
      }
    },
  },
  {
    title: '入库单号',
    dataIndex: 'sheetNo',
    width: 130,
    resizable: true,
  },
  {
    title: '入库日期',
    dataIndex: 'opDate',
    width: 140,
    resizable: true,
  },
  {
    title: '入库申请人',
    dataIndex: 'applicantName',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '所在部门A',
  //   dataIndex: 'deptName',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '仓库名称A',
  //   dataIndex: 'storageLocation',
  //   width: 140,
  //   resizable: true,
  // },
  //
  // {
  //   title: '仓库管理员A',
  //   dataIndex: 'faultTime',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '入库人员A',
  //   dataIndex: 'faultTime',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '所在部门A',
  //   dataIndex: 'faultTime',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '入库数量A',
  //   dataIndex: 'faultTime',
  //   width: 140,
  //   resizable: true,
  // },
  //
  // {
  //   title: '备注A',
  //   dataIndex: 'remark',
  //   width: 140,
  //   resizable: true,
  // },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'sheetNo',
    label: '入库单号',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'subject',
    label: '入库主题',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
];
export const columnsModalShebei: BasicColumn[] = [
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备编码',
    dataIndex: 'deviceCode',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备型号',
    dataIndex: 'deviceModule',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '所属部门',
    dataIndex: 'sysOrgCode',
    width: 170,
    resizable: true,
    ellipsis: true,
    // dict:'sys_depart,org_code,depart_name',
  },
  {
    title: '设备位置',
    dataIndex: 'spaceId',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '设备经度',
  //   dataIndex: 'lo',
  //   width: 170,
  //   resizable: true,
  // },
  // {
  //   title: '设备纬度',
  //   dataIndex: 'la',
  //   width: 130,
  //   resizable: true,
  // },
  {
    title: '设备状态',
    dataIndex: 'deviceStatus',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text == 1) {
        return '在途';
      } else if (text == 2) {
        return '待维修';
      } else if (text == 3) {
        return '维修中';
      } else if (text == 4) {
        return '入库';
      }
    },
  },
  {
    title: '厂家',
    dataIndex: 'factory',
    width: 140,
    resizable: true,
  },
  {
    title: '设备责任人',
    dataIndex: 'official',
    width: 140,
    resizable: true,
  },
  {
    title: '设备使用人',
    dataIndex: 'user',
    width: 140,
    resizable: true,
  },

  {
    title: '购置日期',
    dataIndex: 'purchaseDate',
    width: 140,
    resizable: true,
  },
  {
    title: '使用寿命',
    dataIndex: 'serviceLife',
    width: 140,
    resizable: true,
  },
  {
    title: '设备图片',
    dataIndex: 'devicePic',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (!text) {
        return text;
      }
      return render.renderImage({ text });
    },
  },
  {
    title: '保修期(月)',
    dataIndex: 'warranty',
    width: 140,
    resizable: true,
  },
  {
    title: '巡检点检周期(月)',
    dataIndex: 'cycle',
    width: 140,
    resizable: true,
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    width: 140,
    resizable: true,
  },
  {
    title: '二维码',
    dataIndex: '',
    width: 140,
    resizable: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1) {
        return '在途';
      } else if (text === 2) {
        return '待维修';
      } else if (text === 3) {
        return '维修中';
      } else {
        return '入库';
      }
    },
  },
  // {
  //   title: '创建人',
  //   dataIndex: 'createBy',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '创建时间',
  //   dataIndex: 'createTime',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '修改人',
  //   dataIndex: 'updateBy',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '修改时间',
  //   dataIndex: 'updateTime',
  //   width: 140,
  //   resizable: true,
  // },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchemaShebei: FormSchema[] = [
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'Input',
    colProps: { span: 12 },
  },
  {
    field: 'deviceTypeId',
    label: '设备类型',
    component: 'ApiTreeSelect', // ⭐ 官方推荐
    colProps: { span: 12 },
    componentProps: {
      api: () => defHttp.get({ url: '/operation/operationDimDeviceType/ddl' }), // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    label: 'CAD图纸编码',
    field: '',
    component: 'Input',
    colProps: { span: 12 },
  },
  {
    field: 'spaceId',
    label: '设备位置',
    component: 'ApiTreeSelect',
    colProps: { span: 12 },
    componentProps: {
      api: () => defHttp.get({ url: '/operation/dimSpace/ddl' }), // 如果有单独位置接口，替换成 getSpaceTree
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
];
