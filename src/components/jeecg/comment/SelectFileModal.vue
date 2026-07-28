<template>
    <BasicModal @register="registerModal" width="500px" @ok="onOk" :draggable="false">
        
        <template #title>
            <div style="display: flex;flex-direction: column;">
                <div>
                    选择文件
                </div>
                <div class="file-dir-list">
                    <span @click="()=>onChangeDir('')">
                        全部文件
                    </span>
                    
                    <template v-for="dir in dirList">
                         <span @click="()=>onChangeDir(dir)" style="margin-left: 2px"> /{{ dir.title }} </span>
                    </template>
                   
                </div>
            </div>
            
        </template>
        <div class="file-list" :style="{height: maxHeight+'px'}">
            <a-menu v-if="myFileList && myFileList.length>0" multiple @select="onSelectFile" @deselect="handleDeselect" v-model:selectedKeys="selectedKeys">
                <a-menu-item v-for="item in myFileList" :key="item.id">
                    <div style="display: flex;flex-direction: row;align-items: center">
                        <Icon v-if="item.type == 'folder'" icon="ant-design:folder-open-outlined" style="font-size: 32px;color: rgb(253, 202, 7)" />
                        <div v-else-if="item.type == 'image'" class="content-icon" :style="{ background: 'url(' + getImageTypeIcon() + ')  no-repeat' }"></div>
                        <div v-else class="content-icon" :style="{ background: 'url(' + getBackground(item) + ')  no-repeat' }"></div>
                        <div style="margin-left: 10px">
                            {{ item.name }}
                        </div>
                    </div>
                </a-menu-item>
            </a-menu>
            <a-empty v-else description="没有文件"/>
        </div>
    </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref, watch, reactive, toRaw } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import {defHttp} from "/@/utils/http/axios";
  import {useUserStore} from "/@/store/modules/user";
  import {useFileList} from "/@/components/jeecg/comment/useComment";
  import { getCurrentUserTenant, getIzRootFolderList, getAuth, list } from '/@/views/super/eoa/file/FileList.api'
  import { useMessage } from '/@/hooks/web/useMessage';

  export default defineComponent({
    name: 'SelectFileModal',
    inheritAttrs: false,
    components: { BasicModal },
    emits: ['selected','register'],
    setup(_p, { emit }) {
      const selectedKeys = ref<any[]>([]);
      const attrs = useAttrs();
      const { getBackground, isImage, getImageAsBackground, viewImage, getImageTypeIcon } = useFileList();
      const { userInfo } = useUserStore();
      const myFileList = ref<any[]>([]);
      const selectFolderId = ref('');
      let baseFileId = '';
      let isLoadDone = true;
      const { createMessage } = useMessage();

      // const selectedFile = reactive({
      //   url: '',
      //   id: '',
      //   name: '',
      //   type: ''
      // });

      const selectedFile: any = reactive([]);
      
      // 加载文件
      async function loadFile(arg?) {
        const url = '/eoa/files/getFileList'
        let pid = selectFolderId.value;
        if(arg){
          pid = arg;
        }
        if(!pid){
          pid = baseFileId
        }
        let params = {
          userId: userInfo.id,
          delFlag: 0,
          searchType: 'list',
          parentId: pid
        }
        const data = await defHttp.get({ url, params }, { isTransformResponse: false });
        console.log('da', data);
        let arr:any[] = []
        if(!data.success){
          console.error(data.message)
        }else{
          let records = data.result.records;
          for(let item of records){
            arr.push({
              id: item.id,
              name: item.fileName,
              url: item.url,
              type: item.fileType,
            })
          }
        }
        myFileList.value = arr;
      }
      
      async function openLoadData() {
        let params = {
          fileName: '我的文件',
          fileType: 'folder',
          izFolder: '1',
          izRootFolder: '1',
          parentId: '',
          storeType: 'manage',
          downCount: 0,
          readCount: 0,
          createBy: userInfo.username,
          delFlag: '0',
        };
        const url = '/eoa/files/generateMyFile'
        const data = await defHttp.put({ url, params }, { joinParamsToUrl: true, isTransformResponse: false });
        baseFileId = data.result.id;
        // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
        await loadFile(baseFileId);
        // update-end--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
      }
      
      function initRootFile() {
        myFileList.value = [{
          id: 'myfile',
          name: '我的文件',
          type: 'folder'
        }, {
          id: 'sharefile',
          name: '共享文件',
          type: 'folder'
        }]
      }
      
      const [registerModal, { closeModal }] = useModalInner(()=>{
        initRootFile();
        // update-begin--author:liaozhiyang---date:20240527---for【TV360X-107】重置选中面包屑
        // 重置
        dirList.value = [];
        // update-end--author:liaozhiyang---date:20240527---for【TV360X-107】重置选中面包屑
        isLoadDone = true;
        selectedFile.value = [];
      });

      function onOk() {
        // update-begin--author:liaozhiyang---date:20240603---for：【TV360X-935】从知识库选择文件判断下是否没选
        if (selectedFile.value.length == 0) {
          createMessage.warning('还没有选择文件~');
          return;
        }
        // update-end--author:liaozhiyang---date:20240603---for：【TV360X-935】从知识库选择文件判断下是否没选
        emit('selected', [...selectedFile.value]);
        closeModal();
      }

      const dirList = ref<any[]>([]);
      dirList.value = [];
      
     
      function onSelectFile(event) {
        console.log('onSelectFile', event.key)
        // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
        if (isLoadDone) {
          isLoadDone = false;
        } else {
          return;
        }
        // update-end--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
        let arr = myFileList.value.filter(item=>item.id == event.key)
        let item = arr[0];
        
        let dirs = dirList.value;
        if(item.type === 'folder'){
          dirs.push({
            title: item.name,
            level: dirs.length,
            id: item.id,
            rootType: item.rootType
          });
          dirList.value = dirs;
          selectFolderId.value = item.id;
          selectedKeys.value = []
          selectedFile.value = []
        }else{
          // -update-begin--author:liaozhiyang---date:20240614---for：【TV360X-938】知识库文件选择支持多选
          isLoadDone = true;
          selectedFile.value.push({ ...item });
          // -update-end--author:liaozhiyang---date:20240614---for：【TV360X-938】知识库文件选择支持多选
        }
      }
      // -update-begin--author:liaozhiyang---date:20240614---for：【TV360X-938】知识库文件选择支持多选
      const handleDeselect = (event) => {
        if (selectedFile.value.length) {
          const findIndex = selectedFile.value.findIndex((item) => item.id === event.key);
          if (findIndex != -1) {
            selectedFile.value.splice(findIndex, 1);
          }
        }
      };
      // -update-end--author:liaozhiyang---date:20240614---for：【TV360X-938】知识库文件选择支持多选
      
      function onChangeDir(dir) {
        let dirs = dirList.value;
        if(dir && dir.id){
          selectFolderId.value = dir.id;
          let level = dir.level;
          dirs.splice(level + 1, dirs.length - level - 1)
        }else{
          selectFolderId.value = '';
          dirs = [];
          initRootFile();
        }
        dirList.value = dirs;
        selectedKeys.value = []
      }
      
      const maxHeight = ref(0);
      maxHeight.value = window.innerHeight - 300;

      watch(selectFolderId, ()=>{
        if(!selectFolderId.value){
          // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
          isLoadDone = true;
          // update-end--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
          return;
        }
        let flag = true;
        if(selectFolderId.value == 'sharefile'){
          flag = false;
          loadShareFile().finally(() => {
            // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
            isLoadDone = true;
            // update-end--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
          });
        }else if(selectFolderId.value == 'myfile'){
          flag = false;
          openLoadData().finally(() => {
            // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
            isLoadDone = true;
            // update-end--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
          });
        }else{
          let arr = dirList.value.filter(item=>item.id == selectFolderId.value)
          if(arr.length>0){
            if(arr[0].rootType == 'share'){
              flag = false;
              loadShareFile2(selectFolderId.value).finally(() => {
                // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
                isLoadDone = true;
                // update-end--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
              });
            }else if(arr[0].rootType == 'share2'){
              flag = false;
              loadShareFile3(selectFolderId.value).finally(() => {
                // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
                isLoadDone = true;
                // update-end--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
              });
            }
          }
        }
        if(flag===true){
          loadFile().finally(() => {
            // update-begin--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
            isLoadDone = true;
            // update-end--author:liaozhiyang---date:20240529---for：【TV360X-324】网速慢时点击目录一直累加
          });
        }
      });
      
      
      // 加载文件
      async function loadShareFile3(id){
        const data = await getAuth({ fileId: id, userId: userInfo.id })
        console.log('getAuth', data)
        let arr:any[] = [];
        if (data.success) {
          let parmas = {
            parentId: id,
            delFlag: 0,
            pageNo: 1,
            pageSize: 999,
            searchType: 'list',
            userId: userInfo.id
          }
          const data2 = await list(parmas);
          if(data2.success){
            if(data2.result && data2.result.records){
              for(let item of data2.result.records){
                arr.push({
                  id: item.id,
                  name: item.fileName,
                  url: item.url,
                  type: item.fileType,
                })
              }
            }
          }
          console.log('list', data2)
        }
        myFileList.value = [...arr]
      }

      // 加载目录
      async function loadShareFile2(id){
        let params = { tenantId: id, userId: userInfo.id };
        const data = await getIzRootFolderList(params)
        console.log('loadShareFile2', data)
        let arr:any[] = [];
        if(data.success){
          if(data.result){
            for(let item of data.result){
              arr.push({
                id: item.fileId,
                name: item.fileName,
                type: 'folder',
                rootType: 'share2'
              })
            }
          }
        }
        myFileList.value = [...arr]
      }

      // 加载租户
      async function loadShareFile() {
        const data = await getCurrentUserTenant();
        let arr:any[] = []
        if(data.success){
          if(data.result && data.result.list){
           for(let item of data.result.list){
             arr.push({
               id: item.id,
               name: item.name,
               type: 'folder',
               rootType: 'share'
             })
           }
          }
        }
        arr.push({
          id: '个人',
          name: '个人',
          type: 'folder',
          rootType: 'share'
        })
        myFileList.value = [...arr]
        console.log(data)
      }
      
      return {
        maxHeight,
        onSelectFile,
        dirList,
        attrs,
        registerModal,
        onOk,
        loadFile,
        getImageAsBackground,
        getBackground, 
        isImage,
        myFileList,
        getImageTypeIcon,
        onChangeDir,
        selectedKeys,
        handleDeselect,
      }
    },
  });
</script>
<style lang="less" scoped>
    .file-dir-list {
        display: flex;font-weight: normal;
        margin-top: 15px;font-size: 14px;cursor: pointer;
        
        span{
            display: inline-block;
            
            &:hover{
                color: @primary-color;
            }
        }
    }

    .file-list {
        overflow-y: auto;
        
        .ant-menu{
            border-right: none;

            .ant-menu-item{
                margin-bottom: 0;
                &:hover{
                    background-color: #e6f7ff;
                }
                
                .content-icon{
                    background-position: 50%;
                    background-size: contain !important;
                    height: 30px;
                    width: 30px;
                    display: inline-block;
                    overflow: hidden;
                    text-align: left;
                    text-indent: -9999px;
                    margin-left: 2px;
                }
            }
        }
    }
</style>
