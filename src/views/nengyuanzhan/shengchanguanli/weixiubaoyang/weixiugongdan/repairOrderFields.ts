export function normalizeRepairOrderRecord(record: Record<string, any> = {}) {
  return {
    ...record,
    groupName: record.groupName || record.useDept || record.useDeptName || record.deptName || record.sysOrgCode_dictText || record.sysOrgCode,
    workDescription: record.workDescription || record.faultDesc || '',
    workloadList: Array.isArray(record.workloadList) ? record.workloadList : [],
    details: Array.isArray(record.details) ? record.details : [],
    attachments: Array.isArray(record.attachments) ? record.attachments : [],
  };
}

export function normalizeIdList(value) {
  if (Array.isArray(value)) {
    return value.map(Number).filter((item) => !Number.isNaN(item));
  }
  if (value === undefined || value === null || value === '') {
    return [];
  }
  return String(value)
    .split(',')
    .filter(Boolean)
    .map(Number)
    .filter((item) => !Number.isNaN(item));
}

export function normalizeNumberId(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
}

export function stringifyIdList(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null && item !== '').join(',');
  }
  return value ?? '';
}

export function getOptionLabel(option, fallbackField = 'label') {
  if (!option) {
    return '';
  }
  return option[fallbackField] ?? option.label ?? option.groupName ?? option.leaderName ?? '';
}
