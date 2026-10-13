export interface SystemUserRecord {
  id: string | number;
  username?: string;
  realname?: string;
  workNo?: string;
  phone?: string;
  resolvedOrgCode?: string;
  sysOrgCode?: string;
  orgCode?: string;
  orgCodeTxt?: string;
  departIds?: string | string[];
  departIds_dictText?: string;
  deptId?: string;
  deptName?: string;
  departName?: string;
  post?: string;
  postText?: string;
}

interface EnergyEmployeeMappedPayload {
  employeeName: string;
  employeeCode: string;
  position: string;
  sysOrgCode: string;
  contactNo: string;
}

export interface EnergyEmployeeCreatePayload extends EnergyEmployeeMappedPayload {
  /**
   * 批量新增接口的人员 ID 是 Integer，按本次选择顺序传递，不能使用系统用户的长整型 ID。
   */
  id: number;
}

export interface EnergyEmployeeEditPayload extends EnergyEmployeeMappedPayload {
  id?: string | number;
  employeeType: string;
  company: string;
  idCard: string;
}

export function toTrimmedString(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .join(',');
  }
  if (typeof value === 'object') {
    const item = value as Record<string, unknown>;
    const candidate = item.value ?? item.id ?? item.code ?? item.label ?? '';
    return String(candidate ?? '').trim();
  }
  return String(value).trim();
}

export function buildEmployeeCreatePayload(user: SystemUserRecord, index = 0): EnergyEmployeeCreatePayload {
  return {
    id: index,
    employeeName: toTrimmedString(user.realname),
    employeeCode: toTrimmedString(user.workNo),
    position: toTrimmedString(user.post),
    // 只允许组织编码，不能将部门名称或部门主键传给 sysOrgCode。
    sysOrgCode: toTrimmedString(user.resolvedOrgCode || user.sysOrgCode || user.orgCode),
    contactNo: toTrimmedString(user.phone),
  };
}

export function buildEmployeeBatchCreatePayload(users: SystemUserRecord[]): EnergyEmployeeCreatePayload[] {
  return users.map((user, index) => buildEmployeeCreatePayload(user, index));
}

export function buildEmployeeEditPayload(values: Record<string, unknown>): EnergyEmployeeEditPayload {
  const payload: EnergyEmployeeEditPayload = {
    employeeName: toTrimmedString(values.employeeName),
    employeeCode: toTrimmedString(values.employeeCode),
    employeeType: toTrimmedString(values.employeeType),
    company: toTrimmedString(values.company),
    idCard: toTrimmedString(values.idCard),
    position: toTrimmedString(values.position),
    sysOrgCode: toTrimmedString(values.sysOrgCode),
    contactNo: toTrimmedString(values.contactNo),
  };

  if (values.id) {
    payload.id = values.id as string | number;
  }

  return payload;
}
