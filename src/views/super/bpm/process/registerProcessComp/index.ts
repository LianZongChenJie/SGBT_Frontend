import type { App } from 'vue';
import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
const MyTaskHandleModal = createAsyncComponent(() => import('../personalOffice/myHandleTask/modal/TaskHandleModal.vue'));
// BPM中的组件全局注册——（OA模块、零代码应用要用）
const TaskNotifyMeModal = createAsyncComponent(() => import('../personalOffice/myHandleTask/modal/TaskNotifyMeModal.vue'));
const TaskNotifyModal = createAsyncComponent(() => import('../personalOffice/myApplyTask/notify/TaskNotifyModal.vue'));
const HisTaskDealModal = createAsyncComponent(() => import('../manage/components/HisTaskDealModal.vue'));
const SelectEntrusterModal = createAsyncComponent(() => import('../personalOffice/myHandleTask/modal/SelectEntrusterModal.vue'));
const TaskHandleModal = createAsyncComponent(() => import('../personalOffice/myHandleTask/modal/TaskHandleModal.vue'));
const BpmPictureModal = createAsyncComponent(() => import('../manage/components/BpmPictureModal.vue'));
const DesformDataModal = createAsyncComponent(() => import('../oaOffice/myApply/components/DesformDataModal.vue'));
const BpmGraphicModal = createAsyncComponent(() => import('../components/BpmGraphicModal.vue'));

export const registerProcessComp = {
  install(app: App) {
    //流程任务处理弹窗
    app.component('MyTaskHandleModal', MyTaskHandleModal);
    // BPM中的组件全局注册——（OA模块、零代码应用要用）
    //催办
    app.component('TaskNotifyMeModal', TaskNotifyMeModal);
    app.component('TaskNotifyModal', TaskNotifyModal);
    //历史任务查看页面
    app.component('HisTaskDealModal', HisTaskDealModal);
    //选择委派人
    app.component('SelectEntrusterModal', SelectEntrusterModal);
    //任务办理页面
    app.component('TaskHandleModal', TaskHandleModal);
    //流程图
    app.component('BpmPictureModal', BpmPictureModal);
    //设计器表单弹窗
    app.component('DesformDataModal', DesformDataModal);
    
    app.component('BpmGraphicModal', BpmGraphicModal);

    console.log("---初始化---， 全局注册process模块的部分组件-----------------")
  },
};
