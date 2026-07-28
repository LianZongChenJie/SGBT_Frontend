import { FormSchema } from '/@/components/Table';
import {render} from "@/utils/common/renderUtils";

export const columns = [
  {
    title: '表达式名称',
    dataIndex: 'name',
    width: 180,
    ellipsis: true,
  },
  {
    title: '表达式',
    width: 180,
    dataIndex: 'expression',
  },
  {
    title: '业务类型',
    width: 180,
    dataIndex: 'bizType',
    customRender: ({ text }) => {
      return render.renderDict(text, 'processExpressionBizType');
    },
  },
];
/**
 * 列表查询form
 */
export const searchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  // {
  //   field: 'expression',
  //   label: '表达式',
  //   component: 'Input',
  //   colProps: { span: 6 },
  // },
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
    label: '表达式名称',
    field: 'name',
    required: true,
    component: 'Input',
  },
  {
    label: '表达式',
    field: 'expression',
    required: true,
    component: 'InputTextArea',
  },
  {
    label: '业务类型',
    field: 'bizType',
    required: false,
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'processExpressionBizType',
    },
  },
];
