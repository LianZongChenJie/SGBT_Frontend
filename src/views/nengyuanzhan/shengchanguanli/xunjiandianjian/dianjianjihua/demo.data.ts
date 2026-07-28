import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { defHttp } from '@/utils/http/axios';
import { render } from '@/utils/common/renderUtils';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '审核状态',
    dataIndex: 'reviewStatus',
    width: 170,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1) {
        return '待审核';
      } else if (text === 2) {
        return '驳回';
      } else if (text === 3) {
        return '已审核';
      } else if (text === 4) {
        return '待实施';
      } else if (text === 5) {
        return '实施中';
      } else if (text === 6) {
        return '已关闭';
      }
    },
  },
  {
    title: '计划状态',
    dataIndex: 'status',
    width: 170,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1) {
        return '开启';
      } else if (text === 0) {
        return '关闭';
      }
    },
  },
  {
    title: '计划编号',
    dataIndex: 'planCode',
    width: 130,
    resizable: true,
  },
  {
    title: '计划名称',
    dataIndex: 'planName',
    width: 140,
    resizable: true,
  },

  {
    title: '计划类型',
    dataIndex: 'planType',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1) {
        return '小时计划';
      } else if (text === 2) {
        return '日计划';
      } else if (text === 3) {
        return '周计划';
      } else if (text === 4) {
        return '月计划';
      } else if (text === 5) {
        return '季计划';
      } else if (text === 6) {
        return '年计划';
      }
    },
  },
  {
    title: '执行周期规则',
    dataIndex: 'ruleName',
    width: 140,
    resizable: true,
  },
  {
    title: '计划开始时间',
    dataIndex: 'startTime',
    width: 140,
    resizable: true,
  },
  {
    title: '计划结束时间',
    dataIndex: 'endTime',
    width: 140,
    resizable: true,
  },
  {
    title: '点检班组',
    dataIndex: 'teamName',
    width: 140,
    resizable: true,
  },
  {
    title: '点检人',
    dataIndex: 'chargerName',
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
export const columnsModalYulan: BasicColumn[] = [
  {
    title: '点检项目名称',
    dataIndex: 'itemName',
    width: 130,
    resizable: true,
  },
  {
    title: '点检项目编号',
    dataIndex: 'itemCode',
    width: 140,
    resizable: true,
  },
  {
    title: '点检部位',
    dataIndex: 'areaName',
    width: 140,
    resizable: true,
  },
  {
    title: '点检方法',
    dataIndex: 'methodName',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '巡检分类',
  //   dataIndex: 'categoryName',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '点检分类',
  //   dataIndex: 'categoryId',
  //   width: 140,
  //   resizable: true,
  //   customRender: ({ text }) => {
  //     if (text === 1) {
  //       return '日计划';
  //     } else if (text === 2) {
  //       return '周计划';
  //     } else if (text === 3) {
  //       return '月计划';
  //     } else if (text === 4) {
  //       return '季计划';
  //     } else if (text === 5) {
  //       return '年计划';
  //     }
  //   },
  // },
  {
    title: '点检内容',
    dataIndex: 'content',
    width: 140,
    resizable: true,
  },
  {
    title: '判定标准',
    dataIndex: 'resultType',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 'numerical') {
        return '数值';
      } else if (text === 'text') {
        return '长文本';
      } else if (text === 'radio') {
        return '单选';
      } else if (text === 'checkbox') {
        return '多选';
      }
      return text;
    },
  },
  {
    title: '点检结果',
    dataIndex: 'fieldName',
    width: 140,
    resizable: true,
    // slots: {customRender: 'fieldName'},
  },
  {
    title: '是否正常',
    dataIndex: 'inspectionName',
    width: 170,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1) {
        return '正常';
      } else if (text === 2) {
        return '不正常';
      } else if (text === 3) {
        return '已审核';
      }
    },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 140,
    resizable: true,
  },
];
export const columnsModalShezhi: BasicColumn[] = [
  {
    title: '巡检项目名称',
    dataIndex: 'itemName',
    width: 130,
    resizable: true,
  },
  {
    title: '巡检项目编号',
    dataIndex: 'itemCode',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '巡检分类',
  //   dataIndex: 'categoryName',
  //   width: 140,
  //   resizable: true,
  // },
  {
    title: '巡检分类',
    dataIndex: 'categoryId',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 1){
        return '日计划'
      }else if (text === 2){
        return '周计划'
      }else if(text === 3){
        return '月计划'
      }else if(text === 4){
        return '季计划'
      }else if (text === 5) {
        return '年计划'
      }
    },
  },
  {
    title: '巡检内容',
    dataIndex: 'content',
    width: 140,
    resizable: true,
  },
  {
    title: '判定结果类型',
    dataIndex: 'resultType',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 'numerical') {
        return '数值';
      } else if (text === 'text') {
        return '长文本';
      } else if (text === 'radio') {
        return '单选';
      } else if (text === 'checkbox') {
        return '多选';
      }
    },
  },
  {
    title: '判定结果选项',
    dataIndex: 'optionName',
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
  {
    title: '备注',
    dataIndex: 'remark',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [

  {
    field: 'planCode',
    label: '计划编号',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'planName',
    label: '计划名称',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
];
export const searchFormSchemaYulan: FormSchema[] = [
  {
    field: 'itemCode',
    label: '巡检项目编号',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'itemName',
    label: '巡检项目名称',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
  },
  {
    field: 'categoryId',
    label: '巡检分类',
    component: 'Select',
    componentProps: {
      options: [
        { label: '日计划', value: 1 },
        { label: '周计划', value: 2 },
        { label: '月计划', value: 3 },
        { label: '季计划', value: 4 },
        { label: '年计划', value: 5 },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'content',
    label: '巡检内容',
    component: 'Input',
    componentProps: {},
    colProps: { span: 8 },
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

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'createBy',
    label: 'createBy',
    component: 'Input',
    show: false,
  },
  {
    field: 'createTime',
    label: 'createTime',
    component: 'Input',
    show: false,
  },
  {
    field: 'baseTitle',
    component: 'Divider',
    label: '基本信息',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    field: 'inspectionName',
    label: '计划项目名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'amount',
    label: '数量',
    component: 'InputNumber',
    required: true,
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    field: 'factoryName',
    label: '厂家',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'isRelated',
    label: '是否关联设备',
    component: 'RadioGroup',
    required: true,
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '已关联', value: 1 },
        { label: '未关联', value: 0 },
      ],
    },
  },
  {
    field: 'inspectionCycle',
    label: '维保周期',
    component: 'InputNumber',
    required: true,
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    field: 'unit',
    label: '单位',
    component: 'RadioGroup',
    required: true,
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '天', value: 1 },
        { label: '周', value: 2 },
        { label: '月', value: 3 },
        { label: '季', value: 4 },
        { label: '年', value: 5 },
      ],
    },
  },
  {
    field: 'frequency',
    label: '建议频次',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'duration',
    label: '持续执行时间',
    component: 'InputNumber',
    required: true,
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    field: 'assistDepartment',
    label: '协助部门',
    component: 'JSelectDept',
    componentProps: {
      showButton: false,
      style: {
        width: '100%',
      },
      labelKey: 'departName',
      rowKey: 'orgCode',
    },
  },
  {
    field: 'inspectionGroup',
    label: '负责组',
    component: 'Select',
    componentProps: {
      options: [],
    },
  },
  {
    field: 'responsible',
    label: '负责人',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    componentProps: {
      showButton: false,
      style: {
        width: '100%',
      },
      labelKey: 'departName',
      rowKey: 'orgCode',
    },
  },
  {
    field: 'inspectionYear',
    label: '巡检计划年份',
    component: 'DatePicker',
    required: true,
    componentProps: {
      picker: 'year',
      format: 'YYYY',
      valueFormat: 'YYYY',
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    required: false,
    componentProps: {},
  },
  {
    field: 'updateBy',
    label: '更新人',
    component: 'Input',
    required: false,
    componentProps: {},
  },
];
