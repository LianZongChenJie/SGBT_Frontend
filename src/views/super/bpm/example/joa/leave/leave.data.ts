import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const leaveCategoryOpt = [
  {
    label: '病假',
    value: '1',
    key: '1',
  },
  {
    label: '事假',
    value: '2',
    key: '2',
  },
  {
    label: '年假',
    value: '3',
    key: '3',
  },
  {
    label: '婚假',
    value: '4',
    key: '4',
  },
  {
    label: '产假',
    value: '5',
    key: '5',
  },
  {
    label: '丧假',
    value: '6',
    key: '6',
  },
  {
    label: '探亲假',
    value: '7',
    key: '7',
  },
  {
    label: '护理假',
    value: '8',
    key: '8',
  },
  {
    label: '其他',
    value: '9',
    key: '9',
  },
];
export const columns = [
  {
    title: '申请编号',
    dataIndex: 'applyNo',
    width: 100,
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 100,
  },
  {
    title: '申请日期',
    dataIndex: 'applyDate',
    width: 100,
  },
  {
    title: '请假类别',
    dataIndex: 'leaveCategory',
    width: 100,
    customRender: ({ text }) => {
      let item = leaveCategoryOpt.filter((t) => t.value == text);
      if (item && item.length > 0) {
        return item[0].label;
      } else {
        return text;
      }
    },
  },
  {
    title: '请假开始时间',
    dataIndex: 'leaveStartDate',
    width: 100,
  },
  {
    title: '请假结束时间',
    dataIndex: 'leaveEndDate',
    width: 100,
  },
  {
    title: '流程状态',
    align: 'center',
    dataIndex: 'bpmStatus',
    width: 100,
    customRender: ({ text }) => {
      return render.renderDict(text, 'bpm_status');
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'leaveCategory',
    label: '请假类别',
    component: 'Select',
    componentProps: {
      options: leaveCategoryOpt,
    },
    colProps: { span: 6 },
  },
];
