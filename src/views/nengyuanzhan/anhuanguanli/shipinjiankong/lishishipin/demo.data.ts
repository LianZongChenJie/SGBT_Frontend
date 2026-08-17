import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '开始时间',
    dataIndex: 'beginTime',
    width: 180,
    resizable: true,
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    width: 180,
    resizable: true,
  },
  {
    title: '播放路径',
    dataIndex: 'url',
    width: 300,
    ellipsis: true,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'startTime',
    label: '开始时间',
    component: 'DatePicker',
    required: true,
    colProps: { span: 24 },
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      format: 'YYYY-MM-DD HH:mm:ss',
      disabled: false,
    },
  },
  {
    field: 'endTime',
    label: '结束时间',
    component: 'DatePicker',
    required: true,
    colProps: { span: 24 },
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      format: 'YYYY-MM-DD HH:mm:ss',
      disabled: false,
    },
  },
];
