<template>
  <div class="p-4">
    <div style="width: 260px">
      <left-file ref="leftFileRef" @click-file-type="clickFileType" @recycle-upload-list="recycleUploadList" @search-list="searchList"></left-file>
    </div>
    <div class="header">
      <div class="left" v-if="!showAllTitle">
        <span class="pointer title-hover" @click="handleTitleClick('all')">{{ title }}</span>
        <span v-for="item in titleData" v-if="!recoveryStation">
          <span> > &nbsp;&nbsp;&nbsp;</span>
          <span class="pointer title-hover" @click="handleTitleClick(item)">
            {{ item.title }}
          </span>
        </span>
        <span v-else>/回收站</span>
        <span v-if="keyword" class="global-search ellipsis"
        >&nbsp;&nbsp;中的搜索结果
          <a class="global-search" style="color: #1e88e5" @click="searchAll"
          >&nbsp;&nbsp;{{ !recoveryStation ? '搜索整个知识中心' : '全部已删除的文件和文件夹' }}</a
          >
        </span>
      </div>
      <div v-else class="left">
        <span>知识库&nbsp;&nbsp;中的搜索结果</span>
      </div>
      <div class="dropdown-position" v-if="!recoveryStation && authority !== 'readonly' && leftType !== 'used' && leftType !== 'star'">
        <a-dropdown :trigger="['click']">
          <a-button preIcon="ant-design:plus-outlined" @click.prevent class="add">添加</a-button>
          <template #overlay>
            <a-menu @click="handleCreateClick">
              <a-menu-item key="uploadLocal">
                <span class="upload-font-size">上传本地文件</span>
              </a-menu-item>
              <a-menu-item key="createLinkFile">
                <span class="upload-font-size">添加链接文件</span>
              </a-menu-item>
              <a-menu-item key="createFolder">
                <span class="upload-font-size">新建文件夹</span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
    <div style="margin-top: 10px">
      <right-file ref="rightFileRef" @setTitleData="handleTitleData" @update-input="updateInput" :leftType="leftType"></right-file>
    </div>
  </div>
  <upload-file ref="registerModal" @ok="uploadHandleOk" />
  <file-link ref="fileLinkModal" @ok="fileLinkHandleOk" />
