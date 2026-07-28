<!--部门选择框-->
<template>
  <div>
    <BasicModal wrapClassName="address-book-dialog" title="通讯录" v-bind="$attrs" :canFullscreen="false"
                @register="register" width="900px" @ok="handleOk" @cancel="handleCancel" destroyOnClose :footer="null">
      <a-row span="24">
        <a-col :span="6" class="left-book">
          <div style="margin-top: 20px">
            <div class="book-item" :class="activeKey === 'allContact'?'book-item-active':''"
                 @click="bookItemClick('allContact')">
              所有联系人
            </div>
            <div class="book-item" :class="activeKey === 'myGroup'?'book-item-active':''"
                 @click="bookItemClick('myGroup')">
              我的群组
            </div>
            <a-divider />
            <!-- 租户展示 -->
            <div v-for="item in tenantList">
              <div class="book-list" @click="bookTenantItemClick(item)">
                <Icon v-if="item.show" icon="ant-design:down-outlined" class="book-list-icon" />
                <Icon v-else icon="ant-design:right-outlined" class="book-list-icon" />
                <span style="vertical-align: middle;">{{ item.name }}</span>
              </div>
              <div v-show="item.show">
                <div class="tenant-depart" :class="activeKey === item.id+'depart' ? 'book-item-active':''" @click="bookItemDepartClick(item)">部门</div>
                <div class="tenant-depart" :class="activeKey === item.id+'group' ? 'book-item-active':''" @click="bookItemGroupClick(item)">群组</div>
              </div>
            </div>
          </div>
        </a-col>
        <a-col :span="7" class="center-book">
          <!-- 搜索  -->
          <div class="center-book-search">
            <a-input-search placeholder="搜索" v-model:value="keyword" @search="bookOnSearch" />
          </div>
          <div class="task-select">
            <a-select v-show="activeKey === 'myGroup'" v-model:value="type" style="width: 115px" size="small"
                      @change="groupHandleChange">
              <a-select-option value="allGroup"><span class="font-size-13">所有群组</span></a-select-option>
              <a-select-option value="createdGroup"><span class="font-size-13">我创建的群组</span></a-select-option>
            </a-select>
          </div>
          <!-- 我的群组 -->
          <div v-show="activeKey === 'myGroup' || activeKey === tenantDetail.id + 'group'" class="all-contact">
            <div :class="centerActiveKey === item.groupId ? 'list-item-active' : ''" v-for="item in groupList" class="list-item pointer" @click="centerHandleClick(item)">
              <img :src="getAvatarView(item.avatar)" class="list-item-avatar" />
              <span class="list-item-name">{{ item.groupName }}</span>
              <span class="list-item-number">{{ item.membersNumber }}</span>
            </div>
          </div>
          <!-- 所有联系人 -->
          <div v-show="activeKey === 'allContact'" class="all-contact">
            <AddressBookMore ref="bookMore" @update-detail="updateDetail"/>
          </div>
          <!-- 部门 -->
          <div v-show="activeKey === tenantDetail.id+'depart'" class="all-contact">
            <AddressLeftTree ref="leftTree"  @select="treeHandleSelect"/>
          </div>
        </a-col>
        <a-col :span="12" class="right-book">
          <!-- 我的群组 -->
          <div v-if="centerActiveKey!==''">
            <div v-if="activeKey!=='allContact' && activeKey!=='myGroup' && isUserDetail && activeKey !== tenantDetail.id+'group'" class="project-info pointer" @click="backHandleClick">
              <Icon icon="ant-design:left-outlined" class="right-back"/>
              返回
            </div>
            <div v-if="activeKey!=='allContact' && activeKey!=='myGroup' && !isUserDetail && activeKey !== tenantDetail.id+'group'" class="project-info pointer">
              <span> {{companyName}} </span>
            </div>
            <div class="right-book-detail" v-show="isUserDetail || activeKey === 'myGroup' || activeKey === tenantDetail.id+'group'">
              <img :src="getAvatarView(groupDataDetail.avatar)" :onerror="headerImg" class="right-book-avatar" />
              <div class="right-book-info">
                <span v-if="activeKey === 'myGroup' || activeKey === tenantDetail.id+'group'">{{ groupDataDetail.groupName }}</span>
                <span v-else-if="activeKey === 'allContact' || isUserDetail ">{{ groupDataDetail.realname }}</span>
              </div>
            </div>
            <div class="right-book-btn" v-show="isUserDetail || activeKey === 'myGroup' || activeKey === tenantDetail.id+'group'">
              <a-button style="border-radius: 18px;" type="primary" preIcon="ant-design:message-outlined"
                        @click="sendMessage">发消息
              </a-button>
            </div>
            <div class="right-book-footer">
              <div v-show="activeKey === 'myGroup' || activeKey === tenantDetail.id+'group'">
                <div class="right-book-footer-info">
                  <span>创建人：</span>
                  {{ groupDataDetail.realname }}
                </div>
                <div class="right-book-footer-info">
                  <span>群组成员：</span>
                  {{ groupDataDetail.membersNumber }}
                </div>
                <div class="right-book-footer-info">
                  <span>创建时间</span>
                  {{ getDateTime(groupDataDetail.createTime) }}
                </div>
              </div>
              <div v-show="activeKey === 'allContact' || isUserDetail">
                <div class="right-book-footer-info">
                  <span>电话：</span>
                  {{ groupDataDetail.phone?groupDataDetail.phone:'未填写' }}
                </div>
                <div class="right-book-footer-info">
                  <span>邮箱：</span>
                  {{ groupDataDetail.email ? groupDataDetail.email : "未填写" }}
                </div>
                <div class="right-book-footer-info two-columns">
                  <span>生日：</span>
                  {{ getBirthday(groupDataDetail.birthday) }}
                </div>
                <div class="right-book-footer-info two-columns">
                  <span>性别：</span>
                  {{ getSex(groupDataDetail.sex) }}
                </div>
                <div class="right-book-footer-info two-columns">
                  <span>职务：</span>
                  {{ groupDataDetail.post_dictText?groupDataDetail.post_dictText:'未填写' }}
                </div>
                <div class="right-book-footer-info two-columns">
                  <span>部门：</span>
                  {{ groupDataDetail.departName }}
                </div>
              </div>
              <div v-show="activeKey != 'myGroup' && activeKey != 'allContact' && !isUserDetail && activeKey !== tenantDetail.id+'group'">
                <AddressBookMore ref="bookMore" @update-detail="treeUpdateDetail" @update-total="treeUpdateTotal"/>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </BasicModal>
  </div>
