<template>
  <!-- 催办弹出框 -->
  <a-modal width="60%" style="top: 20px" destroyOnClose :title="data.title" v-model:open="data.visible" :footer="null" @cancel="handleModalCancel">
    <a-tabs defaultActiveKey="1">
      <a-tab-pane key="1">
        <template #tab>
          <Icon icon="ant-design:file-text-outlined" />
          <span>催办</span>
        </template>
        <BizTaskNotifyForm :procInstId="procInstId" @success="handleModalCancel"></BizTaskNotifyForm>
      </a-tab-pane>

      <a-tab-pane key="2">
        <template #tab>
          <Icon icon="ant-design:user-outlined" />
          <span>我提醒的</span>
        </template>
        <MyBizTaskNotifyList :procInstId="procInstId"></MyBizTaskNotifyList>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, unref, reactive } from 'vue';
  import { createAsyncComponent } from '/src/utils/factory/createAsyncComponent';
  import MyBizTaskNotifyList from './MyBizTaskNotifyList.vue';

  const BizTaskNotifyForm = createAsyncComponent(() => import('./BizTaskNotifyForm.vue'), { loading: true });
  //数据
  const data = reactive({
    loading: false,
    title: '催办',
    visible: false,
  });

  const procInstId = ref('');
  /**
   * 关闭弹窗
   */
  function handleModalCancel() {
    data.visible = false;
  }

  /**
   * 催办
   * @param record
   */
  async function notify(id) {
    procInstId.value = id;
    data.visible = true;
  }

  defineExpose({
    notify,
    data,
  });
</script>