</template>
<script lang="ts" name="system-menu" setup>
  import UploadFile from './commponent/UploadFile.vue';
  import FileLink from './commponent/FileLink.vue';
  import LeftFile from './commponent/LeftFile.vue';
  import RightFile from './commponent/RightFile.vue';
  import { getAuth, getPNameByPId } from './FileList.api';
  import { nextTick, onMounted, ref, unref } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter } from 'vue-router';

  const authority = ref<string>('');
  const userStore = useUserStore();
  const parentId = ref<string>();
  const firstPid = ref<string>('');
  const firstFileName = ref<string>('');
  const title = ref<string>('');
  const registerModal = ref();
  const rightFileRef = ref();
  const titleData = ref<any>([]);
  const type = ref<string>('');
  const recycleFileId = ref<string>('');
  const recoveryStation = ref<boolean>(false);
  const keyword = ref<string>('');
  const leftFileRef = ref();
  const fileLinkModal = ref();
  const showAllTitle = ref<boolean>(false);
  const leftType = ref<string>('');
  //获取route参数
  const router = useRouter();
  //是否为分享
  const isShare = ref<boolean>(false);

  /**
   * 创建文件夹及上传文件
   */
  function handleCreateClick(e) {
    //创建文件夹
    if (e.key === 'createFolder') {
      rightFileRef.value.addFolder(parentId.value);
    } else if (e.key === 'createLinkFile') {
      //创建链接文件
      fileLinkModal.value.addLink(unref(parentId));
    } else {
      //上传文件
      registerModal.value.add({ firstPid: firstPid.value, pid: parentId.value, fileName: titleData.value, firstTitle: title.value });
    }
  }

  /**
   * 获取标题
   * @param value
   */
  function handleTitleData(value) {
    //如果存在关键词，需要后台查询最上级的文件名称
    if (unref(keyword) || unref(isShare)) {
      getPNameByPId({ parentId: value.pid }).then((res) => {
        if (res.success && res.result.length > 0) {
          let titleFileData: any = [];
          //首标题赋值
          title.value = res.result[0].fileName;
          parentId.value = res.result[0].fileId;
          firstPid.value = res.result[0].fileId;
          firstFileName.value = res.result[0].fileName;
          //子标题赋值
          for (let i = 1; i < res.result.length; i++) {
            titleFileData.push({ title: res.result[i].fileName, key: res.result[i].fileId });
          }
          if (value.titleData) {
            titleFileData.push(value.titleData[0]);
          }
          titleData.value = titleFileData;
          //更新文件类别，点击颜色
          //如果不是分享那么在更新左侧点击颜色
          if (!unref(isShare)) {
            leftFileRef.value.updateFileType(unref(parentId));
          }
          isShare.value = false;
        }
      });
    } else {
      titleData.value = value.titleData;
      parentId.value = value.parentId;
    }
  }

  /**
   * title点击事件
   * @param val
   */
  function handleTitleClick(val) {
    leftFileRef.value.updateKeyWord();
    nextTick(() => {
      if (val == 'all') {
        leftFileRef.value.updatePlaceholder('在“' + unref(title) + '”中搜索');
        titleData.value = [];
        parentId.value = firstPid.value;
      } else {
        const data = ref<any>([]);
        parentId.value = val.key;
        //重新设置标题
        for (let i = 0; i < titleData.value.length; i++) {
          //当前id等于数组id，后面的就不用push，直接返回值即可
          if (val.key == titleData.value[i].key) {
            data.value.push({ key: titleData.value[i].key, title: titleData.value[i].title });
            break;
          }
          data.value.push({ key: titleData.value[i].key, title: titleData.value[i].title });
        }
        titleData.value = data.value;
        leftFileRef.value.updatePlaceholder('在“' + val.title + '”中搜索');
      }
      //搜索词清空
      keyword.value = '';
      //update-begin---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示------------
      //如果是不是回收站加载普通列表，否则加载回收站列表
      if (!unref(recoveryStation)) {
        rightFileRef.value.loadFileList({
          pid: parentId.value,
          firstPid: firstPid.value,
          fileName: titleData.value,
          firstTitle: title.value,
          type: val === 'all' ? type.value : '',
          authority: unref(authority),
        });
        recoveryStation.value = false;
      } else {
        rightFileRef.value.loadRecycleFileList({ fileId: unref(parentId) });
      }
    });
    //update-end---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示------------
  }

  /**
   * 点击类别回调事件
   * @param data
   */
  function clickFileType(data) {
    firstPid.value = data.firstId;
    firstFileName.value = data.fileName;
    title.value = data.fileName;
    parentId.value = data.parentId;
    titleData.value = [];
    //是否为回收站
    recoveryStation.value = false;
    //用于区分我的文件和个人公司，我的文件type为不空，其余为空
    type.value = data.type;
    //左侧类别星标文件/最近使用/我的文件
    leftType.value = data.leftType;
    keyword.value = '';
    showAllTitle.value = false;
    //获取权限
    getAuth({ fileId: data.firstId, userId: userStore.getUserInfo.id }).then((res) => {
      if (res.success) {
        authority.value = res.result;
        rightFileRef.value.loadFileList({
          pid: parentId.value,
          firstPid: firstPid.value,
          fileName: titleData.value,
          firstTitle: title.value,
          type: data.type,
          authority: res.result,
          isShare: unref(isShare),
        });
        leftFileRef.value.clearIds();
      }
    });
  }

  /**
   * 回收站加载列表
   */
  function recycleUploadList(val) {
    recycleFileId.value = val.fileId;
    title.value = val.recycleName;
    recoveryStation.value = true;
    rightFileRef.value.loadRecycleFileList({ fileId: recycleFileId.value });
  }

  /**
   * 回收站点击触发事件
   */
  function recoveryStationClick() {
    rightFileRef.value.loadRecycleFileList({ fileId: recycleFileId.value });
  }

  /**
   * 文件上传成功之后回调事件
   */
  function uploadHandleOk(value) {
    if (value) {
      rightFileRef.value.uploadFileList();
    }
  }

  /**
   * 新增/编辑链接文件
   */
  function fileLinkHandleOk() {
    rightFileRef.value.uploadFileList();
  }

  /**
   * 查询右侧的列表
   * @param value
   */
  function searchList(value) {
    keyword.value = value;
    rightFileRef.value.searchList(value, unref(parentId));
    if (!value) {
      showAllTitle.value = false;
    }
  }

  /**
   * 更新input标题
   * @param value
   */
  function updateInput(value) {
    leftFileRef.value.updatePlaceholder('在“' + value + '”中搜索');
    leftFileRef.value.updateKeyWord();
    showAllTitle.value = false;
    keyword.value = '';
  }

  /**
   * 搜索整个知识库
   */
  function searchAll() {
    if (unref(keyword)) {
      title.value = unref(firstFileName);
    }
    rightFileRef.value.searchAllList(unref(keyword));
    showAllTitle.value = true;
  }

  /**
   * 设置父id 和一级目录的id
   * @param pId
   * @param rootId
   * @param tenantId
   */
  function setIds(pId, rootId, tenantId) {
    if (pId && rootId) {
      parentId.value = pId;
      firstPid.value = rootId;
      isShare.value = true;
    }
    leftFileRef.value.setFileType(rootId, tenantId, pId);
  }

  /**
   * 初始化页面设置id
   */
  onMounted(() => {
    const parentId = router.currentRoute.value.query.parentId;
    const rootId = router.currentRoute.value.query.rootId;
    const tenantId = router.currentRoute.value.query.tenantId;
    setIds(parentId, rootId, tenantId);
  });
</script>
<style lang="less" scoped>
  .header {
    background: hsla(0, 0%, 100%, 0.9);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
    height: 45px;
    padding: 0 28px;
    user-select: none;
    width: calc(100% - 260px);
    float: left;
    z-index: 8;
  }

  .pointer {
    cursor: pointer;
  }

  .file-text:hover {
    color: rgb(51, 51, 51);
    text-decoration: underline;
  }
  .dropdown-position {
    float: right;
    position: relative;
    top: 6px;
  }
  .left {
    float: left;
    position: relative;
    top: 12px;
  }
  .global-search {
    min-width: 220px;
    font-size: 16px;
  }
  .title-hover:hover {
    color: #1e88e5;
  }
</style>
