import { BasicColumn, FormSchema } from '/@/components/Table';
import { getPlanList, deletePlan, copyPlan, savePlan, disablePlan, getMdmSpaceCascadeTree } from './inspectionPlan.api';
import { majorList } from '../inspectionContent/inspectionContent.api';
import { on } from 'events';
import { M } from 'vite/dist/node/types.d-aGj9QkWt';
import { ref } from 'vue';
import { labelRect } from 'mermaid/dist/rendering-util/rendering-elements/shapes/labelRect';

export let locationData = ref([]);
export let planFormSchema: FormSchema[] = [];
// 处理数据，删除最后一级 children 为 null 的属性
const processLocationData = (data) => {
  // 处理非数组情况
  if (!Array.isArray(data)) {
    return data;
  }

  return data.map(item => {
    // 深拷贝，避免修改原数据
    const processedItem = JSON.parse(JSON.stringify(item));

    // 检查 children 是否存在
    if ('children' in processedItem) {
      // console.log('处理节点:', processedItem.label, 'children:', processedItem.children);

      // 检查 children 是否为有效数组
      if (Array.isArray(processedItem.children) && processedItem.children.length > 0) {
        // 递归处理子节点
        processedItem.children = processLocationData(processedItem.children);
      } else {
        // 删除 children 为 null 或空数组的属性
        delete processedItem.children;
        // console.log('删除了 children 属性:', processedItem.label);
      }
    }

    return processedItem;
  });
};
// 获取巡检区域数据
export const fetchLocationData = ({ campus: value }) => {
  return getMdmSpaceCascadeTree({ campus: value }).then(response => {
    const data = response?.data || response;
    const processedData = processLocationData(data);
    locationData.value = processedData;



    return processedData;
  }).catch(error => {
    console.error('获取巡检区域数据失败', error);
    return [];
  });
};
// 立即执行获取数据
// fetchLocationData();

// 基础信息表单
export const basicFormSchema = [
  {
    field: 'id',
    label: '计划ID',
    component: 'Input',
    show: false,
  },
  {
    field: 'name',
    label: '计划名称',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
  },
  
  { label: '', field: 'majorText', component: 'Input', show: false },
  {
    label: '所属专业', field: 'majorId', component: 'ApiSelect', required: true, colProps: { span: 12 }, componentProps: ({ formModel }) => {
      return {
        api: majorList,
        resultField: 'records',
        labelField: 'name',
        valueField: 'id',
        onChange: (value, option) => {
          formModel.majorText = option?.label || '';
        }
      };
    }
  },
  {
    field: 'assigneeType',
    label: '执行人',
    component: 'RadioGroup',
    colProps: { span: 12 },
    componentProps: ({ formModel }) => {
      return {
        options: [
          { label: '人员', value: 'USER' },
          { label: '科组', value: 'ORG' },
        ],
        onChange: (value) => {
          formModel.assigneeIds = [];
          formModel.assigneeNames = '';
        }
      };
    },
    defaultValue: 'USER',
    required: true,
  },
  {
    field: 'assigneeIds',
    label: '系统人员',
    component: 'JSelectUser',
    colProps: { span: 12 },
    show: ({ values }) => values.assigneeType == 'USER',
    componentProps: ({ formModel }) => {
      return {
        onChange: (options, values) => {
          console.log(options, values)
        }
      };
    },
    slot: 'assigneeIds',
    required: true,
  },
  {
    field: 'assigneeNames',
    label: '系统科组',
    component: 'Input',
    show: false,
  },
  {
    field: 'assigneeIds',
    label: '系统科组',
    component: 'JSelectDept',
    colProps: { span: 12 },
    ifShow: ({ values }) => values.assigneeType == 'ORG',
    componentProps: ({ formModel }) => {
      return {
        labelKey: 'departName',
        rowKey: 'orgCode',
        multiple: false,
        defaultExpandLevel: 3,
        sync: true,
        checkStrictly: false,
        onSelect: (options, values) => {
          formModel.assigneeNames = options[0].label;
        }
      };
    },
    required: true,
  },
];

