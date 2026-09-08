import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Form';
import { renderTablePreviewImage } from '../../../utils/renderTablePreviewImage';
import { SPARE_PARTS_CATEGORY } from './demo.api';

export const columns: BasicColumn[] = [
  {
    title: '备件编码',
    dataIndex: 'deviceCode',
    width: 180,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '备件名称',
    dataIndex: 'deviceName',
    width: 180,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '备件型号',
    dataIndex: 'deviceModule',
    width: 160,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '备件类型',
    dataIndex: 'deviceTypeName',
    width: 160,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '厂家',
    dataIndex: 'factory',
    width: 160,
    resizable: true,
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: 100,
    resizable: true,
  },
  {
    title: '当前库存',
    dataIndex: 'invQty',
    width: 120,
    resizable: true,
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    width: 160,
    resizable: true,
  },
  {
    title: '备件图片',
    dataIndex: 'devicePic',
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
  {
    title: '备注',
    dataIndex: 'remark',
    width: 180,
    resizable: true,
    ellipsis: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'deviceName',
    label: '备件名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入备件名称',
      allowClear: true,
    },
    colProps: { span: 12 },
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
    field: 'deviceCode',
    label: 'deviceCode',
    component: 'Input',
    show: false,
  },
  {
    field: 'category',
    label: 'category',
    component: 'Input',
    show: false,
    defaultValue: SPARE_PARTS_CATEGORY,
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
    field: 'deviceName',
    label: '备件名称',
    colProps: { span: 12 },

    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 80,
      placeholder: '请输入备件名称',
    },
  },
  {
    field: 'deviceTypeId',
    label: '备件类型',
    colProps: { span: 12 },

    component: 'TreeSelect',
    required: true,
    componentProps: {
      treeData: [],
      allowClear: true,
      placeholder: '请选择备件类型',
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'deviceModule',
    label: '备件型号',
    colProps: { span: 12 },

    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入备件型号',
    },
  },
  {
    field: 'factory',
    label: '备件厂家',
    colProps: { span: 12 },

    component: 'Input',
    componentProps: {
      maxlength: 60,
      placeholder: '请输入备件厂家',
    },
  },
  {
    field: 'supplier',
    label: '供应商',
    colProps: { span: 12 },

    component: 'Input',
    componentProps: {
      maxlength: 60,
      placeholder: '请输入供应商',
    },
  },
  {
    field: 'unit',
    label: '单位',
    colProps: { span: 12 },

    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 20,
      placeholder: '请输入单位',
    },
  },
  {
    field: 'devicePic',
    label: '备件图片',
    colProps: { span: 12 },

    component: 'JImageUpload',
    componentProps: {
      text: '上传图片',
      disabled: false,
      fileMax: 1,
    },
  },
  {
    field: 'remark',
    label: '备注',
    colProps: { span: 12 },

    component: 'InputTextArea',
    componentProps: {
      maxlength: 200,
      rows: 4,
      showCount: true,
      placeholder: '请输入备注',
    },
  },
];
