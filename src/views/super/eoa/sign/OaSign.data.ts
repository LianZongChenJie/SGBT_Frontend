import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import dayjs from 'dayjs';
import { getSignType, getOptionsSignType, getOptionsSignStatus, getSignStatus, validatorEndTime } from './utils/util';
import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
import { render } from '/@/utils/common/renderUtils';

/**
 * 打卡列表事件
 */
export const columnsInfo: BasicColumn[] = [
  {
    title: '打卡人员',
    key: 'realname',
    align: 'center',
    width: '200px',
    dataIndex: 'realname',
  },
  {
    title: '打卡时间',
    key: 'signTime_date',
    align: 'center',
    dataIndex: 'signTime',
    width: '200px',
    customRender: ({ text }) => dayjs(text).format('YY/MM/DD'),
  },
  {
    title: '打卡时间',
    key: 'signTime_time',
    align: 'center',
    dataIndex: 'signTime',
    width: '200px',
    customRender: ({ text }) => dayjs(text).format('HH:mm:ss'),
  },
  {
    title: '类型',
    align: 'center',
    dataIndex: 'signType',
    customRender: ({ text }) => getSignType(text),
  },
  {
    title: '打卡状态',
    align: 'center',
    dataIndex: 'signStatus',
    slots: { customRender: 'signStatus' },
  },
];

/**
 * 补卡列表
 */
export const patchColumns: BasicColumn[] = [
  {
    title: '补卡类型',
    align: 'center',
    dataIndex: 'patchType',
    width: '100px',
    customRender: ({ text }) => getSignType(text),
  },
  {
    title: '补卡日期',
    align: 'center',
    width: '100px',
    key: 'abnormalTime_date',
    dataIndex: 'abnormalTime',
    customRender: ({ text }) => dayjs(text).format('YY/MM/DD'),
  },
  {
    title: '异常时间',
    align: 'center',
    width: '100px',
    key: 'abnormalTime_time',
    dataIndex: 'abnormalTime',
    customRender: ({ text }) => dayjs(text).format('HH:mm:ss'),
  },
  {
    title: '正常时间',
    align: 'center',
    width: '100px',
    dataIndex: 'patchTime',
    customRender: ({ text }) => text + ':00',
  },
  {
    title: '异常状态',
    align: 'center',
    width: '100px',
    dataIndex: 'patchStatus',
    customRender: ({ text }) => getSignStatus(text),
  },
  {
    title: '补卡原因',
    align: 'center',
    width: '200px',
    dataIndex: 'patchReason',
    slots: { customRender: 'patchReason' },
  },
  {
    title: '操作日期',
    align: 'center',
    width: '200px',
    dataIndex: 'createTime',
    customRender: ({ text }) => dayjs(text).format('YY/MM/DD HH:mm:ss'),
  },
  {
    title: '审批状态',
    align: 'center',
    dataIndex: 'bpmStatus',
    width: '150px',
    customRender: ({ text, record }) => {
      let tbTypeText = filterDictTextByCache('bpm_status', text);
      if (record.bizStatus === '1') {
        tbTypeText = '已同意';
      }
      if (record.bizStatus === '2') {
        tbTypeText = '未同意';
      }
      return tbTypeText;
    },
  },
];

/**
 * 补卡异常列
 */
export const patchExceptionColumns: BasicColumn[] = [
  {
    title: '打卡时间',
    align: 'center',
    dataIndex: 'signTime',
  },
  {
    title: '类型',
    align: 'center',
    dataIndex: 'signType',
    customRender: ({ text }) => getSignType(text),
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'signStatus',
    slots: { customRender: 'signStatus' },
  },
];

/**
 * 外勤异常列
 */
export const outColumns: BasicColumn[] = [
  {
    title: '外出地点',
    align: 'center',
    width: 80,
    dataIndex: 'outPosition',
  },
  {
    title: '外出事由',
    align: 'center',
    width: 80,
    dataIndex: 'outReason',
  },
  {
    title: '是否用车',
    align: 'center',
    width: 100,
    dataIndex: 'useCar',
    customRender: ({ text }) => (text === 1 ? '需要用车' : '不需要用车'),
  },
  {
    title: '车牌号',
    align: 'center',
    width: 80,
    dataIndex: 'carNumber',
  },
  {
    title: '预期',
    children: [
      {
        title: '外出时间',
        align: 'center',
        width: 150,
        dataIndex: 'expectedStartTime',
        customRender: ({ text }) => dayjs(text).format('YY/MM/DD HH:mm:ss'),
      },
      {
        title: '回来时间',
        align: 'center',
        width: 150,
        dataIndex: 'expectedEndTime',
        customRender: ({ text }) => dayjs(text).format('YY/MM/DD HH:mm:ss'),
      },
    ],
  },
  {
    title: '实际',
    children: [
      {
        title: '外出时间',
        align: 'center',
        width: 150,
        dataIndex: 'actualStartTime',
        customRender: ({ text }) => dayjs(text).format('YY/MM/DD HH:mm:ss'),
      },
      {
        title: '回来时间',
        align: 'center',
        width: 150,
        dataIndex: 'actualEndTime',
        customRender: ({ text }) => dayjs(text).format('YY/MM/DD HH:mm:ss'),
      },
    ],
  },

  {
    title: '流程状态',
    align: 'center',
    dataIndex: 'bpmStatus',
    width: 80,
    customRender: ({ text }) => filterDictTextByCache('bpm_status', text),
  },
];

