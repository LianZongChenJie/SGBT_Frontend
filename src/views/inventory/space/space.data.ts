import { FormSchema } from '/@/components/Table';
import { getSysDepart } from './space.api.ts';
export const nodeFormSchema: FormSchema[] = [
  {
    label: '父节点id',
    field: 'parentId',
    required: false,
    component: 'Input',
    show: false,
  },
  {
    label: '名称',
    field: 'name',
    required: true,
    component: 'Input',
    componentProps: ({ formActionType }) => {
      return {
        onChange: async (e) => {
          console.log(e.target, e);
          const nameValue = e.target.value;
          // 调用setFieldsValue方法更新fullName字段
          await formActionType.setFieldsValue({
            fullName: sessionStorage.getItem('nodePath') + '，' + nameValue,
          });
        },
      };
    },
  },

  {
    label: '类型',
    field: 'type',
    required: true,
    component: 'Select',
    //填写组件Select的属性
    componentProps: {
      options: [
        { label: '区域', value: '区域' },
        { label: '项目', value: '项目' },
        { label: '建筑', value: '建筑' },
        { label: '层', value: '层' },
        { label: '房间', value: '房间' },
      ],
    },
  },
  {
    label: '排序号',
    field: 'sortNum',
    required: true,
    component: 'InputNumber',
    defaultValue: 0,
  },
  {
    label: '全路径',
    field: 'fullName',
    required: false,
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '项目部',
    field: 'projectDept',
    required: true,
    component: 'ApiSelect',
    componentProps: ({ formActionType }) => {
      return {
        mode: 'single',
        api: getSysDepart,
        labelField: 'departName',
        valueField: 'id',
        immediate: true,
        onChange: async (value, option) => {
          // 构建spacePropertyList结构
          const spacePropertyList = [
            {
              propCode: '项目部',
              value: value,
              valueTranslation: option?.departName || option?.label || ''
            }
          ];
          await formActionType.setFieldsValue({ spacePropertyList:JSON.stringify(spacePropertyList) });
        },
      };
    },
    ifShow: ({ values }) => {
      return values?.type == '建筑';
    },
  },
  {
    label: 'spacePropertyList',
    field: 'spacePropertyList',
    required: false,
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    show: false,
  }
];
export const nodeFormDetailSchema: FormSchema[] = [
  {
    label: '父节点id',
    field: 'parentId',
    required: false,
    component: 'Input',
    show: false,
  },
  {
    label: 'id',
    field: 'id',
    required: false,
    component: 'Input',
    show: false,
  },
  {
    label: '名称',
    field: 'name',
    required: true,
    component: 'Input',
    componentProps: ({ formActionType }) => {
      return {
        onChange: async (e) => {
          const parentPath: string[] = sessionStorage.getItem('nodePath')?.split('，') || [];
          console.log(sessionStorage.getItem('nodePath')?.split('，')?.slice(0, -1));
          const nameValue = e.target.value;
          parentPath[parentPath.length - 1] = nameValue;
          // 调用setFieldsValue方法更新fullName字段
          await formActionType.setFieldsValue({
            fullName: parentPath.join('，'),
          });
        },
      };
    },
  },

  {
    label: '类型',
    field: 'type',
    required: true,
    component: 'Select',
    //填写组件Select的属性
    componentProps: {
      options: [
        { label: '区域', value: '区域' },
        { label: '项目', value: '项目' },
        { label: '建筑', value: '建筑' },
        { label: '层', value: '层' },
        { label: '房间', value: '房间' },
      ],
    },
  },
  {
    label: '排序号',
    field: 'sortNum',
    required: true,
    component: 'InputNumber',
    defaultValue: 0,
  },
  {
    label: '全路径',
    field: 'fullName',
    required: false,
    component: 'Input',
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '项目部',
    field: 'projectDept',
    required: true,
    component: 'ApiSelect',
    componentProps: ({ formActionType }) => {
      return {
        mode: 'single',
        api: getSysDepart,
        labelField: 'departName',
        valueField: 'id',
        immediate: true,
        onChange: async (value, option) => {
          // 构建spacePropertyList结构
          console.log('value===',value);
          const spacePropertyList = [
            {
              propCode: '项目部',
              value: value.join(','),
              // value: value,
              valueTranslation: option?.departName || option?.label || '',
            },
          ];
          await formActionType.setFieldsValue({ spacePropertyList:JSON.stringify(spacePropertyList) });
        },
      };
    },
    ifShow: ({ values }) => {
      return values?.type == '建筑';
    },
  },
  {
    label: 'spacePropertyList',
    field: 'spacePropertyList',
    required: false,
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    show: false,
  }
];