</template>
<script lang="ts" setup name="address-book">
import {defineComponent, nextTick, ref, unref} from "vue";
import { BasicModal, useModalInner } from "/@/components/Modal";
import { useAttrs } from "/@/hooks/core/useAttrs";
import { defHttp } from "/@/utils/http/axios";
import { getFileAccessHttpUrl } from "/@/utils/common/compUtils";
import dayjs from "dayjs";
import { JEECG_CHAT_UID } from "/@/enums/cacheEnum";
import { getCacheByDynKey } from "/@/utils/auth";
import { ajaxGetDictItems, getDictItemsByCode } from "/@/utils/dict";
import AddressLeftTree from "./AddressLeftTree.vue";
import AddressBookMore from "./AddressBookMore.vue";
import headerImg from '/@/assets/images/header.jpg';
import {getCurrentUserTenant} from "/@/views/super/eoa/file/FileList.api";
import {cloneDeep} from "lodash-es";

enum Api {
  getMyDepartList = "/sys/sysDepart/getMyDepartList",
  getMyGroupList = "/eoa/im/newApi/getMyGroupList"
}

const props = defineProps();
//注册弹框
const [register, { closeModal }] = useModalInner(async (data) => {
  //获取我的租户
  getMyTenantList();
});
const attrs = useAttrs();
const getBindValue = Object.assign({}, unref(props), unref(attrs));
const tree = ref([]);
const activeKey = ref<string>("allContact");
const centerActiveKey = ref<string>("");
const companyList = ref<any>([]);
const groupList = ref<any>([]);
const groupDataDetail = ref<any>({});
const keyword = ref<string>("");
const chatType = ref<string>("");
const type = ref<string>("allGroup");
const centerSpinning = ref<any>(false);
const pageUserNo = ref<number>(1);
const leftTree = ref();
const bookMore = ref();
const departId = ref<string>('');
const sexOption = getDictItemsByCode("sex");
const isUserDetail = ref<boolean>(true)
const companyName = ref<string>('')
//租户列表
const tenantList = ref<any>([])
//租户详情数据
const tenantDetail = ref<any>([])
//租户id
const tenantId =ref<number>(0);

/**
 * 确定选择
 */
