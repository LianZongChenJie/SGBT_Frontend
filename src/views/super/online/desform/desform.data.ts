import type { BasicColumn, FormSchema } from '/@/components/Table';
import { duplicateCheckDelay } from '/@/views/system/user/user.api';
import { computed, unref } from 'vue';

export const columns: BasicColumn[] = [
  {
    title: '表单名称',
    width: 420,
    align: 'left',
    dataIndex: 'desformName',
  },
  {
    title: '表单编码',
    width: 240,
    align: 'center',
    dataIndex: 'desformCode',
  },
  // {
  //   title: '表单图标',
  //   align: 'center',
  //   width: 240,
  //   dataIndex: 'desformIcon'
  // },
  {
    title: '移动视图',
    width: 240,
    align: 'center',
    dataIndex: 'izMobileView_dictText',
    // 是否是移动视图，只显示“是”
    customRender: ({ record }) => (record.izMobileView === 1 ? '✔' : ''),
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    label: '表单名称',
    field: 'desformName',
    component: 'JInput',
  },
  {
    label: '表单编码',
    field: 'desformCode',
    component: 'JInput',
  },
];

export function getFormSchema(props) {
  const { isUpdate, isCopying, isCopyView, copyMethod, isListModal } = props;
  return computed<FormSchema[]>(() => [
    { label: '', field: 'id', component: 'Input', show: false },
    {
      label: '表单名称',
      field: 'desformName',
      required: true,
      component: 'Input',
      componentProps: {
        placeholder: '例如：客户、采购单',
        maxlength: 20,
        showCount: true,
        id:'desformNameInput',
        onChange(event) {
          // 编辑时不更改编码
          if (unref(isUpdate)) {
            return
          }
          let value = event.target.value
          props.onDesformNameChange(value)
        },
        onkeyup(event){
          if(event.keyCode  == 13){
            props.onSubmit();
          }
        }
      },
    },
    {
      label: '表单编码',
      field: 'desformCode',
      component: 'Input',
      dynamicDisabled: () => isUpdate.value && !isCopying.value && !isCopyView.value,
      ifShow: () => isListModal.value,
      dynamicRules({ model }) {
        return [
          { required: true, message: '请输入表单名称' },
          {
            async validator(_, value) {
              let pattern = /^[a-z|A-Z][a-z|A-Z\d_-]*$/;
              if (!pattern.test(value)) {
                throw '编码必须以字母开头，可包含数字、下划线、横杠';
              } else if (/[A-Z]/.test(value)) {
                throw '不支持大写字母';
              } else {
                let res = await duplicateCheckDelay({
                  tableName: 'design_form',
                  fieldName: 'desform_code',
                  fieldVal: value,
                  dataId: model.id,
                });
                if (!res.success) {
                  throw '表单编码已存在！';
                }
              }
            },
          },
        ];
      },
    },
    {
      label: '复制方式',
      field: 'copyMethod',
      component: 'Input',
      slot: 'copyMethod',
      ifShow: () => isCopyView.value && isListModal.value,
    },
    {
      label: 'Online表单',
      field: 'cgformSwitch',
      component: 'Input',
      slot: 'cgformSwitch',
      ifShow: () => !isUpdate.value && isListModal.value,
    },
    {
      label: '选择表单',
      field: 'cgformCode',
      component: 'Select',
      componentProps: {
        options: unref(props.cgformOptions),
        showSearch: true,
        filterOption(input, option) {
          return option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >= 0;
        },
        getPopupContainer: () => document.body,
        placeholder: '请选择表单',
      },
      required: true,
      ifShow: () => !isUpdate.value && (unref(props.openCgform) || unref(copyMethod) === 2),
    },
    {
      label: '表单模板',
      field: 'templetValue',
      component: 'Select',
      defaultValue: '_______no_use_templet_______',
      componentProps: {
        allowClear: false,
        options: unref(props.templetOptions),
        getPopupContainer: () => document.body,
        onChange(_, record) {
          props.templetJson.value = record.templetJson;
        },
      },
      ifShow: () => unref(props.openCgform) || unref(copyMethod) === 2,
    },
    {
      label: '设为移动视图',
      field: 'izMobileView',
      helpMessage: '只能有一个移动视图',
      component: 'Switch',
      componentProps: {
        checkedValue: 1,
        unCheckedValue: 0,
        checkedChildren: '是',
        unCheckedChildren: '否',
      },
      ifShow: () => props.showSetMobileView.value,
    },
  ]);
}

/** 模板 */
export const templet = {
  searchFormSchemas: [
    {
      label: '模板名称',
      field: 'templetName',
      component: 'JInput',
    },
    {
      label: '模板编码',
      field: 'templetCode',
      component: 'JInput',
    },
  ] as FormSchema[],
  columns: [
    {
      title: '模板名称',
      dataIndex: 'templetName',
    },
    {
      title: '模板编码',
      dataIndex: 'templetCode',
    },
    {
      title: '创建时间',
      width: 260,
      dataIndex: 'createTime',
    },
    {
      title: '修改时间',
      width: 260,
      dataIndex: 'updateTime',
    },
  ] as BasicColumn[],
  formSchemas: [
    {
      label: '模板名称',
      field: 'templetName',
      component: 'Input',
      required: true,
    },
    {
      label: '模板编码',
      field: 'templetCode',
      component: 'Input',
      required: true,
    },
  ] as FormSchema[],
};
