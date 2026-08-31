import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
// import {render} from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
  {
    title: '规则名称',
    dataIndex: 'ruleName',
    width: 170,
    resizable: true,
  },
  {
    title: '执行规则类型',
    dataIndex: 'ruleType',
    width: 90,
    resizable: true,
    customRender:({text})=>{
      if(text === 1){
        return '小时'
      } else if(text === 2){
        return '日'
      }else if(text === 3){
        return '周'
      } else if(text === 4){
        return '月'
      }else if(text === 5){
        return '季'
      }else if(text === 6){
        return '年'
      }
    }
  },
  {
    title: '执行频率',
    dataIndex: 'frequencyInterval',
    width: 100,
    resizable: true,
  },
  {
    title: '执行间隔',
    dataIndex: 'frequencyInterval',
    width: 100,
    resizable: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    resizable: true,
    customRender:({text})=>{
      if(text === 0){
        return '禁用'
      } else if(text === 1){
        return '启用'
      }
    }
  },
  {
    title: '规则描述',
    dataIndex: 'ruleDescription',
    width: 150,
    resizable: true,
  },
];
export const columnsMonth: BasicColumn[] = [
  {
    title: '日期',
    dataIndex: 'dayValue',
    width: 80,
    resizable: true,
    slots: { customRender: 'dayValue' },
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 100,
    resizable: true,
    slots: { customRender: 'startTime' },
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    width: 100,
    resizable: true,
    slots: { customRender: 'endTime' },
  },
];
export const columnsNianLinghuoshijian: BasicColumn[] = [
  {
    title: '月份',
    dataIndex: 'monthValue',
    width: 60,
    resizable: true,
    slots: { customRender: 'monthValue' },
  },
  {
    title: '日期',
    dataIndex: 'dayValue',
    width: 150,
    resizable: true,
    slots: { customRender: 'dayValue' },
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 150,
    resizable: true,
    slots: { customRender: 'startTime' },
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    width: 150,
    resizable: true,
    slots: { customRender: 'endTime' },
  },
];
export const columnsNianTongyishijian: BasicColumn[] = [
  {
    title: '月份',
    dataIndex: 'monthValue',
    width: 60,
    resizable: true,
    slots: { customRender: 'monthValue' },
  },
  {
    title: '日期',
    dataIndex: 'date',
    width: 150,
    resizable: true,
    slots: { customRender: 'date' },
  },
];

export const columnsNianShijianduan: BasicColumn[] = [
  {
    title: '月份',
    dataIndex: 'monthValue',
    width: 60,
    resizable: true,
    slots: { customRender: 'monthValue' },
  },
  {
    title: '开始日',
    dataIndex: 'startDay',
    width: 120,
    resizable: true,
    slots: { customRender: 'startDay' },
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    width: 120,
    resizable: true,
    slots: { customRender: 'startTime' },
  },
  {
    title: '结束日',
    dataIndex: 'endDay',
    width: 120,
    resizable: true,
    slots: { customRender: 'endDay' },
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    width: 120,
    resizable: true,
    slots: { customRender: 'endTime' },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'ruleName',
    label: '规则名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
];


export const formSchemaDate: FormSchema[] = [
  {
    field: 'dayValue',
    label: '选择日期',
    component: 'CheckboxGroup',
    required: true,
    componentProps: {
      options:[
        { label: '1日', value: 1 },
        { label: '2日', value: 2 },
        { label: '3日', value: 3 },
        { label: '4日', value: 4 },
        { label: '5日', value: 5 },
        { label: '6日', value: 6 },
        { label: '7日', value: 7 },
        { label: '8日', value: 8 },
        { label: '9日', value: 9 },
        { label: '10日', value: 10 },
        { label: '11日', value: 11 },
        { label: '12日', value: 12 },
        { label: '13日', value: 13 },
        { label: '14日', value: 14 },
        { label: '15日', value: 15 },
        { label: '16日', value: 16 },
        { label: '17日', value: 17 },
        { label: '18日', value: 18 },
        { label: '19日', value: 19 },
        { label: '20日', value: 20 },
        { label: '21日', value: 21 },
        { label: '22日', value: 22 },
        { label: '23日', value: 23 },
        { label: '24日', value: 24 },
        { label: '25日', value: 25 },
        { label: '26日', value: 26 },
        { label: '27日', value: 27 },
        { label: '28日', value: 28 },
        { label: '29日', value: 29 },
        { label: '30日', value: 30 },
        { label: '31日', value: 31 },
      ]
    },
  }
];

export const formSchemaMonth: FormSchema[] = [
  {
    field: 'month',
    label: '选择月份',
    component: 'CheckboxGroup',
    required: true,
    componentProps: {
      options:[
        { label: '1月', value: 1 },
        { label: '2月', value: 2 },
        { label: '3月', value: 3 },
        { label: '4月', value: 4 },
        { label: '5月', value: 5 },
        { label: '6月', value: 6 },
        { label: '7月', value: 7 },
        { label: '8月', value: 8 },
        { label: '9月', value: 9 },
        { label: '10月', value: 10 },
        { label: '11月', value: 11 },
        { label: '12月', value: 12 },
      ]
    },
  }
];
