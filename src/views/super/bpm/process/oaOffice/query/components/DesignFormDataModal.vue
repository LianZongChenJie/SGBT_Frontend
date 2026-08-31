<template>
  <div v-if="_data.visible" class="j-auto-desform-data-full-screen" :style="{ backgroundColor: _data.bgColor }">
    <desform-view
			class="desform-view"
			:mode="_data.mode"
			:desformCode="_data.desformCode"
			:dataId="_data.dataId"
			height="100vh"
			:innerDialog="true"
			@close="close"
			@success="handleSuccess"
			@reload="handleReload"
			:isOnline="_data.isOnline"
    />
  </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';

  const emit = defineEmits(['ok']);
  const _data = reactive({
    mode: 'add',
    title: '操作',
    visible: false,
    desformCode: null,
    dataId: null,
    bodyOverflow: null,
    bgColor: 'rgba(0,0,0,0.6)',
    isOnline: false,
  });

  /** 开启表单 */
  function open(mode, desformCode, dataId, title, isOnline) {
    _data.isOnline = isOnline;
    _data.mode = mode;
    _data.title = title;
    _data.dataId = dataId;
    _data.desformCode = desformCode;
    _data.visible = true;
    // 禁止body滚动，防止滚动穿透
    _data.bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  /** 开始关闭动画 */
  function close() {
    _data.bgColor = 'rgba(0,0,0,0)';
    setTimeout(() => {
      closed();
    }, 150);
  }

  /** 完全关闭，并初始化所有的字段 */
  function closed() {
    _data.visible = false;
    emit('ok');
    _data.bgColor = 'rgba(0,0,0,0.6)';
    // 恢复body的滚动
    document.body.style.overflow = _data.bodyOverflow;
    _data.bodyOverflow = null;
  }

  function handleSuccess() {
    emit('ok');
    close();
  }

  function handleReload() {
    emit('ok');
  }

  defineExpose({
    open,
  });
</script>

<style lang="less" scoped>
  .j-auto-desform-data-full-screen {
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
