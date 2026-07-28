import { BasicColumn, FormSchema } from '/@/components/Table';
export const columns: BasicColumn[] = [
  {
    title: '编号',
    dataIndex: 'callNo',
    align: 'center',
  },
  {
    title: '通话类型',
    dataIndex: 'callType',
    align: 'center',
  },
  {
    title: '服务类型',
    dataIndex: 'serviceType',
    align: 'center',
  },
  {
    title: '用户',
    dataIndex: 'callerNumber',
    align: 'center',
  },
  {
    title: '被叫号码',
    dataIndex: 'calledNumber',
    align: 'center',
  },
  {
    title: '接听时间',
    dataIndex: 'answeredTime',
    align: 'center',
  },
  {
    title: '挂机时间',
    dataIndex: 'overTime',
    align: 'center',
  },
  {
    title: '通话时长',
    dataIndex: 'duration',
    align: 'center',
  },
  {
    title: '通话日期',
    dataIndex: 'callDate',
    align: 'center',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'callerNumber',
    label: '用户',
    component: 'Input',
  },
  {
    field: 'calledNumber',
    label: '被叫号码',
    component: 'Input',
  },
  {
    field: 'answeredTime',
    component: 'RangePicker',
    label: '接听时间',
    componentProps: {
      valueType: 'Date',
      showTime: true,
    },
    colProps: {
      span: 8,
    },
  },
  // {
  //   field: 'callType',
  //   label: '通话类型',
  //   component: 'Select',
  //   componentProps: {
  //     options: [
  //       { value: '呼入', label: '呼入' },
  //       { value: '呼出', label: '呼出' },
  //     ],
  //   },
  // },
];
