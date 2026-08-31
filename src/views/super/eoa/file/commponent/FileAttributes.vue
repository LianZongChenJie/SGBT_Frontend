<template>
  <div ref="drawerRef" style="height: 100%">
    <div class="drawer" v-if="visible && detailData">
      <div class="file-name" style="display: flex">
        <Icon
          v-if="ext === 'jpg' || ext === 'png' || ext === 'jpeg' || ext === 'gif'"
          class="file-icon"
          icon="ant-design:file-image-outlined"
          style="color: rgb(255, 87, 34)"
        />
        <Icon v-else-if="ext === 'xls' || ext === 'xlsx'" class="file-icon" icon="ant-design:file-excel-outlined" style="color: rgb(98, 187, 55)" />
        <Icon v-else-if="ext === 'pdf'" class="file-icon" icon="ant-design:file-pdf-outlined" style="color: rgb(211, 47, 47)" />
        <Icon v-else-if="ext === 'doc' || ext === 'docx'" class="file-icon" icon="ant-design:file-word-outlined" style="color: rgb(68, 138, 255)" />
        <Icon v-else-if="ext === 'ppt' || ext === 'pptx'" class="file-icon" icon="ant-design:file-ppt-outlined" style="color: rgb(245, 124, 0)" />
        <Icon v-else-if="ext === 'video'" class="file-icon" icon="ant-design:play-square-outlined" style="color: rgb(119, 87, 188)" />
        <Icon v-else-if="ext === 'txt'" class="file-icon" icon="ant-design:file-text-outlined" style="color: rgb(41, 211, 178)" />
        <Icon v-else-if="ext === 'zip'" class="file-icon" icon="ant-design:file-zip-outlined" style="color: rgb(253, 202, 7)" />
        <Icon v-else-if="izFolder === '1'" icon="ant-design:folder-open-outlined" class="file-icon" style="color: rgb(253, 202, 7)" />
        <img :src="LinkImg" v-else-if="ext === 'url'" class="file-icon" />
        <Icon v-else class="file-icon" icon="ant-design:file-unknown-outlined" />
        <span class="attribute-name ellipsis">{{ detailData.fileName }}</span>
      </div>
      <div class="tabs">
        <ul style="padding-bottom: 15px; width: 100%">
          <li :class="item.key === activeKey ? 'click-color' : ''" v-for="item in options" :key="item.key" @click="handleClick(item.key)"
            >{{ item.name }}
          </li>
        </ul>
      </div>
      <div v-show="activeKey == '1'" class="basic">
        <ul>
          <li class="ellipsis flex">
            <span class="basic-font">创&nbsp;&nbsp;建&nbsp;&nbsp;者</span>
            <span class="ellipsis flex">
              <img :src="getImageSrc(detailData.avatar)" class="avatar-box" />
              <span>{{ detailData.realname }}</span>
            </span>
          </li>
          <li class="ellipsis flex">
            <span class="basic-font">类&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;型</span>
            <span class="ellipsis flex">{{ ext ? ext : '文件夹' }}</span>
          </li>
          <li class="ellipsis flex">
            <span class="basic-font">存储位置</span>
            <span class="ellipsis flex">{{ title }}</span>
          </li>
          <li class="ellipsis flex">
            <span class="basic-font">创建时间</span>
            <span>{{ detailData.createTime }}</span>
          </li>
          <li class="ellipsis flex">
            <span class="basic-font">最近修改</span>
            <span>{{ detailData.updateTime }}</span>
          </li>
          <li class="ellipsis flex">
            <span class="basic-font">浏&nbsp;&nbsp;览&nbsp;&nbsp;数</span>
            <span>{{ detailData.readCount ? detailData.readCount : 0 }}</span>
          </li>
          <li class="ellipsis flex">
            <span class="basic-font">下&nbsp;&nbsp;载&nbsp;&nbsp;数</span>
            <span>{{ detailData.downCount ? detailData.downCount : 0 }}</span>
          </li>
          <li class="ellipsis flex">
            <span class="basic-font">分享链接</span>
            <a-input style="height:25px !important;margin-top:5px" :value="detailData.shareUrl" readonly size="small"/>
          </li>
        </ul>
        <a-divider v-if="leftType!='myFile' && leftType!='used' && leftType!='star'" />
        <div style="margin-top: 10px; height: 60px" v-if="leftType!='myFile' && leftType!='used' && leftType!='star'">
          <div class="ellipsis flex">
            <span class="basic-font">允许下载</span>
            <a-switch
              v-model:checked="detailData.enableDown"
              checkedValue="1"
              unCheckedValue="0"
              @click="(checked) => downHandleClick(checked, 'enableDown')"
              size="small"
              v-if="authority === 'owner' || authority === 'admin' || (authority === 'editable' && createBy === username)"
            />
            <span v-else>{{ detailData.enableDown === '0' ? '不允许' : '允许' }}</span>
          </div>
          <div class="ellipsis flex" style="margin-top: 10px; margin-bottom: 10px">
            <span class="basic-font">允许编辑</span>
            <a-switch
              v-model:checked="detailData.enableUpdat"
              checkedValue="1"
              unCheckedValue="0"
              @click="(checked) => downHandleClick(checked, 'enableUpdat')"
              size="small"
              v-if="authority !== 'readonly'"
            />
            <span v-else>{{ detailData.enableUpdat === '0' ? '不允许' : '允许' }}</span>
          </div>
        </div>
        <a-divider />
        <div style="margin-top: 10px; height: 100px">
          <div class="ellipsis flex">
            <span class="basic-font">分享链接预览权限</span>
          </div>
          <div>
            <a-radio-group v-model:value="detailData.sharePerms" @change="(e) => downHandleClick(e.target.value, 'sharePerms')">
              <a-radio :style="radioStyle" value="1" style="font-size: 13px">关闭分享</a-radio>
              <a-radio :style="radioStyle" value="3" style="font-size: 13px">允许任何人查看</a-radio>
            </a-radio-group>
          </div>
        </div>
      </div>
      <div v-show="activeKey == '2'" class="log">
        <FileLog ref="fileLogRef" />
      </div>
      <div class="hold" v-show="visible">
        <a-checkbox @change="expandHandleChange" v-model:checked="holdCheck" style="font-size: 13px; margin-left: 10px">保持展开</a-checkbox>
      </div>
    </div>
    <div v-else-if="visible" class="drawer" style="text-align: center">
      <div style="position: relative; top: 50%">
        选择一个文件或文件夹
        <br />
        可查看其属性和日志
      </div>
    </div>
  </div>
