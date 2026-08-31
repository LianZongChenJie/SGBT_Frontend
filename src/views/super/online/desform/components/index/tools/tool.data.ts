import type { FormSchema } from '/@/components/Form';

export const changeDataTool = {
  actions: {
    input: [
      { label: '将数值转为字符串', value: 'num2str' },
      { label: '将字符串转为数字', value: 'str2num' },
    ],
    number: [{ label: '将字符串转为数字', value: 'str2num' }],
    date: [
      { label: '去除时间部分', value: 'remove_time' },
      { label: '增加时间部分', value: 'add_time' },
    ],
  },
  tips: {
    input: {
      // number to string
      num2str: '',
      // string to number
      str2num: '数据中不能包含非数字的字符，否者将会拒绝执行该操作！',
    },
    number: {
      str2num: '数据中不能包含非数字的字符，否者将会拒绝执行该操作！',
    },
    date: {
      remove_time: '例如：处理前 2020-06-01 15:38:23；处理后 2020-06-01',
      add_time: '例如：处理前 2020-06-01；处理后 2020-06-01 00:00:00',
    },
  },
  formSchemas: [
    {
      label: '组件类型',
      field: 'widgetType',
      component: 'Select',
      componentProps: {
        options: [
          { label: '单行文本', value: 'input' },
          { label: '计数器', value: 'number' },
          { label: '日期选择器', value: 'date' },
        ],
        getPopupContainer: () => document.body,
      },
      required: true,
    },
    {
      label: '选择操作',
      field: 'action',
      component: 'Select',
      componentProps: {
        options: [],
        notFoundContent: '暂无操作',
        getPopupContainer: () => document.body,
        placeholder: '请选择操作',
      },
      required: true,
    },
    {
      label: '选择操作的组件',
      field: 'model',
      component: 'Select',
      componentProps: {
        showSearch: true,
        notFoundContent: '暂无操作',
        options: [],
        getPopupContainer: () => document.body,
        placeholder: '请选择要操作的组件',
      },
      required: true,
    },
  ] as FormSchema[],
};

export const changeModelTool = {
  formSchemas: [
    {
      label: '旧model',
      field: 'oldKey',
      component: 'Input',
      required: true,
    },
    {
      label: '新model',
      field: 'newKey',
      component: 'Select',
      componentProps: {
        options: [],
        notFoundContent: '暂无操作',
        getPopupContainer: () => document.body,
      },
      dynamicRules({ model }) {
        return [
          { required: true, message: '请选择新model' },
          {
            validator(_, value) {
              if (model.oldKey === value) {
                return Promise.reject('新model不能和旧model相同');
              }
              return Promise.resolve();
            },
          },
        ];
      },
    },
  ] as FormSchema[],
};
