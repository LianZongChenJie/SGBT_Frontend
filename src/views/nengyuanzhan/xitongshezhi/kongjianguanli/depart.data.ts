import { FormSchema } from '/@/components/Form';

// 部门基础表单
export function useBasicFormSchema() {
  const basicFormSchema: FormSchema[] = [
    {
      field: 'spaceName',
      label: '空间名称',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入空间名称',
      },
      rules: [{ required: true, message: '空间名称不能为空' }],
    },
    // {
    //   field: 'parentId',
    //   label: '上级空间',
    //   component: 'TreeSelect',
    //   componentProps: {
    //     treeData: [],
    //     placeholder: '无',
    //     dropdownStyle: {maxHeight: '200px', overflow: 'auto'},
    //   },
    // },
    {
      field: 'parentId',
      label: '上级空间',
      component: 'TreeSelect',
      componentProps: {
        placeholder: '无',
        treeData: [], // 先给空
        fieldNames: {
          label: 'label',
          value: 'id',
          children: 'children',
        },
        treeNodeLabelProp: 'label',
        treeDefaultExpandAll: true,
        allowClear: true,
      },
    },

    {
      // field: 'orgCode',
      field: 'spaceCode',
      label: '空间编码',
      required: true,
      component: 'Input',
      componentProps: {
        placeholder: '请输入空间编码编码',
      },
    },
    // {
    //   field: 'orgCategory',
    //   label: '机构类型',
    //   component: 'RadioButtonGroup',
    //   componentProps: {options: []},
    // },
    {
      field: 'cadCode',
      label: 'cad空间编码',
      component: 'Input',
      componentProps: {
        placeholder: '请输入cad空间编码',
      },
    },
    {
      field: 'connSpace',
      label: '联通空间',

      component: 'Input',
      componentProps: {
        placeholder: '请输入联通空间',
      },
    },
    {
      field: 'doorName',
      label: '门名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入门名称',
      },
    },
    {
      field: 'spaceUsage',
      label: '空间用途',
      component: 'InputTextArea',
      componentProps: {
        placeholder: '请输入空间用途',
      },
    },
    // TODO 主键隐藏字段，目前写死为ID
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
  ];
  return { basicFormSchema };
}

// 机构类型选项
export const orgCategoryOptions = {
  // 一级部门
  root: [{ value: '0', label: '空间' }],
  // 子级部门
  child: [
    { value: '2', label: '部门' },
    { value: '3', label: '岗位' },
  ],
};
