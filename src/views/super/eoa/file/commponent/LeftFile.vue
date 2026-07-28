<template>
  <div class="left-content">
    <div class="file-search" :class="isShowBorderColor ? 'border-color' : ''">
      <Icon class="icon-search" icon="ant-design:search-outlined" />
      <a-input
        type="text"
        @click="isShowBorderColor = true"
        @blur="isShowBorderColor = false"
        class="file-search-box"
        :placeholder="placeholder"
        v-model:value="keyWord"
        @pressEnter="handlePressEnter"
      />
    </div>
    <ul class="left-file pointer">
      <li class="item" :class="type === 'myFile' ? 'item-active' : ''" @mouseleave="myFileMouseLeave" @mouseover="myFileSettingShow = true">
        <div style="padding: 0 30px 0 0">
          <div style="width: 80%; float: left" @click="handleLiClick('myFile')">
            <div style="display:flex;align-items:center;">
              <Icon icon="ant-design:paper-clip-outlined" style="color: #0091ea; font-size: 16px; transform: rotate(-44deg)" />
              <span style="flex:1;">我的文件</span>
              <span style="clear:both;"></span>
            </div>
          </div>
          <div v-show="myFileSettingShow" style="width: 10%; float: right">
            <a-dropdown :trigger="['click']" @openChange="myFileVisibleChange">
              <Icon icon="ant-design:more-outlined" @click.prevent />
              <template #overlay>
                <a-menu @click="dropdownMenuMyClick">
                  <a-menu-item key="log" class="left-menu-item">
                    <Icon icon="ant-design:file-text-outlined" class="icon-menu" />
                    文件夹日志
                  </a-menu-item>
                  <a-menu-item key="recycle" class="left-menu-item">
                    <Icon icon="ant-design:rest-outlined" class="icon-menu" />
                    回收站
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </li>
      <li class="item" :class="type === 'used' ? 'item-active' : ''" @click="handleLiClick('used')">
        <Icon icon="ant-design:field-time-outlined" style="color: #00bcd4; font-size: 16px" />
        <span>最近使用</span>
      </li>
      <li class="item" :class="type === 'star' ? 'item-active' : ''" @click="handleLiClick('star')">
        <Icon icon="ant-design:star-outlined" style="color: #ff9800; font-size: 16px" />
        <span>星标文件</span>
      </li>
    </ul>
    <div style="height: 1px; border-bottom: 1px solid #e0e0e0"></div>
    <div style="margin-top: 10px; display: flex" class="folder-header">
      <a-select style="width: 122px" v-model:value="shareFile" @select="shareFileClick">
        <a-select-option value="allShareFile" class="file-size12">全部共享文件</a-select-option>
        <a-select-option value="iHave" class="file-size12">我拥有的</a-select-option>
        <a-select-option value="iJoin" class="file-size12">我加入的</a-select-option>
      </a-select>
      <Icon icon="ant-design:plus-outlined" class="add-file-icon" @click="addFolderHandleClick"></Icon>
    </div>

    <!--个人/租户-->
    <div class="folder-personal-item" v-for="item in tenantList">
      <div class="folder-personal-title" @click="sildeHandleClick(item, false)">
        <span class="content-name" style="color: rgba(0, 0, 0, 0.32)" :title="item.name">{{ item.name }}</span>
        <span class="slide" style="color: rgba(0, 0, 0, 0.32)">{{ !item.openOff ? '展开' : '关闭' }}</span>
      </div>
      <div v-if="item.openOff && item.fileList && item.fileList.length > 0" class="folder-footer">
        <ul>
          <li
            style="width: 100%; display: flex"
            class="item pointer"
            v-for="file in item.fileList"
            :class="type === file.fileId ? 'item-active' : ''"
            @mouseover="mouseOver(file)"
            @mouseleave="mouseLeave(file)"
          >
            <div style="width: 80%" @click="fileLiHandleClick(file)">
              <Icon icon="ant-design:folder-open-outlined" style="color: rgb(253, 202, 7)" />
              <span>{{ file.fileName }}</span>
            </div>
<!--            <div v-if="file.izStar === '1' && !file.settingShow" style="width: 10%">-->
<!--              <Icon icon="ant-design:star-filled" style="color: #fbc02d" />-->
<!--            </div>-->
            <div v-if="file.settingShow" style="width: 10%">
              <a-dropdown :trigger="['click']" @openChange="(visible) => settingVisibleChange(visible, file)">
                <Icon icon="ant-design:more-outlined" @click.prevent />
                <template #overlay>
                  <a-menu @click="({ key }) => dropdownMenuClick(key, file)">
