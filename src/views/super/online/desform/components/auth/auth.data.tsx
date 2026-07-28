import { BasicColumn, FormSchema } from '/@/components/Table';
import { ExclamationCircleOutlined} from '@ant-design/icons-vue';

// 系统变量选项
export const SYS_VAR_OPTIONS = [
  {
    label: '登录用户账号',
    value: '#{sys_user_code}',
  },
  {
    label: '登录用户名称',
    value: '#{sys_user_name}',
  },
  {
    label: '当前日期',
    value: '#{sys_date}',
  },
  {
    label: '当前时间',
    value: '#{sys_time}',
  },
  {
    label: '登录用户部门',
    value: '#{sys_org_code}',
  },
  {
    label: '用户拥有的部门',
    value: '#{sys_multi_org_code}',
  },
  {
    label: '登录用户租户',
    value: '#{tenant_id}',
  },
]

export const dataAuth = {
  columns: [
    {
      title: '启用',
      key: 'rowIndex',
      width: 100,
      slots: { customRender: 'switch' },
    },
    {
      title: '规则名称',
      dataIndex: 'authTitle',
      width: 120,
      ellipsis: true,
    },
    {
      title: '规则字段',
      dataIndex: 'authField',
      width: 120,
      ellipsis: true,
      slots: { customRender: 'authField' },
    },
    {
      title: '规则条件',
      dataIndex: 'authType',
      width: 120,
      ellipsis: true,
    },
    {
      title: '规则值',
      dataIndex: 'authValue',
      width: 120,
      ellipsis: true,
    },
  ] as BasicColumn[],
  searchFormSchemas: [
    { label: '规则名称', field: 'authTitle', component: 'JInput' },
    { label: '规则值', field: 'authValue', component: 'JInput' },
  ] as FormSchema[],
  formSchemas: [
    {
      label: '规则名称',
      field: 'authTitle',
      required: true,
      component: 'Input',
    },
    {
      label: '规则字段',
      field: 'authField',
      ifShow: ({values}) => values.authType !== 'custom_mongodb',
      required: ({values})=> values.authType !== 'custom_mongodb',
      component: 'Select',
      componentProps: {
        allowClear: true,
        showSearch: true,
        filterOption: (input, opt) => opt.label?.toLowerCase().includes(input?.trim().toLowerCase()),
        getPopupContainer: () => document.body,
      },
    },
    {
      label: '条件规则',
      field: 'authType',
      required: true,
      component: 'Select',
      componentProps: {
        options: [
          { label: '请选择', value: undefined },
          { label: '大于（gt）', value: 'gt' },
          { label: '小于（lt）', value: 'lt' },
          { label: '等于（eq）', value: 'eq' },
          { label: '不等于（ne）', value: 'ne' },
          { label: '大于等于（ge）', value: 'ge' },
          { label: '小于等于（le）', value: 'le' },
          { label: '左模糊（left_like）', value: 'left_like' },
          { label: '右模糊（right_like）', value: 'right_like' },
          { label: '全模糊（like）', value: 'like' },
          { label: '为空（empty）', value: 'empty' },
          { label: '非空（not_empty）', value: 'not_empty' },
          { label: '自定义MongoDB语句', value: 'custom_mongodb' },
        ],
        getPopupContainer: () => document.body,
      },
    },
    {
      label: '规则值',
      field: 'authValue',
      required: true,
      component: 'InputSearch',
      componentProps: {
        getPopupContainer: () => document.body,
        inputPlaceholder: '请输入规则值',
        selectPlaceholder: '可选择系统变量',
        options: SYS_VAR_OPTIONS,
      },
      ifShow({values}) {
        return values.authType !== 'empty' && values.authType !== 'not_empty';
      },
    },
    {
      label: '规则值类型',
      field: 'authValueType',
      component: 'Input',
      show: false,
    },
    {
      label: '状态',
      field: 'status',
      component: 'RadioButtonGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '有效', value: 1 },
          { label: '无效', value: 0 },
        ],
      },
      defaultValue: 1,
    },
  ] as FormSchema[],
};

