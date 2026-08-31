import {FormSchema} from '/@/components/Form';

// 部门基础表单
export function useBasicFormSchema() {
    const basicFormSchema: FormSchema[] = [
      {
        field: 'departName',
        label: '空间编码',
        component: 'Input',
        componentProps: {
          placeholder: '请输入空间编码',
        },
        rules: [{ required: true, message: '空间编码不能为空' }],
      },
      {
        field: 'parentId',
        label: '上级空间',
        component: 'TreeSelect',
        componentProps: {
          treeData: [],
          placeholder: '无',
          dropdownStyle: { maxHeight: '200px', overflow: 'auto' },
        },
      },
      {
        field: 'orgCode2',
        label: 'CAD空间编码',
        component: 'Input',
        componentProps: {
          placeholder: '请输入CAD空间编码',
        },
      },
      {
        field: '1orgCode',
        label: '空间名称',
        component: 'Input',
        componentProps: {
          placeholder: '请输入空间名称',
        },
      },
      {
        field: 'orgCategory',
        label: '门名称',
        component: 'Input',
        componentProps: {
          placeholder: '请输入空间名称',
        },
      },
      {
        field: 'departOrder',
        label: '空间用途',
        component: 'Input',
        componentProps: {
          placeholder: '请输入空间用途',
        },
      },
      {
        field: 'mobile',
        label: '连通空间',
        component: 'Input',
        componentProps: {
          placeholder: '请输入电话',
        },
      },
      // {
      //     field: 'fax',
      //     label: '操作时间',
      //     component: 'Input',
      //     componentProps: {
      //         placeholder: '请输入传真',
      //     },
      // },
      {
        field: 'address',
        label: '操作人',
        component: 'Input',
        componentProps: {
          placeholder: '请输入操作人',
        },
      },
    ];
    return {basicFormSchema};
}

// 机构类型选项
export const orgCategoryOptions = {
    // 一级部门
    root: [{value: '1', label: '公司'}],
    // 子级部门
    child: [
        {value: '2', label: '部门'},
        {value: '3', label: '岗位'},
    ],
};

export function editBasic(){
  const basicFormSchema: FormSchema[] = [
    {
      field: 'departName',
      label: '空间名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入空间名称',
      },
      rules: [{ required: true, message: '空间名称不能为空' }],
    },

  ];
  return {basicFormSchema};
}