<!--                    <a-menu-item key="star" class="left-menu-item">-->
<!--                      <Icon icon="ant-design:star-filled" class="icon-menu" />-->
<!--                      {{ file.izStar === '0' ? '标星' : '取消标星' }}-->
<!--                    </a-menu-item>-->
                    <a-menu-item key="share" class="left-menu-item">
                      <Icon icon="ant-design:team-outlined" class="icon-menu" />
                      共享设置
                    </a-menu-item>
                    <a-menu-item key="log" class="left-menu-item">
                      <Icon icon="ant-design:file-text-outlined" class="icon-menu" />
                      文件夹日志
                    </a-menu-item>
                    <a-menu-item key="recycle" class="left-menu-item">
                      <Icon icon="ant-design:rest-outlined" class="icon-menu" />
                      回收站
                    </a-menu-item>
                    <a-menu-item v-if="file.authority == 'owner'" key="delete" class="left-menu-item">
                      <Icon icon="ant-design:delete-outlined" class="icon-menu" />
                      删除文件夹
                    </a-menu-item>
                    <a-menu-item v-else key="exitFolder" class="left-menu-item">
                      <Icon icon="ant-design:export-outlined" class="icon-menu" />
                      退出文件夹
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <!-- 创建文件夹弹窗 -->
  <a-modal
    v-model:open="addFolderShow"
    :title="folderTitle"
    @ok="handleOk"
    @cancel="handleCancel"
    width="500px"
    okText="创建文件夹"
    :okButtonProps="{ class: { 'jee-hidden': isUpdate } }"
    wrapClassName="dialog-create-folder"
  >
    <div class="folder-name">
      <span class="folder-name-text">文件夹名称</span>
      <a-input
        placeholder="请输入文件夹名称"
        class="txt-folder-name"
        v-model:value="fileName"
        @blur="updateFileFolder"
        :disabled="authority === 'readonly' || authority === 'editable'"
      />
<!--      <Icon v-if="izStar === '0'" icon="ant-design:star-filled" class="add-folder-star" @click="starHandleClick" style="color: #99a1ab" />
      <Icon v-else icon="ant-design:star-filled" class="add-folder-star" @click="starHandleClick" style="color: #fbc02d" />-->
    </div>
    <div class="folder-belong">
      <span class="folder-name-text">文件夹归属</span>
      <a-select v-if="!isUpdate" class="txt-folder-name" v-model:value="tenantId" style="width: 324px">
        <a-select-option value="个人">个人</a-select-option>
        <a-select-option v-for="item in tenantSelectList" :value="item.id">{{ item.name }}</a-select-option>
      </a-select>
      <span v-else class="txt-folder-name" style="font-size: 13px; line-height: 35px">{{ tenantName }}</span>
    </div>
    <div class="folder-members">
      <div class="folder-member-box" v-if="authority !== 'readonly'">
        <div class="add-user-member pointer" @click="openHandle">
          <Icon icon="ant-design:plus-circle-outlined" class="add-icon-user" />
          <span>添加协作者</span>
        </div>
      </div>
      <div class="nano-con">
        <ul class="member-list">
          <li class="member-item" v-for="item in invitationUserList">
            <span class="img-member-box">
              <img class="img-charge circle" :src="getAvatar(item.avatar)" />
            </span>
            <span class="member-name ellipsis">{{ item.realname }}</span>
            <span class="permission">
              <span style="width: 85px" v-if="item.authority === 'owner'" class="owner">拥有者</span>
              <a-select
                style="width: 85px"
                v-model:value="item.authority"
                v-else-if="authority === 'owner' || authority === 'admin'"
                @select="(val) => authorityHandleSelect(val, item.id, item.realname)"
              >
                <a-select-option value="admin">管理员</a-select-option>
                <a-select-option value="editable">可编辑</a-select-option>
                <a-select-option value="readonly">只读</a-select-option>
              </a-select>
              <span v-else style="width: 85px">
                <span v-if="item.authority === 'editable'">可编辑</span>
                <span v-else>只读</span>
              </span>
            </span>
            <span
              class="remove-user"
              v-if="authority === 'owner' && item.authority !== 'owner' && userId !== item.id"
              @click="removeUserClick(item.id)"
            >
              移除
            </span>
            <span class="entrusted-folder" v-if="authority === 'owner' && isUpdate && userId === item.id" @click="entrustedFolderClick">
              托付文件夹
            </span>
            <span class="entrusted-folder" v-if="authority !== 'owner' && isUpdate && userId === item.id" @click="exitShare"> 退出 </span>
          </li>
        </ul>
      </div>
    </div>
  </a-modal>
  <!-- 部门选择人员 -->
  <UserSelectByDepModal rowKey="id" labelKey="realname" @register="regModal" @getSelectResult="onSelectOk" :isRadioSelection="isRadioSelection" />
  <!-- 删除共享文件/退出共享弹窗 -->
  <a-modal v-model:open="deleteFolderShow" width="400px">
    <div class="modal-default-title">
      <span v-if="!shareFolderExit">彻底删除共享文件夹"{{ shareFolderName }}"</span>
      <span v-else>退出共享文件夹"{{ shareFolderName }}"</span>
    </div>
    <div class="modal-content" v-if="!shareFolderExit">
      <span
        >共享文件夹将彻底删除，同时删除共享文件夹下所有文件夹和文件，且无法恢复。请确认您和文件夹中的成员都不再需要共享文件夹中的数据再执行此操作</span
      >
    </div>
    <div class="modal-body">
      <a-checkbox v-model:checked="checkedShareFolder">
        <span style="font-size: 13px" v-if="!shareFolderExit">我确定删除此共享文件夹</span>
        <span style="font-size: 13px" v-else>我确定退出此共享文件夹</span>
      </a-checkbox>
    </div>
    <template #footer>
      <button @click="deleteShareCancel" class="delete-cancel-share">取消</button>
      <a-button v-if="!shareFolderExit" @click="deleteShareOk" :class="checkedShareFolder ? 'delete-share' : ''" :disabled="!checkedShareFolder"
        >删除
      </a-button>
      <a-button v-else @click="exitShareOk" :class="checkedShareFolder ? 'delete-share' : ''" :disabled="!checkedShareFolder">退出 </a-button>
    </template>
  </a-modal>

  <a-modal v-model:open="fileLogShow" :title="fileLogTitle" footer="" width="400px">
    <div class="log-file">
      <FileLog ref="fileLogRef" />
    </div>
  </a-modal>
