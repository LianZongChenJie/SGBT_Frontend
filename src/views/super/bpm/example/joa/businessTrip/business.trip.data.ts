import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns = [
  {
    title: '出差人',
    dataIndex: 'applyUserName',
    width: 100,
  },
  {
    title: '部门名称',
    dataIndex: 'departName',
    width: 100,
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
    width: 100,
  },
  {
    title: '目的地',
    dataIndex: 'destination',
    width: 100,
    slots: { customRender: 'pcaSlot' },
  },
  {
    title: '出发时间',
    dataIndex: 'departureTime',
    width: 100,
    customRender: function ({ text }) {
      if (!text) {
        return '';
      }
      if (text.length > 10) {
        return text.substring(0, 10);
      }
      return text;
    },
  },
  {
    title: '出差天数',
    dataIndex: 'dayNum',
    width: 100,
  },
  {
    title: '出行工具',
    dataIndex: 'travelTool',
    width: 100,
    customRender: ({ text }) => {
      if (text == 1) {
        return '客车';
      } else if (text == 2) {
        return '火车';
      } else if (text == 3) {
        return '飞机';
      } else {
        return text;
      }
    },
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
    field: 'applyUserName',
    label: '出差人',
    component: 'Input',
    colProps: { span: 6 },
  },
];
