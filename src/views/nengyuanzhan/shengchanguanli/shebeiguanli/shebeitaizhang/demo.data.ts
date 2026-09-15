import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
import { renderTablePreviewImage } from '../../../utils/renderTablePreviewImage';

export const columns: BasicColumn[] = [
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备编码',
    dataIndex: 'deviceCode',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备型号',
    dataIndex: 'deviceModule',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备类型',
    dataIndex: 'deviceTypeName',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '所属部门',
    dataIndex: 'orgName',
    width: 170,
    resizable: true,
    ellipsis: true,
    // dict:'sys_depart,org_code,depart_name',
  },
  {
    title: '设备位置',
    dataIndex: 'spaceName',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '设备经度',
  //   dataIndex: 'lo',
  //   width: 170,
  //   resizable: true,
  // },
  // {
  //   title: '设备纬度',
  //   dataIndex: 'la',
  //   width: 130,
  //   resizable: true,
  // },
  {
    title: '设备状态',
    dataIndex: 'deviceStatus',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text == 1) {
        return '在途';
      } else if (text == 2) {
        return '待维修';
      } else if (text == 3) {
        return '维修中';
      } else if (text == 4) {
        return '入库';
      }
    },
  },
  {
    title: '厂家',
    dataIndex: 'factory',
    width: 140,
    resizable: true,
  },
  {
    title: '设备责任人',
    dataIndex: 'official',
    width: 140,
    resizable: true,
  },
  {
    title: '设备使用人',
    dataIndex: 'user',
    width: 140,
    resizable: true,
  },

  {
    title: '购置日期',
    dataIndex: 'purchaseDate',
    width: 140,
    resizable: true,
  },
  {
    title: '使用寿命',
    dataIndex: 'serviceLife',
    width: 140,
    resizable: true,
  },
  {
    title: '设备图片',
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
    title: '保修期(月)',
    dataIndex: 'warranty',
    width: 140,
    resizable: true,
  },
  {
    title: '巡检点检周期(月)',
    dataIndex: 'cycle',
    width: 140,
    resizable: true,
  },
  {
    title: '供应商',
    dataIndex: 'supplier',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '创建人',
  //   dataIndex: 'createBy',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '创建时间',
  //   dataIndex: 'createTime',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '修改人',
  //   dataIndex: 'updateBy',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '修改时间',
  //   dataIndex: 'updateTime',
  //   width: 140,
  //   resizable: true,
  // },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 140,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'Input',
    componentProps: {
      placeholder: '请输入设备名称',
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
    defaultValue: '1',
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
    label: '设备名称',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      maxlength: 80,
      placeholder: '请输入设备名称',
    },
  },
  // {
  //   field: 'deviceCode',
  //   label: '设备编码',
  //   component: 'Input',
  //   required:false,
  //   componentProps: {
  //   },
  // },
  // {
  //   field: 'category',
  //   label: '设备类型',
  //   component: 'Input',
  //   required: false,
  //   componentProps: {
  //
  //   },
  // },
  {
    field: 'deviceTypeId',
    label: '设备类型',
    component: 'TreeSelect',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      treeData: [],
      placeholder: '请选择设备类型',
      allowClear: true,
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'deviceModule',
    label: '设备型号',
    colProps: { span: 12 },
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入设备型号',
    },
  },

  // {
  //   field: 'deviceTypeId',
  //   label: '设备分类ID',
  //   component: 'TreeSelect',
  //   componentProps: {
  //     // treeCheckable: true,
  //     // title: '下拉树',
  //     treeData: [], // 先给空
  //     fieldNames: {
  //       label: 'label',
  //       value: 'id',
  //       children: 'children',
  //     },
  //   },
  // },

  {
    field: 'factory',
    label: '设备厂家',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入设备厂家',
    },
  },
  {
    field: 'supplier',
    label: '供应商',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入供应商',
    },
  },

  {
    field: 'official',
    label: '设备责任人',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      maxlength: 30,
      placeholder: '请输入设备责任人',
    },
  },
  {
    field: 'user',
    label: '设备使用人',
    component: 'Input',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      maxlength: 30,
      placeholder: '请输入设备使用人',
    },
  },
  {
    field: 'spaceId',
    label: '设备位置',
    component: 'TreeSelect',
    required: false,
    colProps: { span: 12 },
    componentProps: {
      treeData: [],
      placeholder: '请选择设备位置',
      allowClear: true,
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  // {
  //   field: 'aa',
  //   label: '设备区域',
  //   component: 'TreeSelect',
  //   required:false,
  //   componentProps: {
  //   },
  // },

  // {
  //   field: 'lo',
  //   label: '设备经度',
  //   component: 'Input',
  //   required: false,
  //   componentProps: {},
  // },
  // {
  //   field: 'la',
  //   label: '设备纬度',
  //   component: 'Input',
  //   required: false,
  //   componentProps: {},
  // },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    colProps: { span: 12 },
    componentProps: {
      showButton: false,
      style: {
        width: '100%',
      },
      labelKey: 'departName',
      rowKey: 'orgCode',
    },
  },
  {
    field: 'cadCode',
    label: 'CAD 编码',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入 CAD 编码',
    },
  },
  {
    field: 'deviceStatus',
    label: '设备状态',
    component: 'RadioGroup',
    colProps: { span: 12 },
    required: true,
    defaultValue: 1,
    componentProps: {
      // options: [
      //   {label: '在用', value: '0'},
      //   {label: '备用', value: '1'},
      //   {label: '报废', value: '2'},
      //   {label: '待维修', value: '3'},
      //   {label: '送修中', value: '4'},
      // ],
      options: [
        { label: '在途', value: 1 },
        { label: '待维修', value: 2 },
        { label: '维修中', value: 3 },
        { label: '入库', value: 4 },
      ],
    },
  },
  {
    field: 'purchaseDate',
    label: '购置日期',
    component: 'DatePicker',
    colProps: { span: 12 },
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
      placeholder: '请选择购置日期',
    },
  },
  {
    field: 'serviceLife',
    label: '使用寿命',
    component: 'Input',
    colProps: { span: 12 },
    required: true,
    rules: [
      {
        pattern: /^(0|[1-9]\d*)$/,
        message: '请输入整数月数',
        trigger: 'blur',
      },
    ],
    componentProps: {
      inputmode: 'numeric',
      addonAfter: '月',
      maxlength: 9,
      style: { width: '100%' },
      placeholder: '请输入使用寿命',
    },
  },
  {
    field: 'warranty',
    label: '保修期',
    component: 'Input',
    colProps: { span: 12 },
    componentProps: {
      addonAfter: '月',
      style: { width: '100%' },
      placeholder: '请输入保修期',
    },
  },
  // {
  //   field: 'aaaa',
  //   label: '维保周期',
  //   component: 'Input',
  //   componentProps: {
  //     addonAfter: '月',
  //     style: {width: '100%'},
  //   },
  // },
  {
    field: 'cycle',
    label: '巡检点检周期',
    component: 'InputNumber',
    colProps: { span: 12 },
    required: true,
    componentProps: {
      min: 0,
      precision: 0,
      placeholder: '请输入巡检点检周期',
      style: { width: '100%' },
    },
  },

  // {
  //   field: 'status',
  //   label: 'status',
  //   component: 'Input',
  //   required:true,
  //   componentProps: {
  //   },
  // },
  {
    field: 'devicePic',
    label: '设备图片',
    required: false,
    colProps: { span: 12 },
    component: 'JImageUpload',
    componentProps: {
      //按钮显示文字
      text: '上传图片',
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
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    required: false,
    colProps: { span: 12 },
    componentProps: {
      maxlength: 200,
      placeholder: '请输入备注',
    },
  },
  // {
  //   field: 'updateBy',
  //   label: '修改人',
  //   component: 'Input',
  //   required:true,
  //   componentProps: {
  //   },
  // },
  // {
  //   field: 'updateTime',
  //   label: '修改时间',
  //   component: 'DatePicker',
  //   required:true,
  //   componentProps: {
  //   },
  // },
];
