import type { Ref, ComputedRef } from 'vue';
import { ref, inject, watch, onUnmounted } from 'vue';

type Methods = {
  closeModal?: () => void;
  closeDrawer?: () => void;
  getVisible: Ref<boolean> | ComputedRef<boolean>;
};

/**
 * 监听设计表单弹窗打开事件，关闭当前弹窗
 */
export function useWatchDesigner(methods: Methods) {
  // 获取设计表单弹窗是否打开
  const getDesignerVisible = inject<Ref<boolean>>('getDesignerVisible', ref(false));
  // 监听设计表单弹窗打开事件，关闭当前弹窗
  const unwatch = watch(
    getDesignerVisible,
    (visible) => {
      if (visible && methods?.getVisible?.value) {
        (methods?.closeModal || methods?.closeDrawer)?.();
      }
    },
    { immediate: true }
  );
  // 卸载监听
  onUnmounted(() => unwatch());
}
