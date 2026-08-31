import { computed, ref } from 'vue';
import { router } from '/@/router';
import { useFuncSwitch } from "/@/hooks/jeecg/desform/useFuncSwitch";
import { useLowAppAuthStore } from '/@/store/modules/lowAppAuth';

export function useViewCommon() {
  const appId = computed(() => router.currentRoute.value?.params?.appId);
  const authStore = useLowAppAuthStore();
  // 是否有管理员权限
  const hasAdminAuth = computed(() => authStore.getLowAppAdminAuth());
  // 功能开关
  const { getHasFunc } = useFuncSwitch();
  // 【功能开关】是否开启评论
  const showComment = getHasFunc('RECORD_COMMENT');
  // 【功能开关】是否开启附件
  const showFiles = getHasFunc('FILES_DOWNLOAD');
  // 【功能开关】是否开启日志
  const showDataLog = getHasFunc('RECORD_LOGS');
  // 【功能开关】是否显示新增（复制）按钮
  const showCreateBtn = getHasFunc('SHOW_CREATE_BTN');
  // 【功能开关】记录分享
  const showRecordShare = getHasFunc('RECORD_SHARE');
  // 【功能开关】记录打印
  const showRecordSysPrint = getHasFunc('RECORD_SYS_PRINT');
  // 是否显示设计表单按钮
  const showDesignFormBtn = computed(() => hasAdminAuth.value);

  // 当前页数据总数
  const dataPageTotal = ref<Nullable<number>>(null);
  // 当前数据下标
  const currentIndex = ref<Nullable<number>>(null);

  return {
    appId,
    showComment,
    showFiles,
    showDataLog,
    showCreateBtn,
    showRecordShare,
    showRecordSysPrint,
    showDesignFormBtn,
    dataPageTotal,
    currentIndex,
    hasAdminAuth,
  };
}
