import { BasicColumn, FormSchema } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '名称',
    align: 'center',
    dataIndex: 'name',
    width: 120,
  },
  {
    title: '会议地点',
    align: 'center',
    dataIndex: 'location_dictText',
    width: 120,
    ellipsis: true,
  },
  {
    title: '召集人',
    align: 'center',
    width: 120,
    dataIndex: 'originator_dictText',
  },
  {
    title: '联系人',
    align: 'center',
    width: 120,
    dataIndex: 'contacts_dictText',
  },
  {
    title: '开始时间',
    align: 'center',
    dataIndex: 'beginTime',
    width: 120,
  },
  {
    title: '结束时间',
    align: 'center',
    dataIndex: 'endTime',
    width: 120,
  },
  {
    title: '会议状态',
    align: 'center',
    dataIndex: 'status_dictText',
    width: 80,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'type',
    label: '类型',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'mettingType',
    },
    colProps: { span: 8 },
  },
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    label: 'id',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'type',
    label: '类型',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'mettingType',
    },
  },
  {
    field: 'originator',
    label: '召集人',
    component: 'JSelectUserByDept',
    componentProps: {
      showButton: false,
      isRadioSelection: true,
    },
  },
  {
    field: 'contacts',
    label: '联系人',
    component: 'JSelectUserByDept',
    componentProps: {
      showButton: false,
      isRadioSelection: true,
    },
  },
  {
    field: 'concatMode',
    label: '联系方式',
    component: 'Input',
    rules: [{ required: false, pattern: /^1[3456789]\d{9}$/, message: '手机号码格式有误' }],
  },
  {
    field: 'summaryUploader',
    label: '纪要上传人',
    component: 'JSelectUserByDept',
    componentProps: {
      showButton: false,
      isRadioSelection: true,
    },
  },
  {
    field: 'remindMode',
    label: '提醒方式',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'remindMode',
    },
  },
  {
    field: 'remind',
    label: '提醒时间',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'remindTime',
    },
  },
  {
    field: 'beginTime',
    label: '开始时间',
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    field: 'endTime',
    label: '结束时间',
    component: 'DatePicker',
    required: true,
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    field: 'location',
    label: '会议地点',
    component: 'Input',
    slot: 'location',
    dynamicRules: ({ model }) => {
      const required = model['customLocation'] ? false : true;
      return [
        {
          required: required,
          message: '会议地点不能为空',
        },
      ];
    },
  },
  {
    field: '#',
    label: '',
    component: 'Input',
    slot: 'meetUse',
  },
  {
    field: 'customLocation',
    label: '自定义地点',
    component: 'Input',
    componentProps: ({ formActionType }) => {
      const { clearValidate } = formActionType;
      return {
        onChange: (e: any) => {
          clearValidate(['customLocation', 'location']);
        },
      };
    },
    dynamicRules: ({ model }) => {
      const required = model['location'] ? false : true;
      return [
        {
          required: required,
          message: '自定义地点不能为空',
        },
      ];
    },
  },
  {
    field: 'approvalStatus',
    label: '是否审批',
    component: 'RadioGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        {
          label: '是',
          value: '1',
        },
        {
          label: '否',
          value: '0',
        },
      ],
    },
  },
  {
    field: 'joinPerson',
    label: '参与人员',
    component: 'JSelectUserByDept',
    componentProps: {
      showButton: false,
      isRadioSelection: false,
    },
  },
  {
    field: 'otherPerson',
    label: '其他人员',
    component: 'Input',
  },
  {
    field: 'content',
    label: '会议内容',
    component: 'InputTextArea',
    componentProps: {
      showButton: false,
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
  },
  {
    field: 'files',
    label: '相关文件',
    component: 'JUpload',
  },
];
