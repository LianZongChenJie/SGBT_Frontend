<template>
  <div>
    <div class="share-file" v-if="showTable">
      <a-list size="small" bordered :data-source="dataSource" :loading="loading" :pagination="pageSetting">
        <template #header>
          <div class="pointer all-file">
            <span @click="handleTitleClick('all')">全部文件</span>
            <span v-for="item in titleData">
              <span> > &nbsp;&nbsp;&nbsp;</span>
              <span class="pointer title-hover" @click="handleTitleClick(item)">
                {{ item.title }}
              </span>
            </span>
          </div>
          <div v-if="userData.realname" class="go-system pointer" @click="goSystem">
            <Icon class="font-size-15" icon="ant-design:play-circle-outlined" />
            <span class="font-size-15" style="margin-left: 2px">进入系统</span>
          </div>
          <div class="download-file pointer" @click="downLoadFile">
            <Icon class="font-size-15" icon="ant-design:arrow-down-outlined" />
            <span class="font-size-15" style="margin-left: 2px">下载</span>
          </div>
          <div class="save-file pointer" @click="saveFiles">
            <Icon class="font-size-15" icon="ant-design:cloud-outlined" />
            <span class="font-size-15" style="margin-left: 2px">存入知识库</span>
          </div>
          <div v-if="userData.realname" class="header-image">
            <img style="border-radius: 50%" :src="getImageSrc(userData.avatar)" />
          </div>
          <div v-else class="login-user pointer" style="line-height: 50px">
            <a-button type="primary" size="small" @click="toLogin" class="login-user">登录</a-button>
          </div>
        </template>
        <template #renderItem="{ item }">
          <a-list-item class="share-info pointer" @click="textHandleClick(item)">
            <div>
              <img v-if="item.fileType === 'image'" class="file-image" :src="getImageSrc(item.url)" />
              <Icon v-else-if="item.fileType === 'excel'" class="file-icon" icon="ant-design:file-excel-outlined" style="color: rgb(98, 187, 55)" />
              <Icon v-else-if="item.fileType === 'pdf'" class="file-icon" icon="ant-design:file-pdf-outlined" style="color: rgb(211, 47, 47)" />
              <Icon v-else-if="item.fileType === 'doc'" class="file-icon" icon="ant-design:file-word-outlined" style="color: rgb(68, 138, 255)" />
              <Icon v-else-if="item.fileType === 'ppt'" class="file-icon" icon="ant-design:file-ppt-outlined" style="color: rgb(245, 124, 0)" />
              <Icon v-else-if="item.fileType === 'video'" class="file-icon" icon="ant-design:play-square-outlined" style="color: rgb(119, 87, 188)" />
              <Icon v-else-if="item.fileType === 'text'" class="file-icon" icon="ant-design:file-text-outlined" style="color: rgb(41, 211, 178)" />
              <Icon v-else-if="item.fileType === 'zip'" class="file-icon" icon="ant-design:file-zip-outlined" style="color: rgb(253, 202, 7)" />
              <Icon v-else-if="item.izFolder === '1'" class="file-icon file-folder" icon="ant-design:folder-open-outlined" />
              <img :src="LinkImg" v-else-if="item.ext === 'url'" class="file-image" />
              <Icon v-else class="file-icon" icon="ant-design:file-unknown-outlined" />
              <span class="file-text">{{ item.fileName }}</span>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>
    <div v-else> {{ showText }}</div>
  </div>
  <FileLoginModal @register="registerModal" @success="handleSuccess" />
</template>

