<template>
  <a-card v-bind="$attrs" :bordered="false" :style="{ marginTop: '12px', height: '190px' }">
    <template #title>
      <span><a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />友情链接</span>
    </template>
    <a-row type="flex" justify="space-around" align="middle">
      <a-col :span="4"> <a-button size="large" @click="toWWW('http://www.jeecg.com')">官网</a-button></a-col>
      <a-col :span="4"> <a-button size="large" @click="toWWW('http://bbs.jeecg.com')">BBS</a-button></a-col>
      <a-col :span="4"> <a-button size="large" @click="toWWW('https://help.jeecg.com')">文档</a-button></a-col>
    </a-row>
    <a-row type="flex" justify="space-around" align="middle" :style="{ marginTop: '10px' }">
      <a-col :span="4"> <a-button size="large">系统1</a-button></a-col>
      <a-col :span="4"> <a-button size="large">系统2</a-button></a-col>
      <a-col :span="4"> <a-button size="large">系统3</a-button></a-col>
    </a-row>
  </a-card>
</template>

<script lang="ts" name="eoa-cms-link" setup>
  const props = defineProps({
    size: {
      type: [String, Object],
    },
  });
  function toWWW(url) {
    window.open(url, 'top');
  }
</script>

<style scoped></style>
