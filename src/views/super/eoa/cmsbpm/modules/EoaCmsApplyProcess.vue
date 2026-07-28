<template>
  <a-card v-bind="$attrs" :bordered="false" :style="{ marginTop: '12px', height: '395px' }">
    <template #title>
      <span> <a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />我的申请</span>
    </template>
    <template #extra>
      <a @click="loadMore('task-myApplyTaskList')">更多</a>
    </template>
    <MyApplyProcessList></MyApplyProcessList>
  </a-card>
</template>

<script lang="ts" name="eoa-cms-apply-process" setup>
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { router } from '/@/router';
  const MyApplyProcessList = createAsyncComponent(() => import('./MyApplyProcessList.vue'));
  //props定义
  const props = defineProps({
    isDesign: {
      type: Boolean,
      required: false,
      default: false,
    },
    //设置组件宽高
    size: {
      type: [String, Object],
    },
  });
  //跳转更多
  function loadMore(name) {
    router.push({ name });
  }
</script>

<style scoped></style>
