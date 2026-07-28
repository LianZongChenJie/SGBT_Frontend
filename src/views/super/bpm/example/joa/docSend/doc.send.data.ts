import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
export const columns = [
  {
    title: '公文标题',
    dataIndex: 'title',
    width: 100,
  },
  {
    title: '文种',
    dataIndex: 'classification',
    width: 100,

    customRender: ({ text }) => {
      if (text == 1) {
        return '公告';
      } else if (text == 2) {
        return '通知';
      } else {
        return text;
      }
    },
  },
  {
    title: '公文分类',
    dataIndex: 'docType',
    width: 100,

    customRender: ({ text }) => {
      if (text == 1) {
        return '普通文件';
      } else if (text == 2) {
        return '盖章通知';
      } else if (text == 3) {
        return '正式文件';
      } else {
        return text;
      }
    },
  },
  {
    title: '缓急程度',
    dataIndex: 'urgency',
    width: 100,
    customRender: ({ text }) => {
      if (text == 1) {
        return '普通';
      } else if (text == 2) {
        return '紧急';
      } else if (text == 3) {
        return '特急';
      } else {
        return text;
      }
    },
  },
  {
    title: '印刷分数',
    dataIndex: 'printScore',
    width: 100,
  },
  {
    title: '登记时间',
    dataIndex: 'bookDate',
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
    field: 'title',
    label: '公文标题',
    component: 'Input',
    colProps: { span: 6 },
  },
];
