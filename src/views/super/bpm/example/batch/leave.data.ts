import { FormSchema } from '/src/components/Table';
import { render } from '/src/utils/common/renderUtils';

export const columns = [
  {
    title: '请假人',
    dataIndex: 'name',
    width: 100,
    slots: { customRender: 'notify' },
  },
  {
    title: '请假天数',
    dataIndex: 'days',
    width: 100,
  },
  {
    title: '开始时间',
    dataIndex: 'beginDate',
    width: 100,
  },
  {
    title: '结束时间',
    dataIndex: 'endDate',
    width: 100,
  },
  {
    title: '请假原因',
    dataIndex: 'reason',
    ellipsis: true,
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'bpmStatus',
    width: 80,
    customRender: ({ text }) => {
      return render.renderDict(text, 'bpm_status');
    },
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'bizTaskType',
    label: '类型',
    component: 'Input',
    defaultValue: '1',
    slot: 'bizTaskType',
  },
  {
    field: 'name',
    label: '请假人',
    component: 'Input',
  },
];
/**
 * 表单form
 */
export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: '',
    component: 'Input',
    show: false,
  },
  {
    label: '请假人',
    field: 'name',
    required: true,
    component: 'Input',
  },
  {
    label: '请假天数',
    field: 'days',
    component: 'InputNumber',
    componentProps: {
      width: '100%',
    },
  },
  {
    label: '开始时间',
    field: 'beginDate',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择开始时间',
    },
  },
  {
    label: '结束时间',
    field: 'endDate',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      placeholder: '请选择结束时间',
    },
  },
  {
    label: '请假原因',
    field: 'reason',
    component: 'InputTextArea',
    componentProps: {
      rows: 4
    }
  },
];
