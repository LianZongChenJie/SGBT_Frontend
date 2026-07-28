<template>
  <BasicModal
    :height="300"
    title="数据导入 - 上传Excel（1/3）"
    @register="registerModal"
    :width="900"
    :canFullscreen="false"
    destroyOnClose
    closable
    okText="下一步"
    :maskClosable="false"
    @ok="next()"
  >
    <div>
      <div style="color: #757575; font-size: 14px; line-height: 20px; word-break: break-all; margin-bottom: 12px">
        支持10MB以内的xlsx文件,
        导入多选类型的控件，请确保Excel字段内各个选项用“,”隔开,如篮球,乒乓球,羽毛球；导入地区控件，省市县之间以“/”隔开，如：安徽省/合肥市/包河区，如填写的地区格式没有“/”，则会按照名称精准匹配；请先导出，参考导出的格式设置导入文件的内容
      </div>
      <a-upload-dragger
        v-model:fileList="fileList"
        name="file"
        :multiple="false"
        accept=".xls,.xlsx"
        :data="{ isup: 1 }"
        :max-count="1"
        :headers="uploadHeaders"
        :action="uploadAction"
        @change="handleChange"
        class="low-app-excel-import"
        :beforeUpload="beforeUpload"
        @drop="handleDrop"
      >
        <p class="ant-upload-drag-icon">
          <cloud-upload-outlined style="font-size: 100px" />
        </p>
        <p class="ant-upload-text"> 单击选择文件或拖动文件到此区域上传 </p>
      </a-upload-dragger>
    </div>
  </BasicModal>
</template>

<script lang="ts">
  import { CloudUploadOutlined } from '@ant-design/icons-vue';
  import { ref, defineComponent, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import {useMessage} from "/@/hooks/web/useMessage";

  export default defineComponent({
    name: 'ImportModal',
    components: {
      BasicModal,
      CloudUploadOutlined,
    },
    emits: ['register', 'success', 'next'],
    setup(_p, { emit }) {
      const { createMessage } = useMessage();
      const fileList = ref([]);
      const designFormCode = ref('');
      const uploading = ref(false);
      
      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        console.log('data', data);
        designFormCode.value = data.info.code;
        fileList.value = [];
        uploading.value = false;
      });

      const handleChange = (info: any) => {
        const status = info.file.status;
        if (status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          console.log(`${info.file.name} file uploaded successfully.`, info);
          uploadSuccess(info.file);
        } else if (status === 'error') {
          console.log(`${info.file.name} file upload failed.`);
        }
      };

      function uploadSuccess(file) {
        if (file.response && file.response.result) {
          emit('success', file.response.result, file.name);
          uploading.value = false;
        }else{
          createMessage.error("文件上传失败："+file.response.message)
          fileList.value = []
        }
      }

      function handleDrop() {
        console.log('handleDrop');
      }

      function next() {
        if(fileList.value.length<=0){
          createMessage.error('文件不存在')
          return;
        }
        if(uploading.value === true){
          createMessage.error('文件正在上传');
          return;
        }
        emit('next', designFormCode.value);
      }

      const glob = useGlobSetting();
      // importXls
      const uploadAction = computed(() => {
        const url = `${glob.uploadUrl}/desform/data/uploadExcel/${designFormCode.value}`;
        console.log('上传文件路径', url);
        return url;
      });

      const uploadHeaders = computed(() => {
        let headers = {};
        headers['X-Access-Token'] = getToken();
        return headers;
      });

      /**
       * 上传前事件
       */
      function beforeUpload(_file) {
        /*   let all = fileList.value;
        if(all.length>0){
          console.log('已经上传了');
          fileList.value = [all[0]]
          return false;
        }*/
        uploading.value = true;
        return true;
      }

      return {
        registerModal,
        closeModal,
        next,
        fileList,
        handleChange,
        handleDrop,
        uploadAction,
        uploadHeaders,
        beforeUpload,
      };
    },
  });
</script>

<style scoped lang="less">
  .low-app-excel-import {
    height: 230px;
  }
</style>
