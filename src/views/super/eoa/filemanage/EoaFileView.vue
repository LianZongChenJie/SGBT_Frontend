<template>
  <div style="display: block">
    <iframe :id="id" :src="url" frameborder="0" width="100%" height="850px" scrolling="auto"> </iframe>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { getToken } from '/@/utils/auth';

  const id = ref<string>('eoaFileIframe');
  const url = ref<string>(window._CONFIG['domianURL'] + '/eoa/filemanage/view?token=' + getToken());
</script>
