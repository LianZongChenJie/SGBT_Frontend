<template>
  <a-card :bordered="false" style="height: 100%">
    <div class="search-input-div">
      <a-input
        placeholder="输入标题查询"
        allow-clear
        @keyup.enter.native="onSearch"
        v-model:value="searchText"
        style="border: none"
        @change="titleChange"
      >
        <a-icon slot="prefix" type="search" @click="onSearch" />
      </a-input>
    </div>
    <div class="account-center-avatarHolder">
      <a-button type="primary" block @click="bioClick">写信</a-button>
    </div>
    <div class="account-center-detail">
      <ul style="padding: 0">
        <li>
          <a @click="inbox">
            <i class="inbox"></i>收件箱
            <span class="label first">{{ inboxCount }}</span>
          </a>
        </li>
        <li>
          <a @click="send">
            <i class="send" />发件箱
            <span class="label first">{{ sendCount }}</span>
          </a>
        </li>
        <li>
          <a @click="drafts">
            <i class="drafts" />草稿箱
            <span class="label second">{{ draftsCount }}</span>
          </a>
        </li>
        <li>
          <a @click="dustbin">
            <i class="dustbin" />垃圾箱
            <span class="label second">{{ dustbinCount }}</span>
          </a>
        </li>
      </ul>
      <ul style="padding: 0; margin-top: 20px; display: flex">
        <li style="border-bottom: none">标签</li>
        <a-tag @click="addCategory" style="background: #fff; borderstyle: dashed; margin-left: 10px; cursor: pointer">
          <a-icon type="plus" style="font-size: 13px !important" />
          新建标签
        </a-tag>
      </ul>
    </div>
    <template v-for="tag in mailboxTypeOptions">
      <div style="width: 90px; float: left; cursor: pointer">
        <a-tag @click="classification(tag)" :color="tag.color" :key="tag.value" style="margin-top: 10px; width: 68px; borderstyle: dashed">
          <span><JEllipsis :value="tag.text" :length="3" /></span>
        </a-tag>
        <a-icon type="close" style="position: relative; right: 24px; font-size: 10px" @click="handleTagClose(tag.value)" />
      </div>
    </template>
  </a-card>
  <EoaMailboxCategoryModal @register="registerModal" @success="handleCategorySuccess"></EoaMailboxCategoryModal>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { JEllipsis } from '/@/components/Form';
  import { emailCount, getLabelName, deleteCategory } from '../EoaMailBox.api';
  import { useUserStore } from '/@/store/modules/user';
  import { useModal } from '/@/components/Modal';
  import EoaMailboxCategoryModal from './EoaMailBoxCategoryModal.vue';
  import type { PropType } from 'vue';

  const [registerModal, { openModal }] = useModal();
  const userStore = useUserStore();
  const inboxCount = ref<number>(0);
  const sendCount = ref<number>(0);
  const draftsCount = ref<number>(0);
  const dustbinCount = ref<number>(0);
  const mailboxTypeOptions = ref<any>();
  const color = ref<any>(['purple', 'red', 'orange', 'green', 'cyan', 'blue', 'pink']);
  const searchText = ref<string>('');
  // Emits声明
  const emit = defineEmits(['register', 'change', 'tagchange', 'search', 'ok', 'tagclick']);

  const props = defineProps({
    updateCount: { type: Boolean as PropType<boolean>, default: () => false },
    updateBoxType: { type: Boolean as PropType<boolean>, default: () => false },
  });

  /**
   * 初始化邮件数量
   */
  async function emailCountData() {
    const params = { userId: userStore.getUserInfo.id };
    await emailCount(params).then((res) => {
      if (res.success) {
        inboxCount.value = res.result.inboxCount;
        sendCount.value = res.result.sendCount;
        draftsCount.value = res.result.draftsCount;
        dustbinCount.value = res.result.dustbinCount;
        emit('ok');
      }
    });
  }

  /**
   * 搜索点击事件
   */
  function onSearch() {
    emit('search', searchText.value);
  }

  /**
   * 写信
   * @param type
   */
  function bioClick() {
    emit('change', 'email');
  }

  /**
   * 收件箱点击事件
   */
  function inbox() {
    emit('change', 'inbox');
  }

  /**
   * 草稿箱点击事件
   */
  function drafts() {
    emit('change', 'drafts');
  }

  /**
   * 发件箱点击事件
   */
  function send() {
    emit('change', 'send');
  }

  /**
   * 垃圾箱点击事件
   */
  function dustbin() {
    emit('change', 'dustbin');
  }

  /**
   * 标签新增事件
   */
  function addCategory() {
    openModal(true, {});
  }

  /**
   * 标签点击事件
   * @param tag 标签
   */
  function classification(tag) {
    emit('tagclick', tag);
  }

  /**
   * 搜索值改变事件
   */
  function titleChange() {
    if (searchText.value == '') {
      onSearch();
    }
  }

  /**
   * 获取标签
   */
  async function getMailBoxType() {
    await getLabelName({ userId: userStore.getUserInfo.id }).then((res) => {
      if (res.success) {
        const type = ref<any>([]);
        let j = 0;
        for (let i = 0; i < res.result.length; i++) {
          if (j >= color.length) {
            j = 0;
          }
          type.value.push({
            text: res.result[i].labelName,
            value: res.result[i].id,
            color: color.value[j],
          });
          j++;
        }
        mailboxTypeOptions.value = type.value;
      }
    });
  }

  /**
   * tag点击关闭按钮
   * @param id
   */
  async function handleTagClose(id) {
    await deleteCategory({ id: id }).then(async (res) => {
      if (res) {
        await emailCountData();
        await getMailBoxType();
        emit('tagchange', mailboxTypeOptions.value, 'close');
      }
    });
  }

  /**
   * 添加标签成功事件
   */
  async function handleCategorySuccess() {
    //更新邮箱数量
    await emailCountData();
    //获取邮箱标签
    await getMailBoxType();
    emit('tagchange', mailboxTypeOptions.value, '');
  }

  onMounted(async () => {
    //更新邮箱数量
    await emailCountData();
    //获取邮箱标签
    await getMailBoxType();
  });

  watch(
    () => props.updateCount,
    (updateCount) => {
      if (updateCount) {
        //需要跟新，则更新邮箱数量
        emailCountData();
      }
    }
  );

  watch(
    () => props.updateBoxType,
    (updateBoxType) => {
      if (updateBoxType) {
        //需要更新新，则更新邮箱数量
        getMailBoxType();
        emit('ok');
      }
    }
  );
