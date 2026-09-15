export interface SystemUserRecord {
  id: string | number;
  username?: string;
  realname?: string;
  workNo?: string;
  phone?: string;
  orgCode?: string;
  orgCodeTxt?: string;
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
  id: string | number;
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

export function buildEmployeeCreatePayload(user: SystemUserRecord): EnergyEmployeeCreatePayload {
  return {
    id: user.id,
    employeeName: toTrimmedString(user.realname),
    employeeCode: toTrimmedString(user.workNo),
    position: toTrimmedString(user.post),
    sysOrgCode: toTrimmedString(user.orgCode),
    contactNo: toTrimmedString(user.phone),
  };
}

export function buildEmployeeBatchCreatePayload(users: SystemUserRecord[]): EnergyEmployeeCreatePayload[] {
  return users.map(buildEmployeeCreatePayload);
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
