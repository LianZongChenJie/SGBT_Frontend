import { defHttp } from '/@/utils/http/axios';
import { BasicColumn } from '/@/components/Table';

export function useAuthBatch(authScopeType: string) {
  // 授权 scope
  const scopeTypes = {
    /** 角色 */
    role: {
      name: '角色',
      codeName: 'roleCode',
      columns: [
        { title: '角色编码', align: 'center', dataIndex: 'roleCode' },
        { title: '角色名称', align: 'center', dataIndex: 'roleName' },
      ] as BasicColumn[],
      url: {
        list: '/sys/role/list',
      },
      getUpdateParams(moveRows) {
        return moveRows.map((row) => {
          return {
            id: row.key,
            authField: row.authField,
            authScopeRolesVal: row.scopeValue,
          };
        });
      },
    },
    /** 部门 （用到时再完善） */
    depart: {
      name: '部门',
      codeName: 'id',
      columns: [] as BasicColumn[],
      url: {
        list: '',
      },
      getUpdateParams(_moveRows) {},
    },
  };

  const authScope = scopeTypes[authScopeType];
  if (!authScope) {
    throw new Error('未知的 authScopeType 值：' + authScopeType);
  }

  function loadTableData(params) {
    return defHttp.get({ url: authScope.url.list, params });
  }

  return {
    scopeTypes,
    authScope,
    loadTableData,
  };
}
