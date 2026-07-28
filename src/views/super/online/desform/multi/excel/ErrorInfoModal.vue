<template>
  <BasicModal :footer="null" @register="registerModal" :width="640" :canFullscreen="false" destroyOnClose closable>
    <template #title>
      <div style="display: flex;align-items: center"> 
        <span>
          错误报告
        </span>
        <span style="margin-left: 15px">
          <a-button @click="downLoadFile" type="link">下载错误报告</a-button>
        </span>
      </div>
    </template>
    
    <div style="width: 100%; position: relative">
      <div v-html="errorString" style="width: 100%;border: 1px solid #eee;padding: 10px;" :style="{height: maxHeight+'px'}"></div>
    </div>
  </BasicModal>
</template>

<script lang="ts">
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { ref, defineComponent } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import {useGlobSetting} from "/@/hooks/setting";
  
  export default defineComponent({
    name: 'ErrorInfoModal',
    components: {
      BasicModal,
      SearchOutlined,
    },
    setup(_props) {
      const glob = useGlobSetting();
      const path = ref('');
      const errorString = ref('')
      
      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        console.log('data', data);
        let str = data.errorString;
        if(str){
          str = str.replace(new RegExp('\\[', 'g'), '<span style="font-weight: bold;margin: 0 2px;">').replace(new RegExp('\\]', 'g'), '</span>');
          str = str.replace(new RegExp('\r', 'g'), '<div style="margin: 3px 0"></div>')
          errorString.value = str
        }else{
          errorString.value = ''
        }
        path.value = data.path
      });
      
      function downLoadFile() {
        location.href = glob.uploadUrl+path.value
        console.log('downLoadFile')
      }
      
      const maxHeight = ref(0);
      maxHeight.value = window.innerHeight - 300

      return {
        closeModal,
        path,
        errorString,
        registerModal,
        downLoadFile,
        maxHeight
      };
    },
  });
</script>

<style scoped></style>
