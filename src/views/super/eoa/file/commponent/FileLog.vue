<template>
  <div>
    <ul class="log-detail-list">
      <li class="ellipsis" v-for="(item, index) in logList">
        <Icon
          class="icon-edit"
          v-if="
            isSharePerms(item) ||
            isDown(item) ||
            isUpdat(item) ||
            move(item) ||
            isRename(item) ||
            isNewFile(item) ||
            isReduction(item) ||
            isAddUser(item) ||
            isChangeAuth(item) ||
            isChangeSharedFile(item)
          "
          icon="ant-design:edit-outlined"
        />
        <Icon class="icon-edit" v-if="copy(item)" icon="ant-design:plus-outlined" />
        <Icon class="icon-edit" v-if="isUpdateFlag(item) || isDeleteFile(item)" icon="ant-design:delete-outlined" />
        <div style="word-break: break-all; white-space: break-spaces">
          <FilePopover :userData="item"></FilePopover>
          <span v-if="isSharePerms(item)">
            {{ getSharePermsTxt(item) }}
          </span>
          <span v-else-if="isDown(item)">
            {{ getEnableDownTxt(item) }}
          </span>
          <span v-else-if="isUpdat(item)">
            {{ getEnableUpdatTxt(item) }}
          </span>
          <span v-else-if="move(item)">
            {{ getMoveTxt(item) }}
          </span>
          <span v-else-if="copy(item)">
            <span v-if="JSON.parse(item.dataContent).izFolder ==='0'">
              创建了文件 <a href="javascript:void(0)" @click="toFileView(item)">{{ getFileName(item) }}</a>
            </span>
            <span v-else>
              {{ ' 创建了 文件夹 ' + JSON.parse(item.dataContent).fileName }}
            </span>
          </span>
          <span v-else-if="isRename(item)">
            {{ getRenameTxt(item) }} <a v-if="item.izFolder != '1'" href="javascript:void(0)" @click="toFileView(item)">{{ getNewFileName(item) }}</a>
          </span>
          <span v-else-if="isNewFile(item)">
            {{ ' 上传了新版本' }} <a href="javascript:void(0)" @click="toFileView(item)">{{ getFileName(item) }}</a>
            <span v-if="JSON.parse(item.dataContent).description">
              {{ ' 版本说明：' + JSON.parse(item.dataContent).description }}
            </span>
          </span>
          <span v-else-if="isUpdateFlag(item)">
            {{ getUpdateFlagTxt(item) }}
          </span>
          <span v-else-if="isReduction(item)">
            {{ getReductionTxt(item) }}
          </span>
          <span v-else-if="isDeleteFile(item)">
            {{ getDeleteFileTxt(item) }}
          </span>
          <span v-else-if="isAddUser(item)">
            添加了新成员
            <span v-for="(data, index) in getUserDataTxt(item)">
              <FilePopover :userData="data" /> <span v-if="index !== userDataLength - 1">，</span>
            </span>
          </span>
          <span v-else-if="isChangeAuth(item)">
            {{ ' 将 ' }}
            <span v-for="(data, index) in getUserDataTxt(item)">
              <FilePopover :userData="data" />
            </span>
            {{ getChangeAuthTxt(item) }}
          </span>
          <span v-else-if="isChangeSharedFile(item)">
            {{' 将 '}}
            <FilePopover :userData="getOtherUserDataTxt(item)" />
            {{ '设为共享文件夹 '+getFileName(item)+' 的拥有者'}}
          </span>
        </div>
        <div class="detail-log-time">{{ getTime(item.createTime) }}</div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" name="file-log" setup>
  import { ref } from 'vue';
  import { getDetailLog } from '../FileList.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import FilePopover from './FilePopover.vue';

  import { useGlobSetting } from '/@/hooks/setting';
  import dayjs from 'dayjs';
  import {encryptByBase64} from "@/utils/cipher";

  const logList = ref<any>([]);
  const globSetting = useGlobSetting();
  const userDataLength = ref<number>(0);

  /**
   * 加载文件日志
   * @param fileId
   */
  function loadFileLog(fileId) {
    getDetailLog({ fileId: fileId }).then((res) => {
      if (res.success) {
        logList.value = res.result;
      }
    });
  }

  /**
   * 获取分享日志
   * @param item
   */
  function getSharePermsTxt(item) {
    let dataContent = JSON.parse(item.dataContent);
    let sharePerms = dataContent.sharePerms;
    if (sharePerms == '1') {
      return ' 修改了文件的链接浏览限制为：关闭该文件的分享';
    } else if (sharePerms == '2') {
      return ' 修改了文件的链接浏览限制为：允许本网成员查看';
    } else {
      return ' 修改了文件的链接浏览限制为：任何成员都可以观看';
    }
  }

  /**
   * 获取下载日志
   * @param item
   */
  function getEnableDownTxt(item) {
    let dataContent = JSON.parse(item.dataContent);
    let enableDown = dataContent.enableDown;
    if (enableDown == '0') {
      return ' 修改了文件的下载设置为：不可下载';
    } else {
      return ' 修改了文件的下载设置为：可下载';
    }
  }

  /**
   * 获取编辑日志
   * @param item
   */
  function getEnableUpdatTxt(item) {
    let dataContent = JSON.parse(item.dataContent);
    let enableUpdat = dataContent.enableUpdat;
    if (enableUpdat == '0') {
      return ' 修改了文件的编辑设置为：不可编辑';
    } else {
      return ' 修改了文件的编辑设置为：可编辑';
    }
  }

  /**
   * 获取移动文件日志
   * @param item
   */
  function getMoveTxt(item) {
    let dataContent = JSON.parse(item.dataContent);
    let fileName = dataContent.fileName;
    return ' 移动此文件夹到 ' + fileName;
  }

  /**
   * 获取重命名的日志
   * @param item
   */
  function getRenameTxt(item) {
    let dataContent = JSON.parse(item.dataContent);
    let newFileName = dataContent.newFileName;
    let oldFileName = dataContent.oldFileName;
    if (item.izFolder == '1') {
      return ' 重命名了文件夹' + oldFileName + '为' + newFileName;
    } else {
      return ' 重命名了文件' + oldFileName + '为';
    }
  }

  /**
   * 获取回收站的日志
   * @param item
   */
  function getUpdateFlagTxt(item) {
    let dataContent = JSON.parse(item.dataContent);
    let izFolder = dataContent.izFolder;
    let fileName = dataContent.fileName;
    if (izFolder == '0') {
      return ' 将文件 ' + fileName + ' 放入回收站';
    } else {
      return ' 将文件夹 ' + fileName + ' 放入回收站';
    }
  }

  /**
   * 获取还原文件夹日志
   * @param item
   */
  function getReductionTxt(item) {
    let dataContent = JSON.parse(item.dataContent);
    let izFolder = dataContent.izFolder;
    let fileName = dataContent.fileName;
    if (izFolder == '0') {
      return ' 恢复了文件 ' + fileName;
    } else {
      return ' 恢复了文件夹 ' + fileName;
    }
  }

  /**
   * 获取删除文件日志
   * @param item
   */
  function getDeleteFileTxt(item) {
    let dataContent = JSON.parse(item.dataContent);
    let izFolder = dataContent.izFolder;
    let fileName = dataContent.fileName;
    if (izFolder == '0') {
      return ' 彻底删除了文件 ' + fileName;
    } else {
      return ' 彻底删除了文件夹 ' + fileName;
    }
  }

  /**
   * 获取用户
   * @param item
   */
  function getUserDataTxt(item) {
    let userData = JSON.parse(item.dataContent).userData;
    if (userData) {
      userDataLength.value = userData.length;
      return userData;
    }
  }

  /**
   * 获取用户
   * @param item
   */
  function getOtherUserDataTxt(item) {
    return JSON.parse(item.dataContent).otherUserData;
  }

  /**
   * 获取成员修改权限日志
   * @param item
   */
  function getChangeAuthTxt(item) {
    let oldAuthority = getAuthorityText(JSON.parse(item.dataContent).oldAuthority);
    let newAuthority = getAuthorityText(JSON.parse(item.dataContent).newAuthority);
    return ' 的权限从 ' + oldAuthority + ' 调整为 ' + newAuthority;
  }

  /**
   * 获取权限对应的文本
   * @param text
   */
  function getAuthorityText(text) {
    if (text === 'admin') {
      return '管理员';
    } else if (text === 'editable') {
      return '可编辑';
    } else {
      return '只读';
    }
  }

  /**
   * 获取文件名称
   *
   * @param item
   */
  function getFileName(item) {
    return JSON.parse(item.dataContent).fileName;
  }

  /**
   * 获取新的文件名称
   *
   * @param item
   */
  function getNewFileName(item) {
    return JSON.parse(item.dataContent).newFileName;
  }

  /**
   * 判断是否为分享权限日志
   * @param item
   */
  function isSharePerms(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'sharePerms';
  }

  /**
   * 判断是否为下载权限日志
   * @param item
   */
  function isDown(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'enableDown';
  }

  /**
   * 判断是否为修改权限日志
   * @param item
   */
  function isUpdat(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'enableUpdat';
  }

  /**
   * 判断是否为移动文件日志
   * @param item
   */
  function move(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'move';
  }

  /**
   * 判断是否为复制日志
   * @param item
   */
  function copy(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'copy';
  }

  /**
   * 判断是否为重命名日志
   * @param item
   */
  function isRename(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'rename';
  }

  /**
   * 判断是否为新文件日志
   * @param item
   */
  function isNewFile(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'newFile';
  }

  /**
   * 判断是否删除文件到回收站
   * @param item
   */
  function isUpdateFlag(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'updateFlag';
  }

  /**
   * 判断是否还原文件夹
   * @param item
   */
  function isReduction(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'reduction';
  }

  /**
   * 判断是否删除文件
   * @param item
   */
  function isDeleteFile(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'deleteFile';
  }

  /**
   * 判断是否添加成员
   * @param item
   */
  function isAddUser(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'addUser';
  }

  /**
   * 判断是否修改权限
   * @param item
   */
  function isChangeAuth(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'changeAuth';
  }

  /**
   * 判断是否 共享文件变更拥有着
   *
   * @param item
   */
  function isChangeSharedFile(item) {
    return item.dataContent && JSON.parse(item.dataContent).type == 'changeSharedFile';
  }

  /**
   * 预览文件
   * @param item
   */
  function toFileView(item) {
    let url = JSON.parse(item.dataContent).url;
    //update-begin---author:scott ---date:2024-06-03  for：【TV360X-952】升级到kkfileview4.1.0---
    //let filePath = encodeURIComponent(getFileAccessHttpUrl(url));
    let filePath = encodeURIComponent(encryptByBase64(getFileAccessHttpUrl(url)));
    // //文档采用pdf预览高级模式
    // if (filePath.endsWith('.pdf') || filePath.endsWith('.doc') || filePath.endsWith('.docx')) {
    //   filePath = filePath + '&officePreviewType=pdf';
    // }
    //update-end---author:scott ---date:2024-06-03  for：【TV360X-952】升级到kkfileview4.1.0---
    
    let fileUrl = `${globSetting.viewUrl}?url=` + filePath;
    window.open(fileUrl, '_blank');
  }

  /**
   * 格式化时间
   * @param datetime
   */
  function getTime(datetime) {
    if (datetime == null) return '';
    let time = new Date();
    let outTime = new Date(datetime);
    //当前年比较
    if (time.getTime() < outTime.getTime() || time.getFullYear() != outTime.getFullYear()) {
      return dayjs(outTime).format('YYYY-MM-DD');
    }
    //当前月比较
    if (time.getMonth() != outTime.getMonth()) {
      return dayjs(outTime).format('YYYY-MM-DD');
    }
    //当前日期比较
    if (time.getDate() != outTime.getDate()) {
      let day = outTime.getDate() - time.getDate();
      //日期为1,为昨天
      if (day == -1) {
        return '昨天 ' + dayjs(outTime).format('HH:mm');
      }
      //日期为1,为前天
      if (day == -2) {
        return '前天 ' + dayjs(outTime).format('HH:mm');
      }
      //直接返回年月日
      return dayjs(outTime).format('YYYY-MM-DD');
    }
    return '今天 ' + dayjs(outTime).format('HH:mm');
  }
  defineExpose({
    loadFileLog,
  });
</script>

<style lang="less" scoped>
  .detail-log-content {
    overflow-y: auto;

    .detail-log-attribute {
      height: 100%;
      margin-top: 5px;
      padding: 0 22px 40px;
      width: 100%;
    }
  }

  .log-detail-list {
    padding-bottom: 15px;
    width: 100%;

    li {
      box-sizing: border-box;
      color: #666;
      line-height: 24px;
      padding: 6px 20px 6px 44px;
      position: relative;
      width: 100%;
      font-size: 13px;
    }
  }

  .flex {
    display: flex;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    white-space: nowrap;
  }

  :deep(.ant-popover-inner-content) {
    padding: 0 !important;
  }
  .icon-edit {
    color: #b7b7b7;
    font-size: 13px;
    left: 20px;
    position: absolute;
    top: 11px;
  }
  .detail-log-time {
    color: #b7b7b7;
    font-size: 13px !important;
  }
</style>
<style>
  .file-popover .ant-popover-inner-content {
    padding: 16px 0 0;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 9px 12px -6px rgba(0, 0, 0, 0.2), 0 19px 29px 2px rgba(0, 0, 0, 0.14), 0 7px 36px 6px rgba(0, 0, 0, 0.12);
    width: 200px;
    height: 80px;
  }
</style>