</template>

<script lang="ts" name="file-attributes" setup>
  import { ref, unref, reactive, defineEmits, onMounted, onUnmounted } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { getFileDetail, editSysFile } from '../FileList.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import FileLog from './FileLog.vue';
  import LinkImg from '/@/assets/images/link.png';

  const visible = ref<boolean>(false);
  const ext = ref<string>('');
  const title = ref<string>('');
  const fileTitle = ref<string>('');
  const fileUrl = ref<string>('');
  const detailData = ref<any>({});
  const izFolder = ref<string>();
  const activeKey = ref<any>('1');
  const options = reactive<any>([
    { key: '1', name: '属性' },
    { key: '2', name: '日志' },
  ]);
  const { createMessage: $message } = useMessage();
  const radioStyle = reactive<any>({ display: 'flex', height: '30px', lineHeight: '30px' });
  const holdCheck = ref<boolean>(false);
  const fileLogRef = ref();
  const emit = defineEmits(['register', 'expand', 'refresh', 'load-table']);
  const drawerRef = ref();
  const isClear = ref<boolean>(false);
  const authority = ref<string>('');
  const createBy = ref<string>('');
  const username = ref<string>('');
  const leftType = ref<string>('');

  /**
   * 列表展示
   */
  function show(record) {
    activeKey.value = '1';
    ext.value = record.ext;
    izFolder.value = record.izFolder;
    authority.value = record.authority;
    //列表创建人
    createBy.value = record.createBy;
    //当前用户
    username.value = record.username;
    //左侧类别
    leftType.value = record.leftType;
    if (!unref(isClear)) {
      getFileDetailList(record.id);
    } else {
      isClear.value = false;
    }
  }

  /**
   * 获取文件详情
   * @param id
   */
  function getFileDetailList(id) {
    getFileDetail({ fileId: id })
      .then((res) => {
        if (res.success) {
          res.result.sharePerms = res.result.sharePerms ? res.result.sharePerms : '1';
          detailData.value = res.result;
          title.value = fileTitle.value + '/' + res.result.fileName;
        } else {
          detailData.value = {};
        }
      })
      .finally(() => {
        visible.value = true;
      });
  }

  /**
   * 获取图片路径
   * @param url
   */
  function getImageSrc(fileUrl) {
    return getFileAccessHttpUrl(fileUrl);
  }

  /**
   * 设置标题
   */
  function setTitle(value) {
    fileTitle.value = value;
  }

  /**
   * tabs点击事件
   */
  function handleClick(val) {
    activeKey.value = val;
    if (val == '1') {
      getFileDetailList(detailData.value.fileId);
    } else {
      fileLogRef.value.loadFileLog(detailData.value.fileId);
    }
  }

  /**
   * 权限变更操作
   */
  function downHandleClick(checked, type) {
    let params = {};
    if (type == 'enableDown') {
      params = { enableDown: checked, type: type };
    } else if (type == 'enableUpdat') {
      params = { enableUpdat: checked, type: type };
    } else if (type == 'sharePerms') {
      params = { sharePerms: checked, type: type };
    }
    params['fileId'] = detailData.value.fileId;
    editSysFile(params).then((res) => {
      if (res.success) {
        $message.success('操作成功');
        emit('load-table')
      }
    });
  }

  /**
   * 保持展开点击事件
   */
  function expandHandleChange() {
    emit('expand', unref(holdCheck));
  }

  /**
   * 隐藏属性
   */
  function hideVisible() {
    visible.value = false;
  }

  /**
   * 清除数据
   */
  function clear(value) {
    detailData.value = '';
    if (value) {
      isClear.value = true;
    }
  }

  //监听鼠标点击事件
  const closeSelect = (e: Event) => {
    if (drawerRef.value && !drawerRef.value.contains(e.target)) {
      if (!unref(holdCheck)) {
        visible.value = false;
        emit('refresh');
      }
    }
  };
  onMounted(() => {
    document.addEventListener('click', closeSelect);
  });
  onUnmounted(() => {
    document.removeEventListener('click', closeSelect);
  });

  defineExpose({
    show,
    setTitle,
    hideVisible,
    clear,
  });