/**
 * 考勤统计列
 */
export const statisticsColumns: BasicColumn[] = [
  {
    title: '姓名',
    align: 'center',
    dataIndex: 'realname',
    width: 100,
  },
  {
    title: '工作天数',
    align: 'center',
    dataIndex: 'actualWorkingDays',
    width: 100,
  },
  {
    title: '正常打卡',
    align: 'center',
    dataIndex: 'normalTotal',
    width: 100,
  },
  {
    title: '迟到天数',
    align: 'center',
    dataIndex: 'lateTotal',
    width: 100,
  },
  {
    title: '旷工天数',
    align: 'center',
    dataIndex: 'absentTotal',
    width: 100,
  },
  {
    title: '早退天数',
    align: 'center',
    dataIndex: 'leaveEarlyTotal',
    width: 100,
  },
  {
    title: '补卡次数',
    align: 'center',
    dataIndex: 'patchTotal',
    width: 100,
  },
  {
    title: '外勤天数',
    align: 'center',
    dataIndex: 'outTotal',
    width: 100,
  },
  {
    title: '出差天数',
    align: 'center',
    dataIndex: 'businessTravelTotal',
    width: 100,
  },
  {
    title: '请假次数',
    align: 'center',
    dataIndex: 'leaveTotal',
    width: 100,
  },
  {
    title: '缺卡次数',
    align: 'center',
    dataIndex: 'missingTotal',
    width: 100,
  },
];

/**
 * 考勤规则表单数据
 */
export const ruleFormSchema: FormSchema[] = [
  {
    label: '工作日',
    field: 'workingDays',
    component: 'CheckboxGroup',
    slot: 'workingDays',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请至少选择一项!' }];
    },
  },
  {
    label: '上班时间',
    field: 'onTime',
    component: 'TimePicker',
    componentProps: {
      format: 'HH:mm',
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '上班时间必须填写!' }];
    },
  },
  {
    label: '上班迟到时间',
    field: 'onTimeLate',
    slot: 'onTimeLate',
    component: 'TimePicker',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '上班迟到时间必须填写!' }];
    },
  },
  {
    label: '上班旷工时间',
    field: 'onTimeAbsent',
    slot: 'onTimeAbsent',
    component: 'TimePicker',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '上班旷工时间必须填写!' }];
    },
  },
  {
    label: '下班时间',
    field: 'offTime',
    component: 'TimePicker',
    componentProps: {
      format: 'HH:mm',
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '上班时间必须填写!' }];
    },
  },
  {
    label: '下班早退时间',
    field: 'offTimeEarly',
    slot: 'offTimeEarly',
    labelWidth: 200,
    component: 'TimePicker',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '上班时间必须填写!' }];
    },
  },
  {
    label: '定位中心经纬度',
    field: 'geolocation',
    component: 'JInput',
    slot: 'geolocation',
  },
  {
    label: '不参与打卡人员',
    field: 'notJoining',
    component: 'JSelectUserByDept',
  },
  {
    label: '是否展示假期',
    field: 'showStatus',
    component: 'JDictSelectTag',
    componentProps: {
      type: 'radio',
      dictCode: 'yn',
    },
  },
  {
    label: '元旦假期时间',
    field: 'holidayYuanDan',
    component: 'RangePicker',
    show: false,
    componentProps: {
      placeholder: ['元旦假期开始时间', '元旦假期结束时间'],
      valueType: 'Date',
    },
  },
  {
    label: '春节假期时间',
    field: 'holidayChunJie',
    component: 'RangePicker',
    show: false,
    componentProps: {
      placeholder: ['春节假期开始时间', '春节假期结束时间'],
      valueType: 'Date',
    },
  },
  {
    label: '清明假期时间',
    field: 'holidayQingMing',
    component: 'RangePicker',
    show: false,
    componentProps: {
      placeholder: ['清明假期开始时间', '清明假期结束时间'],
      valueType: 'Date',
    },
  },
  {
    label: '五一劳动节假期时间',
    field: 'holidayLaoDong',
    component: 'RangePicker',
    show: false,
    componentProps: {
      placeholder: ['五一劳动节假期开始时间', '五一劳动节假期结束时间'],
      valueType: 'Date',
    },
  },
  {
    label: '端午假期时间',
    field: 'holidayDuanWu',
    component: 'RangePicker',
    show: false,
    componentProps: {
      placeholder: ['端午假期开始时间', '端午假期结束时间'],
      valueType: 'Date',
    },
  },
  {
    label: '中秋假期时间',
    field: 'holidayZhongQiu',
    component: 'RangePicker',
    show: false,
    componentProps: {
      placeholder: ['中秋假期开始时间', '中秋假期结束时间'],
      valueType: 'Date',
    },
  },
  {
    label: '国庆假期时间',
    field: 'holidayGuoQing',
    component: 'RangePicker',
    show: false,
    componentProps: {
      placeholder: ['国庆假期开始时间', '国庆假期结束时间'],
      valueType: 'Date',
    },
  },
  {
    label: '其他假期时间',
    field: 'holidayOther',
    show: false,
    component: 'RangePicker',
    componentProps: {
      placeholder: ['其他假期开始时间', '其他假期结束时间'],
      valueType: 'Date',
    },
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];

