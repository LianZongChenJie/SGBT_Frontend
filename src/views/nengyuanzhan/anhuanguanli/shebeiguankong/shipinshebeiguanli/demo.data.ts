import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
import { defHttp } from '@/utils/http/axios';

export const columns: BasicColumn[] = [
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备编号',
    dataIndex: 'deviceCode',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '视频监控分组',
    dataIndex: 'videoGroupName',
    width: 170,
    resizable: true,
    ellipsis: true,
    customRender: ({ record, text }) => {
      return text || record?.groupName || record?.videoGroupId || '-';
    },
  },
  {
    title: '设备类型',
    dataIndex: 'deviceType',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备型号',
    dataIndex: 'model',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '设备品牌',
    dataIndex: 'brand',
    width: 170,
    resizable: true,
    ellipsis: true,
  },
  {
    title: '所属部门',
    dataIndex: 'sysOrgCode',
    width: 170,
    resizable: true,
    ellipsis: true,
    // dict:'sys_depart,org_code,depart_name',
  },
  {
    title: '设备位置',
    dataIndex: 'location',
    width: 140,
    resizable: true,
  },
  // {
  //   title: '设备经度',
  //   dataIndex: 'longitude',
  //   width: 170,
  //   resizable: true,
  // },
  // {
  //   title: '设备纬度',
  //   dataIndex: 'latitude',
  //   width: 130,
  //   resizable: true,
  // },
  {
    title: '设备状态',
    dataIndex: 'status',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text == 1) {
        return '在线';
      } else if (text == 0) {
        return '离线';
      }
    },
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
  // {
  //   title: '备注',
  //   dataIndex: 'remark',
  //   width: 140,
  //   resizable: true,
  // },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'Input',
    colProps: { span: 12 },
  },
  {
    field: 'videoGroupId',
    label: '视频监控分组',
    component: 'ApiTreeSelect', // ⭐ 官方推荐
    colProps: { span: 12 },
    componentProps: {
      api: () => defHttp.get({ url: '/operation/videoMonitorGroup/treeList' }), // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
      fieldNames: {
        label: 'groupName',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'spaceId',
    label: '设备位置',
    component: 'ApiTreeSelect',
    colProps: { span: 12 },
    componentProps: {
      api: () => defHttp.get({ url: '/operation/dimSpace/ddl' }), // 如果有单独位置接口，替换成 getSpaceTree
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
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
    field: 'deviceName',
    label: '设备名称',
    component: 'Input',
    required: true,
    componentProps: {},
  },
  {
    field: 'deviceCode',
    label: '设备编号',
    component: 'Input',
    required: false,
    componentProps: {
      disabled: true,
    },
  },
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
    field: 'videoGroupId',
    label: '视频监控分组',
    component: 'ApiTreeSelect', // ⭐ 官方推荐
    // colProps: { span: 12 },
    required: true,
    componentProps: {
      api: () => defHttp.get({ url: '/operation/videoMonitorGroup/treeList' }), // 请求接口
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
      fieldNames: {
        label: 'groupName',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'deviceType',
    label: '设备类型',
    component: 'TreeSelect',
    componentProps: {
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },
  {
    field: 'model',
    label: '设备型号',
    component: 'Input',
    required: false,
    componentProps: {},
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
    field: 'brand',
    label: '设备品牌',
    component: 'Input',
    required: false,
    componentProps: {},
  },
  {
    field: 'spaceId',
    label: '设备位置',
    component: 'ApiTreeSelect',
    // colProps: { span: 12 },
    required: true,
    componentProps: {
      api: () => defHttp.get({ url: '/operation/dimSpace/ddl' }), // 如果有单独位置接口，替换成 getSpaceTree
      immediate: true, // 页面加载就请求接口
      allowClear: true, // 可以清空
      treeDefaultExpandAll: true, // 默认展开所有节点
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
  //   field: 'longitude',
  //   label: '设备经度',
  //   component: 'Input',
  //   required: false,
  //   componentProps: {},
  // },
  // {
  //   field: 'latitude',
  //   label: '设备纬度',
  //   component: 'Input',
  //   required: false,
  //   componentProps: {},
  // },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    componentProps: {
      showButton: false,
      style: {
        width: '100%',
      },
      labelKey: 'departName',
      rowKey: 'orgCode',
    },
  },
  // {
  //   //   field: 'cadCode',
  //   //   label: 'CAD 编码',
  //   //   component: 'Input',
  //   //   required: true,
  //   //   componentProps: {},
  //   // },
  {
    field: 'status',
    label: '状态',
    component: 'RadioGroup',
    required: true,
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '在线', value: '1' },
        { label: '离线', value: '0' },
      ],
    },
  },
  // {
  //   field: 'remark',
  //   label: '备注',
  //   component: 'InputTextArea',
  //   required: false,
  //   componentProps: {},
  // },
];
