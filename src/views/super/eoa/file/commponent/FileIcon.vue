<template>
  <div style="width: 100%; margin: 0 auto;display: flex">
    <img v-if="ext === 'jpg' || ext === 'png' || ext === 'jpeg' || ext === 'gif'" :src="getImageSrc(fileUrl)" class="new-image" />
    <Icon v-else-if="ext === 'xls' || ext === 'xlsx'" class="file-icon" icon="ant-design:file-excel-outlined" style="color: rgb(98, 187, 55)" />
    <Icon v-else-if="ext === 'pdf'" class="file-icon" icon="ant-design:file-pdf-outlined" style="color: rgb(211, 47, 47)" />
    <Icon v-else-if="ext === 'doc' || ext === 'docx'" class="file-icon" icon="ant-design:file-word-outlined" style="color: rgb(68, 138, 255)" />
    <Icon v-else-if="ext === 'ppt' || ext === 'pptx'" class="file-icon" icon="ant-design:file-ppt-outlined" style="color: rgb(245, 124, 0)" />
    <Icon v-else-if="ext === 'video'" class="file-icon" icon="ant-design:play-square-outlined" style="color: rgb(119, 87, 188)" />
    <Icon v-else-if="ext === 'txt'" class="file-icon" icon="ant-design:file-text-outlined" style="color: rgb(41, 211, 178)" />
    <Icon v-else-if="ext === 'zip'" class="file-icon" icon="ant-design:file-zip-outlined" style="color: rgb(253, 202, 7)" />
    <img :src="LinkImg" v-else-if="ext === 'url'" class="file-icon" />
    <Icon v-else-if="izFolder === '1'" icon="ant-design:folder-open-outlined" class="file-icon" style="color: rgb(253, 202, 7)" />
    <Icon v-else class="file-icon" icon="ant-design:file-unknown-outlined" />
  </div>
</template>

<script lang="ts" name="file-icon" setup>
  import { ref } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import LinkImg from '/@/assets/images/link.png';

  const ext = ref<string>('');
  const fileUrl = ref<string>('');
  const izFolder = ref<string>('');

  /**
   * 获取图片路径
   * @param url
   */
  function getImageSrc(url) {
    return getFileAccessHttpUrl(url);
  }

  /**
   * 设置图标icon
   */
  function setIconData(record) {
    ext.value = record.ext
    fileUrl.value = record.url
    izFolder.value = record.izFolder
  }

  defineExpose({
    setIconData
  })
</script>

<style lang="less" scoped>
  .file-icon {
    height: 97px;
    width: 85px;
    display: block !important;
    text-align: center;
    margin: 10px auto;

    :deep(svg) {
      width: 100% !important;
      height: 100% !important;
    }
  }
  .new-image {
    max-height: 100px;
    max-width: 60%;
    margin: 16px auto;
  }
  .file-image {
    display: inline-block !important;
    height: 24px;
    margin-right: 2px;
    margin-top: 6px;
    vertical-align: top;
    width: 21px;
  }
</style>