function handleOk() {
  handleCancel();
}

/**
 * 类别点击事件
 * @param val
 */
function bookItemClick(val) {
  //我的群组设置成空
  groupList.value = [];
  //右侧详细信息设置成空
  groupDataDetail.value = {};
  //中间点击key设置为空
  centerActiveKey.value ='';
  //树的orgCode设置为空
  departId.value = '';
  //右侧显示用户列表还是用户详细
  isUserDetail.value = false
  //清空搜索值
  keyword.value = '';
  if(val.id){
    activeKey.value = val.id;
  }else{
    activeKey.value = val;
  }
  //清空树选中，避免再次进来数据加载不出来
  leftTree.value.clearSelectedKeys();
  //如果是群组
  if (unref(activeKey) === "myGroup") {
    getMyGroupList();
  }else if(unref(activeKey) === tenantDetail.id+'group'){
    getMyTenantGroupList();
  } else if (unref(activeKey) === "allContact") {
    //如果是全部联系人
    setTimeout(()=>{ bookMore.value.getUserData();},100)
  }else{
    //如果是加载树
    setTimeout(()=>{ leftTree.value.loadRootTreeData(val);},100)
    pageUserNo.value = 1;
    departId.value = val.id
  }
}

/**
 * 查询我加入的公司
 */
function getMyDepartList() {
  defHttp.get({ url: Api.getMyDepartList }, { isTransformResponse: false }).then((res) => {
    if (res.success) {
      companyList.value = res.result;
    }
  });
}


/**
 * 获取加入的组或创建的组
 */
function getMyGroupList() {
  centerSpinning.value = true;
  //update-begin---author:wangshuai---date:2024-01-16---for:【QQYUN-7984】通讯录我的群组 所有群组 没有数据显示---
  let params = { keyword: unref(keyword), type: unref(type), searchType: 'allGroup' };
  //update-end---author:wangshuai---date:2024-01-16---for:【QQYUN-7984】通讯录我的群组 所有群组 没有数据显示---
  defHttp.get({ url: Api.getMyGroupList, params }, { isTransformResponse: false }).then((res) => {
    if (res.success) {
      groupList.value = res.result;
    }
  }).finally(() => {
    centerSpinning.value = false;
  });
}

/**
 * 获取头像地址
 */
function getAvatarView(url) {
  if(!url){
    return headerImg;
  }
  return getFileAccessHttpUrl(url);
}

/**
 * 我的群组中间点击事件
 * @param val
 */
function centerHandleClick(val) {
  centerActiveKey.value = val.groupId;
  groupDataDetail.value = val;
}

/**
 * 发送消息
 */
function sendMessage() {
  let val = unref(groupDataDetail);
  //获取messageId
  let cacheByDynKey = getCacheByDynKey(JEECG_CHAT_UID);
  let iframes = document.getElementById("jChatOnline");
  let id = "";
  //如果树群组的情况下id是组id，反之是用户id
  if(unref(activeKey) === 'myGroup' || unref(activeKey) === unref(tenantDetail).id+'group') {
    id = val.groupId;
  }else{
    id = val.id;
  }
  //发送打开聊天窗口的请求
  iframes.contentWindow.postMessage({
    type: "open-chat",
    messageId: cacheByDynKey,
    //update-begin---author:wangshuai---date:2023-12-12---for:【QQYUN-7467】从通讯录发起聊天后，不能再建群组---
    //update-begin---author:wangshuai---date:2024-02-19---for:【QQYUN-8286】通讯录选择完人之后，打开聊天页面没有翻译---
    data: { id: id, type: val.type ? val.type : "friend", groupName: val.groupName, avatar: val.avatar, username: val.realname }
    //update-end---author:wangshuai---date:2024-02-19---for:【QQYUN-8286】通讯录选择完人之后，打开聊天页面没有翻译---
    //update-end---author:wangshuai---date:2023-12-12---for:【QQYUN-7467】从通讯录发起聊天后，不能再建群组---
  }, "*");
  handleCancel();
}

/**
 * 获取创建时间
 * @param val
 */
function getDateTime(val) {
  if(!val){
    return "无";
  }
  return dayjs(new Date(val)).format("YYYY-MM-DD HH:mm:ss");
}

/**
 * 获取生日
 * @param val
 */
function getBirthday(val) {
  if(!val){
    return "未填写";
  }
  return dayjs(new Date(val)).format("YYYY-MM-DD");
}

