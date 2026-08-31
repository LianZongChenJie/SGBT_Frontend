const DEFAULT_IGNORE_KEYS = [
  'id',
  'key',
  'createBy',
  'createTime',
  'updateBy',
  'updateTime',
  'delFlag',
  'tenantId',
  'status',
  'reviewStatus',
  'auditStatus',
  'sort',
];

function isMeaningfulValue(value: unknown, ignoreKeys: Set<string>): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    const text = value.trim();
    return !!text && text !== 'null' && text !== 'undefined' && text !== '--';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }

  if (value instanceof Date) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => isMeaningfulValue(item, ignoreKeys));
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !ignoreKeys.has(key))
      .some(([, item]) => isMeaningfulValue(item, ignoreKeys));
  }

  return false;
}

export function hasMeaningfulData(value: unknown, ignoreKeys: string[] = []) {
  const mergedIgnoreKeys = new Set([...DEFAULT_IGNORE_KEYS, ...ignoreKeys]);
  return isMeaningfulValue(value, mergedIgnoreKeys);
}

export function hasListData(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}
