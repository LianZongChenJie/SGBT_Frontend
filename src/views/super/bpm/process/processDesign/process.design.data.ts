import { BasicColumn, FormSchema } from '/@/components/Table';
import { ajaxGetDictItems } from '/@/views/system/menu/menu.api';
import { render } from '/@/utils/common/renderUtils';

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
    title: '流程名称',
    align: 'center',
    dataIndex: 'processName',
    sorter: true,
  },
  {
    title: '流程编码',
    align: 'center',
    dataIndex: 'processKey',
    sorter: true,
  },
  {
    title: '流程类型',
    align: 'center',
    dataIndex: 'processType',
    sorter: true,
    customRender: function ({ text }) {
      return render.renderDict(text, 'bpm_process_type');
    },
  },
  {
    title: '发布状态',
    align: 'center',
    sorter: true,
    dataIndex: 'processStatus',
    customRender: function ({ text }) {
      if (text == 1) {
        return '已发布';
      } else if (text == 0) {
        return '未发布';
      } else {
        return text;
      }
    },
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createTime',
    sorter: true,
  },
];

/**
 * 查询条件
 */
export const searchFormSchema: FormSchema[] = [
  {
    label: '流程名称',
    field: 'processName',
    component: 'Input',
  },
  {
    label: '流程编码',
    field: 'processKey',
    component: 'Input',
  },
  {
    label: '流程类型',
    field: 'processType',

    component: 'ApiSelect',
    componentProps: {
      api: ajaxGetDictItems,
      params: { code: 'bpm_process_type' },
      labelField: 'text',
      valueField: 'value',
    },
  },
  {
    label: '对接编码',
    field: 'flowCode',
    component: 'Input',
  },
  {
    label: '设计风格',
    field: 'processDesginType',
    component: 'Select',
    defaultValue: 'default',
    componentProps: () => {
      return {
        options: [
          { label: '请选择', value: '' },
          { label: '默认设计', value: 'default' },
          { label: '简版设计', value: 'mini' },
        ],
      };
    },
  },
];
