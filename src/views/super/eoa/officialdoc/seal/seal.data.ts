import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

/**
 * 列表数据
 */
export const columns: BasicColumn[] = [
  {
    title: '印章名称',
    align: 'center',
    dataIndex: 'sealName',
    width: 300,
  },
  {
    title: '印章图片',
    align: 'center',
    dataIndex: 'sealPic',
    slots: { customRender: 'fileSlot' },
    ifShow: false,
    width: 300,
  },
  {
    title: '印章图片',
    align: 'center',
    dataIndex: 'sealPicUrl',
    customRender: render.renderImage,
    width: 300,
  },
  {
    title: '备注说明',
    align: 'center',
    dataIndex: 'remarks',
  },
];

/**
 * 查询数据
 */
export const searchFormSchema: FormSchema[] = [
  {
    label: '印章名称',
    field: 'sealName',
    component: 'Input',
  },
];

/**
 * 表单数据
 */
export const formSchema: FormSchema[] = [
  {
    label: '印章名称',
    field: 'sealName',
    component: 'Input',
    componentProps: {
      maxlength: 50,
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入印章名称!' }];
    },
  },
  {
    label: '印章密码',
    field: 'sealPassword',
    component: 'InputPassword',
    componentProps: {
      maxlength: 50,
    },
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入印章密码!' }];
    },
  },
  {
    label: '印章图片',
    field: 'sealPic',
    component: 'Input',
    slot: 'sealpic',
    show: false,
    dynamicRules: ({ values }) => {
      return [{ required: false, message: '请上传印章图片!' }];
    },
  },
  {
    label: '印章图片',
    field: 'sealPicUrl',
    component: 'JUpload',
    componentProps: {
      bizPath: 'officialdoc',
      multiple: false,
      maxCount: 1,
      fileType: 'image',
    },
    dynamicRules: ({ values }) => {
      return [{ required: true, message: '请上传印章图片!' }];
    },
  },
  {
    label: '备注说明',
    field: 'remarks',
    component: 'InputTextArea',
    componentProps: {
      maxlength: 255,
    },
  },
  {
    label: '',
    field: 'divider',
    component: 'Divider',
  },
  {
    label: '印章密码',
    field: 'password',
    component: 'InputPassword',
    componentProps: {
      maxlength: 50,
    },
    slot: 'password',
    dynamicRules: ({ model, schema }) => {
      return [{ required: true, message: '请输入印章密码!' }];
    },
  },
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];

/**
 * 修改密码表单数据
 */
export const sealPassWordSchema: FormSchema[] = [
  {
    label: '旧密码',
    field: 'oldSealPassword',
    component: 'InputPassword',
    rules: [
      {
        required: true,
        message: '请输入印章旧密码',
      },
    ],
  },
  {
    label: '新密码',
    field: 'sealPassword',
    component: 'InputPassword',
    componentProps: {
      placeholder: '请输入新密码',
    },
    rules: [
      {
        required: true,
        message: '请输入印章新密码',
      },
    ],
  },
  {
    label: '确认新密码',
    field: 'confirmSealPassword',
    component: 'InputPassword',
    componentProps: {
      placeholder: '请确认新密码',
    },
    dynamicRules: ({ values }) => {
      return [
        {
          required: true,
          validator: (_, value) => {
            if (!value) {
              return Promise.reject('确认密码不能为空');
            }
            if (value !== values.sealPassword) {
              return Promise.reject('两次输入的密码不一致!');
            }
            return Promise.resolve();
          },
        },
      ];
    },
  },
];
