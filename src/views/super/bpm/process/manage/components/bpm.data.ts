import { FormSchema } from '/@/components/Table';
import { getAllTask } from './bpm.api';

/**
 * 委派modal的form
 */
export const delegateFormSchema: FormSchema[] = [
  {
    field: 'username',
    label: '用户名',
    component: 'JSelectUserByDept',
    required: true,
    componentProps: {
      labelKey: 'realname',
      rowKey: 'username',
      showButton: false,
      isRadioSelection: true,
    },
  },
];
/**
 * 跳转节点form
 */
export const taskNodeFormSchema: FormSchema[] = [
  {
    field: 'taskId',
    label: '',
    component: 'Input',
    show: false,
  },
  {
    field: 'skipTaskNode',
    label: '跳转节点',
    component: 'ApiSelect',
    required: true,
    componentProps: ({ formModel }) => {
      return {
        api: getAllTask,
        params: { taskId: formModel.taskId },
        labelField: 'name',
        valueField: 'taskKey',
        immediate: false,
        onChange: (e) => {
          console.log('selected:', e);
        },
        onOptionsChange: (options) => {
          console.log('get options', options.length, options);
        },
      };
    },
  },
];
