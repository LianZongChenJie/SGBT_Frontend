<template>
  <div v-if="visible" :class="prefixCls" :style="{ backgroundColor: bgColor, zIndex }">
    <DesformView
      class="desform-view"
      innerDialog
      height="100vh"
      :mode="mode"
      :dataId="dataId"
      :isOnline="isOnline"
      :isLinkDialog="isLinkDialog"
      :desformCode="desformCode"
      :defaultFormData="defaultFormData"
      :widgetConfig="widgetConfig"
      :customButtonId="customButtonId"
      @close="onClose"
      @forceClose="forceClose"
      @success="onSuccess"
      @reload="onReload"
    />
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, getCurrentInstance, ref } from 'vue';
  import { sleep } from '/@/utils';
  import { propTypes } from '/@/utils/propTypes';
  import { useModalInner } from '/@/components/Modal';
  import { useDesign } from '/@/hooks/web/useDesign';

  export default defineComponent({
    name: 'AutoDesformDataFullScreen',
    props: {
      zIndex: propTypes.number.def(999),
      defaultFormData: propTypes.object.def({}),
      widgetConfig: propTypes.array,
    },
    emits: ['register', 'success', 'close'],
    setup(_, { emit }) {
      const { prefixCls } = useDesign('auto-desform-data-full-screen');
      const mode = ref('add');
      const visible = ref(false);
      const desformCode = ref(null);
      const dataId = ref(null);
      const bgColor = ref('rgba(0,0,0,0.6)');
      const isOnline = ref(false);
      const isLinkDialog = ref(false);
      let bodyOverflow: any = null;

      // 是否是自定义按钮创建的关联记录表单
      const isLinkRecordForm = ref(false);
      // 自定义按钮的ID
      const customButtonId = ref('');
      // 当前记录ID
      const currentRecordId = ref('');
      
      // 注册内部弹窗
      let [register] = useModalInner(openModal);

      const instance = getCurrentInstance();
      if (instance) {
        register(
          {
            closeModal,
            getVisible: computed(() => visible.value),
            setModalProps: () => undefined,

            // emitVisible: () => undefined,
            // redoModalHeight: () => undefined,
          } as any,
          instance.uid as any
        );
      }

      function openModal(data) {
        isOnline.value = data.isOnline;
        isLinkDialog.value = data.isLinkDialog;
        mode.value = data.mode;
        dataId.value = data.dataId;
        desformCode.value = data.desformCode;
        visible.value = true;
        // 禁止body滚动，防止滚动穿透
        bodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        
        //如果是表单设计器-自定义按钮创建关联记录 需要下面3个参数
        isLinkRecordForm.value = data.isLinkRecordForm || false;
        customButtonId.value = data.customButtonId || '';
        currentRecordId.value = data.currentRecordId || '';
      }

      /** 开始关闭动画 */
      function closeModal() {
        bgColor.value = 'rgba(0,0,0,0)';
        sleep(150, () => forceClose());
      }

      /** 完全关闭，并初始化所有的字段 */
      function forceClose() {
        emit('close');
        visible.value = false;
        bgColor.value = 'rgba(0,0,0,0.6)';
        // 恢复body的滚动
        document.body.style.overflow = bodyOverflow;
        bodyOverflow = null;
      }

      function onClose() {
        closeModal();
      }

      function onSuccess(data) {
        //update-begin---author:scott ---date:2023-08-14  for：【QQYUN-6271】任务办理填报表单，添加子表数据 显示已删除---
        let dataId = data.dataId;
        let { newData } = data;
        if (!newData._id) {
          newData._id = dataId;
        }
        //update-end---author:scott ---date::2023-08-14  for：【QQYUN-6271】任务办理填报表单，添加子表数据 显示已删除---
        
        emit('success', {
          dataId,
          newData,
          isLinkRecordForm: isLinkRecordForm.value,
          customButtonId: customButtonId.value,
          currentRecordId: currentRecordId.value,
        });
        if (!isLinkDialog.value || mode.value === 'add') {
          closeModal();
        }
      }

      function onReload() {
        emit('success');
      }

      return {
        prefixCls,
        mode,
        dataId,
        bgColor,
        visible,
        isOnline,
        isLinkDialog,
        desformCode,
        forceClose,
        onClose,
        onReload,
        onSuccess,
        customButtonId,
      };
    },
  });
</script>

<style scoped lang="less">
  // noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-auto-desform-data-full-screen';
  .@{prefix-cls} {
    position: fixed;
    z-index: 999;
    transition: background-color 150ms;

    &,
    .desform-view {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .desform-view {
      position: absolute;
    }
  }
</style>
