<template>
  <a-card v-bind="$attrs" :bordered="false" :style="{ marginTop: '12px', height: '513px' }">
    <template #title>
      <span><a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />近期邮件</span>
    </template>
    <template #extra>
      <a @click="loadMore('eoa-email')">更多</a>
    </template>
    <MyEmailList></MyEmailList>
  </a-card>
</template>

<script lang="ts" setup name="eoa-cms-email">
  import { useMessage } from '/@/hooks/web/useMessage';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const MyEmailList = createAsyncComponent(() => import('./MyEmailList.vue'));
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
  //提示弹窗
  const $message = useMessage();

  //update-begin---author:wangshuai ---date:20220520  for：流程门户点击更多跳转到收件箱------------
  /**
   * 跟多路由跳转
   * @param name 路由名称
   */
  function loadMore(name) {
    router.push({ name: name, params: { type: 'inbox' } });
  }
  //update-end---author:wangshuai ---date:20220520  for：流程门户点击更多跳转到收件箱--------------

  //行点击事件
  function rowClick(record, index, event) {
    $message.createMessage.warning(`暂未实现`);
  }
</script>

<style scoped></style>
