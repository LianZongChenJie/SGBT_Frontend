<template>
  <a-modal
    :width="width"
    :open="visible"
    @cancel="handleCancel"
    cancelText="关闭"
    @ok="submitCallback"
    :bodyStyle="{ height: '400px' }"
    wrapClassName="dialog"
  >
    <template #title>
      <span style="font-size: 17px"> {{ title }}</span>
      <div style="margin-top: 20px; width: 100%; display: flex" class="flex-row">
        <div class="title-header" :style="headerTitle">
          <span class="file-header" :style="{ color: showColor ? '#1e88e5' : '' }" @click="fileHandleClick('all')">全部文件</span>
          <span class="file-header" v-if="firstTitle" style="color: #1e88e5" @click="fileHandleClick('firstPid')">/{{ firstTitle }}</span>
          <span class="file-header" style="color: #1e88e5" v-for="item in folderName" @click="fileHandleClick(item.key)">/{{ item.title }}</span>
        </div>
        <div class="operation" v-if="iconShow">
          <span class="folder-search">
            <a-input
              ref="searchRef"
              v-model:value="searchText"
              class="search-folder animated"
              placeholder="请输入文件名称并回车"
              :style="searchIcon"
              @blur="searchBlur"
              @pressEnter="searchPressEnter"
            />
            <Icon icon="ant-design:search-outlined" class="icon-search-folder" @click="searchHandleClick" />
          </span>
          <span class="icon-create-folder">
            <Icon icon="ant-design:folder-add-outlined" class="icon-search-folder" @click="createFolderHandleClick" />
          </span>
        </div>
      </div>
    </template>
    <a-spin :spinning="spinning">
      <div class="folder-content">
        <div class="folder-node">
          <ul class="text-list">
            <li
              v-if="folderData.length > 0"
              class="text-item"
              :class="item.id === activeIndex ? 'text-item-back' : ''"
              v-for="item in folderData"
              @click="handleFolderClick(item)"
              @dblclick="fileNameClick(item)"
            >
              <Icon class="icon-type" icon="ant-design:folder-outlined" style="color: rgb(253, 202, 7)" />
              <span v-if="item.showInput">
                <a-input
                  placeholder="请输入文件名称"
                  ref="addFolderRef"
                  class="ellipsis add-folder-input"
                  v-model:value="item.fileName"
                  @pressEnter="fileNameBlur(item,'enter')"
                  @blur="fileNameBlur(item,'blur')"
                />
              </span>
              <span class="text-name ellipsis" @click="fileNameClick(item)">{{ item.fileName }}</span>
            </li>
            <li v-else style="color: #999; font-size: 14px; text-align: center; margin-top: 20px"> 没有子文件夹 </li>
          </ul>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script lang="ts" setup name="select-folder">
  import { ref, watch, unref, nextTick } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveFile, searchFolder } from '../FileList.api';
  import { cloneDeep } from "lodash-es";

  const title = ref<string>('');
  const width = ref<number>(600);
  const visible = ref<boolean>(false);
  const emit = defineEmits(['register', 'ok']);
  const { createMessage } = useMessage();
  const searchText = ref<string>('');
  const folderData = ref<any>([]);
  const spinning = ref<boolean>(false);
  const pid = ref<any>('');
  const firstPid = ref<any>('');
  const firstTitle = ref<any>('我的文档');
  const folderName = ref<any>('');
  const activeIndex = ref<string>('');
  const showColor = ref<boolean>(true);
  const $message = useMessage();
  const searchIcon = ref({ width: '0px' });
  const headerTitle = ref({ 'min-width': '0px', 'margin-left': '0px' });
  const searchRef = ref();
  const addFolderRef = ref();
  const fileName = ref<string>('');
  const iconShow = ref<boolean>(false);
  const folderType = ref<string>('');
  const firstFolderTitle = ref<string>('');
  const fileFolder = ref<any>([]);
  const copyId = ref<string>('');

  /**
   * 获取文件夹
   */
  function getFolder() {
    spinning.value = true;
    if (!unref(pid)) {
      pid.value = firstPid.value;
    }
    if (unref(pid) == 'all') {
      pid.value = '';
    }
    let params = { parentId: pid.value, searchText: searchText.value };
    searchFolder(params)
      .then((res) => {
        if (res.success) {
          //当前目录folderName循环
          if (res.result && res.result.length > 0) {
            folderData.value = res.result.filter((item) => unref(copyId).indexOf(item.id) == -1);
          } else {
            folderData.value = [];
          }
        }
      })
      .finally(() => {
        spinning.value = false;
      });
  }

  function add(data) {
    title.value = '上传到';
    setFolderData(data);
    folderType.value = 'add';
  }

  function setFolderData(data) {
    pid.value = data.pid;
    firstPid.value = data.firstPid;
    firstTitle.value = data.firstTitle;
    firstFolderTitle.value = data.firstTitle;
    folderName.value = data.fileName;
    showColor.value = true;
    getFolder();
    visible.value = true;
    iconShow.value = true;
  }

  /**
   * 返回文件信息
   */
  function submitCallback() {
    if (!unref(firstFolderTitle)) {
      $message.createMessage.warning('请选择一个文件夹');
      return;
    }
    emit('ok', {
      pid: pid.value,
      //选中文件夹点击确定之后，默认就是folderName文件夹名称集合，不用在做判断了
      folderName: unref(folderName),
      firstTitle: unref(firstTitle.value) ? unref(firstTitle.value) : unref(firstFolderTitle),
      firstPid: firstPid.value,
      folderType: folderType.value,
    });
    handleCancel();
  }

  /**
   * 取消
   */
  function handleCancel() {
    visible.value = false;
    activeIndex.value = '';
    firstFolderTitle.value = '';
    copyId.value = '';
  }

  /**
   * 文件夹点击事件
   * @param item
   */
  function handleFolderClick(item) {
    if(item.id == -1){
      return;
    }
    activeIndex.value = item.id;
    //update-begin---author:wangshuai---date:2023-12-05---for:【QQYUN-7324】移动文件时 新建文件夹报错---
    if(item.id && item.id != -1){
      pid.value = item.id;
    }
    //update-end---author:wangshuai---date:2023-12-05---for:【QQYUN-7324】移动文件时 新建文件夹报错---
    if (!unref(firstTitle)) {
      firstPid.value = item.id;
      firstFolderTitle.value = item.fileName;
    } else {
      let lodeFilter = fileFolder.value.filter((item) => item.key != item.id);
      if (!lodeFilter || lodeFilter.length == 0) {
        fileFolder.value.push({ title: item.fileName, key: item.id });
      }
    }
  }

  /**
   * 文件名称点击事件
   * @param item
   */
  function fileNameClick(item) {
    if(item.id === -1){
      return;
    }
    pid.value = item.id;
    activeIndex.value = '';
    if (!unref(firstTitle)) {
      firstTitle.value = item.fileName;
      firstFolderTitle.value = item.fileName;
      firstPid.value = item.id;
    } else {
      folderName.value.push({ title: item.fileName, key: item.id });
    }
    showColor.value = true;
    iconShow.value = true;
    getFolder();
  }

  /**
   * 头部目录点击事件
   * @param val
   */
  function fileHandleClick(val) {
    if (val == 'all') {
      folderName.value = [];
      fileFolder.value = [];
      firstTitle.value = '';
      showColor.value = false;
      pid.value = 'all';
      getFolder();
      iconShow.value = false;
      firstFolderTitle.value = '';
    } else {
      iconShow.value = true;
      const data = ref<any>([]);
      if (val === 'firstPid') {
        pid.value = firstPid.value;
        folderName.value = [];
        fileFolder.value = [];
      } else {
        pid.value = val;
      }
      //重新设置标题
      for (let i = 0; i < folderName.value.length; i++) {
        //当前id等于数组id，后面的就不用push，直接返回值即可
        if (val == folderName.value[i].key) {
          //update-begin---author:wangshuai---date:2024-07-02---for:【TV360X-1566】移动到的面包屑有小问题---
          data.value.push({ key: folderName.value[i].key, title: folderName.value[i].title });
          //update-end---author:wangshuai---date:2024-07-02---for:【TV360X-1566】移动到的面包屑有小问题---
          break;
        }
        data.value.push({ key: folderName.value[i].key, title: folderName.value[i].title });
      }
      showColor.value = true;
      //需要深拷贝，不然fileFolder发生改变的时候folderName也会发生改变---
      folderName.value = cloneDeep(data.value);
      fileFolder.value = cloneDeep(data.value);
      getFolder();
    }
  }

  /**
   * 查询按钮点击事件
   */
  function searchHandleClick() {
    searchIcon.value['width'] = '150px';
    headerTitle.value['margin-left'] = '-60px';
    searchRef.value.focus();
  }

  /**
   * input失去焦点触发事件
   */
  function searchBlur() {
    searchText.value = '';
    searchIcon.value = { width: '0px' };
    headerTitle.value = { 'min-width': '0px', 'margin-left': '0px' };
  }

  /**
   * 回车搜索
   */
  function searchPressEnter() {
    getFolder();
  }

  /**
   * 新增文件夹
   */
  function createFolderHandleClick() {
    nextTick(() => {
      if (folderData.value.length > 0) {
        if (folderData.value[0].id != -1) {
          folderData.value.unshift({ id: -1, fileName: '', showInput: true });
        }
      } else {
        folderData.value.unshift({ id: -1, fileName: '', showInput: true });
      }
      setTimeout(() => {
        addFolderRef.value && addFolderRef.value?.focus && addFolderRef.value.focus();
      }, 100);
    });
  }
  //update-begin---author:wangshuai---date:2024-07-02---for:【TV360X-1744】知识库 选择文件夹创建文件的时候 回车和blur时间冲突，导致创建了两条数据---
  let touchNum = 0;
  /**
   * 创建文件夹input失去焦点触发
   */
  function fileNameBlur(item,type) {
    if(touchNum > 0){
      touchNum = 0;
      return;
    }
    if(type == 'enter'){
      touchNum++;
    }
    //update-end---author:wangshuai---date:2024-07-02---for:【TV360X-1744】知识库 选择文件夹创建文件的时候 回车和blur时间冲突，导致创建了两条数据---
    if (item.fileName && item.id == -1) {
      let params = {
        fileName: item.fileName,
        fileType: 'folder',
        izFolder: '1',
        storeType: 'manage',
        delFlag: '0',
      };
      if (unref(pid)) {
        params['parentId'] = pid.value;
      } else {
        params['parentId'] = firstPid.value;
      }
      //新建文件夹
      saveFile(params).then((res) => {
        if (res.success) {
          item = res.result;
          item.showInput = false;
          folderData.value[0] = item;
        }
      });
    } else {
      if (unref(folderData).length > 0 && unref(folderData)[0].id == -1) {
        folderData.value.shift();
      }
    }
  }

  /**
   * 复制到
   * @param data
   */
  function copyFile(data) {
    let fileData = cloneDeep(data);
    setFolderData(fileData);
    title.value = '复制到';
    folderType.value = 'copy';
  }

  /**
   * 移动到
   * @param data
   */
  function moveFile(data) {
    let fileData = cloneDeep(data);
    setFolderData(fileData);
    title.value = '移动到';
    folderType.value = 'move';
    copyId.value = fileData.copyId;
  }

  defineExpose({
    add,
    copyFile,
    moveFile,
  });
