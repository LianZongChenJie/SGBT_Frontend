import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';

export const columns: BasicColumn[] = [
  {
    title: '版本号',
    dataIndex: 'versionNo',
    width: 170,
    resizable: true,
  },
  {
    title: '版本名称',
    align: 'center',
    dataIndex: 'versionName',
  },
  {
    title: '平台',
    dataIndex: 'app',
    width: 170,
    resizable: true,
    customRender: ({ text }) => {
      return text == 1 ? '安卓-正常版' : text == 0 ? '安卓-简版' : '';
    },
  },
  {
    title: '是否强制升级',
    align: 'center',
    dataIndex: 'forceUpgrade',
    customRender: ({ text }) => {
      return text == 1 ? '强制升级' : text == 0 ? '不强制升级' : '';
    },
  },
  {
    title: '版本说明',
    dataIndex: 'remark',
    width: 130,
    resizable: true,
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status',
    customRender: ({ text }) => {
      return text == 1 ? '有效' : text == 0 ? '无效' : '';
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'versionNo',
    label: '版本号',
    component: 'Input',
    componentProps: {
      trim: true,
      placeholder: '请输入版本号',
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'app',
    label: '类型',
    component: 'JDictSelectTag',
    required: true,
    componentProps: {
      dictCode: 'app',
    },
  },
  {
    field: 'versionName',
    label: '版本名称',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 40,
      placeholder: '请输入版本名称',
    },
  },
  // {
  //   field: 'aaa',
  //   label: '资料上传',
  //   required: false,
  //   component: 'JImageUpload',
  //   componentProps: {
  //     text: '点击上传',
  //
  //   },
  // },
  {
    field: 'versionNo',
    label: '版本号',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 20,
      placeholder: '请输入版本号',
    },
  },
  {
    field: 'forceUpgrade',
    label: '是否强制升级',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: [
        { label: '强制升级', value: 1 },
        { label: '不强制升级', value: 0 },
      ],
    },
  },
  {
    field: 'remark',
    label: '更新说明',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      maxlength: 200,
      rows: 4,
      showCount: true,
      placeholder: '请输入更新说明',
    },
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: [
        { label: '有效', value: '1' },
        { label: '无效', value: '0' },
      ],
    },
  },
];
