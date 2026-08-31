import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { duplicateCheckDelay } from '/@/views/system/user/user.api';
import { selectTreeData } from './cms.menu.api';

export const columns: BasicColumn[] = [
  {
    title: '栏目名称',
    dataIndex: 'menuName',
    width: 200,
    align: 'center',
  },
  {
    title: '编码',
    dataIndex: 'menuCode',
    width: 120,
    align: 'center',
  },
  {
    title: '图片',
    dataIndex: 'imageHref',
    customRender: render.renderImage,
    width: 120,
    align: 'center',
  },
  {
    title: '链接地址',
    dataIndex: 'linkUrl',
    align: 'center',
    width: 120,
    customRender: render.renderHref,
  },
  {
    title: '模版编码',
    dataIndex: 'templateCode',
    width: 120,
  },
  {
    title: '显示',
    dataIndex: 'isShow',
    align: 'center',
    width: 80,
    customRender: function ({ text }) {
      if (text == '0') {
        return '否';
      } else if (text == '1') {
        return '是';
      }
      return text;
    },
  },
  {
    title: '排序',
    dataIndex: 'serialNumber',
    align: 'center',
    width: 80,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'menuName',
    label: '栏目名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    field: 'id',
    label: '栏目',
    component: 'ApiTreeSelect',
    colProps: { span: 6 },
    componentProps: {
      api: selectTreeData,
      resultField: 'list',
      dropdownStyle: {
        maxHeight: '50vh',
      },
    },
  },
];

export const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'menuName',
    label: '栏目名称',
    /*colProps: { sm:24, xs:24, md:12, lg:12, xl:12, xxl:12 },*/
    colProps: { span: 12, xs: 24 },
    component: 'Input',
    dynamicRules: ({ values, model }) => {
      console.log('values:', values);
      return [
        {
          required: true,
          validator: (_, value) => {
            return new Promise((resolve, reject) => {
              if (!value) {
                return reject('请输入栏目名称！');
              }
              let params = {
                tableName: 'eoa_cms_menu',
                fieldName: 'menu_name',
                fieldVal: value,
                dataId: model.id,
              };
              console.log('menuName', params);
              duplicateCheckDelay(params)
                .then((res) => {
                  res.success ? resolve() : reject('栏目名称已存在!');
                })
                .catch((err) => {
                  reject(err.message || '校验失败');
                });
            });
          },
        },
      ];
    },
  },
  {
    field: 'menuType',
    label: '栏目类型',
    defaultValue: '1',
    colProps: { span: 12, xs: 24 },
    component: 'JDictSelectTag',
    componentProps: () => {
      return {
        dictCode: 'cms_menu_type',
        type: 'radio',
      };
    },
  },
  {
    field: 'parentId',
    label: '栏目',
    component: 'TreeSelect',
    colProps: { span: 12, xs: 24 },
    componentProps: {
      fieldNames: {
        title: 'menuName',
        key: 'id',
        value: 'id',
      },
      getPopupContainer: () => document.body,
    },
    ifShow: ({ values }) => values.menuType == '1',
  },
  {
    field: 'linkUrl',
    label: '链接地址',
    component: 'Input',
    colProps: { span: 12, xs: 24 },
    ifShow: ({ values }) => values.menuType == '2',
  },
  {
    field: 'templateCode',
    label: '模版编码',
    colProps: { span: 12, xs: 24 },
    component: 'Input',
    dynamicRules: ({ values, model }) => {
      console.log(' templateCode values:', values);
      console.log(' templateCode model:', model);
      return [
        {
          required: false,
          validator: (_, value) => {
            console.log(' templateCode _:', _);
            console.log(' templateCode value:', value);
            return new Promise((resolve, reject) => {
              if (!value) {
                resolve();
              }
              let params = {
                tableName: 'eoa_cms_menu',
                fieldName: 'template_code',
                fieldVal: value,
                dataId: model.id,
              };
              console.log('template_code', params);
              duplicateCheckDelay(params)
                .then((res) => {
                  console.log('res', res);
                  res.success ? resolve() : reject('模板code已存在!');
                })
                .catch((err) => {
                  reject(err.message || '校验失败');
                });
            });
          },
        },
      ];
    },
  },
  {
    field: 'serialNumber',
    label: '序号',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入序号',
    },
    colProps: { span: 12, xs: 24 },
  },
  {
    field: 'isShow',
    label: '显示',
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '显示', value: '1' },
        { label: '不显示', value: '0' },
      ],
    },
    colProps: { span: 12, xs: 24 },
  },
  {
    field: 'showMode',
    label: '显示类型',
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '栏目', value: '0' },
        { label: '文章', value: '1' },
      ],
    },
    colProps: { span: 12, xs: 24 },
  },
  {
    field: 'imageHref',
    label: '图片',
    component: 'JImageUpload',
    //update-begin---author:wangshuai---date:2024-06-24---for:【TV360X-1379】文章栏目 图片样式问题---
    componentProps: {
      fileMax: 1,
    },
    colProps: { span: 12, xs: 24 },
    //update-end---author:wangshuai---date:2024-06-24---for:【TV360X-1379】文章栏目 图片样式问题---
  },
];