/**
 * 获取性别
 * @param val
 */
function getSex(val) {
  let findOption = sexOption.find(item => parseInt(item.value) === val);
  let sex = "未填写";
  if (findOption) {
    sex = findOption.text;
  }
  return sex;
}



/**
 * 弹窗关闭事件
 */
function handleCancel() {
  closeModal();
  activeKey.value = "allContact";
  type.value = "allGroup";
  centerActiveKey.value = "";
  companyList.value = [];
  groupList.value = [];
  groupDataDetail.value = [];
}

/**
 * 搜索
 * @param value
 */
function bookOnSearch(value) {
  groupList.value = [];
  //是否为群组
  if (unref(activeKey) === "myGroup") {
    getMyGroupList();
  }else if(unref(activeKey) === unref(tenantDetail).id+'group'){
    getMyTenantGroupList();
  } else if(unref(activeKey) === "allContact") {
    groupDataDetail.value = {}
    //更新用户列表搜索词
    bookMore.value.updateKeyword(unref(keyword));
  }else{
    isUserDetail.value = false;
    groupDataDetail.value = {};
    setTimeout(()=>{
      leftTree.value.searchDepart({id:unref(tenantDetail).id,departName:unref(keyword)});
    },100)
  }
}



/**
 * 群组选中显示
 */
function groupHandleChange() {
  //群组显示加载群组列表
  getMyGroupList();
}

/**
 * 树选择回调事件
 * @param val
 */
function treeHandleSelect(val) {
  //将中心key设置成树的编码，以便于样式显示
  centerActiveKey.value = val.orgCode
  isUserDetail.value = false
  setTimeout(()=>{
    departId.value = val.id
    companyName.value = val.title
    bookMore.value.updateDepartId(val.id,unref(keyword));
  },100)
}

/**
 * 更新详细信息
 * @param item
 */
function updateDetail(item) {
  setPostTxt(item)
  isUserDetail.value = true;
  groupDataDetail.value = item;
  centerActiveKey.value = item.centerActiveKey;
}

/**
 * 树返回更新更新详细信息
 * @param item
 */
function treeUpdateDetail(item) {
  setPostTxt(item)
  groupDataDetail.value = item;
  //将中心key设置成树的编码，以便于样式显示
  centerActiveKey.value = item.centerActiveKey;
  isUserDetail.value = true;
}

/**
 * 返回
 */
function backHandleClick() {
  //将中心key设置成树的编码，以便于样式显示
  isUserDetail.value = false
}

/**
 * 设置职务
 * @param item
 */
async function setPostTxt(item) {
  //update-begin---author:wangshuai ---date:20230220  for：[QQYUN-3980]组织管理中 职位功能 职位表加租户id 加职位-用户关联表------------
  //文本翻译
  if (item.post_dictText) {
    item.post_dictText = item.post_dictText.replaceAll(",", "|")
  }
  //update-end---author:wangshuai ---date:20230220  for：[QQYUN-3980]组织管理中 职位功能 职位表加租户id 加职位-用户关联表------------
}

/**
 * 更新该部门下面有多少人
 * @param val
 */
function treeUpdateTotal(val) {
    companyName.value = companyName.value + '(' + val + ')';
}

  /**
   * 租户点击事件
   * @param item
   */
  function bookTenantItemClick(item) {
    item.show = !item.show;
  }
  
  /**
   * 获取我的租户
   */
  function getMyTenantList() {
    getCurrentUserTenant().then((res) => {
      if (res.success) {
        tenantList.value = res.result.list;
      }
    });
  }

  /**
   * 清空数据 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
   */
  function clearData() {
    //我的群组设置成空
    groupList.value = [];
    //右侧详细信息设置成空
    groupDataDetail.value = {};
    //中间点击key设置为空
    centerActiveKey.value ='';
    //树的orgCode设置为空
    departId.value = '';
    //搜索值设置为空
    keyword.value = '';
  }

  /**
   * 设置点击key和租户数据赋值
   * @param val 租户数据
   * @param type depart:部门 group:群组
   */ 
  function setActiveKey(val,type){
    activeKey.value = val.id+type;
    tenantDetail.value = val;
  }
  /**
   * 租户部门点击事件
   * @param item
   */
  function bookItemDepartClick(item) {
    nextTick(()=>{
      clearData();
      isUserDetail.value = true;
      setActiveKey(item,'depart');
      //加载树
      setTimeout(()=>{
        leftTree.value.clearDepartName();
        leftTree.value.loadRootTreeData(item);
        },300)
        pageUserNo.value = 1;
    })
  }

  /**
   * 租户群组点击事件
   * @param item
   */
  function bookItemGroupClick(item) {
    tenantId.value = item.id;
    nextTick(()=>{
      clearData();
      isUserDetail.value = false;
      setActiveKey(item,'group');
      getMyTenantGroupList()
    })
  }

  /**
   * 获取租户下面的群组
   */
  function getMyTenantGroupList() {
    centerSpinning.value = true;
    let params = { type: 'allGroup', tenantId: unref(tenantId),keyword: unref(keyword)};
    defHttp.get({ url: Api.getMyGroupList, params }, { isTransformResponse: false }).then((res) => {
      if (res.success) {
        groupList.value = res.result;
      }
    }).finally(() => {
      centerSpinning.value = false;
    });
  }
