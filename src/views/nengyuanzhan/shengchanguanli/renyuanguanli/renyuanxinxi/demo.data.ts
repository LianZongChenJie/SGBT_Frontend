import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';

export const columns: BasicColumn[] = [
  {
    title: '人员姓名',
    dataIndex: 'employeeName',
    width: 120,
    resizable: true,
  },
  {
    title: '人员编码',
    dataIndex: 'employeeCode',
    width: 120,
    resizable: true,
  },
  {
    title: '人员类型',
    dataIndex: 'employeeType',
    width: 120,
    resizable: true,
    // dictCode: 'employeeType',
    customRender: ({ text }) => {
      return render.renderDict(text, 'employeeType');
    },
  },
  {
    title: '单位',
    dataIndex: 'company',
    width: 130,
    resizable: true,
  },
  {
    title: '证件号码',
    dataIndex: 'idCard',
    width: 140,
    resizable: true,
  },
  {
    title: '岗位',
    dataIndex: 'position',
    width: 140,
    resizable: true,
  },
  {
    title: '所属部门',
    dataIndex: 'sysOrgCode',
    width: 140,
    resizable: true,
  },
  {
    title: '联系方式',
    dataIndex: 'contactNo',
    width: 140,
    resizable: true,
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    width: 120,
    resizable: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160,
    resizable: true,
  },
  {
    title: '修改人',
    dataIndex: 'updateBy',
    width: 120,
    resizable: true,
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    width: 160,
    resizable: true,
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'employeeName',
    label: '人员姓名',
    component: 'Input',
    colProps: { span: 10 },
    componentProps: {
      placeholder: '请输入人员姓名',
    },
  },
  {
    field: 'employeeCode',
    label: '人员编码',
    component: 'Input',
    colProps: { span: 10 },
    componentProps: {
      placeholder: '请输入人员编码',
    },
  },
  {
    field: 'employeeType',
    label: '人员类型',
    component: 'JDictSelectTag',
    colProps: { span: 10 },
    componentProps: {
      dictCode: 'employeeType',
    },
  },
  {
    field: 'company',
    label: '单位',
    component: 'Input',
    colProps: { span: 10 },
    componentProps: {
      placeholder: '请输入单位',
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
    field: 'employeeName',
    label: '人员姓名',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 30,
      placeholder: '请输入人员姓名',
    },
  },
  {
    field: 'employeeCode',
    label: '人员编码',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 30,
      placeholder: '请输入人员编码',
    },
  },
  {
    field: 'employeeType',
    label: '人员类型',
    component: 'JDictSelectTag',
    required: true,
    componentProps: {
      dictCode: 'employeeType',
    },
  },
  {
    field: 'company',
    label: '单位',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 60,
      placeholder: '请输入单位名称',
    },
  },
  {
    field: 'idCard',
    label: '证件号码',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 30,
      placeholder: '请输入证件号码',
    },
  },
  {
    label: '岗位',
    field: 'position',
    component: 'JSelectPosition',
    required: true,
    componentProps: {
      showButton: false,
      multiple: false, // 是否多选
    },
    // colProps: { span: 12 },
  },
  // {
  //   field: 'position',
  //   label: '岗位',
  //   component: 'Input',
  //   required:true,
  //   componentProps: {
  //   },
  // },
  {
    field: 'sysOrgCode',
    label: '所属部门',
    component: 'JSelectDept',
    required: true,
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
    field: 'contactNo',
    label: '联系方式',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 20,
      placeholder: '请输入联系方式',
    },
  },
];

// 部门基础表单
export function useBasicFormSchema() {
  const basicFormSchema: FormSchema[] = [
    {
      field: 'parentId',
      label: '上级部门',
      component: 'TreeSelect',
      componentProps: {
        treeData: [],
        placeholder: '无',
        dropdownStyle: { maxHeight: '200px', overflow: 'auto' },
      },
    },
    {
      field: 'departName',
      label: '部门名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入部门名称',
      },
      rules: [{ required: true, message: '部门名称不能为空' }],
    },
    {
      field: 'orgCode',
      label: '机构编码',
      component: 'Input',
      componentProps: {
        placeholder: '请输入机构编码',
      },
    },
    {
      field: 'orgCategory',
      label: '机构类型',
      component: 'RadioButtonGroup',
      show: false,
      componentProps: { options: [] },
    },
  ];
  return { basicFormSchema };
}

// 机构类型选项
export const orgCategoryOptions = {
  // 一级部门
  root: [{ value: '1', label: '公司' }],
  // 子级部门
  child: [
    { value: '2', label: '部门' },
    // {value: '3', label: '岗位'},
  ],
};
