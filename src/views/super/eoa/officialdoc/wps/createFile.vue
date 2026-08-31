<template>
  <div id="createFile">
    <iframe v-if="frameShow" id="create_iframe" ref="frameRef" :src="frameSrc" class="frame-content"></iframe>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { createTemplateFile } from '../template/wps.file.api';

  const frameShow = ref(false);
  const frameSrc = ref('');
  const type = sessionStorage.getItem('WPS_TYPE');
  createTemplateFile({ template: type }).then((res) => {
    frameSrc.value = res.message;
    frameShow.value = true;
  });
</script>

<style scoped>
  #create_iframe {
    position: fixed;
    top: @header-height;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .frame-content {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    border: none;
    /* 防止双击缩放 */
    touch-action: manipulation;
  }

  body #createFile {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
    width: 100%;
    /* 防止双击缩放 */
    touch-action: manipulation;
  }

  body #createFile #wps-iframe {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    height: 100%;
    /* 防止双击缩放 */
    touch-action: manipulation;
  }
</style>