// 执行时间表单
export const timeFormSchema = [
  {
    field: 'validityType',
    label: '生效类型',
    component: 'Select',
    colProps: { span: 12 },
    componentProps: {
      options: [
        { label: '无期限', value: 'UNLIMITED' },
        { label: '固定有效期', value: 'FIXED' },
        { label: '自起始日永久生效', value: 'PERMANENT' },
      ],
      onChange: (value) => {
        console.log(value)
      }
    },
    required: true,
    defaultValue: 'UNLIMITED',
  },
  {
    field: 'dateRange',
    label: '生效时间',
    component: 'RangeDate',
    colProps: { span: 12 },
    show: ({ values }) => values.validityType == 'FIXED',
    componentProps: {
      //日期格式化
      format: 'YYYY-MM-DD',
    },
    required: true,
  },
  {
    field: 'startAt',
    label: '生效日期',
    component: 'DatePicker',
    colProps: { span: 12 },
    show: ({ values }) => values.validityType == 'PERMANENT',
    componentProps: {
      //日期格式化
      format: 'YYYY-MM-DD',
    },
    required: true,
  },
  {
    field: 'cycleType',
    label: '循环周期',
    component: 'Select',
    componentProps: ({ formModel }) => {
      return {
        options: [
          { label: '每天', value: 'DAILY' },
          { label: '每周', value: 'WEEKLY' },
          { label: '每月', value: 'MONTHLY' },
          // { label: '自定义间隔', value: 'CUSTOM' },
        ],
        onChange: (value) => {
          console.log(value)
          formModel.monthCycle = '';
          formModel.weekCycle = '';
          formModel.timeCycle = '';
        }
      }
    },
    colProps: { span: 12 },
    required: true,
  },
  {
    field: 'dayCycle',
    label: '执行天',
    component: 'Select',
    componentProps: ({ formModel }) => {

      if (formModel.cycleType === 'MONTHLY') {
        return {
          mode: 'multiple',
          options: [
            { label: '1日', value: '1' },
            { label: '2日', value: '2' },
            { label: '3日', value: '3' },
            { label: '4日', value: '4' },
            { label: '5日', value: '5' },
            { label: '6日', value: '6' },
            { label: '7日', value: '7' },
            { label: '8日', value: '8' },
            { label: '9日', value: '9' },
            { label: '10日', value: '10' },
            { label: '11日', value: '11' },
            { label: '12日', value: '12' },
            { label: '13日', value: '13' },
            { label: '14日', value: '14' },
            { label: '15日', value: '15' },
            { label: '16日', value: '16' },
            { label: '17日', value: '17' },
            { label: '18日', value: '18' },
            { label: '19日', value: '19' },
            { label: '20日', value: '20' },
            { label: '21日', value: '21' },
            { label: '22日', value: '22' },
            { label: '23日', value: '23' },
            { label: '24日', value: '24' },
            { label: '25日', value: '25' },
            { label: '26日', value: '26' },
            { label: '27日', value: '27' },
            { label: '28日', value: '28' },
            { label: '29日', value: '29' },
            { label: '30日', value: '30' },
            { label: '31日', value: '31' },
          ],
        };
      } else {
        return {
          mode: 'multiple',
          options: [
            { label: '周一', value: '1' },
            { label: '周二', value: '2' },
            { label: '周三', value: '3' },
            { label: '周四', value: '4' },
            { label: '周五', value: '5' },
            { label: '周六', value: '6' },
            { label: '周日', value: '7' },
          ],
        };
      }
    },
    colProps: { span: 12 },
    show: ({ values }) => values.cycleType == 'WEEKLY' || values.cycleType == 'MONTHLY',
    required: true,
  },
  {
    field: 'timeCycle',
    label: '执行时间',
    component: 'TimePicker',
    componentProps: {
      format: 'HH:mm',
      valueFormat: 'HH:mm',
    },
    colProps: { span: 12 },
    // dynamicDisabled: ({ values }) => values.cycleType != 'MONTHLY' && values.cycleType != 'WEEKLY' && values.cycleType != 'DAILY',
    required: true,
  },
  {
    field: 'taskCompletionDeadline',
    label: '任务完成时限',
    component: 'InputNumber',
    componentProps: {
      addonAfter:'小时',
      min: 1,
      max: 100,
      step: 1,
    },
    colProps: { span: 12 },
    // dynamicDisabled: ({ values }) => values.cycleType != 'MONTHLY' && values.cycleType != 'WEEKLY' && values.cycleType != 'DAILY',
    required: true,
  },
];

