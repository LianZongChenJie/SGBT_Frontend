import { BasicColumn, FormSchema } from '/@/components/Table';
import { getUserList } from "@/api/common/api";
import { DescItem } from '/@/components/Description/index';
import { JImageUpload } from "@/components/Form";
import { formatImageUrls } from "@/utils/event/index";

import { h } from 'vue';
import { getLimitProject } from "@/views/event/event/eventOrder.api";
import { getTreeData } from '../../inventory/space/space.api'
import { getSysDepart } from './eventOrder.api';
export const statusColor = {
  '已转工单': '#0e82f6', '待处理': '#e48000', '待评价': '#e48000', '已完成': '#909090'
}
export const schema: DescItem[] = [
  {
    field: 'code',
    label: '编号',
  },
  {
    field: 'createdTime',
    label: '创建时间',
  },
  {
    field: 'contractPeople',
    label: '联系人',
  },

  {
    field: 'contractPhone',
    label: '联系电话',
  },
  {
    field: 'orderType',
    label: '报事分类',
  },
  {
    field: 'spaceName',
    label: '区域',
  },
  {
    field: 'address',
    label: '详细地址',
  },
  {
    field: 'urgency',
    label: '紧急程度',
  },
  {
    field: 'isArea',
    label: '是否租区内',
    render: (value) => value ? '是' : '否',
  },
  {
    field: 'isPaid',
    label: '是否有偿',
    render: (value) => value ? '是' : '否',
  },
  {
    field: 'forCustomer',
    label: '是否代客报事',
    render: (value) => value ? '是' : '否',
  },
  {
    field: 'price',
    label: '价格',

  },
  {
    field: 'creatPeopleName',
    label: '创建人',
    // span: 3,
  },
  {
    field: 'description',
    label: '问题描述',
    span: 2,
  },
  {
    field: 'pics',
    label: '图片',
    span: 3,
    render: (value) => {
      const imgArray = formatImageUrls(value);
      return h(JImageUpload, {
        value: imgArray,
        disabled: true,
        fileMax: 6,
        isShowDownload: true,
      });
    },
  },
];
export const columns: BasicColumn[] = [
  {
    title: '编号',
    align: 'center',
    dataIndex: 'code',
  },
  {
    title: '区域',
    align: 'center',
    dataIndex: 'spaceName',
  },
  {
    title: '报事分类',
    align: 'center',
    dataIndex: 'orderType',
  },
  /*{
    title: '工单时限',
    align: "center",
    dataIndex: 'hours'
  },*/
  {
    title: '联系人',
    align: 'center',
    dataIndex: 'contractPeople',
  },
  {
    title: '联系电话',
    align: 'center',
    dataIndex: 'contractPhone',
  },
  {
    title: '是否租区内',
    width: 110,
    align: 'center',
    dataIndex: 'isArea',
    customRender: ({ record }) => {
      let v = record.isArea ? '是' : '否';
      return v;
    },
  },
  {
    title: '是否有偿',
    width: 110,
    align: 'center',
    dataIndex: 'isPaid',
    customRender: ({ record }) => {
      let v = record.isPaid ? '是' : '否';
      return v;
    },
  },
  {
    title: '是否代客报事',
    align: 'center',
    width: 110,
    dataIndex: 'forCustomer',
    customRender: ({ record }) => {
      let v = record.forCustomer ? '是' : '否';
      return v;
    },
  },
  {
    title: '是否超时',
    align: 'center',
    dataIndex: 'isTimeout',
    customRender: ({ record }) => {
      let v = record.isTimeout ? '是' : '否';
      return v;
    },
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'status',
  },
  {
    title: '创建时间',
    align: 'center',
    dataIndex: 'createdTime',
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'code',
    label: '单号',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'contractPeople',
    label: '联系人',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'contractPhone',
    label: '联系电话',
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { value: '待处理', label: '待处理' },
        { value: '已转工单', label: '已转工单' },
        { value: '待评价', label: '待评价' },
        { value: '已完成', label: '已完成' },
        { value: '待确认', label: '待确认' },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'forCustomer',
    label: '是否代客报事',
    component: 'Select',
    componentProps: {
      options: [
        { value: 'true', label: '是' },
        { value: 'false', label: '否' },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'spaceName',
    label: '区域',
    component: 'ApiSelect',
    componentProps: () => {
      return {
        //mode: 'multiple',
        api: async () => {
          const organizations = await getLimitProject({});
          return organizations; // 返回完整数据供选择器渲染
        },
        numberToString: true,
        labelField: 'departName',
        valueField: 'departName',
        immediate: false,
      };
    },
    colProps: { span: 8 },
  },
  {
    field: 'timeRange',
    component: 'RangePicker',
    label: '时间范围',
    componentProps: {
      valueType: 'date',
    },
    colProps: {
      span: 8,
    },
  },
  {
    field: 'isTimeout',
    label: '是否超时',
    component: 'Select',
    componentProps: {
      options: [
        { value: 'true', label: '是' },
        { value: 'false', label: '否' },
      ],
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '是否代客报事',
    field: 'forCustomer',
    component: 'RadioGroup',
    show: true,
    required: true,
    defaultValue: false,
    componentProps: ({ formModel, formActionType }) => {
      return {
        options: [
          { label: '是', value: true },
          { label: '否', value: false },
        ],
        onChange: async (value: any) => {
          // 当选项变化时，清空联系人和联系电话
          if (formActionType) {
            if (value.target.value) {
              await formActionType.setFieldsValue({
                contractPeople: undefined,
                contractPhone: '',
              });
            } else {
              await formActionType.setFieldsValue({
                contractPeople: JSON.parse(localStorage.getItem('userSelf') || '[]')[0].id,
                contractPhone: JSON.parse(localStorage.getItem('userSelf') || '[]')[0].phone,
              });
            }
          }
        }
      };
    },
  },
  {
    label: '联系人',
    field: 'contractPeople',
    component: 'Select',
    show: true,
    required: true,
    componentProps: ({ formModel, formActionType }) => {
      return {
        options: formModel.forCustomer
          ? JSON.parse(localStorage.getItem('customerUser') || '[]')
          : JSON.parse(localStorage.getItem('userSelf') || '[]'),
        fieldNames: {
          label: 'realname',
          value: 'id',
        },
        immediate: true,
        onChange: async (value: any, option: any) => {
          // 当选择联系人时，自动填充联系电话
          if (option && option.phone) {
            await formActionType.setFieldsValue({
              contractPhone: option.phone
            });
          }
        },
        // 提供完整的选项信息给onChange
        getPopupContainer: () => document.body
      }
    },
  },
  // {
  //   label: '联系人',
  //   field: 'contractPeople',
  //   component: 'Select',
  //   show: ({ values }) => !values.forCustomer,
  //   required: true,
  //   dynamicDisabled: true,
  //   componentProps: () => {
  //     return {
  //       //mode: 'multiple',
  //       options: JSON.parse(localStorage.getItem('userSelf') || '[]'),
  //       fieldNames: {
  //         label: 'realname',
  //         value: 'id',
  //       },
  //       defaultValue: JSON.parse(localStorage.getItem('userSelf') || '[]')[0].id,
  //     };
  //   },
  // },
  {
    label: '联系电话',
    field: 'contractPhone',
    component: 'Input',
    show: true,
    dynamicDisabled: true,
  },
  {
    label: '报事分类',
    field: 'orderType',
    component: 'Select',
    show: true,
    required: true,
    componentProps: {
      options: [
        { value: '报事报修', label: '报事报修' },
        { value: '咨询建议', label: '咨询建议' },
        // { value: '技术支持', label: '技术支持' },
        // { value: '业务咨询', label: '业务咨询' },
        // { value: '投诉建议', label: '大跳台' },
        // { value: '其他', label: '其他' }
      ]
    },
  },
  {
    label: '详细地址',
    field: 'address',
    component: 'ApiTreeSelect',
    required: true,
    componentProps: ({ formModel, formActionType }) => {
      let treeCache: any[] = [];

      function findNodePath(tree: any[], targetId: string, path: string[] = []): string[] {
        if (!tree) return [];
        for (const node of tree) {
          console.log('node', node);
          const nodeId = node.id || node.key;
          const nodeName = node.name || node.title;
          if (String(nodeId) === String(targetId)) {
            return [...path, nodeName];
          }
          if (Array.isArray(node.children) && node.children.length > 0) {
            const childPath = findNodePath(node.children, targetId, [...path, nodeName]);
            if (childPath.length > 0) {
              return childPath;
            }
          }
        }
        return [];
      }

      function findNodePathWithId(tree: any[], targetId: string, path: any[] = []): any[] {
        if (!tree) return [];
        for (const node of tree) {
          const nodeId = node.id || node.key;
          if (String(nodeId) === String(targetId)) {
            return [...path, { id: nodeId, name: node.name || node.title }];
          }
          if (Array.isArray(node.children) && node.children.length > 0) {
            const childPath = findNodePathWithId(node.children, targetId, [...path, { id: nodeId, name: node.name || node.title }]);
            if (childPath.length > 0) {
              return childPath;
            }
          }
        }
        return [];
      }
      function buildTree(nodes: any[], path: string[] = []): any[] {
        if (!Array.isArray(nodes)) return [];
        return nodes.map((node) => {
          const nodeName = node.name || node.title;
          const currentPath = [...path, nodeName];
          const next: any = {
            ...node,
            fullPath: currentPath.join('，'),
          };
          const hasChildren = Array.isArray(node.children) && node.children.length > 0;
          // 父节点不可选，叶子节点可选
          next.selectable = !hasChildren;
          if (hasChildren) {
            next.children = buildTree(node.children, currentPath);
          }
          return next;
        });
      }
      return {
        api: async () => {
          const raw = await getTreeData({});
          const data = Array.isArray(raw) ? raw : [];
          return buildTree(data);
        },
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children',
        },
        // 关键：启用 labelInValue，这样可以把显示的 label 改成全路径
        labelInValue: true,
        dropdownStyle: {
          maxHeight: '50vh',
        },
        treeExpandAction: 'click',
        getPopupContainer: () => document.body,
        onOptionsChange: (data: any[]) => {
          treeCache = Array.isArray(data) ? data : [];
        },
        onChange: async (value: any) => {
          console.log('value', value, formModel, treeCache);
          // labelInValue=true 时，value是 { value: 选中id, label: 节点名称 }
          const selectedId = Array.isArray(value) ? value[value.length - 1]?.value : value?.value;
          const pathArr = findNodePath(treeCache, String(selectedId));
          const fullPath = pathArr.join('，');
          // 获取选中节点的父节点id（即空间ID）
          const pathWithId = findNodePathWithId(treeCache, String(selectedId));
          const parentId = pathWithId.length >= 2 ? pathWithId[pathWithId.length - 2]?.id : null;
          const area = await getSysDepart({ spaceId: parentId });
          // 1) 让下拉选择框的显示文本改为全路径
          await formActionType.setFieldsValue({
            address: { value: selectedId, label: fullPath },
          });
          // 2) 同步表单模型为全路径字符串（满足“把全路径给address”的需求）
          formModel.address = fullPath;
          formModel.spaceId = value.value;
          area.forEach((element: any) => {
            if (element.propCode === '项目部') {
              formModel.spaceName = element.valueTranslation;
            }
          });
        },
      };
    },
  },
  {
    label: '区域',
    field: 'spaceName',
    component: 'ApiSelect',
    required: true,
    componentProps: ({ formModel }) => {
      return {
        //mode: 'multiple',
        api: async () => {
          const organizations = await getLimitProject({});
          return organizations; // 返回完整数据供选择器渲染
        },
        numberToString: true,
        labelField: 'departName',
        valueField: 'departName',
        immediate: false,
        onChange: (_: any, values: any) => {
          if (!values) {
            formModel.spaceName = '';
            return;
          }
          formModel.spaceName = values.label;
        },
      };
    },
  },

  {
    label: 'spaceId',
    field: 'spaceId',
    component: 'Input',
    show: false,
  },
  {
    label: '紧急程度',
    field: 'urgency',
    component: 'Select',
    show: true,
    required: false,
    componentProps: {
      options: [
        { value: '非常紧急', label: '非常紧急' },
        { value: '紧急', label: '紧急' },
        { value: '一般', label: '一般' },
      ],
    },
    // ifShow: ({ values }) => {
    //   return values.forCustomer;
    // },
  },
  {
    label: '是否租区内',
    field: 'isArea',
    component: 'RadioGroup',
    show: true,
    required: true,
    defaultValue: true,
    componentProps: {
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
  },
  {
    label: '是否有偿',
    field: 'isPaid',
    component: 'RadioGroup',
    show: true,
    required: true,
    defaultValue: false,
    componentProps: {
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
  },

  {
    label: '价格',
    field: 'price',
    component: 'InputNumber',
    show: true,
    required: false,
  },
  {
    label: '问题描述',
    field: 'description',
    component: 'InputTextArea',
    show: true,
    required: true,
  },
  {
    label: '图片/视频',
    field: 'pics',
    component: 'JImageUpload',
    show: true,
    required: false,
    componentProps: {
      //按钮显示文字
      text: '图片上传',
      //支持两种基本样式picture和picture-card
      listType: 'picture-card',
      //用于控制文件上传的业务路径,默认temp
      bizPath: 'temp',
      //是否禁用
      disabled: false,
      //最大上传数量
      fileMax: 6,
    },
  },
];
export const userSelectSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },

  {
    label: '人',
    field: 'userName',
    component: 'Input',
    show: false,
  },

  {
    label: '处理人',
    field: 'personInfo',
    component: 'ApiSelect',
    required: true,

    componentProps: ({ formModel }) => {
      return {
        api: getUserList,
        numberToString: true,
        labelField: 'realname',
        valueField: 'id',
        immediate: false,
        onChange: (_, values) => {
          if (!values) {
            formModel.userName = '';
            return;
          }
          formModel.userName = values.label;
        },
      };
    },
  },
  {
    label: '备注',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
];

export const processSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '处理结果',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
];
export const checkSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '验收结果',
    field: 'redio',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: [
        { label: '通过', value: 'Y' },
        { label: '不通过', value: 'N' },
      ],
      defaultValue: 'Y',
    },
  },
  {
    label: '验收意见',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
];
export const appraiseSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '满意度',
    field: 'redio',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options: [
        { label: '非常满意', value: 'Y' },
        { label: '满意', value: 'Z' },
        { label: '不满意', value: 'N' },
      ],
      defaultValue: 'Y',
    },
  },
  {
    label: '其它',
    field: 'description',
    component: 'InputTextArea',
    required: true,
  },
];
export const transferSchema: FormSchema[] = [
  {
    label: '主键',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '联系人',
    field: 'contractPeople',
    component: 'Input',
    show: true,
    required: true,
  },
  {
    label: '联系电话',
    field: 'contractPhone',
    component: 'Input',
    show: true,
    required: true,
  },
  {
    label: '报事分类',
    field: 'orderType',
    component: 'Select',
    show: true,
    required: true,
    componentProps: {
      options: [
        { value: '报事报修', label: '报事报修' },
        { value: '咨询建议', label: '咨询建议' },
      ],
    },
  },
  {
    label: '区域',
    field: 'spaceName',
    component: 'ApiSelect',
    required: true,
    componentProps: ({ formModel }) => {
      return {
        //mode: 'multiple',
        api: async () => {
          const organizations = await getLimitProject({});
          return organizations; // 返回完整数据供选择器渲染
        },
        numberToString: true,
        labelField: 'departName',
        valueField: 'departName',
        immediate: false,
        onChange: (_: any, values: any) => {
          if (!values) {
            formModel.spaceName = '';
            return;
          }
          formModel.spaceName = values.label;
        },
      };
    },
  },
  {
    label: '详细地址',
    field: 'address',
    component: 'ApiTreeSelect',
    required: true,
    componentProps: ({ formModel, formActionType }) => {
      let treeCache: any[] = [];

      function findNodePath(tree: any[], targetId: string, path: string[] = []): string[] {
        if (!tree) return [];
        for (const node of tree) {
          const nodeId = node.id || node.key;
          const nodeName = node.name || node.title;
          if (String(nodeId) === String(targetId)) {
            return [...path, nodeName];
          }
          if (Array.isArray(node.children) && node.children.length > 0) {
            const childPath = findNodePath(node.children, targetId, [...path, nodeName]);
            if (childPath.length > 0) {
              return childPath;
            }
          }
        }
        return [];
      }
      function buildTree(nodes: any[], path: string[] = []): any[] {
        if (!Array.isArray(nodes)) return [];
        return nodes.map((node) => {
          const nodeName = node.name || node.title;
          const currentPath = [...path, nodeName];
          const next: any = {
            ...node,
            fullPath: currentPath.join('，'),
          };
          const hasChildren = Array.isArray(node.children) && node.children.length > 0;
          // 父节点不可选，叶子节点可选
          next.selectable = !hasChildren;
          if (hasChildren) {
            next.children = buildTree(node.children, currentPath);
          }
          return next;
        });
      }
      return {
        api: async () => {
          const raw = await getTreeData({});
          const data = Array.isArray(raw) ? raw : [];
          return buildTree(data);
        },
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children',
        },
        // 关键：启用 labelInValue，这样可以把显示的 label 改成全路径
        labelInValue: true,
        dropdownStyle: {
          maxHeight: '50vh',
        },
        treeExpandAction: 'click',
        getPopupContainer: () => document.body,
        onOptionsChange: (data: any[]) => {
          treeCache = Array.isArray(data) ? data : [];
        },
        onChange: async (value: any) => {
          // labelInValue=true 时，value是 { value: 选中id, label: 节点名称 }
          const selectedId = Array.isArray(value) ? value[value.length - 1]?.value : value?.value;
          const pathArr = findNodePath(treeCache, String(selectedId));
          const fullPath = pathArr.join('，');

          // 1) 让下拉选择框的显示文本改为全路径
          await formActionType.setFieldsValue({
            address: { value: selectedId, label: fullPath },
          });
          // 2) 同步表单模型为全路径字符串（满足“把全路径给address”的需求）
          formModel.address = fullPath;
          formModel.spaceId = value.value;
        },
      };
    },
  },
  {
    label: 'spaceId',
    field: 'spaceId',
    component: 'Input',
    show: false,
  },
  {
    label: '紧急程度',
    field: 'urgency',
    component: 'Select',
    show: true,
    required: false,
    componentProps: {
      options: [
        { value: '非常紧急', label: '非常紧急' },
        { value: '紧急', label: '紧急' },
        { value: '一般', label: '一般' },
      ],
    },
  },
  {
    label: '是否租区内',
    field: 'isArea',
    component: 'RadioGroup',
    show: true,
    required: true,
    defaultValue: true,
    componentProps: {
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
  },
  {
    label: '是否有偿',
    field: 'isPaid',
    component: 'RadioGroup',
    show: true,
    required: false,
    defaultValue: false,
    componentProps: {
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    }
  },
  {
    label: '价格',
    field: 'price',
    component: 'InputNumber',
    show: true,
    required: false,
  },
  {
    label: '问题描述',
    field: 'description',
    component: 'InputTextArea',
    show: true,
    required: true,
  },
  {
    label: '图片/视频',
    field: 'pics',
    component: 'JImageUpload',
    show: true,
    required: false,
    componentProps: {
      //按钮显示文字
      text: '图片上传',
      //支持两种基本样式picture和picture-card
      listType: 'picture-card',
      //用于控制文件上传的业务路径,默认temp
      bizPath: 'temp',
      //是否禁用
      disabled: false,
      //最大上传数量
      fileMax: 6,
    },
  },
  /*  {
      label: '班组长',
      field: 'leaderId',
      component: 'ApiSelect',
      componentProps: {
        mode: 'single',
        api: getUserList,
        labelField: 'realname',
        valueField: 'id',
        immediate: true,
        resultField: 'records',
        /!* transform: (res) => {
           if (res.success && res.result && res.result.records) {
             return res.result.records;
           }
           return [];
         }*!/
      },
    },*/
];
