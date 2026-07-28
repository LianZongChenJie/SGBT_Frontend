<template>
  <BasicModal v-bind="$attrs" title="查看详情" :minHeight="600" :showCancelBtn="false" :showOkBtn="false" :height="88" v-model:visible="visible">
    <a-card class="daily-article">
      <a-card-meta :title="content.titile" :description="'发布人：' + content.sender + ' 发布时间： ' + content.sendTime"> </a-card-meta>
      <a-divider />
      <span v-html="content.msgContent" class="article-content"></span>
    </a-card>
  </BasicModal>
</template>
<script lang="ts">
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { ref, unref, defineComponent } from 'vue';

  export default defineComponent({
    components: {
      BasicModal: createAsyncComponent(() => import('/@/components/Modal/src/BasicModal.vue')),
    },
    setup() {
      const content = ref({});
      const visible = ref(false);

      function show(item) {
        if (item.isUpdate) {
          content.value = item.record;
        }
        visible.value = true;
      }
      return {
        content,
        visible,
        show,
      };
    },
  });
</script>

<style scoped lang="less">
  .detail-iframe {
    border: 0;
    width: 100%;
    height: 100%;
    min-height: 600px;
  }
</style>