<script name="file-share" lang="ts" setup>
  import { nextTick, onMounted, ref, toRaw, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { downLoadShareFiles, getShareFile, getShareFileList, addMyFiles, getTenantId } from '../FileList.api';
  import { columns } from '../FileList.data';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import LinkImg from '/@/assets/images/link.png';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { getToken } from '/@/utils/auth';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import FileLoginModal from '../filelogin/FileLoginModal.vue';
  import { userInfo } from 'os';
  import { useModal } from '/@/components/Modal';
  import headerImg from '/@/assets/images/header.jpg';
  import {encryptByBase64} from "@/utils/cipher";

  //提示弹窗
  const $message = useMessage();
  const globSetting = useGlobSetting();
  //获取route参数
  const router = useRouter();
  //list列表数据
  const dataSource = ref<any>([]);
  //初始化数据
  const initData = ref<any>({});
  //是否展示表格
  const showTable = ref<boolean>(false);
  //父id
  const parentId = ref<string>('');
  //标题集合
  const titleData = ref<any>([]);
  //列表加载
  const loading = ref<boolean>(false);
  //是否拥有权限
  const noAnth = ref<boolean>(false);
  //一级目录id
  const rootId = ref<string>('');
  //文本显示
  const showText = ref<string>('加载中，请稍后');
  const userStore = useUserStore();
  //分页配置
  const pageSetting = ref<any>({
    total: 0,
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '30'],
    showTotal: (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条';
    },
    showQuickJumper: true,
    showSizeChanger: true,
    onChange: pageOnChange,
    showSizeChange: showSizeChange,
  });
  //用户数据
  const userData = ref<any>({});
  //文件id
  const fileId = ref<string>('');
  //登录弹窗页面
  const [registerModal, { openModal }] = useModal();

  /**
   * 获取分享数据
   */
  function getShare(id, rId) {
    rootId.value = rId;
    fileId.value = id;
    //获取分享文件
    getShareFile({ id: id }).then((res) => {
      if (res.success && res.result) {
        if (userStore.getUserInfo.id) {
          //获取权限，看看当前用户是否在该文件夹中
          getTenantId({ fileId: id, rootId: unref(rootId), userId: userStore.getUserInfo.id }).then((data) => {
            if (data.success && data.result) {
              //跳转到知识库
              toFile(data);
            } else {
              setShareFile(res, id);
            }
          });
        } else {
          //设置分享文件
          setShareFile(res, id);
        }
      } else {
        showTable.value = false;
        showText.value = '当前文件不存在或您没有查看权限';
      }
    });
  }

  /**
   * 获取图片路径
   * @param url
   */
  function getImageSrc(url) {
    //图片不存在，返回默认图片
    if (!url) {
      return headerImg;
    }
    //获取默认头像
    return getFileAccessHttpUrl(url);
  }

  /**
   * 文本或文件夹点击事件
   */
  function textHandleClick(record) {
    if (record.izFolder === '1') {
      parentId.value = record.id;
      let filter = titleData.value.filter((item) => item.key == record.id);
      if (!filter || filter.length == 0) {
        titleData.value.push({ key: record.id, title: record.fileName });
      }
      getFileList();
    } else {
      //预览文件接口
      handleView(record);
    }
  }

  /**
   * title点击事件
   * @param val
   */
  function handleTitleClick(val) {
    nextTick(() => {
      pageSetting.value.current = 1;
      pageSetting.value.pageSize = 10;
      //如果标题点击的是全部文件
      if (val == 'all') {
        titleData.value = [];
        parentId.value = '';
        dataSource.value = [];
        dataSource.value.push(unref(initData));
        pageSetting.value.total = 1;
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
        getFileList();
      }
    });
  }

  /**
   * 预览文件
   * @param record
   */
  function handleView(record) {
    if (record && record.url) {
      //如果后缀是url,直接打开新窗口即可
      if (record.ext === 'url') {
        window.open(record.url, '_blank');
        return;
      }
      //update-begin---author:scott ---date:2024-06-03  for：【TV360X-952】升级到kkfileview4.1.0---
      //let filePath = encodeURIComponent(getFileAccessHttpUrl(record.url));
      let filePath = encodeURIComponent(encryptByBase64(getFileAccessHttpUrl(record.url)));
      // //文档采用pdf预览高级模式
      // if (filePath.endsWith('.pdf') || filePath.endsWith('.doc') || filePath.endsWith('.docx')) {
      //   filePath = filePath + '&officePreviewType=pdf';
      // }
      //update-end---author:scott ---date:2024-06-03  for：【TV360X-952】升级到kkfileview4.1.0---
      
      let url = `${globSetting.viewUrl}?url=` + filePath;
      console.log("分享链接跳转路径："+ url)
      window.open(url, '_blank');
    }
  }

  /**
   * 获取文件内容
   */
  function getFileList() {
    loading.value = true;
    let params = {
      shareId: initData.value.id,
      parentId: unref(parentId),
      pageNo: pageSetting.value.current,
      pageSize: pageSetting.value.pageSize,
      delFlag: '0',
    };
    dataSource.value = [];
    getShareFileList(params)
      .then((res) => {
        if (res.success) {
          if (res.result.records && res.result.records.length > 0) {
            let records = res.result.records;
            for (let item of records) {
              item.showInput = false;
              if (item.izFolder !== '1' && item.fileName) {
                item.ext = getFileExt(item.fileName);
                item.fileName = item.fileName.substr(0, item.fileName.lastIndexOf('.'));
              }
            }
            dataSource.value = records;
            pageSetting.value.total = res.result.total;
          } else {
            dataSource.value = [];
            pageSetting.value.total = 0;
            showText.value = '当前文件不存在或您没有查看权限';
          }
        }
      })
      .finally(() => {
        loading.value = false;
      });
  }

  /**
   * 获取后缀
   */
  function getFileExt(fileName) {
    let ext = fileName.split('.');
    ext = ext[ext.length - 1];
    return ext;
  }

  /**
   * 文件下载
   */
  function downLoadFile() {
    let fileName = initData.value.fileName;
    if (unref(titleData).length > 0) {
      let value = titleData.value[titleData.value.length - 1];
      fileName = value.title;
    }
    let fileId = initData.value.id;
    if (unref(parentId)) {
      fileId = unref(parentId);
    }
    let a = document.createElement('a');
    a.href = downLoadShareFiles + '?fileId=' + fileId + '&zipName=' + fileName + '&type=share' + '&shareId=' + initData.value.id;
    a.target = '_target';
    a.click();
  }

  /**
   * 上一页、下一页发生改变
   * @param pageNo
   * @param pageSize
   */
  function pageOnChange(pageNo, pageSize) {
    pageSetting.value.current = pageNo;
    pageSetting.value.pageSize = pageSize;
    getFileList();
  }

  /**
   * 页数放生改变
   * @param pageNo
   * @param pageSize
   */
  function showSizeChange(page, pageSize) {
    pageSetting.value.pageSize = pageSize;
    getFileList();
  }

  /**
   * 获取用户数据
   */
  function getUserData() {
    let userInfo = userStore.getUserInfo;
    if (userInfo) {
      userData.value = userInfo;
      getFileToPath();
    } else {
      userData.value = {};
    }
  }

  /**
   * 去登录
   */
  function toLogin() {
    //打开登录弹窗
    openModal(true, {});
  }

  /**
   * 存入知识库
   */
  async function saveFiles() {
    let userInfo = userStore.getUserInfo;
    if (userInfo.id) {
      getFileToPath();
    } else {
      $message.createMessage.warning('请先登录');
    }
  }

  /**
   * 登陆成功
   * @param value
   */
  function handleSuccess(value) {
    getTenantId({ fileId: unref(fileId), rootId: unref(rootId), userId: userStore.getUserInfo.id }).then((res) => {
      if (res.success && res.result) {
        toFile(res);
      } else {
        userData.value = value;
      }
    });
  }

  /**
   * 根据文件id和用户id跳转不同的页面
   */
  function getFileToPath() {
    getTenantId({ fileId: unref(fileId), rootId: unref(rootId), userId: userStore.getUserInfo.id }).then((res) => {
      if (res.success && res.result) {
        toFile(res);
      } else {
        let fileId = initData.value.id;
        if (unref(parentId)) {
          fileId = unref(parentId);
        }
        let params = {
          fileName: '我的文件',
          fileType: 'folder',
          izFolder: '1',
          izRootFolder: '1',
          parentId: '',
          storeType: 'manage',
          downCount: 0,
          readCount: 0,
          createBy: userStore.getUserInfo.username,
          delFlag: '0',
          fileId: fileId,
          userId: userStore.getUserInfo.id,
        };
        addMyFiles(params).then((res) => {
          if (res.success) {
            $message.createMessage.success('存入知识库成功');
          } else {
            $message.createMessage.info(res.message);
          }
        });
      }
    });
  }

  /**
   * 设置分享文件
   * @param data
   * @param id
   */
  function setShareFile(data, id) {
    if (data.result.izFolder === '0') {
      console.log("文件跳转路径",data.result.url)
      window.open(data.result.url, '_self');
      showTable.value = false;
    } else {
      showText.value = '当前文件不存在或您没有查看权限';
      showTable.value = true;
      dataSource.value.push(data.result);
      //附初始值，工点击全部文件时调用
      initData.value = data.result;
      parentId.value = id;
      pageSetting.value.total = 1;
      userData.value = userStore.getUserInfo;
    }
  }

  /**
   * 跳转到知识库
   * @param data
   */
  function toFile(data) {
    showText.value = '已在共享文件夹中，正在跳转到知识库';
    let params = { parentId: data.result.parentId ? data.result.parentId : unref(rootId), rootId: unref(rootId) };
    if (data.result.tenantId) {
      params['tenantId'] = data.result.tenantId;
    }
    //update-begin---author:wangshuai---date:2023-12-06---for:【QQYUN-7335】文件分享链接跳转的地址不正确---
    let routePath = router.currentRoute.value.query.path;
    let path:string = routePath?routePath:'/file';
    console.log("文件夹跳转：",path)
    router.push({ path: path, query: params });
    //update-end---author:wangshuai---date:2023-12-06---for:【QQYUN-7335】文件分享链接跳转的地址不正确---
  }

  /**
   * 去我的文件
   */
  function goSystem() {
    router.push({ path: '/file' });
  }

  /**
   * 初始化页面获取数据
   */
  onMounted(() => {
    let id = router.currentRoute.value.query.id;
    let rootId = router.currentRoute.value.query.rootId;
    if (id && rootId) {
      getShare(id, rootId);
    }
  });
