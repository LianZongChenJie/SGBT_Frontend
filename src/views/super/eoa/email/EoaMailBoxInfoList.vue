<template>
  <a-row prefixCls type="flex" :gutter="24" style="padding: 10px">
    <a-col :md="24" :lg="5" style="margin-bottom: 10px">
      <EoaMailBoxLeftModal
        :updateCount="updateCount"
        :updateBoxType="updateBoxType"
        @change="emailChange"
        @tagchange="tagChange"
        @search="searchTextChange"
        @ok="handleCategoryOk"
        @tagclick="tagClick"
      ></EoaMailBoxLeftModal>
    </a-col>
    <a-col :md="24" :lg="19">
      <div style="height: 100%; background-color: white">
        <!-- 表单区域 -->
        <EoaMailboxInfoModal
          ref="eoaMailboxInfoModal"
          v-if="pageFlag === 'email'"
          @success="handleSuccess"
          :replyRecord="replyRecord"
          @changeinbox="(type) => {replyRecord = [];changeInBox(type);}"
        ></EoaMailboxInfoModal>
        <EoaEmailInList
          v-else-if="pageFlag === 'inbox'"
          ref="eoaEmailInList"
          @delete="emailDelete"
          @reply="handleReply"
          :search="searchText"
          @tagclick="tagClick"
        ></EoaEmailInList>
        <EoaEmailSendList v-else-if="pageFlag === 'send'" @delete="emailDelete" @reply="handleReply" :search="searchText"></EoaEmailSendList>
        <EoaMailBoxDraftsList
          v-else-if="pageFlag === 'drafts'"
          @delete="emailDelete"
          :search="searchText"
          @changeinbox="changeInBox"
        ></EoaMailBoxDraftsList>
        <EoaMailBoxDustbinList
          v-else-if="pageFlag === 'dustbin'"
          @delete="emailDelete"
          @reply="handleReply"
          :search="searchText"
        ></EoaMailBoxDustbinList>
        <EoaMailBoxTypeList
          v-else-if="pageFlag === 'tags'"
          @delete="emailDelete"
          @reply="handleReply"
          :search="searchText"
          :title="tag.text"
          :mailboxType="tag.value"
          @edit="updateType"
        ></EoaMailBoxTypeList>
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts" name="eoa-email-info" setup>
  import { onMounted, ref, unref, nextTick } from 'vue';
  import EoaMailboxInfoModal from './components/EoaMailBoxInfoModal.vue';
  import EoaMailBoxLeftModal from './components/EoaMailBoxLeftModal.vue';
  import EoaEmailSendList from './EoaMailBoxSendList.vue';
  import EoaEmailInList from './EoaMailBoxInList.vue';
  import EoaMailBoxDraftsList from './EoaMailBoxDraftsList.vue';
  import EoaMailBoxDustbinList from './EoaMailBoxDustbinList.vue';
  import EoaMailBoxTypeList from './EoaMailBoxTypeList.vue';
  import { useRouter } from 'vue-router';
  import { useAppStore } from '/@/store/modules/app';

  const { currentRoute } = useRouter();
  const route = unref(currentRoute);
  const pageFlag = ref<string>('email');
  const title = ref<string>('');
  const checkedKeys = ref<Array<string | number>>([]);
  //收件箱定义一个ref变量
  const eoaEmailInList = ref();
  const eoaMailboxInfoModal = ref();
  const updateCount = ref<boolean>(false);
  const replyRecord = ref<any>([]);
  const searchText = ref<string>('');
  const tag = ref<any>({});
  //update-begin---author:wangshuai ---date:20220427  for：【VUEN-1242】标签不能编辑------------
  const updateBoxType = ref<boolean>(false);
  //update-end---author:wangshuai ---date:20220427  for：【VUEN-1242】标签不能编辑--------------

  /**
   * 成功回调
   */
  function handleSuccess() {}

  /**
   * 收件箱回调事件
   * @param type
   */
  function emailChange(type) {
    pageFlag.value = type;
  }

  /**
   * 标签新增和删除回调事件，需要刷新收件箱的tag
   * @param option 标签的数组
   * @param type 是否为删除，删除需要刷新表格
   */
  function tagChange(option, type) {
    //是否为收件箱
    if (pageFlag.value == 'inbox') {
      eoaEmailInList.value.mailboxTypeOptions = option;
      //需要刷新表格
      if (type) {
        eoaEmailInList.value.reload();
      }
    }
  }

  /**
   * 收件箱删除邮件回调事件
   */
  async function emailDelete() {
    updateCount.value = true;
  }

  /**
   * 转发或回复
   * @param record
   */
  async function handleReply(record) {
    replyRecord.value = record;
    pageFlag.value = 'email';
  }

  /**
   * 搜索
   * @param text
   */
  function searchTextChange(text) {
    searchText.value = text;
  }

  /**
   * 标签新增回调事件
   */
  function handleCategoryOk() {
    updateCount.value = false;
    updateBoxType.value = false;
  }

  /**
   * tag标签点击事件
   * @param value
   */
  function tagClick(value) {
    tag.value = value;
    pageFlag.value = 'tags';
  }

  /**
   * 跳转到发件箱
   * @param type
   */
  function changeInBox(type) {
    updateCount.value = true;
    //邮箱发送成功后跳转到发件箱
    if (type == 0) {
      pageFlag.value = 'send';
    }else if(type == 1){
      pageFlag.value = 'drafts';
    }
  }

  /**
   * 更新邮箱类别
   */
  function updateType() {
    updateBoxType.value = true;
  }
  onMounted(() => {
    let toType = route.params.type;
    //如果是收件箱,跳转到收件箱
    if (toType === 'inbox') {
      changeInBox(0);
    } else if (toType === 'process') {
      //如果是流程门户转发跳转，则需要跳转到写信页面并自动填写数据
      if (route.params.rec) {
        eoaMailboxInfoModal.value.loadData(JSON.parse(<string>route.params.rec));
      }
    }else{
      initHrefModal();
    }
  });
  
  // 消息跳转处理页面参数
  function initHrefModal(){
    const appStore = useAppStore();
    if(!appStore){
      return;
    }
    let params = appStore.getMessageHrefParams;
    if(params){
      let emailId = params.detailId;
      if(emailId){
        pageFlag.value = 'inbox';
        nextTick(()=>{
          console.log('eoaEmailInList.value----', eoaEmailInList.value)
          eoaEmailInList.value.openHrefDetailModal(emailId);
          appStore.setMessageHrefParams('')
        })
      }
    }
  }
  
</script>
