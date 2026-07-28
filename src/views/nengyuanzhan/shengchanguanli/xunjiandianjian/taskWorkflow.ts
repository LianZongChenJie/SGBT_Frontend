const TASK_ACTION_STATUSES = new Set([1, 2]);

export function canExecuteTask(status?: number) {
  return TASK_ACTION_STATUSES.has(Number(status));
}

export function canAdjustTask(status?: number) {
  return TASK_ACTION_STATUSES.has(Number(status));
}