</script>

<style lang="less" scoped>
  .share-file {
    z-index: 999;
    background: white;
    color: #0a8fe9;
  }

  .file-icon {
    height: 28px;
    margin-top: 4px;
    position: absolute;
    vertical-align: top;
    width: 26px;
    left: 1px;

    :deep(svg) {
      width: 100% !important;
      height: 100% !important;
    }
  }

  .file-image {
    display: inline-block !important;
    height: 24px;
    margin-right: 2px;
    margin-top: 6px;
    vertical-align: top;
    width: 21px;
  }

  :deep(.ant-list-header) {
    display: flex;
  }

  .pointer {
    cursor: pointer;
  }

  .file-text {
    margin-left: 12px;
    position: relative;
    top: 8px;
  }

  .all-file {
    line-height: 50px;
    width: 100%;
  }

  .share-info:hover {
    background-color: #f9f9f9;
  }

  .download-file {
    line-height: 50px;
    width: 60px;
  }

  .go-system {
    line-height: 50px;
    width: 106px;
  }

  .save-file {
    line-height: 50px;
    margin-left: 10px;
    width: 120px;
  }

  .font-size-15 {
    font-size: 15px;
    color: #808080;
  }

  .login-user {
    border-radius: 4px;
    width: 72px;
    font-size: 15px;
    height: 30px;
  }

  .header-image {
    display: block;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin: 7px 16px 7px 0;
  }

  .file-folder {
    position: relative;
    margin-left: 2px;
    width: 23px;
    color: rgb(253, 202, 7);
  }
</style>
