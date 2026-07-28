<template>
  <div style="padding: 20px">
    <h1 style="margin-top: 3%">请输入可访问的文件地址</h1>
    <a-textarea placeholder="请输入文件地址" v-model:value="textarea" />
    <div style="margin: 40px 0" />
    <br />
    <a-button type="primary" @click="clClean" style="margin-right: 10px">clean</a-button>
    <a-button type="primary" @click="clSubmit">view</a-button>
    <a-dropdown style="margin-right: 10px; margin-top: 10px">
      <a-button style="margin-left: 8px">
        新建
        <a-icon type="plus" />
      </a-button>
      <template #overlay>
        <a-menu>
          <a-menu-item key="1" preIcon="ant-design:plus" @click="createFile('word')">文字文档</a-menu-item>
          <a-menu-item key="1" preIcon="ant-design:plus" @click="createFile('excel')">表格文档</a-menu-item>
          <a-menu-item key="1" preIcon="ant-design:plus" @click="createFile('ppt')">演示文档</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { getViewUrlWebPath } from '../template/wps.file.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Persistent } from '/@/utils/cache/persistent';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const { createMessage } = useMessage();
  const fileSuffix = ref([
    'xls',
    'xlt',
    'et',
    'xlsx',
    'xltx',
    'csv',
    'xlsm',
    'xltm',
    'doc',
    'dot',
    'wps',
    'wpt',
    'docx',
    'dotx',
    'docm',
    'dotm',
    'ppt',
    'pptx',
    'pptm',
    'ppsx',
    'ppsm',
    'pps',
    'potx',
    'potm',
    'dpt',
    'dps',
    'pdf',
  ]);
  const textarea = ref('');

  /**
   * 清除按钮点击
   */
  function clClean() {
    textarea.value = '';
  }

  /**
   * 预览页面
   */
  async function clSubmit() {
    if (!textarea.value) {
      createMessage.warning('输入内容不能为空！');
      return;
    }
    let reg = /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/;
    if (!reg.test(textarea.value)) {
      createMessage.warning('请输入正确的文件路径！');
      return;
    }
    const fileName = textarea.value;
    const fileStrArr = fileName.split('.');
    const suffix = fileStrArr[fileStrArr.length - 1];
    let result = fileSuffix.value.some((item) => {
      return item === suffix;
    });
    if (!result) {
      createMessage.warning('不支持该文件类型');
      return;
    }
    const params = {
      fileUrl: textarea.value,
    };
    getViewUrlWebPath(params).then((res) => {
      let routeUrl = router.resolve({
        path: '/wps/viewFile',
      });
      sessionStorage.setItem('WPS_URL', res.wpsUrl);
      window.open(routeUrl.href, '_blank');
    });
  }

  /**
   * word新建文件点击事件
   */
  function createFile(type) {
    sessionStorage.setItem('WPS_TYPE', type);
    let routeUrl = router.resolve({
      path: '/wps/createFile',
    });
    window.open(routeUrl.href, '_blank');
  }
</script>

<style scoped></style>
