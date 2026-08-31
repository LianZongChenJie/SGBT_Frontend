import type { App } from 'vue';
import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
// 异步注册 DesformView 组件
export const DesformViewAsync = createAsyncComponent(() => import('./DesformView.vue'), { loading: true });
export const DesformViewModalAsync = createAsyncComponent(() => import('./DesformViewModal.vue'), { loading: true });

export const DesformView = {
  install(app: App) {
    app.component('DesformView', DesformViewAsync);
    app.component('DesformViewModal', DesformViewModalAsync);
  },
};

// 表单设计器配置类型
export interface DesformConfigType extends Recordable {
  // 标题字段
  titleField: string;
  // 弹窗配置
  dialogOptions: {
    top: number;
    width: number;
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  // 是否启用留言
  enableComment: boolean;
  // 是否允许打印
  allowPrint: boolean;
  // 是否允许积木报表打印
  allowJmReport: boolean;
}

export {default as DesformDataLinkageModal} from './DesformDataLinkageModal.vue'
