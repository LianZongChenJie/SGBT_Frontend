import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { defHttp } from '@/utils/http/axios';
import { render } from '@/utils/common/renderUtils';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '审核状态',
    dataIndex: 'auditStatus',
    width: 170,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 0){
        return '待审核'
      }else if (text === 1){
        return '通过'
      }
      else if (text === 2){
        return '驳回'
      }else if(text === 3){
        return '已审核'
      }else if(text === 4){
        return '待维修'
      }else if (text === 5) {
        return '维修中'
      }else if (text === 6) {
        return '已撤回'
      }else if (text === 7) {
        return '已完成'
      }else if (text === 8) {
        return '审核中'
      }
    },
  },
  // {
  //   title: '计划状态',
  //   dataIndex: 'status',
  //   width: 170,
  //   resizable: true,
  //   customRender: ({ text }) => {
  //     if (text === 1){
  //       return '开启'
  //     }else if (text === 2){
  //       return '关闭'
  //     }
  //   },
  // },
  {
    title: '报修单号',
    dataIndex: 'orderNo',
    width: 130,
    resizable: true,
  },
  {
    title: '报修主题',
    dataIndex: 'theme',
    width: 140,
    resizable: true,
  },
{
    title: '报修人',
    dataIndex: 'reporterName',
    width: 140,
    resizable: true,
  },
{
    title: '所在部门',
    dataIndex: 'deptName',
    width: 140,
    resizable: true,
  },
  {
    title: '联系方式',
    dataIndex: 'contactPhone',
    width: 140,
    resizable: true,
  },
{
    title: '报修时间',
    dataIndex: 'createTime',
    width: 140,
    resizable: true,
  },
{
    title: '故障时间',
    dataIndex: 'faultTime',
    width: 140,
    resizable: true,
  },
  {
    title: '故障等级',
    dataIndex: 'faultLevel',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text ===4){
        return '紧急'
      }else if (text === 3){
        return '高'
      }else if(text ===2){
        return '中'
      }else if(text === 1){
        return '低'
      }
    },
  },
  {
    title: '故障列别',
    dataIndex: 'faultCategory',
    width: 140,
    resizable: true,
    // customRender: ({ text }) => {
    //   if (text === 1){
    //     return '小时计划'
    //   }else if (text === 2){
    //     return '日计划'
    //   }else if(text === 3){
    //     return '周计划'
    //   }else if(text === 4){
    //     return '月计划'
    //   }else if (text === 5) {
    //     return '季计划'
    //   }else if (text === 6) {
    //     return '年计划'
    //   }
    // },
  },
  {
    title: '是否停机',
    dataIndex: 'isDowntime',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1){
        return '是'
      }else if (text === 0){
        return '否'
      }
    },
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 140,
    resizable: true,
  },
  {
    title: '设备编号',
    dataIndex: 'deviceCode',
    width: 140,
    resizable: true,
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    width: 140,
    resizable: true,
  },
  {
    title: '规格型号',
    dataIndex: 'specModel',
    width: 140,
    resizable: true,

  },
  {
    title: '使用部门',
    dataIndex: 'groupName',
    width: 140,
    resizable: true,
    customRender: ({ text, record }) => {
      return text || record?.useDept || '-';
    },
  },
  {
    title: '存放位置',
    dataIndex: 'storageLocation',
    width: 140,
    resizable: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 140,
    resizable: true,
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'orderNo',
    label: '报修单号',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },
  {
    field: 'theme',
    label: '报修主题',
    component: 'Input',
    componentProps: {
    },
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
  },{
    title: '设备编码',
    dataIndex: 'deviceCode',
    width: 170,
    resizable: true,
    ellipsis: true,
  },{
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
      }else if (text ==2){
        return '待维修'
      }else if (text == 3){
        return '维修中'
      } else if (text == 4){
        return '入库'
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
    customRender: ({text}) => {
      if (text === 1) {
        return "在途"
      } else if (text === 2) {
        return '待维修'
      } else if (text === 3){
        return '维修中'
      }else{
        return '入库'
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
