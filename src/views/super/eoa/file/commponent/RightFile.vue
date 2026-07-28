<template>
  <div :style="menuWidth" style="float: left; padding-left: 10px" class="file-menu">
    <a-table
      :loading="loading"
      :pagination="iPagination"
      rowKey="id"
      :row-selection="rowSelection"
      :columns="tableColumns"
      :dataSource="dataSource"
      :customRow="customRow"
      @change="handleTableChange"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'fileName'">
          <span v-if="selectedRowKeys.length < 2"> 文件名称 </span>
          <div v-if="selectedRowKeys.length > 1 && delFlag === '0'">
            <span>已选中{{ selectedRowKeys.length }}项</span>
            <span class="header-icon" v-if="authority !== 'readonly'">
              <a-tooltip title="批量下载" placement="bottom">
                <Icon class="pointer header-icon-color" icon="ant-design:cloud-download-outlined" @click="batchDownFiles" />
              </a-tooltip>
            </span>
            <span class="header-icon" v-if="authority !== 'readonly'">
              <a-tooltip title="批量移动" placement="bottom">
                <Icon class="pointer header-icon-color" icon="ant-design:swap-outlined" @click="moveFile(selectedRowKeys.join(','))" />
              </a-tooltip>
            </span>
            <span class="header-icon">
              <a-tooltip title="批量复制" placement="bottom">
                <Icon class="pointer header-icon-color" icon="ant-design:copy-outlined" @click="copyFile(selectedRowKeys.join(','))" />
              </a-tooltip>
            </span>
            <span class="header-icon" v-if="authority !== 'readonly' && authority !== 'editable'">
              <a-tooltip title="批量删除" placement="bottom">
                <Icon class="pointer header-icon-color" icon="ant-design:delete-outlined" @click="batchDeleteFiles" />
              </a-tooltip>
            </span>
          </div>
          <div v-if="selectedRowKeys.length > 1 && delFlag === '1'">
            <span>已选中{{ selectedRowKeys.length }}项</span>
            <span class="header-icon" v-if="authority !== 'readonly' && authority !== 'editable'">
              <a-tooltip title="批量彻底删除" placement="bottom">
                <Icon class="pointer header-icon-color" icon="ant-design:delete-outlined" @click="removeCompletelyFile(selectedRowKeys.join(','))" />
              </a-tooltip>
            </span>
            <span class="header-icon" v-if="authority !== 'readonly' && authority !== 'editable'">
              <a-tooltip title="批量还原" placement="bottom">
                <Icon class="pointer header-icon-color" icon="ant-design:rollback-outlined" @click="batchReductionFiles(selectedRowKeys.join(','))" />
              </a-tooltip>
            </span>
          </div>
        </template>
      </template>
      <template v-slot:bodyCell="{ column, record, text }">
        <template v-if="column.key === 'fileName'">
          <div class="editable-cell">
            <div v-if="editableData[record.id]" class="editable-cell-input-wrapper">
              <a-input
                :ref="(el) => setItemRef(el, `rename${record.id}`)"
                style="width: 90%"
                v-model:value="editableData[record.id].fileName"
                @blur="inputSave(record.id)"
                @pressEnter="inputSave(record.id)"
              />
            </div>
            <div v-else class="editable-cell-text-wrapper">
              <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap" v-if="record.fileType !== 'folder'" class="pointer">
                <img class="file-image" v-if="record.fileType === 'image'" :src="getImageSrc(record.url)" @click="handleTextClick(record)" />
                <Icon
                  v-else-if="record.fileType === 'excel'"
                  class="file-icon"
                  icon="ant-design:file-excel-outlined"
                  style="color: rgb(98, 187, 55)"
                  @click="handleTextClick(record)"
                />
                <Icon
                  v-else-if="record.fileType === 'pdf'"
                  class="file-icon"
                  icon="ant-design:file-pdf-outlined"
                  style="color: rgb(211, 47, 47)"
                  @click="handleTextClick(record)"
                />
                <Icon
                  v-else-if="record.fileType === 'doc'"
                  class="file-icon"
                  icon="ant-design:file-word-outlined"
                  style="color: rgb(68, 138, 255)"
                  @click="handleTextClick(record)"
                />
                <Icon
                  v-else-if="record.fileType === 'pp'"
                  class="file-icon"
                  icon="ant-design:file-ppt-outlined"
                  style="color: rgb(245, 124, 0)"
                  @click="handleTextClick(record)"
                />
                <Icon
                  v-else-if="record.fileType === 'video'"
                  class="file-icon"
                  icon="ant-design:play-square-outlined"
                  style="color: rgb(119, 87, 188)"
                  @click="handleTextClick(record)"
                />
                <Icon
                  v-else-if="record.fileType === 'text'"
                  class="file-icon"
                  icon="ant-design:file-text-outlined"
                  style="color: rgb(41, 211, 178)"
                  @click="handleTextClick(record)"
                />
                <Icon
                  v-else-if="record.fileType === 'zip'"
                  class="file-icon"
                  icon="ant-design:file-zip-outlined"
                  style="color: rgb(253, 202, 7)"
                  @click="handleTextClick(record)"
                />
                <img :src="LinkImg" v-else-if="(record.ext = 'url')" class="file-image" @click="handleTextClick(record)" />
                <Icon v-else class="file-icon" icon="ant-design:file-unknown-outlined" @click="handleTextClick(record)" />
                <span
                  v-if="record.fileType === 'image' || record.ext === 'url'"
                  style="margin-left: 8px"
                  class="file-text"
                  @click="handleTextClick(record)"
                  >{{ text + '.' + record.ext }}</span
                >
                <span v-else style="margin-left: 30px" class="file-text" @click="handleTextClick(record)">{{ text + '.' + record.ext }}</span>
                <Icon class="icon-star" v-if="record.izStar === '1'" icon="ant-design:star-outlined"></Icon>
              </div>
              <div v-else class="pointer" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                <Icon
                  @click="handleTextClick(record)"
                  icon="ant-design:folder-open-outlined"
                  class="file-icon"
                  style="margin-left: 2px; width: 23px; color: rgb(253, 202, 7)"
                />
                <span class="file-text" style="margin-left: 30px" @click="handleTextClick(record)">{{ text }}</span>
              </div>
              <div class="editable-cell-icon" v-if="selectedRowKeys.length < 2">
                <Icon v-if="delFlag === '0'" style="top: -6px" icon="ant-design:share-alt-outlined" class="header-icon-color pointer" @click="onShareFile(record)" />
                <Icon
                  style="top: -6px; left: 10px"
                  v-if="
                    (authority === 'editable' && record.enableDown === '1') ||
                    record.createBy === createBy ||
                    authority === 'owner' ||
                    authority === 'admin'
                  "
                  class="header-icon-color pointer"
                  icon="ant-design:cloud-download-outlined"
                  @click="downFile(record)"
                />
                <a-dropdown :trigger="['click']">
                  <Icon class="header-icon-color pointer" style="top: -6px; left: 20px" icon="ant-design:ellipsis-outlined" @click.prevent />
                  <template #overlay>
                    <a-menu class="menu-more" v-if="delFlag === '1'">
                      <span
                        style="text-align: center; display: block"
                        v-if="authority === 'readonly' || (authority === 'editable' && record.createBy !== createBy)"
                        >暂无权限</span
                      >
                      <a-menu-item
                        key="0"
                        v-if="(authority !== 'readonly' && authority !== 'editable') || (authority === 'editable' && record.createBy === createBy)"
                      >
                        <div @click="reductionFile(record)">
                          <Icon class="table-icon-color pointer" icon="ant-design:rollback-outlined" />
                          <span class="table-font-size">还原</span>
                        </div>
                      </a-menu-item>
                      <a-menu-item
                        key="1"
                        v-if="(authority !== 'readonly' && authority !== 'editable') || (authority === 'editable' && record.createBy === createBy)"
                      >
                        <div @click="removeCompletelyFile(record.id)">
                          <Icon class="table-icon-color pointer" icon="ant-design:delete-filled" />
                          <span class="table-font-size">彻底删除</span>
                        </div>
                      </a-menu-item>
                    </a-menu>
                    <a-menu class="menu-more" v-else>
                      <a-menu-item
                        key="0"
                        v-if="
                          record.ext === 'url' &&
                          ((authority === 'editable' && record.enableUpdat === '1') || authority === 'owner' || authority === 'admin')
                        "
                      >
                        <div @click="editLink(record)">
                          <Icon class="table-icon-color pointer" icon="ant-design:edit-outlined" />
                          <span class="table-font-size">编辑</span>
                        </div>
                      </a-menu-item>
                      <a-menu-item key="8" v-if="record.izFolder === '0'">
                        <div @click="starUpdate(record)">
                          <Icon class="table-icon-color pointer" icon="ant-design:star-outlined" />
                          <span class="table-font-size">{{ record.izStar === '0' ? '标星' : '取消标星' }}</span>
                        </div>
                      </a-menu-item>
                      <a-menu-divider v-if="record.izFolder === '0'" />
                      <a-menu-item
                        key="1"
                        v-if="(authority === 'editable' && record.enableUpdat === '1') || authority === 'owner' || authority === 'admin'"
                      >
                        <div @click="inputEdit(record.id)">
                          <Icon class="table-icon-color pointer" icon="ant-design:edit-outlined" />
                          <span class="table-font-size">重命名</span>
                        </div>
                      </a-menu-item>
                      <a-menu-item
                        key="3"
                        v-if="
                          record.izFolder === '0' &&
                          ((authority === 'editable' && record.enableUpdat === '1') || authority === 'owner' || authority === 'admin')
                        "
                      >
                        <div @click="uploadNewFile(record)">
                          <Icon class="table-icon-color pointer" icon="ant-design:cloud-sync-outlined" />
                          <span class="table-font-size">上传新版本</span>
                        </div>
                      </a-menu-item>
                      <a-menu-item
                        key="4"
                        v-if="(authority === 'editable' && record.enableUpdat === '1') || authority === 'owner' || authority === 'admin'"
                      >
                        <div @click="moveFile(record.id)">
                          <Icon class="table-icon-color pointer" icon="ant-design:swap-outlined" />
                          <span class="table-font-size">移动到...</span>
                        </div>
                      </a-menu-item>
                      <a-menu-item key="5">
                        <div @click="copyFile(record.id)">
                          <Icon class="table-icon-color pointer" icon="ant-design:copy-outlined" />
                          <span class="table-font-size">复制到...</span>
                        </div>
                      </a-menu-item>
                      <a-menu-item key="6" v-if="authority !== 'readonly' && (authority !== 'editable' || record.createBy === createBy)">
                        <div @click="deleteFiles(record.id)">
                          <Icon class="table-icon-color pointer" icon="ant-design:delete-outlined" />
                          <span class="table-font-size">删除</span>
                        </div>
                      </a-menu-item>
                      <a-menu-item key="7">
                        <div @click="setProperty(record)">
                          <Icon class="table-icon-color pointer" icon="ant-design:info-circle-filled" />
                          <span class="table-font-size">属性</span>
                        </div>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </div>
        </template>
      </template>
    </a-table>
    <select-folder ref="selectFolder" @ok="folderHandleOk"></select-folder>
    <!--文件上传-->
    <input ref="fileUploadRef" class="img-upload-input" type="file" @change="submitUpload" style="display: none" />
    <!--上传新版本-->
    <UploadNewVersion ref="uploadNewVersionRef" @ok="uploadNewFileOk" />
    <!--属性-->
    <FileAttributes ref="fileAttributesRef" @ok="uploadNewFileOk" @expand="expandHandleClick" @refresh="refresh" @load-table="loadTable"/>
    <FileLink ref="fileLinkRef" @ok="getFileList" />
    <!--分享-->
    <a-modal v-model:open="shareVisible" wrapClassName="modal" :footer="null">
      <template #title>
        <div class="share">
          <span style="font-size: 17px; font-weight: normal">分享</span>
          <div>
            <FileIcon ref="fileIconRef"/>
          </div>
        </div>
      </template>
      <div class="file-form" style="margin-top: 20px">
        <div class="file-item">
          <div class="file-item-label">名称</div>
          <div :title="rowData.fileName">
            <span class="file-item-content" style="width: 90%; display: block">{{ rowData.fileName }}</span>
          </div>
        </div>
        <div class="file-item">
          <div class="file-item-label">分享链接</div>
          <div style="padding-top: 6px; width: 280px; float: left" class="pointer">
            <a-dropdown :trigger="['click']">
              <span class="ant-dropdown-link" @click.prevent>
                {{ sharePermsText }}
                <Icon icon="ant-design:down-outlined" />
              </span>
              <template #overlay>
                <a-menu @click="dropdownMenuClick" v-model:value="rowData.sharePerms">
                  <a-menu-item key="1">
                    <span>关闭分享</span>
                  </a-menu-item>
                  <a-menu-item key="3">
                    <span>允许任何人查看</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
        <div v-if="rowData.sharePerms === '1'" class="file-item closed-tip" style="float: left; width: 100%">
          <div class="file-item-label"></div>
          <div style="font-size: 13px"> 链接已关闭，开启后可进行共享 </div>
        </div>
        <div v-else style="width: 100px; float: left">
          <a-popover placement="bottom" style="width: 346px">
            <template #content>
              <a-input id="copyFile" class="share-input" v-model:value="rowData.shareUrl"></a-input>
              <span class="share-span" @click="copyLinkClick">复制链接</span>
            </template>
            <a-button>
              <template #icon>
                <Icon icon="ant-design:link-outlined" />
              </template>
              <span>复制链接</span>
            </a-button>
          </a-popover>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" name="eoa-right-file" setup>
  import {reactive, ref, computed, unref, nextTick, defineEmits, onMounted, onUnmounted } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { columns, miniColumns } from '../FileList.data';
  import {
    list,
    saveFile,
    editSysFile,
    deleteFile,
    moveFiles,
    copyFiles,
    removeCompletely,
    updateFile,
    updateDownNum,
    edit,
    downLoadFiles,
    batchDeleteFile,
    batchReductionFile,
    getRecycleBinList,
    updateReadCount,
  } from '../FileList.api';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { useGlobSetting } from '/@/hooks/setting';
  import SelectFolder from './SelectFolder.vue';
  import { useContextMenu } from '/@/hooks/web/useContextMenu';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { Modal } from 'ant-design-vue';
  import UploadNewVersion from './UploadNewVersion.vue';
  import FileAttributes from './FileAttributes.vue';
  import FileLink from './FileLink.vue';
  import { getToken } from '/@/utils/auth';
  import LinkImg from '/@/assets/images/link.png';
  import FileIcon from './FileIcon.vue';
  import { router } from "/@/router";
  import {encryptByBase64} from "@/utils/cipher";

  const tableColumns = ref<any>(columns);
  const globSetting = useGlobSetting();
  const baseUploadUrl = globSetting.uploadUrl;
  const loading = ref<boolean>(false);
  const authority = ref<string>('');
  const userStore = useUserStore();
  const $message = useMessage();
  const dataSource = ref<any>([]);
  const rowSelection = computed(() => {
    return {
      selectedRowKeys: unref(selectedRowKeys),
      onChange: onSelectChange,
    };
  });
  const shareFile = ref<string>('allShareFile');
  const selectedRowKeys = ref<any>([]);
  let inputRefs: any = {};
  const onSelectChange = (changableRowKeys) => {
    selectedRowKeys.value = changableRowKeys;
  };
  const menuData = ref<any>([]);
  const editableData = reactive({});
  const rowData = ref<any>({});
  const parentId = ref<string>('');
  const titleData = ref<any>([]);
  const emit = defineEmits(['register', 'setTitleData', 'update-input']);
  const dataList = ref<any>();
  const delFlag = ref<string>('0');
  const pageSetting = {
    total: 0,
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '30'],
    showTotal: (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条';
    },
    showQuickJumper: true,
    showSizeChanger: true,
  };
  const iPagination = ref<any>(pageSetting);
  const fileUploadRef = ref();
  const firstTitle = ref<string>('');
  const uploadNewVersionRef = ref();
  const fileAttributesRef = ref();
  const menuWidth = ref<any>({ width: 'calc(100% - 260px)' });
  const expand = ref<boolean>(false);
  const rootId = ref<string>('');
  const type = ref<string>('');
  const keyword = ref<string>('');
  const shareVisible = ref<boolean>(false);
  const ext = ref<string>('');
  const sharePermsText = ref<string>('关闭分享');
  const shareUrl = ref<string>('');
  const fileLinkRef = ref();
  const rightMenuAtt = ref<boolean>(false);
  const createBy = userStore.getUserInfo.username;
  const searchType = ref<string>('');
  const isShare = ref<boolean>(false);
  const fileIconRef = ref();
  const props = defineProps({
    leftType:{ type: String, default: '' }
  });

  function inputEdit(key) {
    editableData[key] = cloneDeep(dataSource.value.filter((item) => key === item.id)[0]);
  }

  function inputSave(key) {
    nextTick(() => {
      let filterElement = dataSource.value.filter((item) => key === item.id)[0];
      //新增文件夹
      if (key == -1) {
        if (!unref(editableData[key]).fileName) {
          $message.createMessage.warning('文件名称不能为空');
          dataSource.value.shift();
        } else {
          let params = {
            fileName: unref(editableData[key]).fileName,
            fileType: 'folder',
            izFolder: '1',
            storeType: 'manage',
            delFlag: '0',
            parentId: '',
            enableDown:'1',
            enableUpdat:'1',
          };
          if (unref(parentId)) {
            params.parentId = unref(parentId);
          }
          //新建文件夹
          saveFile({ ...params, rootId: unref(rootId) }).then((res) => {
            if (res.success) {
              delete editableData[key];
              getFileList();
            }
          });
        }
      } else {
        let params = {};
        if (editableData[key].izFolder === '1') {
          params = { fileName: editableData[key].fileName, fileId: editableData[key].id, type: 'rename' };
        } else {
          params = { fileName: editableData[key].fileName + '.' + editableData[key].ext, fileId: editableData[key].id, type: 'rename' };
          if(editableData[key].url){
            params['fileUrl'] = editableData[key].url
          }
        }
        editSysFile(params);
        //修改文件夹名称或文件
        Object.assign(filterElement, editableData[key]);
        delete editableData[key];
      }
    });
  }

  const selectFolder = ref();

  /**
   * 渲染表格事件
   */
  const customRow = (record) => {
    return {
      onClick: (event) => {
        onRowClick(event, record);
      },
      onDblclick: (event) => {
        onRowDblclick(event, record);
      },
      onContextmenu: (event) => {
        onRowContextmenu(event, record);
      },
    };
  };
  const [createContextMenu] = useContextMenu();

  /**
   * 表格改变事件
   */
  function handleTableChange(pagination) {
    iPagination.value = pagination;
    getFileList();
  }

  /**
   * 获取文件内容
   */
  function getFileList() {
    loading.value = true;
    let params = {
      parentId: unref(parentId),
      delFlag: delFlag.value,
      pageNo: iPagination.value.current,
      pageSize: iPagination.value.pageSize,
      type: unref(type),
      userId: userStore.getUserInfo.id,
      keyword: unref(keyword),
      searchType: unref(searchType),
      storeType:'manage'
    };
    dataSource.value = [];
    list(params)
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
            //如果是分享那么需要更新标题
            if (unref(isShare)) {
              emit('setTitleData', { parentId: unref(parentId), pid: unref(parentId) });
              isShare.value = false;
            }
            dataSource.value = records;
            selectedRowKeys.value = [];
            inputRefs = {};
            iPagination.value.total = res.result.total;
          } else {
            selectedRowKeys.value = [];
            dataSource.value = [];
            iPagination.value.total = 0;
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
   * 单击行选中事件
   * @param event
   * @param record
   */
  function onRowClick(event, record) {
    let keys: any = [];
    keys.push(record.id);
    selectedRowKeys.value = keys;
    //如果是展开的情况下，加载数据，否则隐藏属性
    if (unref(expand)) {
      setFileTitle({ fileName: unref(titleData), firstTitle: unref(firstTitle) });
      record.authority = unref(authority);
      //update-begin---author:wangshuai---date:2024-06-25---for:【TV360X-1565】知识库分享链接没了。---
      let fullPath = router.currentRoute.value.path;
      if (!record.shareUrl || record.shareUrl.indexOf(fullPath) == -1) {
        setShareUrl(record,fullPath);
      }
      //update-end---author:wangshuai---date:2024-06-25---for:【TV360X-1565】知识库分享链接没了。---
      record.leftType = props.leftType;
      fileAttributesRef.value.show(record);
    } else {
      nextTick(() => {
        fileAttributesRef.value.hideVisible();
        tableColumns.value = columns;
        menuWidth.value = { width: 'calc(100% - 260px)' };
      });
    }
  }

  /**
   * 右侧菜单事件
   * @param event
   * @param record
   */
  function onRowContextmenu(event, record) {
    rowData.value = record;
    event.preventDefault();
    if (unref(delFlag) == '1') {
      //还原的权限修改：回收站中：拥有修改权限，自己创建的可以彻底删除和还原
      if (
        (unref(authority) !== 'readonly' && unref(authority) !== 'editable') ||
        (unref(authority) === 'editable' && record.createBy === unref(createBy))
      ) {
        createContextMenu({
          event: event,
          styles: { 'z-index': 512, 'font-size': '13px' },
          items: [
            {
              label: '彻底删除',
              icon: 'ant-design:delete-filled',
              handler: () => {
                removeCompletelyFile(record.id);
              },
            },
            {
              label: '还原',
              icon: 'ant-design:rollback-outlined',
              handler: () => {
                reductionFile(record);
              },
            },
          ],
        });
      }
      return;
    }
    //update-begin---author:wangshuai ---date:20221011  for：[VUEN-2430]只读/编辑权限 对文件和文件夹的操作控制------------
    //右侧菜单拼写
    let item: any = [
      {
        label: '打开',
        icon: 'bx:bxs-folder-open',
        handler: () => {
          onRowDblclick(event, record);
        },
      },
      {
        label: '下载',
        icon: 'ant-design:cloud-download-outlined',
        divider: true,
        handler: () => {
          downFile(record);
        },
      },
      {
        label: '分享',
        icon: 'ant-design:share-alt-outlined',
        handler: () => {
          onShareFile(record);
        },
        divider: true,
      },
      {
        label: '重命名',
        icon: 'ant-design:edit-outlined',
        handler: () => {
          inputEdit(record.id);
        },
      },
      {
        label: '移动到...',
        icon: 'ant-design:swap-outlined',
        handler: () => {
          moveFile(record.id);
        },
      },
      {
        label: '复制到...',
        icon: 'ant-design:copy-outlined',
        handler: () => {
          copyFile(record.id);
        },
      },
      {
        label: '删除',
        icon: 'ant-design:delete-outlined',
        handler: () => {
          deleteFiles(record.id);
        },
      },
      {
        label: '属性',
        icon: 'ant-design:info-circle-filled',
        handler: () => {
          rightMenuAtt.value = true;
          setAttribute(record);
        },
      },
    ];

    //如果不是文件夹，需要添加预览/标星/上传新版本
    if (record.izFolder == '0') {
      item.splice(0, 1);
      item.unshift({
        label: '预览',
        icon: 'ant-design:eye-outlined',
        handler: () => {
          handleView(record);
        },
      });
      item.splice(2, 0, {
        label: record.izStar == '0' ? '标星' : '取消标星',
        icon: 'ant-design:star-outlined',
        handler: () => {
          starUpdate(record);
        },
      });
      item.splice(6, 0, {
        label: '上传新版本',
        icon: 'ant-design:cloud-sync-outlined',
        handler: () => {
          uploadNewFile(record);
        },
      });
    }

    //如果后缀是url，那么有编辑
    if (record.ext == 'url') {
      //如果是只读或者编辑权限允许修改
      if (unref(authority) !== 'readonly' || (unref(authority) === 'editable' && record.enableUpdat == '1')) {
        item.splice(1, 0, {
          label: '编辑',
          icon: 'ant-design:edit-outlined',
          handler: () => {
            editLink(record);
          },
        });
      }
      //删除上传新版本
      item.splice(7, 1);
    }

    //如果只有编辑权限，那么就没有删除操作，编辑权限不为创建者才会修改创建者
    if (unref(authority) == 'readonly' || (unref(authority) == 'editable' && record.createBy !== createBy)) {
      if (unref(authority) == 'editable') {
        item.splice(item.length - 2, 1);
      }
      //如果权限只读并且不是文件夹的情况下，那么只留预览、下载、标星、复制到和属性
      if (unref(authority) == 'readonly' && record.izFolder == '0') {
        item.splice(4, 2);
        item.splice(4, 3);
      }
      //如果权限只读并且是文件夹的情况下，那么只留预览、下载、复制到和属性
      if (unref(authority) == 'readonly' && record.izFolder == '1') {
        item.splice(3, 2);
        item.splice(3, 2);
      }
      //如果不予许下载，移除下载选项,并且不为当前创建者
      if (record.enableDown == '0' && record.createBy !== createBy) {
        item.splice(1, 1);
      }
      //如果不予许编辑，移除上传新版本和复制到...
      if (record.enableUpdat == '0') {
        //上传新版本的坐标
        let uploadIndex = -1;
        //移动到的坐标
        let moveToIndex = -1;
        //重命名
        let renameIndex = -1;
        for (let i = 0; i < item.length; i++) {
          if (item[i].label === '移动到...') {
            moveToIndex = i;
          }
          if (item[i].label === '上传新版本' && record.ext !== 'url') {
            uploadIndex = i;
          }
          if (item[i].label === '重命名') {
            renameIndex = i;
          }
        }
        //移除上传至
        if (uploadIndex != -1) {
          item.splice(uploadIndex, 1);
        }
        //移除复制到...
        if (moveToIndex != -1) {
          item.splice(moveToIndex, 1);
        }
        //移除重命名
        if (renameIndex != -1) {
          item.splice(renameIndex, 1);
        }
      }
    }
    createContextMenu({
      event: event,
      styles: { 'z-index': 512, 'font-size': '13px' },
      items: item,
    });
    //update-end---author:wangshuai ---date:20221011  for：[VUEN-2430]只读/编辑权限 对文件和文件夹的操作控制--------------
  }

  /**
   * 删除文件
   */
  function deleteFiles(id) {
    Modal.confirm({
      title: '删除文件',
      content: '文件的引用和分享链接也将失效，确认删除？',
      okText: '删除',
      cancelText: '取消',
      onOk: () => {
        deleteFile({ id: id, rootId: unref(rootId) }).then((res) => {
          if (res.success) {
            unref(iPagination).current = 1;
            getFileList();
          }
        });
      },
    });
  }

  /**
   * 更多下拉菜单点击属性触发
   */
  function setProperty(record) {
    rightMenuAtt.value = false;
    setAttribute(record);
  }
  /**
   * 设置属性
   */
  function setAttribute(record) {
    menuWidth.value = { width: 'calc(100% - 610px)' };
    record.sharePerms = record.sharePerms ? record.sharePerms : '1';
    nextTick(() => {
      tableColumns.value = miniColumns;
      setFileTitle({ fileName: unref(titleData), firstTitle: unref(firstTitle) });
      //update-begin---author:wangshuai---date:2023-12-06---for:【QQYUN-7297】表单讨论弹窗放大按钮时只显示一部分---
      //需要用path,fullPath会将浏览器中的参数也传递，如/file?parentId
      let fullPath = router.currentRoute.value.path;
      if (!record.shareUrl || record.shareUrl.indexOf(fullPath) == -1) {
        setShareUrl(record,fullPath);
      }
      //update-end---author:wangshuai---date:2023-12-06---for:【QQYUN-7297】表单讨论弹窗放大按钮时只显示一部分---
      record.authority = unref(authority);
      //当前用户
      record.username = unref(createBy);
      record.leftType = props.leftType;
      fileAttributesRef.value.show(record);
    });
  }

  /**
   * 复制到
   */
  function copyFile(id) {
    dataList.value['copyId'] = id;
    //update-begin---author:wangshuai---date:2023-12-05---for:【QQYUN-7323】移动文件目录显示不对---
    dataList.value['pid'] = parentId.value;
    rowData.value.id = id;
    //update-end---author:wangshuai---date:2023-12-05---for:【QQYUN-7323】移动文件目录显示不对---
    selectFolder.value.copyFile(unref(dataList));
  }

  /**
   * 移动到
   */
  function moveFile(id) {
    dataList.value['copyId'] = id;
    //update-begin---author:wangshuai---date:2023-12-05---for:【QQYUN-7323】移动文件目录显示不对---
    dataList.value['pid'] = parentId.value;
    rowData.value.id = id;
    //update-end---author:wangshuai---date:2023-12-05---for:【QQYUN-7323】移动文件目录显示不对---
    selectFolder.value.moveFile(unref(dataList));
  }

  /**
   * 上传新版本
   */
  function uploadNewFile(record) {
    rowData.value = record;
    fileUploadRef.value.click();
  }

  /**
   * 文件下载
   * @param record
   */
  function downFile(record) {
    updateDownNum({ fileId: record.id, userId: userStore.getUserInfo.id, operateType: 'used' });
    //文件下载
    if (record.izFolder == '0' && record.ext !== 'url') {
      downloadFile(record.url);
    } else {
      downFileById(record.id, record.fileName);
    }
  }

  /**
   * 根据id下载文件
   * @param ids
   * @param fileName
   */
  function downFileById(ids, fileName) {
    //文件夹下载
    let a = document.createElement('a');
    //update-begin---author:wangshuai ---date:20221014  for：点击下载时，压缩文件名称显示所下载名称------------
    a.href = downLoadFiles + '?fileIds=' + ids + '&zipName=' + fileName + '&token=' + getToken();
    //update-begin---author:wangshuai ---date:20221014  for：点击下载时，压缩文件名称显示所下载名称------------
    a.target = '_target';
    a.click();
  }

  /**
   * 文件批量下载
   */
  function batchDownFiles() {
    //update-begin---author:wangshuai ---date:20221014  for：点击下载时，压缩文件名称显示所下载名称------------
    let fileName = unref(firstTitle);
    if (unref(titleData).length > 0) {
      //update-begin---author:wangshuai---date:2024-06-24---for:【TV360X-1391】知识库批量下载压缩包名称变成了  object,obejct---
      fileName = unref(titleData)[unref(titleData).length - 1].title;
      //update-end---author:wangshuai---date:2024-06-24---for:【TV360X-1391】知识库批量下载压缩包名称变成了  object,obejct---
    }
    downFileById(unref(selectedRowKeys).join(','), fileName);
    //update-end---author:wangshuai ---date:20221014  for：点击下载时，压缩文件名称显示所下载名称--------------
  }

  /**
   * 标星更新
   * @param record
   */
  function starUpdate(record) {
    //update-begin---author:wangshuai ---date:20221011  for：传递record参数，抽出通用方法--------------
    let izStar = record.izStar == '0' ? '1' : '0';
    let id = record.id;
    let params = { fileId: record.id, izStar: izStar, userId: userStore.getUserInfo.id, operateType: 'star' };
    //update-end---author:wangshuai ---date:20221011  for：传递record参数，抽出通用方法--------------
    updateFile(params).then((res) => {
      if (res.success) {
        $message.createMessage.success(record.izStar == '0' ? '标星成功' : '取消标星成功');
        let element = dataSource.value.filter((item) => id === item.id)[0];
        Object.assign(element, { izStar: izStar });
        getFileList();
      }
    });
  }

  /**
   * 双击事件打开
   * @param event
   * @param record
   */
  function onRowDblclick(event, record) {
    handleTextClick(record);
  }
  function setItemRef(el, key) {
    if (el) {
      nextTick(() => {
        inputRefs[key] = el;
        inputRefs[key].focus();
      });
    }
  }

  /**
   * 文本点击事件
   */
  function handleTextClick(record) {
    if (record.izFolder === '1') {
      parentId.value = record.id;
      let filter = titleData.value.filter((item) => item.key == record.id);
      if (!filter || filter.length == 0) {
        titleData.value.push({ key: record.id, title: record.fileName });
      }
      emit('setTitleData', { titleData: titleData.value, parentId: unref(parentId), pid: record.parentId });
      type.value = '';
      keyword.value = '';
      searchType.value = 'list';
      //update-begin---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示------------
      if (unref(delFlag) === '0') {
        unref(iPagination).current = 1;
        getFileList();
      } else {
        //获取回收站
        getRecycleFileList();
      }
      //update-end---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示--------------
      //打开文件夹隐藏属性
      if (record.izFolder == '1') {
        if (unref(expand)) {
          fileAttributesRef.value.clear(true);
        }
      }
      //文件名称点击之后更新搜索文件名称
      emit('update-input', record.fileName);
    } else {
      //预览文件接口
      handleView(record);
    }
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
        //增加预览
        updateReadCount({ id: record.id });
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
      window.open(url, '_blank');
      //增加预览
      updateReadCount({ id: record.id });
    }
  }

  /**
   * 还原文件
   * @param record
   */
  function reductionFile(record) {
    //update-begin---author:wangshuai ---date:20221027  for：[VUEN-2546]5.还原整个文件夹时，在原来文件夹名称后多了.undefined------------
    let fileName = record.fileName;
    if (record.izFolder !== '1') {
      fileName = record.fileName + '.' + record.ext;
    }
    //update-end---author:wangshuai ---date:20221027  for：[VUEN-2546]5.还原整个文件夹时，在原来文件夹名称后多了.undefined--------------
    Modal.confirm({
      title: '还原文件',
      content: '确认还原选中的文件？',
      okText: '还原',
      cancelText: '取消',
      onOk: () => {
        editSysFile({
          fileId: record.id,
          fileName: fileName,
          delFlag: '0',
          rootId: unref(rootId),
          type: 'reduction',
          izFolder: record.izFolder,
        }).then((res) => {
          if (res.success) {
            $message.createMessage.success('还原成功');
            //还原之后加载回收站列表
            getRecycleFileList();
          }
        });
      },
    });
  }

  /**
   * 批量彻底还原
   * @param record
   */
  function batchReductionFiles(id) {
    Modal.confirm({
      title: '还原文件',
      content: '确认还原选中的文件？',
      okText: '还原',
      cancelText: '取消',
      onOk: () => {
        batchReductionFile({
          fileId: id,
          delFlag: '0',
          rootId: unref(rootId),
          type: 'reduction',
        }).then((res) => {
          if (res.success) {
            $message.createMessage.success('还原成功');
            //还原之后加载回收站列表
            getRecycleFileList();
          }
        });
      },
    });
  }

  /**
   * 彻底删除
   * @param id
   */
  function removeCompletelyFile(id) {
    Modal.confirm({
      title: '彻底删除文件',
      content: '文件的引用和分享链接也将失效，确认删除？',
      okText: '彻底删除',
      cancelText: '取消',
      onOk: () => {
        removeCompletely({ fileId: id, rootId: unref(rootId) }).then((res) => {
          if (res.success) {
            $message.createMessage.success('彻底删除成功');
            //删除之后加载回收站列表
            getRecycleFileList();
          }
        });
      },
    });
  }

  /**
   * 获取图片路径
   * @param url
   */
  function getImageSrc(url) {
    return getFileAccessHttpUrl(url);
  }

  /**
   * 添加文件夹
   */
  function addFolder(val = '') {
    dataSource.value.unshift({ id: '-1' });
    inputEdit('-1');
    parentId.value = val;
  }

  /**
   * 点击菜单事件
   * @param e
   */
  function handleMenuClick(e) {
    if (e.key === 'rename') {
      inputEdit(rowData.value.id);
    }
  }

  /**
   * 加载文件列表
   * @param params
   */
  function loadFileList(params) {
    dataList.value = params;
    titleData.value = params.fileName;
    parentId.value = params.pid;
    authority.value = params.authority;
    firstTitle.value = params.firstTitle;
    rootId.value = params.firstPid;
    delFlag.value = '0';
    type.value = params.type;
    iPagination.value = pageSetting;
    unref(iPagination).current = 1;
    keyword.value = '';
    searchType.value = 'list';
    //是否分享
    isShare.value = params.isShare;
    getFileList();
    //右侧如果是打开状态,则清除数据内容
    if (unref(expand)) {
      fileAttributesRef.value.clear(false);
    }
  }

  /**
   * 文件复制到回调事件
   */
  function folderHandleOk(value) {
    //添加最上级的id进行添加日志
    let params = { copyToFileId: value.pid, fileId: rowData.value.id, rootId: unref(rootId), userId: userStore.getUserInfo.id };
    //选中行数大于1，那么就是批量复制
    if (unref(selectedRowKeys).length > 1) {
      params.fileId = unref(selectedRowKeys).join(',');
    }
    //update-begin---author:wangshuai---date:2023-12-05---for:【QQYUN-7323】移动文件 目录显示不对 文件夹232下只有一个文件夹 新的 在当前目录下再次移动文件，还显示当前文件夹---
    dataList.value.pid = value.pid
    //update-end---author:wangshuai---date:2023-12-05---for:【QQYUN-7323】移动文件 目录显示不对 文件夹232下只有一个文件夹 新的 在当前目录下再次移动文件，还显示当前文件夹---
    if (value.folderType == 'copy') {
      copyFiles(params).then((res) => {
        if (res.success) {
          unref(iPagination).current = 1;
          getFileList();
          $message.createMessage.success(res.message);
        }
      });
    } else {
      moveFiles(params).then((res) => {
        if (res.success) {
          $message.createMessage.success(res.message);
        } else {
          $message.createMessage.warning(res.message);
        }
        unref(iPagination).current = 1;
        getFileList();
      });
    }
  }

  /**
   * 加载回收站文件列表
   * @param val
   */
  function loadRecycleFileList(val) {
    parentId.value = val.fileId;
    delFlag.value = '1';
    searchType.value = 'list';
    //update-begin---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示------------
    keyword.value = '';
    //回收站没有分页，因为有子级
    iPagination.value = false;
    getRecycleFileList();
    //update-end---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示------------
  }

  /**
   * 上传成功之后加载列表
   */
  function uploadFileList() {
    unref(iPagination).current = 1;
    getFileList();
  }

  /**
   * 选择文件之后回调事件
   * @param e
   */
  function submitUpload(e) {
    const files = e.target.files;
    const rawFile = files[0];
    if (!rawFile) return;
    let value = rowData.value;
    let ext = value.ext;
    let sub = rawFile.name.substring(rawFile.name.lastIndexOf('.') + 1);
    if (ext !== sub) {
      $message.createMessage.info('请选择相同格式的文件');
      return;
    }
    let data = { file: rawFile, fileId: value.id, fileName: rawFile.name };
    //开始上传文件
    uploadNewVersionRef.value.upload(data);
    fileUploadRef.value.value = null;
  }

  /**
   * 新版本上传成功之后刷新列表
   */
  function uploadNewFileOk() {
    $message.createMessage.success('已上传为新版本');
    getFileList();
  }

  /**
   * 设置文件标题
   * @param params
   */
  function setFileTitle(params) {
    let fileName = params.fileName;
    let firstTitle = params.firstTitle;
    if (fileName && fileName.length > 0) {
      for (let i = 0; i < fileName.length; i++) {
        firstTitle = firstTitle + '/' + fileName[i].title;
      }
    }
    fileAttributesRef.value.setTitle(firstTitle);
  }

  /**
   * 保持展开
   * @param value
   */
  function expandHandleClick(value) {
    expand.value = value;
  }

  /**
   * 刷新表格
   */
  function refresh() {
    //是否是右键选中属性,如果是...更多选项下选中属性的话首次不会设置宽度
    if (unref(rightMenuAtt)) {
      menuWidth.value = { width: 'calc(100% - 260px)' };
      tableColumns.value = columns;
    } else {
      rightMenuAtt.value = true;
    }
  }

  /**
   * 加载表格数据
   */
  function loadTable() {
    if (unref(keyword)) {
      searchType.value = 'allSearch';
    } else {
      searchType.value = 'list';
    }
    if (unref(delFlag) == '0') {
      unref(iPagination).current = 1;
      getFileList();
    } else {
      getRecycleFileList();
    }
  }

  /**
   * 搜索文本(存在父级id)
   */
  function searchList(value, pid) {
    //update-begin---author:wangshuai---date:2024-07-08---for:【TV360X-1577】知识库可以搜索到其他用户未共享的文件---
    if(searchType.value != 'allSearch' || !value){
      //如果搜索词不为空那就就是搜索列表，否则就是左侧点击普通搜索
      if (value) {
        searchType.value = 'search';
      } else {
        searchType.value = 'list';
        parentId.value = pid;
      }
    }
    //update-end---author:wangshuai---date:2024-07-08---for:【TV360X-1577】知识库可以搜索到其他用户未共享的文件---
    keyword.value = value;
    //update-begin---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示------------
    if (unref(delFlag) == '0') {
      unref(iPagination).current = 1;
      getFileList();
    } else {
      getRecycleFileList();
    }
    //update-end---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示------------
  }

  /**
   * 搜索全部(不存在父级id)
   */
  function searchAllList() {
    //如果搜索词不为空那就就是搜索列表，否则就是左侧点击普通搜索
    if (unref(keyword)) {
      searchType.value = 'allSearch';
    } else {
      searchType.value = 'list';
    }
    parentId.value = '';
    //update-begin---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示------------
    if (unref(delFlag) == '0') {
      unref(iPagination).current = 1;
      getFileList();
    } else {
      getRecycleFileList();
    }
    //update-end---author:wangshuai ---date:20221102  for：[VUEN-2608]删除文件夹至回收站，如果文件夹没有删除，列表不显示------------
  }

  /**
   * 分享文件
   * @param record
   */
  function onShareFile(record) {
    //设置分享链接
    record.sharePerms = record.sharePerms ? record.sharePerms : '1';
    setSharePermsTxt(record);
    //update-begin---author:wangshuai---date:2023-12-05---for:【QQYUN-7297】表单讨论弹窗放大按钮时只显示一部分---
    //需要用path,fullPath会将浏览器中的参数也传递，如/file?parentId
    let fullPath = router.currentRoute.value.path;
    if (!record.shareUrl || record.shareUrl.indexOf(fullPath) == -1) {
      setShareUrl(record,fullPath);
    }
    //update-end---author:wangshuai---date:2023-12-05---for:【QQYUN-7297】表单讨论弹窗放大按钮时只显示一部分---
    rowData.value = record;
    shareVisible.value = true;
    //设置图标
    setTimeout(()=>{
      fileIconRef.value.setIconData(record)
    },100)
  }

  /**
   * 设置分享文件文本
   * @param record
   */
  function setSharePermsTxt(record) {
    if (record.sharePerms === '1') {
      sharePermsText.value = '关闭分享';
    } else if (record.sharePerms === '2') {
      sharePermsText.value = '允许所有联系人查看';
    } else {
      sharePermsText.value = '允许任何人查看';
    }
  }

  /**
   * 下拉框选中事件
   */
  function dropdownMenuClick(val) {
    let params = { id: rowData.value.id, sharePerms: val.key };
    edit(params).then((res) => {
      if (res.success) {
        rowData.value.sharePerms = val.key;
        setSharePermsTxt(rowData.value);
      }
    });
  }

  /**
   * 设置分享链接
   */
  function setShareUrl(record,fullPath) {
    //update-begin---author:wangshuai ---date:20221111  for: 设置分享链接------------
    let id = record.id;
    //获取ip
    let protocol = window.location.protocol;
    //获取i端口号
    let host = window.location.host;
    let url = protocol + '//' + host;
    //update-begin---author:wangshuai---date:2023-12-05---for:【QQYUN-7297】表单讨论弹窗放大按钮时只显示一部分---
    let shareUrl = url + '/file/share?id=' + id + '&rootId=' + unref(rootId) + '&path=' + fullPath;
    //update-end---author:wangshuai---date:2023-12-05---for:【QQYUN-7297】表单讨论弹窗放大按钮时只显示一部分---
    //更新文件shareUrl
    let params = { id: record.id, shareUrl: shareUrl };
    //update-end---author:wangshuai ---date:20221111  for: 设置分享链接------------
    edit(params).then((res) => {
      if (res.success) {
        rowData.value.shareUrl = shareUrl;
      }
    });
  }

  /**
   * 复制链接
   */
  function copyLinkClick() {
    var input = document.createElement('input');
    input.value = rowData.value.shareUrl;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);
    $message.createMessage.success('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方');
  }

  /**
   * 批量删除
   */
  function batchDeleteFiles() {
    if (unref(selectedRowKeys).length > 1) {
      Modal.confirm({
        title: '批量删除文件',
        content: '文件的引用和分享链接也将失效，确认删除？',
        okText: '删除',
        cancelText: '取消',
        onOk: () => {
          batchDeleteFile({ ids: unref(selectedRowKeys).join(','), rootId: unref(rootId) }).then((res) => {
            if (res.success) {
              unref(iPagination).current = 1;
              getFileList();
            }
          });
        },
      });
    }
  }

  /**
   * 编辑链接
   * @param record
   */
  function editLink(record) {
    fileLinkRef.value.editLink(record);
  }

  /**
   * 获取回收站的文件列表
   */
  function getRecycleFileList() {
    loading.value = true;
    let params = {
      parentId: unref(parentId),
      userId: userStore.getUserInfo.id,
      keyword: unref(keyword),
      searchType: unref(searchType),
    };
    dataSource.value = [];
    getRecycleBinList(params)
      .then((res) => {
        if (res.success) {
          if (res.result && res.result.length > 0) {
            let records = res.result;
            for (let item of records) {
              item.showInput = false;
              if (item.izFolder !== '1' && item.fileName) {
                item.ext = getFileExt(item.fileName);
                item.fileName = item.fileName.substr(0, item.fileName.lastIndexOf('.'));
              }
            }
            dataSource.value = records;
            selectedRowKeys.value = [];
            inputRefs = {};
          } else {
            selectedRowKeys.value = [];
            dataSource.value = [];
          }
        }
      })
      .finally(() => {
        loading.value = false;
      });
  }
  
  let tagName = document.getElementsByTagName("body");
  onMounted(()=>{
    tagName[0].style.background = "#f0f2f5";
  })

  onUnmounted(()=>{
    tagName[0].style.background = "#ffffff";
  })

  defineExpose({
    addFolder,
    loadFileList,
    loadRecycleFileList,
    uploadFileList,
    searchList,
    searchAllList,
  });
