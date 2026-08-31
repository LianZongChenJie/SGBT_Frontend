import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    resizable: true,
    customRender: ({ text }) => {
      if (text == '0') {
        return '未处理';
      } else if (text == '1') {
        return '已处理';
      } else if (text == '2') {
        return '已消除';
      }
    },
  },
  {
    title: '告警等级',
    dataIndex: 'level',
    width: 110,
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
    title: '告警编号',
    dataIndex: 'anomalyNo',
    width: 150,
    resizable: true,
  },
  {
    title: '告警时间',
    dataIndex: 'occurTime',
    width: 150,
    resizable: true,
  },
  {
    title: '告警事件',
    dataIndex: 'eventName',
    width: 150,
    resizable: true,
  },
  {
    title: '来源自系统',
    dataIndex: 'sourceSystem',
    width: 110,
    resizable: true,
  },
  {
    title: '告警位置',
    dataIndex: 'locationName',
    width: 110,
    resizable: true,
  },
  {
    title: '处理人',
    dataIndex: 'handler',
    width: 110,
    resizable: true,
  },
  {
    title: '处理意见',
    dataIndex: 'handleOpinion',
    width: 110,
    resizable: true,
  },
  {
    title: '关联事件',
    dataIndex: 'workOrderId',
    width: 110,
    resizable: true,
  },
  {
    title: '处理时间',
    dataIndex: 'handleTime',
    width: 150,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      allowClear: true,
      placeholder: '请选择状态',
      options: [
        { label: '已处理', value: '1' },
        { label: '未处理', value: '0' },
        { label: '已消除', value: '2' },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'level',
    label: '告警等级',
    component: 'Select',
    componentProps: {
      allowClear: true,
      placeholder: '请选择告警等级',
      options: [
        { label: '非常紧急', value: '1' },
        { label: '紧急', value: '2' },
        { label: '一般', value: '3' },
        { label: '较低', value: '4' },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'anomalyNo',
    label: '告警编号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入告警编号',
    },
    colProps: { span: 8 },
  },
  {
    field: 'eventName',
    label: '告警事件',
    component: 'Input',
    componentProps: {
      placeholder: '请输入告警事件',
    },
    colProps: { span: 8 },
  },
  {
    field: 'beginTime',
    label: '开始时间',
    component: 'DatePicker',
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 8 },
  },
  {
    field: 'endTime',
    label: '结束时间',
    component: 'DatePicker',
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 8 },
  },
];

//取消
export const formSchema1: FormSchema[] = [
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
    field: 'name',
    label: '处理意见',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '误报，告警已解除', value: 0 },
        { label: '误报，暂不处理', value: 1 },
      ],
    },
  },
];
