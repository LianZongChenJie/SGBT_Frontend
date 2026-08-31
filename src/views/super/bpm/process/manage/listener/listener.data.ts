import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns = [
  {
    title: '名称',
    dataIndex: 'listenerName',
    width: 180,
    ellipsis: true,
  },
  {
    title: '监听类型',
    dataIndex: 'listenerType',
    width: 100,
    customRender: ({ text }) => {
      return render.renderDictNative(
        text,
        [
          { label: '执行监听', value: 1 },
          { label: '任务监听', value: 2 },
        ],
        false
      );
    },
  },
  {
    title: '事件',
    dataIndex: 'listenerEvent',
    width: 100,
  },
  {
    title: '执行类型',
    dataIndex: 'listenerValueType',
    width: 150,
    customRender: ({ text }) => {
      return render.renderDictNative(
        text,
        [
          { label: '表达式', value: 'expression' },
          { label: 'JAVA类', value: 'javaClass' },
          { label: 'Spring表达式', value: 'delegateExpression' },
        ],
        false
      );
    },
  },
  {
    title: '执行内容',
    dataIndex: 'listenerValue',
    width: 360,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'listenerStatus',
    width: 100,
    customRender: ({ text }) => {
      return render.renderDictNative(
        text,
        [
          { label: '已禁用', value: '0' },
          { label: '已启用', value: '1' },
        ],
        false
      );
    },
  },
];
/**
 * 列表查询form
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'listenerName',
    label: '名称',
    component: 'Input',
    colProps: { span: 6 },
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
    label: '名称',
    field: 'listenerName',
    required: true,
    component: 'Input',
  },
  {
    label: '监听类型',
    field: 'listenerType',
    component: 'Select',
    componentProps: ({ formModel }) => {
      return {
        options: [
          { label: '执行监听', value: 1 },
          { label: '任务监听', value: 2 },
        ],
        onChange: () => {
          formModel.listenerEvent = '';
        },
      };
    },
  },
  {
    label: '事件属性',
    field: 'listenerEvent',
    component: 'Select',
    componentProps: ({ formModel }) => {
      const isExecute = [
        { label: 'start', value: 'start' },
        { label: 'end', value: 'end' },
        { label: 'take', value: 'take' },
      ];
      const isTask = [
        { label: 'create', value: 'create' },
        { label: 'assignment', value: 'assignment' },
        { label: 'complete', value: 'complete' },
      ];
      let option = !formModel['listenerType'] ? [] : formModel['listenerType'] == 1 ? isExecute : isTask;
      return {
        options: option,
      };
    },
  },
  {
    label: '值类型',
    field: 'listenerValueType',
    component: 'RadioGroup',
    defaultValue: 'javaClass',
    componentProps: ({ formActionType }) => {
      return {
        options: [
          { label: 'JAVA类', value: 'javaClass' },
          { label: '表达式', value: 'expression' },
          { label: '代理表达式', value: 'delegateExpression' },
        ],
        onChange: (e) => {
          const { updateSchema } = formActionType;
          let value = e.target.value;
          const label = value === 'javaClass' ? '类路径' : '表达式';
          updateSchema([
            {
              field: 'listenerValue',
              label: label,
            },
          ]);
        },
      };
    },
  },
  {
    label: '类路径',
    field: 'listenerValue',
    component: 'Input',
  },
];
