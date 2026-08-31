<template>
  <div v-if="visible" class="j-auto-desform-data-full-screen" :style="{ backgroundColor: bgColor }">
    <DesformView
      class="desform-view"
      :mode="mode"
      :desformCode="desForm.desformCode"
      :dataId="dataId"
      height="100vh"
      :innerDialog="true"
      @close="close"
      @forceClose="close"
      @success="handleSuccess"
      @reload="handleReload"
      :isOnline="isOnline"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, toRefs, reactive } from 'vue';

  export default defineComponent({
    props: {
      dialogOptions: {
        type: Object,
        default: () => {},
      },
    },
    emits: ['close', 'added', 'edited', 'ok'],
    setup(_, { emit }) {
      const _data = reactive({
        mode: 'add',
        title: '操作',
        visible: false,
        desForm: {},
        dataId: null,
        bgColor: 'rgba(0,0,0,0.6)',
        isOnline: false,
        /** 开启表单 */
      });
      function open(mode, desform, dataId, title) {
        _data.mode = mode;
        _data.title = title;
        _data.dataId = dataId;
        _data.desForm = desform;
        _data.visible = true;
        console.log('_data', _data);
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
        emit('close');
        _data.bgColor = 'rgba(0,0,0,0.6)';
        // 恢复body的滚动
        document.body.style.overflow = _data.bodyOverflow;
        _data.bodyOverflow = null;
      }

      function handleSuccess(event) {
        if (_data.dataId == null) {
          emit('added', { desform: _data.desForm, dataId: event.dataId });
        } else {
          emit('edited', { desform: _data.desForm, dataId: _data.dataId });
        }
        close();
      }

      function handleReload() {
        emit('ok');
      }
      return {
        open,
        close,
        handleSuccess,
        handleReload,
        ...toRefs(_data),
      };
    },
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