</script>
<style lang="less" scoped>
.left-book {
  height: 500px;
  background-color: #f5f5f5;
  box-sizing: border-box;
  display: flex;
  flex: 0 0 auto;
  flex-flow: column nowrap;
  overflow: auto;
  overflow-x: hidden;
}

.center-book {
  height: 500px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
  border-right: 1px solid #f5f5f5;

  .center-book-search {
    align-items: center;
    display: flex;
    padding: 10px 14px 5px;
  }
}

.book-item {
  width: 100%;
  cursor: pointer;
  font-size: 13px;
  height: 40px;
  line-height: 40px;
  padding: 0 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-item-active {
  background-color: #e0e0e0;
}

.book-list {
  cursor: pointer;
  font-size: 13px;
  height: 40px;
  line-height: 40px;
  overflow: hidden;
  padding: 0 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #000000 !important;
  text-align: left;
}


.pointer {
  cursor: pointer;
}

.right-book {
  flex: 1 0;
  position: relative;
  padding: 16px 24px;
  height: 500px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
  overflow-x: hidden;
}

.right-book-detail {
  align-items: center;
  display: flex;
  flex-flow: row nowrap;
}

.right-book-avatar {
  align-self: flex-start;
  border-radius: 50%;
  height: 66px;
  width: 66px;
}

.right-book-info {
  flex: 1 0;
  padding-left: 14px;
}

.right-book-btn {
  margin-top: 24px !important;
}

.right-book-footer {
  font-size: 13px !important;
  margin-top: 24px !important;

  .right-book-footer-info {
    margin: 8px 0;

    span {
      color: #757575 !important;
    }
  }

  .two-columns {
    flex: 0 0.5;
  }
}

.font-size-13 {
  font-size: 13px;
}

.all-contact{
  height:450px;
  overflow: auto;
  overflow-x: hidden;
}
.task-select {
  padding-left: 10px;
  padding-right: 10px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
}

.task-select :deep(.ant-select-selector) {
  border: none !important;
  box-shadow: none !important;
}

.task-select :deep(.ant-select-selection__rendered) {
  border: none !important;
}

.task-select :deep(.ant-checkbox-inner) {
  width: 14px;
  height: 14px;
}

.list-item {
  align-items: center;
  display: flex;
  flex-flow: row nowrap;
  height: 44px;
  line-height: 44px;
  padding: 0 16px;
}

.list-item-avatar {
  border-radius: 50%;
  height: 32px;
  width: 32px;
}

.list-item-name {
  flex: 1 0;
  overflow: hidden;
  padding-left: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.list-item-number {
  color: #bdbdbd !important;
  padding-left: 5px !important;
}

.list-item-active {
  background-color: #e3f2fd !important
}
.project-info{
  font-size: 13px;
  margin: 0 0 14px 0;
}
.right-back{
    position: relative;
    top: 1px;
}
.book-list-icon{
  font-size: 13px !important;
  color: #000000;
  position: relative;
  top: 2px;
  display: inline-flex;
  margin-left: -17px;
  margin-right: 3px;
}
.tenant-depart{
  cursor: pointer;
  font-size: 12px;
  height: 40px;
  line-height: 40px;
  overflow: hidden;
  padding: 0 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #757575 !important;
}
</style>
<style>
.address-book-dialog .scroll-container {
  padding: 0 !important;
}

.address-book-dialog .scroll-container .scrollbar__wrap {
  margin-bottom: 0 !important;
}
</style>
