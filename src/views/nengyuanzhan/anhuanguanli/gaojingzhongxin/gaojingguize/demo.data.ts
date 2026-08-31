import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
// import {render} from '/@/utils/common/renderUtils';
import { getTreeListGaojingshijian, getTreeListGaojingleixing, getTreeListGaojingdengji } from './demo.api';

export const columns: BasicColumn[] = [
  {
    title: '告警类型',
    dataIndex: 'categoryName',
    width: 170,
    resizable: true,
  },
  {
    title: '告警事件',
    dataIndex: 'eventName',
    width: 130,
    resizable: true,
  },
  {
    title: '默认等级',
    dataIndex: 'defaultLevel',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text == '1') {
        return '非常紧急';
      } else if (text == '2') {
        return '紧急';
      } else if (text == '3') {
        return '一般';
      } else if (text == '4') {
        return '较低';
      }
    },
  },
  {
    title: '告警规则说明',
    dataIndex: 'ruleDescription',
    width: 130,
    resizable: true,
  },
  {
    title: '合并规则(分钟)',
    dataIndex: 'mergeRange',
    width: 130,
    resizable: true,
  },

  {
    title: '处置页面展示',
    dataIndex: 'isDisplay',
    width: 140,
    resizable: true,
    slots: { customRender: 'isDisplay' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'categoryId',
    label: '告警类型',
    component: 'ApiSelect', // ⭐ 官方推荐
    colProps: { span: 8 },
    componentProps: {
      api: getTreeListGaojingleixing, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      labelField: 'name', // 下拉显示文字
      valueField: 'id',        // 实际提交值
      placeholder: '请选择告警类型',
    },
  },

  {
    field: 'eventId',
    label: '告警事件',
    component: 'ApiSelect', // ⭐ 官方推荐
    colProps: { span: 8 },
    componentProps: {
      api: getTreeListGaojingshijian, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      labelField: 'eventName', // 下拉显示文字
      valueField: 'id',        // 实际提交值
      placeholder: '请选择告警事件',
    },
  },
  {
    field: 'defaultLevel',
    label: '告警级别',
    component: 'ApiSelect', // ⭐ 官方推荐
    colProps: { span: 8 },
    componentProps: {
      api: getTreeListGaojingdengji, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      labelField: 'levelName', // 下拉显示文字
      valueField: 'levelCode',        // 实际提交值
      placeholder: '请选择告警等级',
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
    field: 'categoryId',
    label: '告警类型',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: getTreeListGaojingleixing,
      immediate: true,
      allowClear: true,
      labelField: 'name',
      valueField: 'id',
      placeholder: '请选择告警类型',
    },
  },
  {
    field: 'eventId',
    label: '告警事件',
    component: 'ApiSelect', // ⭐ 官方推荐
    // colProps: { span: 8 },
    required: true,
    componentProps: {
      api: getTreeListGaojingshijian, // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      labelField: 'eventName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      placeholder: '请选择告警事件',
    },
  },
  {
    field: 'defaultLevel',
    label: '默认等级',
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
    field: 'ruleDescription',
    label: '规则说明',
    component: 'InputTextArea',
    required: true,
    componentProps: {},
  },
  {
    field: 'isDisplay',
    label: '告警处置页面展示',
    component: 'Switch',
    required: false,
    helpMessage: '关闭后，在告警处置的告警面板上不展示，但在告警记录展示',
    componentProps: {
      checkedValue: 'Y',
      unCheckedValue: 'N',
      checkedChildren: '开',
      unCheckedChildren: '关',
    },
  },
  {
    field: 'baseTitle',
    component: 'Divider',
    label: '合并规则',
    componentProps: {
      //是否虚线
      dashed: false,
      //分割线标题的位置（left | right | center）
      orientation: 'left',
      //文字是否显示为普通正文样式
      plain: true,
      //水平还是垂直类型（horizontal | vertical）
      type: 'horizontal',
    },
  },

  // {
  //   field: 'describe',
  //   label: '合并规则',
  //   component: 'Input',
  //   componentProps: {
  //     disabled: true,
  //   },
  //   //渲染 values当前表单所有值
  //   render: ({ values }) => {
  //     let date = values.date;
  //     return `在同一台设备首次触发告警后，在 ${'2'} 分钟内，在该设备触发的同类型告警消息，规整压缩至首条告警记录内`;
  //   },
  // },
];
