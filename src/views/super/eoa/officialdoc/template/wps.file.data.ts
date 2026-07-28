import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '模板名称',
    dataIndex: 'name',
    width: 120,
  },
  {
    title: '版本',
    dataIndex: 'version',
    width: 100,
  },
  {
    title: '下载地址',
    dataIndex: 'downloadUrl',
    width: 100,
    slots: { customRender: 'fileSlot' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '模板名称',
    field: 'name',
    component: 'Input',
    colProps: { span: 8 },
  },
];