</script>

<style lang="less" scoped>
  .drawer {
    top: 69px;
    background: #fff;
    bottom: 0;
    box-shadow: 0 23px 23px 5px rgba(0, 0, 0, 0.2), 0 6px 6px rgba(0, 0, 0, 0.15);
    position: absolute;
    right: 16px;
    width: 340px;
    z-index: 513;
    height: calc(100% - 70px);
    overflow-y: hidden;
  }

  .file-name {
    padding: 20px 22px 0;
    position: relative;
  }

  .file-icon {
    display: inline-block;
    height: 24px;
    margin-right: 13px;
    width: 24px;
    font-size: 26px !important;
  }

  .attribute-name {
    display: inline-block;
    font-size: 16px;
    width: 244px;
    color: #333;
    font-weight: 500;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    white-space: nowrap;
    font-size: 13px;
  }

  .tabs {
    border-bottom: 1px solid #ddd;
    height: 46px;
    margin-bottom: 5px;

    li {
      border-bottom: 3px solid #fff;
      color: #aaa;
      cursor: pointer;
      float: left;
      font-size: 13px;
      height: 43px;
      line-height: 46px;
      text-align: center;
      width: 148px;
    }

    li:first-child {
      margin-left: 18px;
    }

    li:last-child {
      margin-left: 4px;
    }

    li:hover {
      border-bottom-color: #aaa;
    }
  }

  .click-color {
    border-color: #1e88e5 !important;
    color: #1e88e5 !important;
  }

  .basic {
    margin-top: 5px;
    padding: 0 22px 40px;
    width: 100%;
    overflow-y: auto;
    height: calc(100% - 145px);
    li {
      height: 32px;
      line-height: 32px;
      position: relative;
      width: 100%;
    }

    .basic-font {
      color: #999;
      width: 60px;
      margin-right: 20px;
      font-size: 13px;
    }
  }

  .flex {
    display: flex;
  }

  .avatar-box {
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    position: relative;
    top: 5px;
    margin-right: 15px;
  }

  :deep(.ant-divider-horizontal) {
    margin: 2px 0 !important;
  }

  .hold {
    position: fixed;
    bottom: 0;
    background-color: #ffffff;
    height: 40px;
    font-size: 13px;
    width: 340px;
    line-height: 40px;
  }
  .log {
    overflow-y: auto;
    height: calc(100% - 145px);
  }
</style>