// 执行区域表单
export const locationFormSchema = [
  {
    field: 'campus',
    label: '院区',
    component: 'JDictSelectTag',
    colProps: { span: 12 },
    componentProps: {
      dictCode: 'campus_type',
      type: 'select',
      onChange: (value) => {
        console.log(value)
        fetchLocationData({ campus: value });
        
      }
    },
    required: true,
  },
  {
    field: 'executeLocationName',
    label: '巡检区域',
    component: 'Input',
    colProps: { span: 12 },
    show: false
  },
  {
    field: 'executeLocationIds',
    label: '巡检区域',
    component: 'Cascader',
    componentProps: ({ formModel }) => {
      return {
        options: locationData.value,
        maxTagCount: 10,
        placement: 'bottomRight',
        showSearch: true,
        multiple: true,
        onChange: (options, values) => {
          // 先清空之前的值
          formModel.executeLocationName = '';
          values.forEach((item, index) => {
            if (item.length > 0 && item[item.length - 1].fullPath) {
              formModel.executeLocationName += item[item.length - 1].fullPath + ',';
            }
          });
          // 移除末尾多余的逗号
          if (formModel.executeLocationName.endsWith(',')) {
            formModel.executeLocationName = formModel.executeLocationName.slice(0, -1);
          }
        }
      }

    },
    colProps: { span: 12 },
    required: true,
  },
];
export const columns: BasicColumn[] = [
  {
    title: '计划名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
  },
  {
    title: '所属专业',
    dataIndex: 'majorText',
    key: 'majorText',
    align: 'center',
    width: 90,
  },
  {
    title: '执行人',
    dataIndex: 'assigneeNames',
    key: 'assigneeNames',
    align: 'center',
    // width: 120,
    // ellipsis: true,
  },
  {
    title: '巡检区域',
    dataIndex: 'executeLocationName',
    key: 'aexecuteLocationNamerea',
    align: 'center',
    // width: 150,
    // ellipsis: true,
  },
  {
    title: '循环周期',
    dataIndex: 'cycleType',
    key: 'cycleType',
    align: 'center',
    slots: { customRender: 'cycleType' },
    width: 80,
  },
  {
    title: '生效时间',
    dataIndex: 'timeRange',
    key: 'timeRange',
    align: 'center',
    width: 210,
    ellipsis: true,
    slots: { customRender: 'timeRange' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 80,
    slots: { customRender: 'status' },
  },
  {
    title: '下次生成时间',
    dataIndex: 'nextRunAt',
    key: 'nextRunAt',
    align: 'center',
    width: 150,
    ellipsis: true,
  }
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'planName',
    label: '计划名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  // { label: '', field: 'majorText', component: 'Input', show: false },
  {
    label: '所属专业', field: 'majorId', component: 'ApiSelect', colProps: { span: 6 }, componentProps: ({ formModel }) => {
      return {
        api: majorList,
        resultField: 'records',
        labelField: 'name',
        valueField: 'id',
      };
    }
  },
  {
    field: 'planStatus',
    label: '计划状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '草稿', value: '草稿' },
        { label: '待生效', value: '待生效' },
        { label: '生效中', value: '生效中' },
        { label: '已停用', value: '已停用' },
        { label: '已结束', value: '已结束' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'executorName',
    label: '执行人',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'cycleType',
    label: '循环周期',
    component: 'Select',
    componentProps: {
      options: [
        { label: '每天', value: '每天' },
        { label: '每周', value: '每周' },
        { label: '每月', value: '每月' },
        { label: '自定义间隔', value: '自定义间隔' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    field: 'area',
    label: '巡检区域',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'dateRange',
    label: '生效时间范围',
    component: 'RangePicker',
    colProps: { span: 6 },
  },
];



export const detailColumns = {
  device: [
    { title: '对象类型', dataIndex: 'type', key: 'type', width: 80 },
    { title: '设备类型', dataIndex: 'category', key: 'category', width: 120 },
    { title: '巡检内容', dataIndex: 'content', key: 'content' },
    { title: '具体对象数', dataIndex: 'count', key: 'count', width: 100 },
    { title: '操作', key: 'action', width: 150, slots: { customRender: 'action' } },
  ],
  space: [
    { title: '对象类型', dataIndex: 'type', key: 'type', width: 80 },
    { title: '空间类型', dataIndex: 'category', key: 'category', width: 120 },
    { title: '巡检内容', dataIndex: 'content', key: 'content' },
    { title: '具体对象数', dataIndex: 'count', key: 'count', width: 100 },
    { title: '操作', key: 'action', width: 150, slots: { customRender: 'action' } },
  ],
  system: [
    { title: '对象类型', dataIndex: 'type', key: 'type', width: 80 },
    { title: '系统名称', dataIndex: 'category', key: 'category', width: 120 },
    { title: '巡检内容', dataIndex: 'content', key: 'content' },
    { title: '具体对象数', dataIndex: 'count', key: 'count', width: 100 },
    { title: '操作', key: 'action', width: 150, slots: { customRender: 'action' } },
  ],
};

export const objectPreviewColumns = [
  { title: '对象类型', dataIndex: 'objectType', key: 'objectType', slots: { customRender: 'objectType' }, width: 80, align: 'center' },
  { title: '资源类型', dataIndex: 'subtypeName', key: 'subtypeName', width: 120, align: 'center' },
  { title: '巡检内容', dataIndex: 'contentSummary', key: 'contentSummary' },
  { title: '具体对象数', dataIndex: 'objectCount', key: 'objectCount', width: 100, align: 'center' },
];

export const objectPreviewColumns2 = [
  { title: '设备名称', dataIndex: 'objectName', key: 'objectName', width: 140 },
  { title: '编码', dataIndex: 'objectCode', key: 'objectCode', width: 120 },
  { title: '所在位置', dataIndex: 'locationPath', key: 'locationPath' },
];

export const templatePreviewColumns = [
  { title: '巡检项', dataIndex: 'itemName', key: 'itemName', width: 120 },
  { title: '巡检内容', dataIndex: 'content', key: 'content' },
  { title: '结果类型', dataIndex: 'resultType', key: 'resultType', width: 100 },
];

export const contentViewColumns: BasicColumn[] = [
  { title: '巡检项', dataIndex: 'itemName', key: 'itemName', width: 120 },
  { title: '巡检内容', dataIndex: 'contentName', key: 'contentName' },
  { title: '结果类型', dataIndex: 'resultType', key: 'resultType', width: 100, slots: { customRender: 'resultType' } },
  { title: '选项值', dataIndex: 'optionValues', key: 'optionValues', width: 200 },
  { title: '来源', dataIndex: 'source', key: 'source', width: 100 },
  { title: '操作', key: 'action', width: 110, slots: { customRender: 'action' } }
];

export const planObjectFormSchema: FormSchema[] = [
  {
    field: 'objectType',
    label: '对象类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [
        { label: '设备', value: '设备' },
        { label: '空间', value: '空间' },
        { label: '系统', value: '系统' },
      ],
      onChange: (value) => {
        return value;
      },
    },
    colProps: { span: 12 },
  },
  {
    field: 'objectSubtype',
    label: '对象具体类型',
    component: 'Select',
    required: true,
    componentProps: {
      options: [],
    },
    colProps: { span: 12 },
  },
];

export const templateFormSchema: FormSchema[] = [
  {
    field: 'detailId',
    label: '所属明细',
    component: 'Select',
    required: true,
    componentProps: {
      options: [],
    },
    colProps: { span: 12 },
  },
  {
    field: 'sourceId',
    label: '巡检内容来源',
    component: 'Select',
    required: true,
    componentProps: {
      options: [],
    },
    colProps: { span: 12 },
  },
];

export const inspectItemFormSchema: FormSchema[] = [
  {
    field: 'detailId',
    label: '所属明细',
    component: 'Select',
    required: true,
    componentProps: {
      options: [],
    },
    colProps: { span: 12 },
  },
  {
    field: 'itemName',
    label: '巡检项名称',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
  },
  {
    field: 'content',
    label: '巡检内容',
    component: 'Input',
    colProps: { span: 24 },
  },
  {
    field: 'resultType',
    label: '结果类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '选项', value: '选项' },
        { label: '百分比', value: '百分比' },
        { label: '文本', value: '文本' },
      ],
    },
    colProps: { span: 12 },
  },
  {
    field: 'options',
    label: '选项值',
    component: 'Input',
    colProps: { span: 12 },
  },
];