</template>

<script name="eoa-left-file" lang="ts" setup>
  import { defineEmits, ref, unref, nextTick } from 'vue';
  import {
    generateMyFile,
    getCurrentUserTenant,
    getIzRootFolderList,
    createAFolder,
    queryUserByIds,
    updateFile,
    getShareFolder,
    entrustedFolder,
    changeAuth,
    deleteAuth,
    deleteShareFolder,
    addAuthUser,
    editSysFile,
    getAuth,
  } from '../FileList.api';
  import { useUserStore } from '/@/store/modules/user';
  import { cloneDeep } from 'lodash-es';
  import UserSelectByDepModal from '/@/components/Form/src/jeecg/components/modal/UserSelectByDepModal.vue';
  import { useModal } from '/@/components/Modal';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import headerImg from '/@/assets/images/header.jpg';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Modal } from 'ant-design-vue';
  import FileLog from './FileLog.vue';

  // 注册用户选择框
  const [regModal, { openModal }] = useModal();
  const $message = useMessage();
  const userStore = useUserStore();
  const tenantList = ref<any>([]);
  const tenantSelectList = ref<any>([]);
  const type = ref<string>('myFile');
  const shareFile = ref<string>('allShareFile');
  const addFolderShow = ref<boolean>(false);
  const izStar = ref<string>('0');
  const tenantId = ref<string>('个人');
  const fileName = ref<string>('');
  const folderTitle = ref<string>('创建文件夹');
  const emit = defineEmits(['register', 'success', 'click-file-type', 'recycle-upload-list', 'search-list']);
  const userinfo = userStore.getUserInfo;
  const invitationUserList = ref<any>([
    {
      id: userinfo.id,
      avatar: userinfo.avatar,
      authority: 'owner',
      realname: userinfo.realname,
    },
  ]);
  const authority = ref<string>('owner');
  const isUpdate = ref<boolean>(false);
  const tenantName = ref<string>('');
  const isRadioSelection = ref<boolean>(false);
  const userId = userStore.getUserInfo.id;
  const fileLoader = ref<any>({});
  const deleteFolderShow = ref<boolean>(false);
  const checkedShareFolder = ref<boolean>(false);
  const shareFolderName = ref<string>('');
  const shareFileId = ref<string>('');
  const shareFolderExit = ref<boolean>(false);
  const deepCopyList = ref<any>([]);
  const fileLogShow = ref<boolean>(false);
  const fileLogTitle = ref<string>('');
  const fileLogRef = ref();
  const placeholder = ref<string>('在“我的文件中”中搜索');
  const keyWord = ref<string>('');
  const isShowBorderColor = ref<boolean>(false);
  //我的文件id
  const myFileId = ref<string>('');
  //我的文件设置按钮是否隐藏
  const myFileSettingShow = ref<boolean>(false);
  //我的文件设置按钮点击事件
  const dropdownClick = ref<boolean>(false);
  //一级目录id
  const rootId = ref<string>('');
  //父id
  const parentId = ref<string>('');

  /**
   * 标星点击事件
   */
  function starHandleClick() {
    izStar.value = izStar.value === '0' ? '1' : '0';
    if (unref(isUpdate)) {
      updateFile({ izStar: izStar.value, fileId: fileLoader.value.id, userId: userStore.getUserInfo.id, operateType: 'star' }).then((res) => {
        if (res.success) {
          fileLoader.value.izStar = izStar.value;
          $message.createMessage.success('操作成功');
        }
      });
    }
  }

  /**
   * 加载文件名称
   */
  getTenantList();

  /**
   * 加载文件名称
   */
  function getTenantList() {
    getCurrentUserTenant().then((res) => {
      if (res.success) {
        let list = cloneDeep(res.result.list);
        //update-begin---author:wangshuai ---date:20221009  for：[VUEN-2422]没有租户个人也显示------------
        if (list && list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            //update-begin---author:wangshuai ---date:20221111  for：如果分享页面的租户id不空，并且相等，默认打开------------
            if (unref(tenantId) == list[i].id) {
              list[i].openOff = true;
            } else {
              list[i].openOff = false;
            }
            //update-end---author:wangshuai ---date:20221111  for：如果分享页面的租户id不空，并且相等，默认打开--------------
          }
          //分享如果存在租户id不用加载个人下的共享文件夹
          list.push({ name: '个人', id: '个人', openOff: !tenantId.value || tenantId.value == '个人' });
        } else {
          //分享如果存在租户id不用加载个人下的共享文件夹
          list = [{ name: '个人', id: '个人', openOff: !tenantId.value || tenantId.value == '个人' }];
        }
        //update-end---author:wangshuai ---date:20221009  for：[VUEN-2422]没有租户个人也显示--------------
        //点击进来，个人类别默认展开
        //update-begin---author:wangshuai ---date:20221111  for: 默认打开哪一个个人、我的文件、还是租户------------
        //打开个人，并添加选中事件
        if (unref(tenantId) && tenantId.value == '个人') {
          sildeHandleClick({ id: '个人' }, true, unref(rootId));
        } else if (unref(tenantId)) {
          //打开租户，并添加选中事件
          //存在租户id,不用加载个人下的共享文件夹
          sildeHandleClick({ id: tenantId.value }, false, unref(rootId));
        } else {
          //打开个人
          sildeHandleClick({ id: '个人' }, true);
        }
        //update-end---author:wangshuai ---date:20221111  for：默认打开哪一个个人、我的文件、还是租户------------
        deepCopyList.value = cloneDeep(list);
        tenantSelectList.value = res.result.list;
        shareFileClick();
      }
    });
  }

  /**
   * 左侧菜单点击事件
   * @param value
   */
  function handleLiClick(value) {
    type.value = value;
    let fileName = '';
    if (value == 'myFile') {
      fileName = '我的文件';
    } else if (value == 'used') {
      fileName = '最近使用';
    } else {
      fileName = '星标文件';
    }
    placeholder.value = '在' + '“' + fileName + '”中搜索';
    keyWord.value = '';
    let params = {
      fileName: fileName,
      fileType: 'folder',
      izFolder: '1',
      izRootFolder: '1',
      parentId: '',
      storeType: 'manage',
      downCount: 0,
      readCount: 0,
      createBy: userStore.getUserInfo.username,
      delFlag: '0',
    };
    generateMyFile(params).then((res) => {
      if (res.success) {
        //我的文件id
        myFileId.value = res.result.id;
        //update-begin---author:wangshuai ---date:20221111  for: 分享过来的一级目录是否和我的文件id一致------------
        //一级目录id为空或者和生成返回的id不一样，那么就在加载右侧表格
        if (!unref(rootId) || unref(rootId) == unref(myFileId)) {
          type.value = value;
          emit('click-file-type', {
            fileName: fileName,
            parentId: res.result.id,
            firstId: res.result.id,
            type: value != 'myFile' ? value : '',
            leftType: value,
          });
        }
        //update-end---author:wangshuai ---date:20221111  for: 分享过来的一级目录是否和我的文件id一致------------
      }
    });
  }

  /**
   * 添加共享文件夹
   */
  function addFolderHandleClick() {
    //新增的时候设置当前文件夹权限为拥有者
    authority.value = 'owner';
    addFolderShow.value = true;
    isUpdate.value = false;
  }

  /**
   * 创建文件夹点击事件
   */
  function handleOk() {
    if (!unref(fileName)) {
      $message.createMessage.warning('请填写文件夹名称');
      return;
    }
    //update-begin---author:wangshuai---date:2024-06-03---for:【TV360X-790】文件件归属必须选择，否则数据库不会存租户id---
    if(!unref(tenantId)) {
      $message.createMessage.warning('请选择文件夹归属');
      return;
    }
    //update-end---author:wangshuai---date:2024-06-03---for:【TV360X-790】文件件归属必须选择，否则数据库不会存租户id---
    let params = {
      fileName: fileName.value,
      fileType: 'folder',
      izFolder: '1',
      izRootFolder: '1',
      storeType: 'manage',
      izStar: izStar.value,
      userData: JSON.stringify(unref(invitationUserList)),
      tenantId: tenantId.value,
      delFlag: '0',
    };
    //新建文件夹
    createAFolder(params).then((res) => {
      if (res.success) {
        nextTick(() => {
          let value = deepCopyList.value;
          //点击创建没显示
          res.result.fileId = res.result.id;
          res.result.authority = 'owner';
          for (let i = 0; i < value.length; i++) {
            //update-begin---author:wangshuai ---date:20221011  for：[VUEN-2421]点击创建文件夹左侧下拉没有显示--------------
            if (res.result.tenantId == value[i].id) {
              //update-end---author:wangshuai ---date:20221011  for：[VUEN-2421]点击创建文件夹左侧下拉没有显示--------------
              value[i].fileList.unshift(res.result);
            }
          }
          //创建完成之后重新加载表格
          let result = res.result;
          type.value = res.result.id;
          emit('click-file-type', { fileName: result.fileName, parentId: result.id, firstId: result.id, type: '', leftType: res.result.id });
          shareFileClick();
        });
        handleCancel();
      }
    });
  }

  /**
   * 创建文件夹关闭事件
   */
  function handleCancel() {
    //如果是更新共享文件夹的时候
    if (unref(isUpdate)) {
      for (let i = 0; i < tenantList.value.length; i++) {
        let fileList = tenantList.value[i].fileList;
        if (fileList && fileList.length > 0) {
          for (let j = 0; j < fileList.length; j++) {
            if (fileList[j].fileId == fileLoader.value.id) {
              fileList[j].fileName = fileLoader.value.fileName;
              fileList[j].izStar = fileLoader.value.izStar;
              break;
            }
          }
        }
      }
    }
    invitationUserList.value = [
      {
        id: userinfo.id,
        avatar: userinfo.avatar,
        authority: 'owner',
        realname: userinfo.realname,
      },
    ];
    addFolderShow.value = false;
    fileName.value = '';
    izStar.value = '0';
    fileLoader.value = {};
  }

  /**
   * 展开关闭点击事件
   * @param item
   * @param flag
   * @param rootId
   */
  function sildeHandleClick(item, flag, rootId = '') {
    item.openOff = !item.openOff;
    if (item.openOff) {
      let params = { tenantId: item.id, userId: userStore.getUserInfo.id };
      getIzRootFolderList(params).then((res) => {
        if (res.success) {
          if (res.result && res.result.length > 0) {
            let result = res.result;
            for (let i = 0; i < result.length; i++) {
              result[i].settingShow = false;
              //update-begin---author:wangshuai ---date:20221111  for: 增加选中颜色，并传递点击事件------------
              if (rootId && rootId === result[i].fileId) {
                type.value = rootId;
                emit('click-file-type', { fileName: result[i].fileName, parentId: unref(parentId), firstId: unref(rootId), leftType: unref(rootId) });
              }
              //update-end---author:wangshuai ---date:20221111  for: 增加选中颜色，并传递点击事件------------
            }
            //是否首次加载个人
            if (flag) {
              let length = tenantList.value.length;
              tenantList.value[length - 1].fileList = result;
            } else {
              //update-begin---author:wangshuai---date:2024-01-05---for:分享文件首次加载租户下的共享文件夹未显示---
              let index = tenantList.value.findIndex((itemList)=>itemList.id == item.id);
              if(index != -1){
                tenantList.value[index].fileList = result;
              }
              //update-end---author:wangshuai---date:2024-01-05---for:分享文件首次加载租户下的共享文件夹未显示---
            }
            deepCopyList.value = cloneDeep(tenantList.value);
            shareFileClick();
          } else {
            item.fileList = [];
            deepCopyList.value = cloneDeep(tenantList.value);
            shareFileClick();
          }
        }
      });
    }
  }

  /**
   * 文件夹点击事件
   */
  function fileLiHandleClick(item) {
    type.value = item.fileId;
    //设置搜索内容
    placeholder.value = '在' + '“' + item.fileName + '”中搜索';
    keyWord.value = '';
    //点击左侧获取文件夹权限,避免不是实时权限
    emit('click-file-type', { fileName: item.fileName, parentId: item.fileId, firstId: item.fileId, leftType: item.fileId });
  }

  /**
   * 鼠标移入事件
   * @param file
   */
  function mouseOver(file) {
    file.settingShow = true;
  }

  /**
   * 鼠标移出事件
   * @param file
   */
  function mouseLeave(file) {
    //如果当前不是下拉菜单，那么点击的样式应该去掉
    if (!file.dropdownClick) {
      file.settingShow = false;
    }
  }

  /**
   * 下拉菜单显示隐藏事件
   * @param visible
   * @param file
   */
  function settingVisibleChange(visible, file) {
    if (visible) {
      file.dropdownClick = true;
    } else if (!visible) {
      //如果下拉菜单是隐藏状态,那么设置按钮就隐藏掉
      file.settingShow = false;
      file.dropdownClick = false;
    }
  }

  /**
   * 打开用户选择框
   */
  function openHandle() {
    isRadioSelection.value = false;
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 选择用户成功
   * @param selectKeys
   * @param selectRows
   */
  function onSelectOk(selectRows, selectKeys) {
    if (unref(isRadioSelection)) {
      //如果是单选的情况下说明当前是委托用户
      entrustedFolder({ msgTo: selectKeys[0], userId: userinfo.id, fileId: fileLoader.value.id }).then((res) => {
        if (res.success) {
          getShareFolder({ fileId: fileLoader.value.id }).then((res) => {
            if (res.success) {
              setInvitaion(res);
            }
          });
        }
      });
    } else {
      //如果是多选的情况下说明当前是添加用户
      if (selectKeys && selectKeys.length > 0) {
        queryUserByIds({ userIds: selectKeys.join(',') }).then((res) => {
          if (res.success) {
            //排除用户合并
            let data: any = [];
            //排除用户(只添加没有的，用户新增权限用户)
            let userIdData: any = [];
            for (let i = 0; i < res.result.length; i++) {
              if (!unref(invitationUserList) || unref(invitationUserList).length !== 0) {
                let filter = invitationUserList.value.filter((item) => item.id == res.result[i].id);
                if (filter.length == 0) {
                  data.push(Object.assign({ authority: 'editable' }, res.result[i]));
                  userIdData.push(Object.assign({ authority: 'editable' }, res.result[i]));
                }
              } else {
                data.push(Object.assign({ authority: 'editable' }, res.result[i]));
                userIdData.push(Object.assign({ authority: 'editable' }, res.result[i]));
              }
            }
            if (unref(isUpdate)) {
              //如果是编辑状态，那么就更新权限表
              addToAuthUser(userIdData, data);
            } else {
              invitationUserList.value.push(...data);
            }
          }
        });
      }
    }
  }

  /**
   * 添加成员权限
   */
  function addToAuthUser(userIdData, data) {
    if (userIdData.length > 0) {
      addAuthUser({ userData: JSON.stringify(userIdData), id: fileLoader.value.id }).then((res) => {
        if (res.success) {
          $message.createMessage.success('邀请成功');
          invitationUserList.value.push(...data);
        }
      });
    } else {
      $message.createMessage.warning('您邀请的用户已在该文件夹中');
    }
  }

  /**
   * 设置用户数据列表
   */
  function setInvitaion(data) {
    invitationUserList.value = data.result.authVoList;
    for (let i = 0; i < data.result.authVoList.length; i++) {
      if (unref(userId) == data.result.authVoList[i].id) {
        authority.value = data.result.authVoList[i].authority;
        break;
      }
    }
  }

  /**
   * 下拉菜单点击事件
   * @param key
   * @param file
   */
  function dropdownMenuClick(key, file) {
    file.settingShow = false;
    file.dropdownClick = false;
    //标星
    if (key === 'star') {
      updateIzStart(file);
    } else if (key === 'share') {
      //共享设置
      settingShareFile(file);
    } else if (key === 'recycle') {
      //回收站
      emit('recycle-upload-list', { fileId: file.fileId, recycleName: file.fileName });
    } else if (key === 'delete') {
      deleteFile(file);
    } else if (key === 'exitFolder') {
      exitFile(file);
    } else if (key === 'log') {
      getFileLog(file);
    }
  }

  /**
   * 更新标星事件
   */
  function updateIzStart(file) {
    let izStar = file.izStar === '0' ? '1' : '0';
    updateFile({ izStar: izStar, fileId: file.fileId, userId: userStore.getUserInfo.id, operateType: 'star' });
    file.izStar = izStar;
  }

  /**
   * 设置分享文件
   */
  function settingShareFile(file) {
    if (file.tenantId === '个人') {
      tenantName.value = file.tenantId;
    } else {
      for (let i = 0; i < tenantList.value.length; i++) {
        let id = tenantList.value[i].id;
        if (id === parseInt(file.tenantId)) {
          tenantName.value = tenantList.value[i].name;
          break;
        }
      }
    }
    //获取共享文件夹
    getShareFolder({ fileId: file.fileId }).then((res) => {
      if (res.success) {
        fileLoader.value = res.result.sysFile;
        fileName.value = res.result.sysFile.fileName;
        tenantId.value = res.result.sysFile.tenantId;
        izStar.value = res.result.sysFile.izStar;
        setInvitaion(res);
        addFolderShow.value = true;
        folderTitle.value = '共享设置';
        isUpdate.value = true;
      }
    });
  }

  /**
   *
   * 托付文件夹
   */
  function entrustedFolderClick() {
    isRadioSelection.value = true;
    openModal(true, {
      isUpdate: false,
    });
  }

  /**
   * 删除共享文件
   * @param file
   */
  function deleteFile(file) {
    deleteFolderShow.value = true;
    shareFolderName.value = file.fileName;
    shareFileId.value = file.fileId;
    shareFolderExit.value = false;
  }

  /**
   * 退出共享文件
   * @param file
   */
  function exitFile(file) {
    deleteFolderShow.value = true;
    shareFolderName.value = file.fileName;
    shareFileId.value = file.fileId;
    shareFolderExit.value = true;
  }

  /**
   * 删除共享文件夹按钮事件
   */
  function deleteShareCancel() {
    deleteFolderShow.value = false;
    shareFolderName.value = '';
    checkedShareFolder.value = false;
  }

  /**
   * 共享文件删除确定事件
   */
  function deleteShareOk() {
    deleteShareFolder({ fileId: unref(shareFileId) }).then((res) => {
      if (res.success) {
        setTenantList(unref(shareFileId));
        deleteShareCancel();
        handleLiClick('myFile');
      }
    });
  }

  /**
   * 共享文件退出确定事件
   */
  function exitShareOk() {
    deleteAuth({ fileId: unref(shareFileId), userId: userinfo.id, moveType:'exit' }).then((res) => {
      if (res.success) {
        setTenantList(unref(shareFileId));
        deleteShareCancel();
        handleLiClick('myFile');
      } else {
        $message.createMessage.warning(res.message);
      }
    });
  }

  /**
   * 加载本地头像
   * @param avatar
   */
  function getAvatar(avatar) {
    if (avatar) {
      return getFileAccessHttpUrl(avatar);
    }
    return headerImg;
  }

  /**
   * 移除用户
   * @param id
   */
  function removeUserClick(id) {
    Modal.confirm({
      title: '操作提示',
      content: '是否确定移除该成员',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        deleteAuth({ fileId: fileLoader.value.id, userId: id, moveType:'remove' }).then((res) => {
          if (res.success) {
            invitationUserList.value = invitationUserList.value.filter((item) => item.id != id);
          }
        });
      },
    });
  }

  /**
   * 更新文件名称
   */
  function updateFileFolder() {
    if (unref(isUpdate)) {
      editSysFile({ fileName: fileName.value, fileId: fileLoader.value.id, type: 'rename' }).then((res) => {
        if (res.success) {
          $message.createMessage.success('操作成功');
          fileLoader.value.fileName = fileName.value;
        }
      });
    }
  }

  /**
   * 下拉权限点击事件
   * @param val
   * @param userId
   */
  function authorityHandleSelect(val, userId, realname) {
    if (isUpdate) {
      changeAuth({ authority: val, fileId: fileLoader.value.id, userId: userId, realname: realname }).then((res) => {
        if (res.success) {
          $message.createMessage.success('操作成功');
        }
      });
    }
  }

  /**
   * 退出共享文件
   */
  function exitShare() {
    Modal.confirm({
      title: '操作提示',
      content: '是否确定退出该共享文件夹?',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        deleteAuth({ fileId: fileLoader.value.id, userId: userinfo.id, moveType:'exit' }).then((res) => {
          if (res.success) {
            addFolderShow.value = false;
            setTenantList(fileLoader.value.id);
          }
        });
      },
    });
  }

  /**
   * 设置左侧列表赖加载
   * @param params
   */
  function setTenantList(fileId) {
    for (let i = 0; i < tenantList.value.length; i++) {
      let fileList = tenantList.value[i].fileList;
      if (fileList && fileList.length > 0) {
        for (let j = 0; j < fileList.length; j++) {
          if (fileList[j].fileId == fileId) {
            fileList.splice(j, 1);
            return;
          }
        }
      }
    }
  }

  /**
   * 共享文件夹点击下拉框点击事件
   */
  function shareFileClick() {
    let val = shareFile.value;

    let type = 'owner';
    if (val === 'allShareFile') {
      tenantList.value = deepCopyList.value;
      return;
    } else if (val === 'iJoin') {
      type = 'admin,editable,readonly';
    }
    let deepCopy: any = [];
    let copyList = cloneDeep(deepCopyList.value);
    for (let i = 0; i < copyList.length; i++) {
      let fileList = copyList[i].fileList;
      let data = copyList[i];
      let copyFileList: any = [];
      if (fileList && fileList.length > 0) {
        for (let j = 0; j < fileList.length; j++) {
          if (type.indexOf(fileList[j].authority) != -1) {
            copyFileList.push(fileList[j]);
          }
        }
      }
      data.fileList = copyFileList;
      deepCopy.push(data);
    }
    tenantList.value = deepCopy;
  }

  /**
   * 获取文件日志
   * @param record
   */
  function getFileLog(record) {
    fileLogShow.value = true;
    nextTick(() => {
      fileLogTitle.value = record.fileName;
      fileLogRef.value.loadFileLog(record.fileId);
    });
  }

  /**
   * 回车文件搜索
   */
  function handlePressEnter() {
    emit('search-list', unref(keyWord));
  }

  /**
   * 更新文本内容
   * @param value
   */
  function updatePlaceholder(value) {
    placeholder.value = value;
  }

  /**
   * 清空搜索
   */
  function updateKeyWord() {
    keyWord.value = '';
  }

  /**
   * 更新选中值
   * @param value
   */
  function updateFileType(value) {
    //update-begin---author:wangshuai---date:2024-07-02---for:【TV360X-1393】知识库搜索之后 如果刚好是在我的文件里面，点击之后我的文件不是选中状态---
    type.value = value === myFileId.value ? 'myFile' : value;
    //update-end---author:wangshuai---date:2024-07-02---for:【TV360X-1393】知识库搜索之后 如果刚好是在我的文件里面，点击之后我的文件不是选中状态---
  }

  /**
   * 我的文件下拉点击事件
   */
  function dropdownMenuMyClick({ key }) {
    if (key === 'recycle') {
      //回收站
      emit('recycle-upload-list', { fileId: unref(myFileId), recycleName: '我的文件' });
    } else if (key === 'log') {
      //日志文件
      getFileLog({ fileId: unref(myFileId), fileName: '我的文件' });
    }
    dropdownClick.value = false;
    myFileSettingShow.value = false;
  }

  /**
   * 设置我的文件下拉菜单是否隐藏
   */
  function myFileVisibleChange(visible) {
    if (visible) {
      dropdownClick.value = true;
    } else if (!visible) {
      //如果下拉菜单是隐藏状态,那么设置按钮就隐藏掉
      myFileSettingShow.value = false;
      dropdownClick.value = false;
    }
  }

  /**
   * 我的文件鼠标移出事件
   */
  function myFileMouseLeave() {
    if (!unref(dropdownClick)) {
      myFileSettingShow.value = false;
    }
  }

  /**
   * 设置文件类别
   * @param rId
   * @param tId
   */
  function setFileType(rId, tId, pId) {
    rootId.value = rId;
    tenantId.value = tId;
    parentId.value = pId;
    //获取父级id
    handleLiClick('myFile');
  }

  /**
   * 清空id
   */
  function clearIds() {
    rootId.value = '';
    tenantId.value = '个人';
    parentId.value = '';
  }
  defineExpose({
    updatePlaceholder,
    updateKeyWord,
    updateFileType,
    setFileType,
    clearIds,
  });