</script>

<style scoped lang="less">
  :deep(.ant-table-tbody > tr > td) {
    padding: 0 16px;
    height: 36px;
    line-height: 36px;
  }

  .add {
    color: white;
    background-color: #1e88e5;
    border-radius: 20px;
  }

  .upload-font-size {
    font-size: 13px;
  }

  .border-hide {
    border: none;
  }

  .editable-cell {
    position: relative;

    .editable-cell-input-wrapper,
    .editable-cell-text-wrapper {
      padding-right: 24px;
    }

    .editable-cell-text-wrapper {
      padding: 5px 68px 5px 5px;
    }

    .editable-cell-icon,
    .editable-cell-icon-check {
      position: absolute;
      right: 30px;
      width: 40px;
      cursor: pointer;
      top: 10px;
    }

    .editable-cell-icon {
      margin-top: 4px;
      display: none !important;
      color: #999;
    }

    .editable-cell-icon-check {
      line-height: 28px;
    }

    .editable-cell-icon:hover,
    .editable-cell-icon-check:hover {
      color: #108ee9;
    }

    .editable-add-btn {
      margin-bottom: 8px;
    }

    .icon-star{
      color: rgb(255, 152, 0);
      margin-left: 5px;
      display: inline;
      position: relative;
      top: 3px;
    }
  }

  .editable-cell:hover .editable-cell-icon {
    display: inline-block !important;
  }

  .title-hover:hover {
    color: #1e88e5;
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
    margin-right: 2px;
    /*update-begin---author:wangshuai---date:2024-07-03---for:【TV360X-1568】正方形的图片略缩图变形了*/
    vertical-align: middle;
    width: 24px;
    height: 24px;
    object-fit: contain;
    /*update-end---author:wangshuai---date:2024-07-03---for:【TV360X-1568】正方形的图片略缩图变形了*/
  }
  .pointer {
    cursor: pointer;
  }
  .file-text{
    vertical-align: middle;
  }

  .file-text:hover {
    color: rgb(51, 51, 51);
    text-decoration: underline;
  }
  .file-menu {
    float: left;
    margin-top: 10px;
  }
  :deep(.ant-table-selection-column) {
    padding: 0 !important;
  }
  .share {
    display: table;
    height: 150px;
    width: 100%;
  }
  .file-form {
    height: 200px;
    .file-item {
      margin-bottom: 24px;
      padding-left: 100px;
      position: relative;
    }

    .file-item-label {
      color: #9e9e9e;
      font-size: 14px;
      height: 36px;
      left: 0;
      line-height: 36px;
      position: absolute;
      text-align: right;
      width: 80px;
    }
    .file-item-content {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      position: relative;
      top: 6px;
    }
  }
  .closed-tip {
    color: #919191;
    font-size: 13px;
  }
  .share-input {
    width: 230px;
    padding: 0 12px;
    box-sizing: border-box;
    font-size: 14px;
    height: 34px;
  }
  .share-span {
    font-size: 13px;
    border-radius: 3px;
    color: #fff;
    cursor: pointer;
    display: inline-block;
    height: 34px;
    line-height: 34px;
    margin-left: 12px;
    text-align: center;
    width: 68px;
    box-sizing: border-box;
    background-color: #1e88e5;
  }
  .header-icon {
    display: inline;
    margin-left: 22px;
  }
  .header-icon-color {
    color: #999;
    font-size: 17px !important;
    position: relative;
    top: 2px;
  }
  .header-icon-color:hover {
    color: #1e88e5 !important;
  }
  .table-icon-color {
    display: inline;
    font-size: 13px !important;
  }
  .table-font-size {
    font-size: 13px;
    margin-left: 10px;
  }
  .menu-more {
    z-index: 512;
    width: 156px;
    :deep(.ant-dropdown-menu-item) {
      width: 100%;
      height: 42px !important;
      margin: 0 !important;
      line-height: 42px !important;
    }
  }
</style>