/**
 * 打卡查询数据
 */
export const infoSearchFormSchema: FormSchema[] = [
  {
    label: '打卡日期',
    field: 'signTime',
    component: 'RangePicker',
    componentProps: {
      valueType: 'Date'
    },
  },
  {
    label: '打卡类型',
    field: 'signType',
    component: 'Select',
    componentProps: {
      options: getOptionsSignType(),
    },
  },
  {
    label: '打卡状态',
    field: 'signStatus',
    component: 'Select',
    componentProps: {
      options: getOptionsSignStatus(),
    },
  },
];

/**
 * 打卡表单
 */
export const infoFormSchema: FormSchema[] = [
  {
    label: '打卡时间',
    field: 'signTime',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    label: '打卡类型',
    field: 'signTypeText',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    label: '打卡状态',
    field: 'signStatusText',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    label: '备注',
    field: 'signRemarks',
    component: 'InputTextArea',
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];

/**
 * 补卡表单
 */
export const patchFormSchema: FormSchema[] = [
  {
    label: '补卡类型',
    field: 'signType',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    label: '异常状态',
    field: 'abnormalStatus',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    label: '异常时间',
    field: 'abnormalTime',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    label: '正常时间',
    field: 'patchTime',
    component: 'Input',
    dynamicDisabled: true,
  },
  {
    label: '补卡原因',
    field: 'patchReason',
    component: 'InputTextArea',
    componentProps: {
      rows: 5,
    },
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];

/**
 * 补卡查询数据
 */
export const patchSearchFormSchema: FormSchema[] = [
  {
    label: '打卡日期',
    field: 'patchTime',
    component: 'RangePicker',
    componentProps: {
      valueType: 'Date'
    },
  },
  {
    label: '异常类型',
    field: 'patchType',
    component: 'Select',
    componentProps: {
      options: getOptionsSignType(),
    },
  },
  {
    label: '打卡状态',
    field: 'patchStatus',
    component: 'Select',
    componentProps: {
      options: getOptionsSignStatus(),
    },
  },
];

/**
 * 外勤表单数据
 */
export const outFormSchema: FormSchema[] = [
  {
    label: '外出地点',
    field: 'outPosition',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '外出地点必须填写!' }];
    },
  },
  {
    label: '外出事由',
    field: 'outReason',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '外出事由必须填写!' }];
    },
  },
  {
    label: '是否用车',
    field: 'useCar',
    component: 'Select',
    slot: 'useCar',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '是否用车必须填写!' }];
    },
  },
  {
    label: '车牌号',
    field: 'carNumber',
    component: 'Input',
    dynamicRules: ({ model, schema }) => {
      return [{ required: false, message: '车牌号必须填写!' }];
    },
  },
  {
    label: '预期外出时间',
    field: 'expectedStartTime',
    slot: 'expectedStartTime',
    component: 'RangePicker',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请选择预期外出时间' }, { validator: (_, value) => validatorEndTime(model.expectedEndTime, value) }];
    },
  },
  {
    label: '预期回来时间',
    field: 'expectedEndTime',
    slot: 'expectedEndTime',
    component: 'RangePicker',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请选择预期回来时间' }, { validator: (_, value) => validatorEndTime(model.expectedStartTime, value) }];
    },
  },
  {
    label: '实际外出时间',
    field: 'actualStartTime',
    component: 'RangePicker',
    slot: 'actualStartTime',
    show: false,
  },
  {
    label: '实际回来时间',
    field: 'actualEndTime',
    component: 'RangePicker',
    slot: 'actualEndTime',
    show: false,
  },
  {
    label: '编号',
    field: 'id',
    component: 'Input',
    show: false,
  },
];

/**
 * 外勤查询数据
 */
export const outSearchFormSchema: FormSchema[] = [
  {
    label: '预计外出日期',
    field: 'expectedStartTime',
    component: 'RangePicker',
    componentProps:{
      valueType: 'Date'
    }
  },
  {
    label: '是否用车',
    field: 'useCar',
    component: 'Select',
    componentProps: {
      options: [
        { label: '需要用车', value: 1 },
        { label: '不需要用车', value: 0 },
      ],
    },
  },
  {
    label: '车牌号',
    field: 'carNumber',
    component: 'Input',
  },
];

/**
 * 考勤统计
 */
export const staticSearchFormSchema: FormSchema[] = [
  {
    label: '打卡日期',
    field: 'monthValue',
    component: 'MonthPicker',
    componentProps: {
      format: 'YYYY年MM月',
      valueFormat: 'YYYY-MM',
    },
    defaultValue: dayjs().format('YYYY-MM'),
  },
];