</script>

<style lang="less" scoped>
  a {
    color: #666666;
    display: block;
    padding: 5px 0;
  }

  .page-header-wrapper-grid-content-main {
    width: 100%;
    height: 100%;
    min-height: 100%;
    transition: 0.3s;

    .account-center-avatarHolder {
      text-align: center;
      margin-bottom: 24px;

      & > .avatar {
        margin: 0 auto;
        width: 104px;
        height: 104px;
        margin-bottom: 20px;
        border-radius: 50%;
        overflow: hidden;

        img {
          height: 100%;
          width: 100%;
        }
      }

      .username {
        color: rgba(0, 0, 0, 0.85);
        font-size: 20px;
        line-height: 28px;
        font-weight: 500;
        margin-bottom: 4px;
      }
    }

    .account-center-detail {
      p {
        margin-bottom: 8px;
        padding-left: 26px;
        position: relative;
      }

      .title {
        background-position: 0 0;
      }

      .group {
        background-position: 0 -22px;
      }

      .address {
        background-position: 0 -44px;
      }
    }

    .account-center-tags {
      .ant-tag {
        margin-bottom: 8px;
      }
    }

    .tagsTitle,
    .teamTitle {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      margin-bottom: 12px;
    }
  }

  .bio {
    background-color: #1ab394;
    border-color: #1ab394;
    color: #ffffff;
    width: 100%;
  }

  li {
    list-style-type: none;
    border-bottom: 1px solid #e7eaec;
    display: block;
    box-sizing: border-box;
    text-align: -webkit-match-parent;
  }

  .label {
    display: inline;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    text-shadow: none;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25em;
    color: #ffffff;
    float: right !important;
  }

  .first {
    background-color: #f8ac59;
  }

  .second {
    background-color: #ed5565;
  }

  /**邮件搜索输入框样式*/
  .search-input-div {
    width: 90%;
    text-align: center;
    margin-bottom: 24px;

    :deep(.ant-input) {
      background-color: #fff;
      border: 0;
      border-radius: 0px;
      outline: none;
      box-shadow: none;
    }
  }
</style>
