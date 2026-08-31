import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { selectTreeData } from '/@/views/super/eoa/cms/menu/cms.menu.api';

export const columns: BasicColumn[] = [
  {
    title: '发布时间',
    align: 'center',
    dataIndex: 'publishDate',
    width: 150,
  },
  {
    title: '标题',
    align: 'center',
    dataIndex: 'title',
  },
  {
    title: '封面图片',
    align: 'center',
    dataIndex: 'imageHref',
    customRender: render.renderImage,
  },
  {
    title: '作者',
    align: 'center',
    dataIndex: 'author',
  },
  {
    title: '关键字',
    align: 'center',
    dataIndex: 'keywords',
  },
  {
    title: '栏目',
    align: 'center',
    dataIndex: 'columnId_dictText',
  },
  {
    title: '发布状态',
    align: 'center',
    dataIndex: 'isPublish_dictText',
  },
];
export const searchFormSchema: FormSchema[] = [
  {
    label: '标题',
    field: 'title',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '发布时间',
    field: 'publishDate',
    component: 'RangePicker',
    componentProps: {
      valueType: 'Date',
    },
    colProps: { span: 6 },
  },
  {
    field: 'columnId',
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
    field: 'columnId',
    label: '栏目',
    component: 'TreeSelect',
    required: true,
    componentProps: {
      replaceFields: {
        title: 'menuName',
        key: 'id',
        value: 'id',
      },
      getPopupContainer: () => document.body,
    },
  },
  {
    field: 'title',
    label: '标题',
    component: 'Input',
    required: true,
  },
  {
    field: 'author',
    label: '作者',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'keywords',
    label: '关键字',
    component: 'Input',
  },
  {
    field: 'isPublish',
    label: '是否发布',
    component: 'RadioGroup',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
    },
  },
  {
    field: 'type',
    label: '文章类型',
    component: 'Select',
    defaultValue: 'article',
    componentProps: {
      options: [
        { label: '文章', value: 'article' },
        { label: '文件', value: 'file' },
        { label: '链接', value: 'url' },
      ],
    },
  },
  {
    field: 'summary',
    label: '摘要',
    component: 'InputTextArea',
    componentProps: {
      options: [
        { label: '文章', value: 'article' },
        { label: '文件', value: 'file' },
        { label: '链接', value: 'url' },
      ],
    },
  },
  {
    field: 'imageHref',
    label: '封面图片',
    component: 'JImageUpload',
    componentProps: {
      fileMax: 1,
    },
  },
  {
    field: 'linkUrl',
    label: '链接地址',
    component: 'Input',
    ifShow: ({ values }) => values.type === 'url',
  },
  {
    field: 'fileUrl',
    label: '文件',
    component: 'JUpload',
    componentProps: {
      maxCount: 1,
    },
    ifShow: ({ values }) => values.type === 'file',
  },
  {
    field: 'content',
    label: '内容',
    component: 'JEditor',
    componentProps: {
      fileMax: 1,
      showImageUpload: false,
      width: '966px',
    },
    ifShow: ({ values }) => values.type === 'article',
  },
];
