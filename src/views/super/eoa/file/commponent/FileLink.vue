<template>
  <a-modal v-model:open="linkVisible" wrapClassName="modal" :ok-text="okText" @ok="handleOk" @cancel="handleCancel">
    <template #title>
      <div class="new-version">
        <span style="font-size: 17px; font-weight: normal">{{ title }}</span>
        <img  class="file-icon" :src=LinkImg>
      </div>
    </template>
    <div class="file-form" style="margin-top: 20px">
      <div class="file-item">
        <div class="file-item-label">文件名</div>
        <div class="file-item-content">
          <a-input v-model:value="linkData.fileName" style="width: 90%" />
        </div>
      </div>
      <div class="file-item">
        <div class="file-item-label">添加说明</div>
        <div class="file-item-content">
          <a-input v-model:value="linkData.url" placeholder="http://" style="width: 90%" />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" name="file-link" setup>
  import { ref, unref, defineEmits } from 'vue';
  import { createAFolder, edit } from '/@/views/super/eoa/file/FileList.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import LinkImg from '/@/assets/images/link.png';

  const linkVisible = ref<boolean>(false);
  const linkData = ref<any>({});
  const $message = useMessage();
  const parentId = ref<string>('');
  const emit = defineEmits(['ok']);
  const isUpdate = ref<boolean>(false);
  const okText = ref<string>('创建');
  const title = ref<string>('添加链接');

  /**
   * 新增
   */
  function addLink(value) {
    parentId.value = value;
    okText.value = '创建';
    title.value = '添加链接';
    linkData.value = {}
    isUpdate.value = false;
    linkVisible.value = true;
  }

  /**
   * 编辑
   */
  function editLink(record) {
    linkData.value = record;
    okText.value = '保存';
    title.value = '编辑链接';
    linkVisible.value = true;
    isUpdate.value = true;
  }

  /**
   * 创建链接文件
   */
  function handleOk() {
    if (!unref(linkData).fileName) {
      $message.createMessage.warning('文件名名称不能为空');
      return;
    }
    if (!unref(linkData).url) {
      $message.createMessage.warning('链接url不能为空');
      return;
    }
    let fileName = linkData.value.fileName;

    if (unref(linkData).fileName.lastIndexOf('.url') == -1) {
      fileName = fileName + '.url';
    }

    if (!unref(isUpdate)) {
      let params = {
        fileName: fileName,
        fileType: 'other',
        izFolder: '0',
        storeType: 'manage',
        parentId: unref(parentId),
        delFlag: '0',
        url: unref(linkData).url,
        enableDown: '1',
        enableUpdat: '1',
      };
      //新建链接文件
      createAFolder(params).then((res) => {
        if (res.success) {
          emit('ok');
          handleCancel();
        }
      });
    } else {
      //更新链接文件
      edit({ id: unref(linkData).id, fileName: fileName, url: unref(linkData).url }).then((res) => {
        if (res.success) {
          emit('ok');
          handleCancel();
        }
      });
    }
  }

  /**
   * 关闭弹窗
   */
  function handleCancel() {
    linkVisible.value = false;
  }
  defineExpose({
    addLink,
    editLink,
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
