<template>
  <a-modal :body-style="{'min-height': '350px'}" :title="title" :width="width" :open="visible" @cancel="handleCancel" cancelText="关闭" :footer="null">
    <Loading :loading="loading" tip="上传中，请稍后" />
    <div style="width: 600px; margin: 10px auto; height: 160px">
      <a-upload-dragger
        name="file"
        :multiple="true"
        :action="uploadUrl"
        :fileList="fileImageList"
        @change="handleUploadChange"
        :showUploadList="false"
        :headers="headers"
        :data="getParams"
        :beforeUpload="beforeUpload"
        class="upload-dragger"
      >
        <p class="ant-upload-drag-icon">
          <Icon icon="ant-design:inbox-outlined" class="upload-icon"></Icon>
        </p>
        <p class="ant-upload-text">拖拽文件到这里上传</p>
      </a-upload-dragger>
    </div>
    <div style="text-align: center; margin-top: 30px">
      <a-upload
        :action="uploadUrl"
        :multiple="true"
        :showUploadList="false"
        :fileList="fileImageList"
        @change="handleUploadChange"
        :headers="headers"
        :data="getParams"
        :beforeUpload="beforeUpload"
      >
        <a-button>
          <Icon icon="ant-design:upload-outlined"></Icon>
          上传文件
        </a-button>
      </a-upload>
      <a-upload
        :action="uploadUrl"
        :showUploadList="false"
        :fileList="fileImageList"
        @change="handleUploadChange"
        :headers="headers"
        directory
        :data="getParams"
        :beforeUpload="beforeUpload"
      >
        <a-button style="margin-left: 10px">
          <Icon icon="ant-design:inbox-outlined"></Icon>
          上传文件夹
        </a-button>
      </a-upload>
    </div>
    <div style="text-align: center; padding: 10px 0">
      文件上传到: {{ firstTitle }}<span v-for="item in folderName">/{{ item.title }}</span
      ><span style="margin-left: 10px; color: #1e88e5; cursor: pointer" @click="handleUpdateClick">更改</span>
    </div>
    <div v-if="fileImageList.length > 0">
      <div class="file-list">
        <div class="file-item">
          <div class="file-name">文件</div>
          <div class="file-size">大小</div>
          <div class="file-status">状态</div>
          <div class="file-location">位置</div>
        </div>
      </div>
      <div class="file-content">
        <ul v-for="item in fileList">
          <li class="file-item">
            <div class="file-name">{{ item.fileName }}</div>
            <div class="file-size">{{ getFileSize(item.fileSize) }}</div>
            <div class="file-status" v-if="item.status === 'done'"> 成功</div>
            <div class="file-status" v-else>失败</div>
            <div class="file-location"
              >{{item.firstTitle}}<span v-for="folder in item.folderName">/{{ folder.title }}</span></div
            >
          </li>
        </ul>
      </div>
    </div>
  </a-modal>
  <select-folder ref="selectFolder" @ok="folderHandleOk"></select-folder>
</template>

