import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns = [
  {
    title: '业务申请',
    dataIndex: 'bpmTitle',
    width: 200,
    ellipsis: true,
  },
  {
    title: '表单',
    dataIndex: 'desformName',
    width: 250,
    ellipsis: true,
    customRender: ({ text }) => {
      return `工单【${text}】`;
    },
  },
  {
    title: '表单编码',
    dataIndex: 'desformCode',
  },
  {
    title: '流程名称',
    dataIndex: 'processName',
  },
  {
    title: '流程编码',
    dataIndex: 'flowCode',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '状态',
    dataIndex: 'bpmStatus',
    customRender: ({ text }) => {
      return render.renderDict(text, 'bpm_status');
    },
  },
];
/**
 * 列表查询form
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'desformCode',
    label: '表单名称',
    component: 'JSearchSelect',
    colProps: { span: 6 },
    componentProps: {
      dict: 'design_form where parent_id is null,desform_name,desform_code',
    },
  },
  {
    field: 'flowCode',
    label: '流程编码',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'processName',
    label: '流程名称',
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
