import { BasicColumn, FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';

export const columns: BasicColumn[] = [
  {
    title: '机关代字名称',
    dataIndex: 'organName',
    width: 150,
  },
  {
    title: '模板名称',
    dataIndex: 'tempId_dictText',
    width: 150,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '代字名称',
    field: 'organName',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '模板名称',
    field: 'tempId',
    component: 'JSearchSelect',
    componentProps: {
      dict: 'oa_wps_file,name,id',
      async: false,
    },
    colProps: { span: 8 },
  },
];

export const distributeSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '代字名称',
    field: 'organName',
    component: 'Input',
    dynamicRules: ({ model, schema }) => rules.duplicateCheckRule('oa_officialdoc_organcode', 'organ_name', model, schema, true),
  },
  {
    label: '模板',
    field: 'tempId',
    rules: [{ required: true, message: '请选择模板' }],
    component: 'JSearchSelect',
    componentProps: {
      dict: 'oa_wps_file,name,id',
      async: false,
      getPopupContainer: () => document.body,
    },
  },
];
