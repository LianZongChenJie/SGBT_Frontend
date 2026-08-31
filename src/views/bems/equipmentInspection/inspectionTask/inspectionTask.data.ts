import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';

// 表格列配置
export const columns: BasicColumn[] = [
  { title: '任务编号', align: "center", dataIndex: 'taskNo', width: 210 },
  { title: '计划名称', align: "center", dataIndex: 'planName' },
  { title: '所属专业', align: "center", dataIndex: 'majorName', width: 100 },
  { title: '计划执行对象', align: "center", dataIndex: 'assigneeNames', width: 150 },
  { title: '实际执行人', align: "center", dataIndex: 'actualExecutorNames', width: 120 },
  { title: '执行开始时间', align: "center", dataIndex: 'executeWindowStart', width: 170, slots: { customRender: 'executeWindowStart' } },
  { title: '截止时间', align: "center", dataIndex: 'executeWindowEnd', width: 170, slots: { customRender: 'executeWindowEnd' } },
  { title: '执行进度', align: "center", dataIndex: 'executionProgress', width: 100 },
  { title: '状态', align: "center", dataIndex: 'status', width: 100, slots: { customRender: 'status' } },
  { title: '报修数', align: "center", dataIndex: 'repairCount', width: 80, slots: { customRender: 'repairCount' } },
  { title: '实际完成时间', align: "center", dataIndex: 'submittedAt', width: 160, slots: { customRender: 'submittedAt' } },
];

// 搜索表单Schema
export const searchFormSchema: FormSchema[] = [
  { label: '任务编号', field: 'taskNo', component: 'Input', colProps: { span: 8 } },
  { label: '计划名称', field: 'planName', component: 'Input', colProps: { span: 8 } },
  { label: '所属专业', field: 'majorName', component: 'Input', colProps: { span: 8 } },
  { label: '计划执行对象', field: 'executionObjectName', component: 'Input', colProps: { span: 8 } },
  { label: '实际执行人', field: 'actualExecutorName', component: 'Input', colProps: { span: 8 } },
  {
    label: '状态', field: 'status', component: 'Select', colProps: { span: 8 }, componentProps: {
      options: [
        { label: '待执行', value: 'PENDING' },
        { label: '执行中', value: 'IN_PROGRESS' },
        { label: '已完成', value: 'COMPLETED' },
        { label: '已逾期', value: 'OVERDUE' },
      ],
    }
  },
  { label: '执行时间范围', field: 'executeStartTime', component: 'RangePicker', colProps: { span: 8 } },
];