<script lang="ts" setup name="upload-file">
  import {ref, unref, reactive, nextTick} from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import JUpload from '/@/components/Form/src/jeecg/components/JUpload/JUpload.vue';
  import { uploadUrl } from '../FileList.api';
  import SelectFolder from './SelectFolder.vue';
  import { cloneDeep } from "lodash-es";
  import { calculateFileSize, getHeaders } from "/@/utils/common/compUtils";
  import Loading from "@/components/Loading/src/Loading.vue";

  const title = ref<string>('');
  const width = ref<number>(800);
  const visible = ref<boolean>(false);
  const disableSubmit = ref<boolean>(false);
  const realForm = ref();
  const emit = defineEmits(['register', 'ok']);
  const fileImageList = ref<any[]>([]);
  const fileList = ref<any[]>([]);
  const { createMessage } = useMessage();
  const fileUrl = ref<any>([]);
  const headers = getHeaders();
  const pid = ref<any>('');
  const folderName = ref<any>('');
  const firstTitle = ref<any>('');
  const firstPid = ref<any>('');
  const getParams = ref<any>({ parentId: pid, bizPath: 'manage' });
  const selectFolder = ref();
  const uploadingFile = ref<number>(0);
  const loading = ref<boolean>(false);

  function add(data) {
    title.value = '上传至';
    pid.value = data.pid;
    firstTitle.value = data.firstTitle;
    firstPid.value = data.firstPid;
    folderName.value = data.fileName;
    visible.value = true;
  }

  function handleOk() {
    realForm.value.submitForm();
  }

  function submitCallback() {
    handleCancel();
  }

  function handleCancel() {
    //关闭弹窗之后如果上传的图片大于0，列表就需要刷新
    emit('ok', unref(fileImageList).length > 0);
    visible.value = false;
    fileImageList.value = [];
    fileList.value = [];
    loading.value = false;
  }

  /**
   * 文件上传
   */
  function handleUploadChange(info) {
    loading.value = true;
    const status = info.file.status;
    //上传完成
    if (status != 'uploading') {
      if (status === 'done' || status === 'error') {
        if (info.file.response?.code == 500 || status === 'error') {
          let result = {
            percent: 100,
            firstTitle: cloneDeep(unref(firstTitle)),
            folderName: cloneDeep(unref(folderName)),
            status: 'error',
            fileName: info.file.name,
            fileSize: info.file.size
          }
          fileList.value.push(result);
          uploadingFile.value = uploadingFile.value -1;
          return;
        }
        let result = info.file.response.result;
        result.percent = 100;
        result.firstTitle = cloneDeep(unref(firstTitle))
        result.folderName = cloneDeep(unref(folderName));
        result.status = status;
        fileList.value.push(result);
        //判断上传图片是否已经全部上传，上传完毕刷新接口
        nextTick(()=>{
          uploadingFile.value = uploadingFile.value -1;
          if(unref(uploadingFile) == 0){
            emit("ok",unref(fileImageList).length > 0)
            loading.value = false;
          }
        })
      }
    }
  }

  /**
   * 获取文件大小
   * @param size
   */
  function getFileSize(size) {
    return calculateFileSize(size);
  }

  function beforeUpload(file, fileList) {
    fileImageList.value = [...unref(fileList), file];
    uploadingFile.value = uploadingFile.value + 1;
  }

  /**
   * 修改文件夹位置
   */
  function handleUpdateClick() {
    selectFolder.value.add({
      pid: pid.value,
      fileName: folderName.value,
      firstPid: firstPid.value,
      firstTitle: firstTitle.value,
    });
  }

  /**
   * 选择文件回调事件
   * @param val
   */
  function folderHandleOk(val) {
    pid.value = val.pid;
    folderName.value = val.folderName;
    firstPid.value = val.firstPid;
    firstTitle.value = val.firstTitle;
  }

  defineExpose({
    add,
  });
</script>

<style lang="less" scoped>
  .file-list {
    border-top: 1px solid #ddd;
    font-size: 14px;
    margin-top: 12px;
    box-sizing: border-box;
    overflow: auto;
    padding: 0 21px;
    width: 100%;
  }

  .file-item {
    border-bottom: 1px solid #ddd;
    display: flex;
    height: 45px;
    line-height: 45px;
  }

  .file-item > div {
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    white-space: nowrap;
  }

  .file-name {
    flex: 1;
    margin-right: 15px;
    min-width: 40px;
  }

  .file-size {
    margin-right: 15px;
    width: 113px;
  }

  .file-status {
    margin-right: 15px;
    width: 100px;
  }

  .file-location {
    margin-right: 15px;
    width: 155px;
  }

  .file-content {
    box-sizing: border-box;
    overflow: auto;
    padding: 0 21px;
    width: 100%;
  }

  .ant-upload-drag-icon span {
    font-size: 80px !important;
  }
</style>
