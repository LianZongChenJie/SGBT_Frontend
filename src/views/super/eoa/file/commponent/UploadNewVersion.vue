<template>
  <a-modal v-model:open="visible" @ok="handleOk" @cancel="handleCancel" wrapClassName="modal">
    <Loading :loading="loading" tip="上传中，请稍后" />
    <template #title>
      <div class="new-version">
        <span style="font-size: 17px; font-weight: normal">上传新版本</span>
        <div v-if="!progressShow">
          <FileIcon ref="fileIconRef" />
        </div>
      </div>
      <div v-show="progressShow"> </div>
    </template>
    <div class="file-form" style="margin-top: 20px">
      <div class="file-item">
        <div class="file-item-label">名称</div>
        <div class="file-item-content">
          <a-input v-model:value="fileName" style="width: 90%" />
        </div>
      </div>
      <div class="file-item">
        <div class="file-item-label">添加说明</div>
        <div class="file-item-content">
          <a-textarea v-model:value="description" placeholder="对此版本添加说明,可在属性-日志中查看" style="width: 90%" />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" name="upload-new-version" setup>
  import { ref, unref, defineEmits } from 'vue';
  import { uploadFile, editSysFile } from '../FileList.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useMessage } from '/@/hooks/web/useMessage';
  import FileIcon from './FileIcon.vue';
  import Loading from '/@/components/Loading/src/Loading.vue';

  const visible = ref<boolean>(false);
  const progressShow = ref<boolean>(true);
  const fileName = ref<string>('');
  const copyFileName = ref<string>('');
  const description = ref<string>('');
  const percent = ref<number>(0);
  const fileId = ref<string>('');
  const ext = ref<string>('');
  const fileSize = ref<string>('');
  const fileUrl = ref<string>('');
  const { createMessage: $message } = useMessage();
  const emit = defineEmits(['ok']);
  const fileIconRef = ref();
  const loading = ref<boolean>(false);

  /**
   * 文件上传
   */
  function upload(value) {
    visible.value = true;
    loading.value = true;
    fileName.value = value.fileName.substring(0, value.fileName.lastIndexOf('.'));
    copyFileName.value = value.fileName;
    percent.value = 1;
    progressShow.value = true;
    fileId.value = value.fileId;
    let fileData = new FormData();
    fileData.append('bizPath', 'biz/user_imgs');
    fileData.append('file', value.file);
    uploadFile(fileData).then((res) => {
      if (res.success && res.message) {
        percent.value = 100;
        fileUrl.value = res.message;
        ext.value = res.message.substring(res.message.lastIndexOf('.') + 1);
        fileSize.value = value.file.size;
        progressShow.value = false;
        setTimeout(()=>{
          //设置文件图表标
          fileIconRef.value.setIconData({url:unref(fileUrl),ext:unref(ext),izFolder:''})
        },100)
      }else{
        $message.warning(res.message);
        progressShow.value = false;
      }
    }).catch((error)=>{
      if(error?.response?.statusText == 'Request Entity Too Large'){
        $message.warning("上传失败，文件太大请重新上传！");
      }else{
        $message.warning("上传失败，请重新上传！");
      }
    }).finally(()=>{
      loading.value = false;
    })
  }

  /**
   * 文件上传
   */
  function handleOk() {
    if (!unref(fileName)) {
      $message.warn('请输入新版本文件名');
      return;
    }
    let name = copyFileName.value?.substring(copyFileName.value.lastIndexOf('.'));
    name = fileName.value + name;
    let params = {
      fileId: unref(fileId),
      fileSize: unref(fileSize),
      //update-begin---author:wangshuai---date:2024-07-02---for:【TV360X-1582】上传新版本，名称字段没有作用---
      fileName: name,
      //update-end---author:wangshuai---date:2024-07-02---for:【TV360X-1582】上传新版本，名称字段没有作用---
      fileUrl: unref(fileUrl),
      description: unref(description),
      type: 'newFile',
    };
    editSysFile(params).then((res) => {
      if (res.success) {
        emit('ok');
        handleCancel();
      }
    });
  }

  /**
   * 关闭弹窗
   */
  function handleCancel() {
    loading.value = false;
    visible.value = false;
  }

  /**
   * 获取图片路径
   * @param url
   */
  function getImageSrc(url) {
    return getFileAccessHttpUrl(url);
  }

  defineExpose({
    upload,
  });
</script>

<style lang="less" scoped>
  .file-form {
    .file-item {
      margin-bottom: 24px;
      padding-left: 100px;
      position: relative;
    }

    .file-item-label {
      color: #9e9e9e;
      font-size: 14px;
      height: 36px;
      left: 0;
      line-height: 36px;
      position: absolute;
      text-align: right;
      width: 80px;
    }
  }

  .new-image {
    max-height: 100px;
    max-width: 60%;
    margin: 16px auto;
  }

  .new-version {
    display: table;
    height: 150px;
    width: 100%;
  }

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

  .file-text {
    background: hsla(0, 0%, 100%, 0.4);
    border-radius: 3px;
    bottom: 3px;
    color: #333;
    display: block;
    line-height: 1;
    padding: 3px 2px;
    position: absolute;
    right: 3px;
    text-indent: 0;
  }
</style>
<style>
  .modal .ant-modal-header {
    background-color: #f5f5f5 !important;
  }
</style>
