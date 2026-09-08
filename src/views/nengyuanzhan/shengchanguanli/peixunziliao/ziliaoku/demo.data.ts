import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
// import {render} from '/@/utils/common/renderUtils';
import { getTreeListZiliaokeshi, getTreeListZiliaomulu } from './demo.api';

function buildSafeUploadFile(file: File) {
  const extMatch = file.name.match(/\.([A-Za-z0-9]+)$/);
  const ext = extMatch ? `.${extMatch[1]}` : '';
  return new File([file], `material_${Date.now()}${ext}`, {
    type: file.type,
    lastModified: file.lastModified,
  });
}
export const columns: BasicColumn[] = [
  // {
  //   title: '序号',
  //   dataIndex: 'name',
  //   width: 170,
  //   resizable: true,
  // },
  {
    title: '资料名称',
    dataIndex: 'title',
    width: 170,
    resizable: true,
  },
  {
    title: '资料编码',
    dataIndex: 'materialCode',
    width: 130,
    resizable: true,
  },
  {
    title: '资料目录',
    dataIndex: 'catalogueName',
    width: 140,
    resizable: true,
  },
  {
    title: '课室',
    dataIndex: 'classroomName',
    width: 140,
    resizable: true,
  },
  {
    title: '课程时间',
    dataIndex: 'materialTime',
    width: 140,
    resizable: true,
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    width: 140,
    resizable: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 140,
    resizable: true,
  },
  {
    title: '资料简介',
    dataIndex: 'description',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'catalogueId',
    label: '资料目录',
    component: 'ApiSelect',
    required: false,
    componentProps: {
      api: getTreeListZiliaomulu,
      labelField: 'catalogueName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
      allowClear: true,
      placeholder: '请选择资料目录',
    },
    colProps: { span: 8 },
  },

  {
    field: 'title',
    label: '资料名称',
    component: 'Input',
    componentProps: {
      trim: true,
      placeholder: '请输入资料名称',
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
    field: 'createBy',
    label: 'createBy',
    component: 'Input',
    show: false,
  },
  {
    field: 'createTime',
    label: 'createTime',
    component: 'Input',
    show: false,
  },
  {
    field: 'title',
    label: '资料名称',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 80,
      placeholder: '请输入资料名称',
    },
  },
  {
    field: 'description',
    label: '资料简介',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      maxlength: 200,
      rows: 4,
      showCount: true,
      placeholder: '请输入资料简介',
    },
  },
  {
    field: 'filePath',
    label: '资料上传',
    required: false,
    component: 'JUpload',
    componentProps: {
      //是否显示选择按钮
      text: '文件上传',
      //最大上传数
      maxCount: 1,
      //是否显示下载按钮
      download: true,
      beforeUpload: buildSafeUploadFile,
    },
  },
  {
    field: 'materialTime',
    label: '资料时长',
    component: 'InputNumber',
    required: true,
    componentProps: {
      min: 0,
      style: { width: '100%' },
      placeholder: '请输入资料时长',
    },
  },
  {
    field: 'catalogueId',
    label: '资料目录',
    component: 'ApiSelect',
    required: false,
    componentProps: {
      api: getTreeListZiliaomulu,
      labelField: 'catalogueName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
      allowClear: true,
      placeholder: '请选择资料目录',
    },
  },
  {
    field: 'classroomId',
    label: '课室',
    component: 'ApiSelect',
    required: false,
    componentProps: {
      api: getTreeListZiliaokeshi,
      labelField: 'classroomName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
      allowClear: true,
      placeholder: '请选择课室',
    },
  },
];
