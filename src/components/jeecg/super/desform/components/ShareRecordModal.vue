<template>
  <BasicModal title="分享记录" width="580px" :canFullscreen="false" :footer="null" :minHeight="120" destroyOnClose @register="registerModal">
    <div class="share-item">
      <div class="share-item-title">内部成员访问</div>
      <div class="share-item-desc">
        <span>只有应用成员登录后才能根据权限访问</span>
      </div>
      <a-space class="share-item-content">
        <div class="href-box">
          <div class="href-left" :title="href">{{ href }}</div>
          <a-tooltip title="新页面打开">
            <div class="href-right" @click="onOpen">
              <Icon icon="ic:round-launch" />
            </div>
          </a-tooltip>
        </div>
        <a-tooltip title="复制">
          <a-button preIcon="ant-design:copy" @click="onCopy" />
        </a-tooltip>
        <a-popover placement="bottom" overlayClassName="share-record-qrcode-popover">
          <template #content>
            <QrCode ref="qrRef" :value="href" />
            <div style="text-align: center; position: absolute; left: 0; right: 0; bottom: 0">
              <a-button type="link" @click="onDownload">点击下载</a-button>
            </div>
          </template>
          <a-button preIcon="ic:round-qrcode" />
        </a-popover>
      </a-space>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import type { QrCodeActionType } from '/@/components/Qrcode';
  import { ref, unref } from 'vue';
  import { QrCode } from '/@/components/Qrcode';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { copyTextToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  const qrRef = ref<QrCodeActionType>();
  const { createMessage: $message } = useMessage();
  const [registerModal] = useModalInner(open);

  const href = ref('');

  function open(data) {
    href.value = data.href;
  }

  function onOpen() {
    window.open(href.value, '_blank');
  }

  async function onCopy() {
    let success = copyTextToClipboard(href.value);
    if (success) {
      $message.success('复制成功');
    } else {
      prompt('复制失败，请手动复制', href.value);
    }
  }

  function onDownload() {
    const qrEl = unref(qrRef);
    if (!qrEl) return;
    qrEl.download('分享二维码-' + new Date().getTime() + '.png');
  }
</script>

<style scoped lang="less">
  .share-item {
    padding: 10px;

    .share-item-title {
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }

    .share-item-desc {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
    }

    .share-item-content {
      margin-top: 12px;

      .href-box {
        display: flex;
        align-items: center;
        width: 455px;
        height: 32px;
        border-radius: 4px;
        background-color: #efefef;

        .href-left {
          flex: 1;
          padding: 0 10px;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .href-right {
          width: 32px;
          height: 32px;
          border-left: 1px solid #e8e8e8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          &:hover {
            background-color: #f5f5f5;
          }
        }
      }
    }
  }
</style>
<style lang="less">
  .share-record-qrcode-popover {
    .ant-popover-inner-content {
      padding: 0 0 10px 0;
    }
  }
</style>
