import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';

export const columns: BasicColumn[] = [
  { title: '巡检项名称', align: 'center', dataIndex: 'knowledgeItemName' },
  { title: '关联巡检内容', align: 'center', dataIndex: 'contentName' },
  { title: '来源说明', align: 'center', dataIndex: 'source' }
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '巡检项名称',
    field: 'knowledgeItemName',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '关联巡检内容',
    field: 'contentName',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    label: '来源说明',
    field: 'source',
    component: 'Input',
    colProps: { span: 8 },
  },
];
