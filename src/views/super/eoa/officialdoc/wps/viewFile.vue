<template> </template>

<script lang="ts" setup>
  import WebOfficeSDK from './web-office-sdk.es.js';
  import { getToken } from '/@/utils/auth';
  import { Persistent } from '/@/utils/cache/persistent';
  let wpsUrl = sessionStorage.getItem('WPS_URL');
  //配置超时获取 token 函数
  //设置token自动刷新，url:地址，mode：normal 普通模式、simple极简模式，mount:在哪个div中显示iframe
  const jssdk = WebOfficeSDK.config({
    url: wpsUrl,
    mode: 'normal',
    mount: document.querySelector('#app'),
  });
  //设置 token
  jssdk.setToken({
    token: getToken(),
  });
  jssdk.on('fileOpen', (data) => {
    console.log('数据回调:', data);
  });
</script>

<style>
  #office-iframe {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background: white;
  }
</style>
