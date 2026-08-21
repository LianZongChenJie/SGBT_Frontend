import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import dayjs from 'dayjs';
// import {render} from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '巡逻计划名称',
    dataIndex: 'planName',
    width: 170,
    resizable: true,
  },
  {
    title: '开始时间',
    dataIndex: 'startDate',
    width: 130,
    resizable: true,
  },
  {
    title: '结束时间',
    dataIndex: 'endDate',
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
    title: '播放时间',
    dataIndex: 'playDuration',
    width: 140,
    resizable: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text === 'START' || text === 1 || text === '1') {
        return '启动';
      }
      if (text === 'STOP' || text === 0 || text === '0') {
        return '停止';
      }
      return '-';
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
    field: 'planName',
    label: '巡逻计划',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入巡逻计划名称',
    },
  },
  {
    field: 'startDate',
    label: '开始时间',
    component: 'DatePicker',
    colProps: { span: 8 },
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    field: 'endDate',
    label: '结束时间',
    component: 'DatePicker',
    colProps: { span: 8 },
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
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
    field: 'planName',
    label: '巡逻计划名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'startDate',
    label: '巡逻开始日期',
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: false,
      picker: 'date',
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      disabledDate: (current: any) => {
        return current && current < dayjs().startOf('day');
      },
    },
  },
  {
    field: 'endDate',
    label: '巡逻结束日期',
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: false,
      picker: 'date',
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      disabledDate: (current: any) => {
        return current && current < dayjs().startOf('day');
      },
    },
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioGroup',
    defaultValue: 'START',
    required: true,
    componentProps: {
      options: [
        { value: 'STOP', label: '停止' },
        { value: 'START', label: '启动' },
      ],
      // checkedValue: 'START',      // 选中时的值
      // unCheckedValue: 'STOP',     // 未选中时的值
      // checkedChildren: '启动',
      // unCheckedChildren: '停止'
      // showTime:true,
      // picker:'date',
      // format: 'YYYY-MM-DD',
      // valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    field: 'baseTitle',
    component: 'Divider',
    label: '选择摄像头',
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
];
export const formSchemaEdit: FormSchema[] = [
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
    field: 'interactionCount',
    label: '随机互动摄像头数量',
    component: 'InputNumber',
    required: true,
    suffix: '个',
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    field: 'playDuration',
    label: '批量修改播放时长为',
    component: 'InputNumber',
    required: true,
    suffix: '秒',
    componentProps: {
      style: { width: '100%' },
      min: 1,
      max: 3600,
      step: 1,
      precision: 0,
    },
  },
];