</script>

<style scoped lang="less">
  .left-content {
    float: left;
    width: 100%;
    background: white;
    border-right: 1px solid #e0e0e0;
    height: 100%;
    padding: 10px 10px;

    .item span {
      margin-left: 10px;
      font-size: 13px;
    }
  }

  .left-file li {
    height: 40px !important;
    line-height: 40px !important;
    padding-left: 10px;
  }

  .left-file .item {
    &:hover {
      background: rgb(235, 235, 235);
    }
  }

  .pointer {
    cursor: pointer;
  }

  .item-active {
    background: #bbdefb;
  }

  .folder-header {
    color: #fff;
    font-size: 12px;
    height: 32px;
    line-height: 32px;
    padding: 0 15px;
    width: 100%;
    justify-content: space-between;

    :deep(.ant-select-selector) {
      font-size: 12px;
      height: 30px !important;
    }

    :deep(.ant-select-arrow) {
      top: 48% !important;
    }
  }

  .file-size12 {
    font-size: 12px !important;
  }

  .add-file-icon {
    color: rgba(0, 0, 0, 0.54);
    float: right;
    font-size: 18px !important;
    position: relative;
    cursor: pointer;
    top: 6px;
  }

  .folder-name-text {
    line-height: 36px;
    margin-right: 10px;
    vertical-align: top;
    font-size: 12px;
  }

  .txt-folder-name {
    height: 35px;
    width: 325px;
  }

  .folder-name {
    box-sizing: border-box;
    display: flex;
    padding: 18px 20px;
  }

  .add-folder-star {
    cursor: pointer;
    display: inline-block;
    font-size: 20px !important;
    line-height: 20px;
    margin-left: 13px;
    vertical-align: middle;
    margin-top: 6px;
  }

  .folder-belong {
    box-sizing: border-box;
    display: flex;
    padding: 10px 20px;
  }

  .folder-personal-item .folder-personal-title {
    align-items: center;
    cursor: pointer;
    display: flex;
    height: 40px;
    overflow: hidden;
    padding: 0 40px 0 15px;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .slide {
    cursor: pointer !important;
    line-height: 40px;
    position: absolute;
    right: 10px;
    top: 0;
    visibility: hidden;
  }

  .folder-personal-title:hover {
    .slide {
      visibility: visible;
    }
  }

  .folder-footer {
    list-style-type: none;
    user-select: none;
  }

  .folder-footer .item {
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    padding-left: 15px;
  }

  .folder-footer li {
    &:hover {
      background: rgb(235, 235, 235);
    }
  }

  .folder-members {
    margin-top: 10px;
  }

  .folder-member-box {
    display: inline-block;
    vertical-align: top;
    width: 100%;
  }

  .add-user-member {
    height: 30px;
    line-height: 30px;
    margin-bottom: 12px;
    width: 460px;
    color: #1e88e5;
    padding-left: 18px;
  }

  .add-icon-user {
    cursor: pointer;
    display: inline-block;
    font-size: 24px;
    padding-right: 8px;
    margin-top: 2px;
  }

  .nano-con {
    padding-left: 18px;
    overflow: hidden;

    .member-list {
      max-height: 300px;
    }

    .member-list :hover {
      .remove-user {
        display: block;
      }
    }

    ul li span {
      display: inline-block;
      font-size: 14px;
      height: 40px;
      line-height: 40px;
    }

    .member-item {
      display: flex;
      height: 44px;
      vertical-align: middle;
      cursor: pointer;
      margin-right: 30px;

      .img-member-box {
        line-height: 0;
        cursor: pointer;
        margin-right: 30px;
      }

      .permission {
        .owner {
          color: #00c957;
        }
      }

      .img-charge {
        height: 28px;
        width: 28px;
        border-radius: 50%;
        margin-top: 6px;
      }

      .remove-user {
        color: rgb(153, 153, 153);
        display: none;
        margin-left: 10px;
      }
    }

    .member-name {
      margin-right: 20px;
      width: 150px;
    }
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    white-space: nowrap;
  }
</style>
<style lang="less">
  .jee-hidden {
    display: none;
  }

  .left-menu-item {
    color: #666666;
    font-size: 13px;
    height: 32px !important;
    line-height: 20px !important;

    .icon-menu {
      font-size: 13px !important;
    }
  }

  .left-menu-item:hover {
    background-color: #1e88e5 !important;
    color: white !important;
  }

  .entrusted-folder {
    color: #999;
    cursor: pointer;
    max-width: 90px;
    margin-left: 10px;
  }

  .modal-default-title {
    font-size: 17px;
    font-weight: 400;
    color: #f44336;
    padding: 16px;
  }

  .modal-content {
    color: #757575;
    font-size: 14px;
    line-height: 20px;
    padding-left: 16px;
    padding-right: 16px;
    word-break: break-all;
  }

  .modal-body {
    box-sizing: border-box;
    flex: 1;
    overflow: auto;
    padding: 10px 16px 15px;
  }

  .delete-share {
    background-color: #f44336;
    color: white;
  }

  .delete-share:hover {
    background-color: #f44336 !important;
    border-color: #f44336 !important;
    color: white !important;
  }

  .delete-cancel-share {
    background: transparent;
    color: #9e9e9e;
    //update-begin---author:wangshuai ---date: 20230828  for：文件共享文件夹删除取消样式按钮问题------------
    border-color: transparent;
    cursor: pointer;
    //update-end---author:wangshuai ---date: 20230828 for：文件共享文件夹删除取消样式按钮问题------------  
  }
  .log-file {
    overflow-y: auto;
    height: 450px;
  }
  .file-search {
    border-bottom: 1px solid rgba(0, 0, 0, 0.32) !important;
    box-sizing: border-box;
    height: 38px;
    margin: 6px auto;
    -moz-border-radius: 5px;
    -webkit-border-radius: 5px;
    border-radius: 5px;
    display: flex;
  }
  .border-color {
    border-color: #1e88e5 !important;
  }
  .file-search-box {
    border: none !important;
    height: 25px;
    line-height: 25px;
    margin-top: 7px;
    padding: 0 5px 0 2px;
    width: 100%;
    box-shadow: none !important;
  }
  .icon-search {
    display: inline-block;
    font-size: 20px;
    color: rgba(0, 0, 0, 0.54);
    margin: 12px 9px 9px;
  }
  .content-name{
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
  }
</style>
<style>
  .dialog-create-folder .ant-modal-close-x {
    width: 60px !important;
    height: 50px !important;
    line-height: 50px !important;
  }
</style>