export const buttonAuth = {
  columns: [
    {
      title: '启用',
      key: 'rowIndex',
      width: 60,
      slots: { customRender: 'switch' },
    },
    {
      title: '名称',
      dataIndex: 'authTitle',
      ellipsis: true,
    },
    {
      title: '字段名',
      dataIndex: 'authField',
      ellipsis: true,
    },
    {
      title: '已授权给',
      dataIndex: 'authScopeIsAll',
      customRender: renderAuthScopeIsAll,
    },
  ] as BasicColumn[],
};

export const fieldAuth = {
  columns: [
    {
      title: '启用',
      key: 'rowIndex',
      width: 60,
      slots: { customRender: 'switch' },
    },
    {
      title: '权限名称',
      dataIndex: 'authTitle',
      ellipsis: true,
    },
    {
      title: '权限字段',
      dataIndex: 'authField',
      ellipsis: true,
    },
    {
      title: '可见授权',
      width: 100,
      dataIndex: 'authScopeIsAll',
      customRender: renderAuthScopeIsAll,
    },
    {
      title: '编辑授权',
      width: 100,
      dataIndex: 'ea',
      customRender: ({text: record, record: {status}}) => renderAuthScopeIsAll({
        text: record.authScopeIsAll,
        record: {...record, status}
      }),
    },
  ] as BasicColumn[],
};

export const settingAuth = {
  formSchemas: [
    {
      label: '授权给所有人',
      field: 'authScopeIsAll',
      component: 'Switch',
      componentProps: {
        checkedValue: 'Y',
        unCheckedValue: 'N',
        checkedChildren: '是',
        unCheckedChildren: '否',
      },
      defaultValue: 'N',
    },
    {
      label: '用户权限',
      field: 'authScopeUsersVal',
      component: 'JSelectUser',
      componentProps: {
        isRadioSelection: false,
      },
      dynamicDisabled: ({ model }) => model.authScopeIsAll === 'Y',
    },
    {
      label: '角色权限',
      field: 'authScopeRolesVal',
      component: 'JSelectRole',
      componentProps: {
        rowKey: 'roleCode',
        isRadioSelection: false,
      },
      dynamicDisabled: ({ model }) => model.authScopeIsAll === 'Y',
    },
    {
      label: '部门权限',
      field: 'authScopeDepartsVal',
      component: 'JSelectDept',
      componentProps: {
        // 取消父子关联
        checkStrictly: true,
      },
      dynamicDisabled: ({ model }) => model.authScopeIsAll === 'Y',
    },
    {label: '状态', field: 'status', component: 'Input', show: false},
  ] as FormSchema[],
};

/** 渲染授权范围 */
export function renderAuthScopeIsAll({ text, record }) {
  const style = 'color: #CCCCCC;';
  const { authScopeUsersVal, authScopeRolesVal, authScopeDepartsVal, status } = record;
  const disabled = status == 0
  if (disabled) {
    return <span title="由于未启用该项，所以权限未生效" style={style}>未启用</span>;
  }
  const hasAuth = authScopeUsersVal || authScopeRolesVal || authScopeDepartsVal;
  if (text === 'N') {
    if (hasAuth) {
      return <span title="已配置用户、角色或部门权限并生效">固定人群</span>;
    } else {
      return <span title="未授权给任何人" style={'color: #b84133'}>未授权</span>;
    }
  } else {
    if (hasAuth) {
      return (
        <span title="已配置用户、角色或部门权限，但未生效，因为勾选了授权给所有人">
          <span style={style}>所有人</span>
          <ExclamationCircleOutlined style={'color: #FFC107; margin-left: 4px;'}/>
        </span>
      );
    } else {
      return (
        <span title="已授权给所有人" style={style}>
          所有人
        </span>
      );
    }
  }
}
