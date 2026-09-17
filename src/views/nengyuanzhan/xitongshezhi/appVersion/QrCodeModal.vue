<template>
  <BasicModal title="下载二维码" v-bind="$attrs" :show-ok-btn="false" :show-cancel-btn="false" @register="registerModal" width="460px">
    <div class="qrcode-preview">
      <a-button type="primary" @click="onPrint">打印二维码</a-button>
      <div id="app-version-qrcode-print" class="qrcode-print-content">
        <QrCode :value="downloadUrl" :width="280" :options="{ margin: 2 }" />
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { QrCode } from '/@/components/Qrcode';
  import { printJS } from '/@/hooks/web/usePrintJS';

  defineProps<{
    downloadUrl: string;
  }>();

  const [registerModal] = useModalInner();

  function onPrint() {
    printJS({
      printable: '#app-version-qrcode-print',
      type: 'html',
    });
  }
</script>

<style lang="less" scoped>
  .qrcode-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .qrcode-print-content {
    display: flex;
    justify-content: center;
    padding: 12px;
    background: #fff;
  }
</style>
