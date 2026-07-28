/**
 * 测试数据--常用的数据权限
 */
const aiCommonAuthData = [
  {
    ruleName: '只查询自己创建的数据',
    ruleColumn: 'create_by',
    ruleOperator: '=',
    ruleValue: '#{sys_user_code}',
    status: 1,
  },
  {
    ruleName: '查询本部门及下级部门的数据',
    ruleColumn: 'sys_org_code',
    ruleOperator: 'RIGHT_LIKE',
    ruleValue: '#{sys_org_code}',
    status: 1,
  },
];
export default aiCommonAuthData;