</script>

<style lang="less" scoped>
  .folder-content {
    box-sizing: border-box;
    font-size: 13px;
  }

  .title-header {
    transition: all 1s ease;
    display: flex;
    font-weight: normal;
    width: 80%;
    height: 30px;
  }

  .folder-name {
    font-size: 14px !important;
    height: 30px;
    overflow-x: hidden;
  }

  .folder-search {
    box-sizing: border-box;
    display: flex;
    height: 30px;
    line-height: 30px;
    margin-left: 12px;
    margin-right: 12px;
  }

  .folder-node {
    box-sizing: border-box;
    max-height: 380px;
    min-height: 300px;
    overflow: hidden;
    overflow-y: auto;
    padding: 4px 24px;
  }

  .text-list {
    position: relative;
    width: 100%;
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .text-item {
    box-sizing: border-box;
    cursor: pointer;
    height: 46px;
    line-height: 46px;
  }

  .text-item:hover {
    background: #f8f8f8;
  }

  .text-item-back {
    background: #bbdefb !important;
  }

  .icon-type {
    display: inline-block;
    font-size: 32px !important;
    height: 32px;
    margin-left: 10px;
    vertical-align: middle;
    width: 29px;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    white-space: nowrap;
  }

  .text-name {
    display: inline-block !important;
    font-size: 12px;
    margin-left: 15px;
    max-width: 230px;
    vertical-align: middle;
  }

  .text-name:hover {
    text-decoration: underline;
  }

  .file-header {
    font-size: 14px !important;
    height: 30px;
    cursor: pointer;
    line-height: 30px;
  }

  .file-header:hover {
    text-decoration: underline;
  }

  .add-folder-input {
    display: inline-block !important;
    font-size: 12px;
    margin-left: 15px;
    max-width: 230px;
    vertical-align: middle;
  }

  .add-folder-input:hover {
    text-decoration: none;
  }

  .operation {
    box-sizing: border-box;
    color: #7d7d7d;
    display: flex;
    font-size: 0;
  }

  .search-folder {
    border-width: 0;
    border-bottom: 1px solid #7d7d7d;
    font-size: 13px;
    padding: 2px 0;
    vertical-align: middle;
    width: 0;
  }

  .search-folder:focus {
    border: none;
    box-shadow: none;
    border-bottom: 1px solid #7d7d7d;
  }

  .animated {
    -webkit-transition: all 1s ease;
    transition: all 1s ease;
  }

  .icon-search-folder {
    background-color: #fff;
    cursor: pointer;
    display: inline-block !important;
    font-size: 20px !important;
    height: 22px;
    line-height: 22px;
    width: 24px;
    color: #7d7d7d;
    opacity: 0.8;
    vertical-align: middle;
  }

  .flex-row {
    display: flex !important;
    min-width: 0;
    font-size: 14px;
    height: 30px;
    margin: -4px 0 4px;
    overflow-x: hidden;
  }

  .icon-create-folder {
    cursor: pointer;
    font-size: 18px;
    color: #7d7d7d;
    opacity: 0.8;
    vertical-align: middle;
  }
</style>
<style>
  .dialog .ant-modal-close-x {
    line-height: 50px !important;
    height: 50px !important;
  }
</style>
