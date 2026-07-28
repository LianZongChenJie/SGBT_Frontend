import { BasicColumn, FormSchema } from '/@/components/Table';
import { processFormTypeOptions } from '../processForm/process.form.data';
import { filterDictText } from '/@/utils/dict/JDictSelectUtil';

const ruleTypeOptions = [
  {
    value: '1',
    label: '显示',
  },
  {
    value: '2',
    label: '禁用',
  },
];

const ruleStatusOptions = [
  {
    value: '1',
    label: '正向有效',
  },
  {
    value: '0',
    label: '反向有效',
  },
];

/**
 * 列表
 */
export const columns: BasicColumn[] = [
  {
    title: '规则名称',
    align: 'center',
    dataIndex: 'ruleName',
    ellipsis: true,
  },
  {
    title: '规则编码',
    align: 'center',
    dataIndex: 'ruleCode',
    ellipsis: true,
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
    title: '策略',
    align: 'center',
    dataIndex: 'ruleType',
    customRender: function ({ text }) {
      return filterDictText(ruleTypeOptions, text);
    },
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status',
    customRender: function ({ text }) {
      return filterDictText(ruleStatusOptions, text);
    },
  },
];

/**
 * 查询条件
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'formType',
    label: '表单类型',
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: processFormTypeOptions,
    },
  },
  {
    field: 'ruleCode',
    label: '规则编码',
    component: 'Input',
  },
];
