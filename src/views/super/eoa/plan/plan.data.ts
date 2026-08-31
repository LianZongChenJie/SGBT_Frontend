import { FormSchema } from '/@/components/Table';

export const columns = [
  {
    title: '标题',
    dataIndex: 'title',
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
  },
  {
    title: '类型',
    dataIndex: 'type_dictText',
  },
  {
    title: '是否全天',
    dataIndex: 'allDay_dictText',
  },
  {
    title: '紧急程度',
    dataIndex: 'urgentLevel_dictText',
  },
  {
    title: '提醒类型',
    align: 'center',
    dataIndex: 'remindType',
    customRender: ({ text }) => {
      if (text && text.length > 0) {
        return text
          .split(',')
          .map((t) => (t === '1' ? '邮件' : t === '2' ? '短信' : t === '4' ? '系统消息' : t))
          .join(' | ');
      }
    },
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status_dictText',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'title',
    label: '标题',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'eoa_plan_status',
      placeholder: '请选择状态',
    },
    colProps: { span: 6 },
  },
  {
    field: 'type',
    label: '类型',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'eoa_plan_type',
      placeholder: '请选择类型',
    },
    colProps: { span: 6 },
  },
  {
    field: 'remindType',
    label: '提醒类型',
    component: 'Input',
    slot: 'remindType',
    colProps: { span: 6 },
  },
];
export const colorList = [
  {
    key: '薄暮',
    color: '#F5222D',
  },
  {
    key: '火山',
    color: '#FA541C',
  },
  {
    key: '日暮',
    color: '#FAAD14',
  },
  {
    key: '明青',
    color: '#13C2C2',
  },
  {
    key: '极光绿',
    color: '#52C41A',
  },
  {
    key: '拂晓蓝（默认）',
    color: '#1890FF',
  },
  {
    key: '极客蓝',
    color: '#2F54EB',
  },
  {
    key: '酱紫',
    color: '#722ED1',
  },
];
