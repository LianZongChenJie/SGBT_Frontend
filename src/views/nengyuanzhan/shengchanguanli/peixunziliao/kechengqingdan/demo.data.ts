import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
import { getTreeListZiliaokeshi } from '@/views/nengyuanzhan/shengchanguanli/peixunziliao/ziliaoku/demo.api';
import { getTreeListKechengmulu } from './demo.api';
import { renderTablePreviewImage } from '../../../utils/renderTablePreviewImage';

// import {render} from '/@/utils/common/renderUtils';
export const columns: BasicColumn[] = [
  // {
  //   title: '序号',
  //   dataIndex: 'name',
  //   width: 170,
  //   resizable: true,
  // },
  {
    title: '课程名称',
    dataIndex: 'title',
    width: 170,
    resizable: true,
  },
  {
    title: '课程编码',
    dataIndex: 'id',
    width: 130,
    resizable: true,
  },
  {
    title: '课程目录',
    dataIndex: 'subjectName',
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
    dataIndex: 'durationMinutes',
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
    title: '课程简介',
    dataIndex: 'description',
    width: 140,
    resizable: true,
  },
  {
    title: '学分',
    dataIndex: 'credits',
    width: 140,
    resizable: true,
  },
  {
    title: '培训教师',
    dataIndex: 'teacherName',
    width: 140,
    resizable: true,
  },
  {
    title: '封面图',
    dataIndex: 'coverImage',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      return renderTablePreviewImage({
        text,
        width: 100,
        height: 60,
        style: {
          width: '100px',
          height: '60px',
          objectFit: 'cover',
          borderRadius: '4px',
        },
      });
    },
  },
];
export const columnsModal: BasicColumn[] = [
  // {
  //   title: '序号',
  //   dataIndex: 'id',
  //   width: 100,
  //   resizable: true,
  // },
  {
    title: '资料名称',
    dataIndex: 'title',
    width: 100,
    resizable: true,
  },
  {
    title: '类型',
    dataIndex: 'fileType',
    width: 100,
    resizable: true,
  },
  {
    title: '课件时长',
    dataIndex: 'materialTime',
    width: 100,
    resizable: true,
  },
  {
    title: '学习顺序',
    dataIndex: 'sortOrder',
    width: 100,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'title',
    label: '课程名称',
    component: 'Input',
    componentProps: {
      trim: true,
    },
    colProps: { span: 8 },
  },
  {
    field: 'subjectId',
    label: '课程目录',
    component: 'ApiSelect',
    required: false,
    componentProps: {
      api: getTreeListKechengmulu,
      labelField: 'subjectName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
      allowClear: true,
      placeholder: '请选择课程目录',
    },
    colProps: { span: 8 },
  },

  {
    field: 'classroomId',
    label: '课室',
    component: 'ApiSelect',
    required: false,
    componentProps: {
      api: getTreeListZiliaokeshi,
      labelField: 'classroomName', // 下拉显示文字
      valueField: 'id',
      immediate: true, // 页面加载立即请求
      allowClear: true,
      placeholder: '请选择课室',
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
    label: '课程名称',
    component: 'Input',
    required: true,
    componentProps: {
      style: { width: '100%' },
      maxlength: 80,
      placeholder: '请输入课程名称',
    },
  },
  {
    field: 'credits',
    label: '学分',
    component: 'InputNumber',
    required: true,
    componentProps: {
      style: { width: '100%' },
      min: 0,
      precision: 0,
      placeholder: '请输入学分',
    },
  },
  {
    field: 'durationMinutes',
    label: '时长',
    component: 'InputNumber',
    required: true,
    componentProps: {
      min: 0,
      precision: 0,
      style: { width: '100%' },
      addonAfter: '分钟',
      placeholder: '请输入课程时长',
    },
  },
  {
    field: 'subjectId',
    label: '课程目录',
    component: 'ApiSelect',
    required: false,
    componentProps: {
      api: getTreeListKechengmulu,
      labelField: 'subjectName', // 下拉显示文字
      valueField: 'id', // 实际提交值
      immediate: true, // 页面加载立即请求
      allowClear: true,
      placeholder: '请选择课程目录',
    },
  },
  {
    field: 'teacherName',
    label: '培训教师',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 40,
      placeholder: '请输入培训教师',
    },
  },
  {
    field: 'classroomId',
    label: '课室',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: getTreeListZiliaokeshi,
      labelField: 'classroomName', // 下拉显示文字
      valueField: 'id',
      immediate: true, // 页面加载立即请求
      allowClear: true,
      placeholder: '请选择课室',
    },
  },
  {
    field: 'description',
    label: '课程简介',
    component: 'InputTextArea',
    required: true,
    // colProps: {
    //   span: 24, // ⭐ 独占一行
    // },
    componentProps: {
      style: {
        width: '100%',
      },
      rows: 3,
      placeholder: '请输入课程简介',
    },
  },
  {
    field: 'coverImage',
    label: '封面图',
    required: false,
    component: 'JImageUpload',
    componentProps: {
      //按钮显示文字
      text: '上传封面',
      //支持两种基本样式picture和picture-card
      // listType:'picture-card',
      //用于控制文件上传的业务路径,默认temp
      // bizPath:'temp',
      //是否禁用
      disabled: false,
      //最大上传数量
      fileMax: 1,
    },
  },
];
export const formSchema1: FormSchema[] = [
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
    componentProps: {},
  },
  {
    field: 'materialId',
    label: '类型',
    component: 'Select',
    required: true,
    componentProps: {},
  },
  {
    field: 'materialTime',
    label: '课件时长',
    component: 'Input',
    required: true,
    componentProps: {
      addonAfter: '分钟',
    },
  },
  {
    field: 'sortOrder',
    label: '学习排序',
    component: 'InputNumber',
    required: true,
    componentProps: {
      style: { width: '100%' },
    },
  },
];
