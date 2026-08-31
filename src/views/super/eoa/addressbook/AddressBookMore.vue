<template>
  <a-list
    item-layout="horizontal"
    :data-source="userDataList"
    :loading="centerLoading"
  >
    <template #renderItem="{ item }">
      <a-list-item class="list-item pointer" :class="centerActiveKey === item.id?'list-item-active':''"
                   @click="listHandleClick(item)">
        <img :src="getAvatarView(item.avatar)" :onerror="headerImg" class="list-item-avatar" />
        <span class="list-item-name">{{ item.realname }}</span>
      </a-list-item>
    </template>
    <template #loadMore>
      <div v-if="isShowMore" :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px',cursor:'pointer' }">
        <div @click="loadMore">加载更多</div>
      </div>
    </template>
  </a-list>
</template>

<script lang="ts" setup name="address-book-more">
import { ref, unref } from "vue";
import { defHttp } from "/@/utils/http/axios";
import { getFileAccessHttpUrl } from "/@/utils/common/compUtils";
import headerImg from '/@/assets/images/header.jpg';

enum Api {
  userList = "/sys/user/list"
}

const userDataList = ref<any>([]);
const isShowMore = ref<boolean>(false);
const centerActiveKey = ref<string>("");
const pageUserNo = ref<number>(1);
const centerLoading = ref<boolean>(false);
const keyword = ref<string>("");
const departId = ref<string>("");
const emit = defineEmits(['update-detail','update-total'])

getDepartUserData();

/**
 * 加载更多
 */
function loadMore() {
  pageUserNo.value = pageUserNo.value + 1;
  getDepartUserData();
}

/**
 * 查询我加入的公司
 */
function getDepartUserData() {
  centerLoading.value = true;
  let params = { pageNo: unref(pageUserNo), pageSize: 10,realname: '*'+unref(keyword)+'*',departId: unref(departId) };
  defHttp.get({ url:Api.userList, params }, { isTransformResponse: false }).then((res) => {
    if (res.result && res.success) {
      if (res.result.records && res.result.records.length > 0) {
        let records = res.result.records;
        if(records.length<10){
          isShowMore.value = false;
        }else{
          isShowMore.value = true;
        }
        userDataList.value.push(...records);
      } else {
        isShowMore.value = false;
      }
      //更新列表数量展示
      emit('update-total',res.result.total)
    }else{
      emit('update-total',0)
    }
  }).finally(() => {
    centerLoading.value = false;
  });
}

/**
 * 获取头像
 * @param url
 */
function getAvatarView(url) {
  if(!url){
    return headerImg;
  }
  return getFileAccessHttpUrl(url);
}

/**
 * 更新修改次
 */
function updateKeyword(val) {
  pageUserNo.value = 1;
  userDataList.value = [];
  keyword.value = val;
  getDepartUserData();
}

/**
 * 获取用户数据
 */
function getUserData() {
  pageUserNo.value = 1;
  userDataList.value = [];
  departId.value = ''
  getDepartUserData();
}

/**
 * 加载更多列表点击事件
 * @param item
 */
function listHandleClick(item) {
  centerActiveKey.value = item.id;
  //如果部门名称不为空
  if(item.orgCodeTxt){
    //将部门名称用户|展示
    item.departName = item.orgCodeTxt.split(",").join("|").toString();
  }else{
    item.departName = '未填写';
  }
  item.centerActiveKey = unref(centerActiveKey)
  emit('update-detail', item)
}

/**
 * 更新部门id
 * @param val
 * @param search
 */
function updateDepartId(val,search='') {
  pageUserNo.value = 1
  departId.value = val
  userDataList.value = []
  keyword.value = search
  getDepartUserData();
}

defineExpose({
  updateKeyword,
  getUserData,
  updateDepartId
});
</script>

<style scoped>
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
.pointer {
  cursor: pointer;
}
.list-item-active {
  background-color: #e3f2fd !important
}
</style>
