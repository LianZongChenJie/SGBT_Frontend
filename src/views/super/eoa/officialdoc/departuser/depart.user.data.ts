import { BasicColumn, FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
import { reactive } from 'vue';

export const columns: BasicColumn[] = [
  {
    title: '部门',
    dataIndex: 'departId_dictText',
    width: 150,
  },
  {
    title: '用户',
    dataIndex: 'userId_dictText',
    width: 150,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '部门',
    field: 'departId',
    component: 'JTreeSelect',
    componentProps: {
      dict: 'sys_depart,depart_name,id',
      pidField: 'parent_id',
      multiple: false,
      getPopupContainer: () => document.body,
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '部门',
    field: 'departId',
    component: 'JTreeSelect',
    componentProps: ({ formActionType }) => {
      return {
        dict: 'sys_depart,depart_name,id',
        pidField: 'parent_id',
        loadTriggleChange: true,
        getPopupContainer: () => document.body,
        onChange: (value) => {
          const params = reactive({ departId: value });
          const { updateSchema } = formActionType;
          updateSchema({
            field: 'userId',
            componentProps: {
              params: params,
            },
          });
        },
      };
    },
    dynamicRules: ({ model, schema }) => rules.duplicateCheckRule('oa_officialdoc_depart_user', 'depart_id', model, schema, true),
  },
  {
    field: 'userId',
    label: '用户',
    component: 'JSelectUser',
    required: true,
    componentProps: {
      labelKey: 'realname',
      rowKey: 'id',
      params: {},
    },
    dynamicDisabled: ({ values }) => {
      return !values.departId;
    },
  },
];
