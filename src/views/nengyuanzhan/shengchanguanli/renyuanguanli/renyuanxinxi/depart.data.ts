import {FormSchema} from '/@/components/Form';

// 部门基础表单
export function useBasicFormSchema() {
    const basicFormSchema: FormSchema[] = [

      {
        field: 'parentId',
        label: '上级节点名称',
        component: 'TreeSelect',
        componentProps: {
          treeData: [],
          placeholder: '无',
          dropdownStyle: { maxHeight: '200px', overflow: 'auto' },
        },
      },

      {
        field: 'orgCategory',
        label: '下级节点名称',
        component: 'Input',
        componentProps: {
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
