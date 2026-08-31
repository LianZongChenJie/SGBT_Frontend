import { BasicColumn, FormSchema } from '/@/components/Table';

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
    title: '节点名称',
    align: 'center',
    width: 120,
    dataIndex: 'processNodeName',
  },
  {
    title: '节点编码',
    align: 'center',
    width: 120,
    dataIndex: 'processNodeCode',
  },
  {
    title: 'PC表单地址',
    align: 'center',
    dataIndex: 'modelAndView',
    width: 240,
    ellipsis: true,
  },
  {
    title: '移动表单地址',
    align: 'center',
    dataIndex: 'modelAndViewMobile',
    width: 240,
    ellipsis: true,
  },
  {
    title: '超时提醒（时）',
    align: 'center',
    dataIndex: 'nodeTimeout',
    width: 100,
    customRender: function ({ text }) {
      if (!text) {
        return '';
      }
      return text + '小时';
    },
  },
];

/**
 * 表单
 */
export const nodeFormSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: 'processId',
    field: 'processId',
    component: 'Input',
    show: false,
  },
  {
    label: '节点名称',
    field: 'processNodeName',
    component: 'Input',
    componentProps:{
      readonly: true
    }
  },
  {
    label: '节点编码',
    field: 'processNodeCode',
    component: 'Input',
    componentProps:{
      readonly: true
    }
  },
  {
    label: 'PC表单地址',
    field: 'modelAndView',
    component: 'Input',
    slot: 'modelAndView'
  },
  {
    label: '移动表单地址',
    field: 'modelAndViewMobile',
    component: 'Input',
    slot: 'modelAndViewMobile'
  },
  {
    label: '超时提醒（时）',
    field: 'nodeTimeout',
    component: 'Input',
    slot: 'nodeTimeout',
  },
];
