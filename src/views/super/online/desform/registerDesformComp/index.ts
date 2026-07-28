import type { App } from 'vue';
import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
const DesformModal = createAsyncComponent(() => import('../components/DesformModal.vue'));
const FormDesignerIframeModal = createAsyncComponent(() => import('../components/FormDesignerIframeModal.vue'));
export const registerDesformComp = {
  install(app: App) {
    app.component('DesformModal', DesformModal);
    app.component('FormDesignerIframeModal', FormDesignerIframeModal);

    // NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
    console.log("---初始化---， 全局注册 desform模块的全局组件-----------------")
  },
};
