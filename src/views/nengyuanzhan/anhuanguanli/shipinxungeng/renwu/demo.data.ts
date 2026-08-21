import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getTreeListGaojingdengji } from '@/views/nengyuanzhan/anhuanguanli/gaojingzhongxin/gaojingguize/demo.api';
import { getEventNames, getEventTypes } from '@/views/nengyuanzhan/anhuanguanli/shipinxungeng/renwu/demo.api';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '巡逻任务名称',
    dataIndex: 'taskName',
    width: 170,
    resizable: true,
  },
  {
    title: '计划执行时间',
    dataIndex: 'planStartTime',
    width: 130,
    resizable: true,
  },
  {
    title: '开始时间',
    dataIndex: 'actualStartTime',
    width: 130,
    resizable: true,
  },
  {
    title: '结束时间',
    dataIndex: 'actualEndTime',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '摄像头名称A',
  //   dataIndex: 'inspectionCycle',
  //   width: 140,
  //   resizable: true,
  // },
  {
    title: '播放时长(秒)',
    dataIndex: 'duration',
    width: 140,
    resizable: true,
  },

  {
    title: '状态',
    dataIndex: 'taskStatus',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      const map = {
        0: '未开始',
        1: '进行中',
        2: '已完成',
        3: '未完成/漏检',
      };
      return map[text] ?? map[Number(text)] ?? '-';
    },
  },
  // {
  //   title: '当前播放位置',
  //   dataIndex: 'duration',
  //   width: 140,
  //   resizable: true,
  // },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'taskName',
    label: '任务名称',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入巡逻任务名称',
    },
  },
  {
    field: 'actualStartTime',
    label: '开始时间',
    component: 'DatePicker',
    colProps: { span: 8 },
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    field: 'actualEndTime',
    label: '结束时间',
    component: 'DatePicker',
    colProps: { span: 8 },
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
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
    field: 'eventName',
    label: '事件名称',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: getEventNames, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      labelField: 'label', // 下拉显示文字
      valueField: 'value', // 实际提交值
    },
  },
  {
    field: 'eventType',
    label: '事件类型',
    component: 'ApiSelect', // ⭐ 官方推荐
    // colProps: { span: 8 },
    required: true,
    componentProps: {
      api: getEventTypes, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      labelField: 'label', // 下拉显示文字
      valueField: 'value', // 实际提交值
    },
  },
  {
    field: 'eventLevel',
    label: '事件等级',
    component: 'ApiSelect', // ⭐ 官方推荐
    // colProps: { span: 8 },
    required: true,
    componentProps: {
      api: getTreeListGaojingdengji, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      labelField: 'levelName', // 下拉显示文字
      valueField: 'levelCode', // 实际提交值
      placeholder: '请选择默认等级',
    },
  },

  {
    field: 'location',
    label: '位置信息',
    component: 'Input',
    required: true,
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'cameraCode',
    label: '摄像机code',
    component: 'Input',
    required: true,
    show: false,
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'taskId',
    label: 'taskId',
    component: 'Input',
    required: true,
    show: false,
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'deviceName',
    label: '摄像机',
    component: 'Input',
    required: true,
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'imageUrl',
    label: '图片',
    required: true,
    helpMessage: '最多上传10张图片',
    component: 'JImageUpload',
    componentProps: {
      //按钮显示文字
      text: '上传图片',
      //支持两种基本样式picture和picture-card
      // listType:'picture-card',
      //用于控制文件上传的业务路径,默认temp
      // bizPath:'temp',
      //是否禁用
      disabled: false,
      //最大上传数量
      fileMax: 10,
      // 告警自动抓拍上传失败时，仍可在当前表单控件中预览 data URL。
      allowDataUrl: true,
    },
  },
  {
    field: 'description',
    label: '描述',
    component: 'InputTextArea',
    required: false,
    componentProps: {},
  },
];
