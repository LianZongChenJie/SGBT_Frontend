/*
 * 功能开关
 */
import type { Ref } from 'vue';
import { ref, computed, provide, inject } from 'vue';

// 默认允许的功能列表
const DEF_FUNC_LIST = [
  /** 显示创建按钮 */
  'SHOW_CREATE_BTN',
  /** 导入数据 */
  'IMPORT_DATA',
  /** 视图导出 */
  'VIEW_EXPORT',
  /** 允许批量操作 */
  'BATCH_ACTION',
  /** 批量编辑 */
  'BATCH_EDIT',
  /** 批量打印 */
  'BATCH_SYS_PRINT',
  /** 批量导出 */
  'BATCH_EXPORT',
  /** 批量删除 */
  'BATCH_REMOVE',
  /** 批量执行自定义动作（按钮） */
  'BATCH_CUSTOM_BUTTON',
  /** 记录分享 */
  'RECORD_SHARE',
  /** 记录讨论 */
  'RECORD_COMMENT',
  /** 记录打印 */
  'RECORD_SYS_PRINT',
  /** 记录日志 */
  'RECORD_LOGS',
  /** 允许下载附件 */
  'FILES_DOWNLOAD',
] as const;

export type FuncCodeType = typeof DEF_FUNC_LIST[number];
const piSymbol = 'ALLOW_FUNC_LIST';

/**
 * 功能开关
 */
export function useFuncSwitch() {
  const allowFuncList = inject<Ref<FuncCodeType[]>>(piSymbol, ref([]));

  if (allowFuncList.value.length === 0) {
    allowFuncList.value = [...DEF_FUNC_LIST];
    provide(piSymbol, allowFuncList);
    console.info('注册 useFuncSwitch provided')
  }

  /**
   * 获取判断是否允许使用某个功能的计算属性
   * @param code
   */
  function getHasFunc(code: FuncCodeType) {
    return computed<boolean>(() => {
      return allowFuncList.value.includes(code);
    });
  }

  return {
    getHasFunc,
    allowFuncList,
  };
}
