import { BasicColumn } from '/@/components/Table';
import { filterDictText } from '/@/utils/dict/JDictSelectUtil';

export const processFormTypeOptions = [
  {
    value: '1',
    label: 'Online表单',
    title: 'Online表单',
  },
  {
    value: '2',
    label: '表单设计器',
    title: '表单设计器',
  },
  {
    value: '3',
    label: '自定义开发',
    title: '自定义开发',
  },
];

/**
 * 列表
 */
export const columns: BasicColumn[] = [
  {
    title: '#',
    dataIndex: '',
    key: 'rowIndex',
    width: 60,
    align: 'center',
    customRender: function ({ index }) {
      return parseInt(index) + 1;
    },
  },
  {
    title: '唯一编码',
    align: 'center',
    dataIndex: 'relationCode',
  },
  {
    title: '表名/自定义表单CODE',
    align: 'center',
    dataIndex: 'formTableName',
  },
  {
    title: '表单类型',
    align: 'center',
    dataIndex: 'formType',
    customRender: function ({ text }) {
      return filterDictText(processFormTypeOptions, text);
    },
  },
  {
    title: '业务标题表达式',
    align: 'center',
    dataIndex: 'titleExp',
  },
  {
    title: '流程状态列名',
    align: 'center',
    dataIndex: 'flowStatusCol',
  },
];
