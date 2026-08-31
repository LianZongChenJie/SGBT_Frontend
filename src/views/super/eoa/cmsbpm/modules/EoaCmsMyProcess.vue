<template>
  <a-card v-bind="$attrs" :bordered="false" :style="{ marginTop: '12px', height: '450px' }">
    <template #title>
      <span><a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />流程中心</span>
    </template>
    <template #extra>
      <a @click="loadMore('task-myHandleTaskInfo')">更多</a>
    </template>
    <a-tabs>
      <a-tab-pane tab="待办" key="1">
        <MyRunningTaskList ref="runTaskList"></MyRunningTaskList>
      </a-tab-pane>
      <a-tab-pane tab="我的抄送" key="2">
        <MyCcHisProcessList ref="ccProcessList"></MyCcHisProcessList>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script lang="ts" setup name="eoa-cms-my-process">
  import { ref, unref } from 'vue';
  import { router } from '/@/router';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

  const MyRunningTaskList = createAsyncComponent(() => import('./MyRunningTaskList.vue'));
  const MyCcHisProcessList = createAsyncComponent(() => import('./MyCcHisProcessList.vue'));
  const props = defineProps({
    isDesign: {
      type: Boolean,
      required: false,
      default: false,
    },
    size: {
      type: [String, Object],
    },
  });
  const processUpdate = ref(false);

  function loadMore(name) {
    router.push({ name });
  }
</script>

<style scoped></style>
