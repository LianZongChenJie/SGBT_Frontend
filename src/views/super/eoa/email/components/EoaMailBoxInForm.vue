<template>
  <BasicModal v-bind="$attrs" destroyOnClose @register="register" title="查看邮件" @visible-change="handleShow" width="800px">
    <template #footer>
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>
    <div class="body">
      <div style="display: flex">
        <div style="text-align: left">
          <h3>主题：{{ replyRecord.title }}</h3>
        </div>
        <div style="text-align: right; margin-left: 10px">
          <a @click="toEmail()">进入邮箱</a>
        </div>
      </div>
      <div style="margin-top: 10px" v-if="tags.length > 0"></div>
      <div style="display: flex; border-bottom: 1px solid #e8e8e8">
        <div style="text-align: left; width: 50%">
          <span>发件人：{{ replyRecord.senderId_dictText }}</span>
        </div>
        <div style="text-align: right; width: 50%" class="author">
          <span> {{ replyRecord.sendTime }}</span>
        </div>
      </div>
      <div style="margin-top: 20px">
        <div v-html="replyRecord.content" v-if="replyRecord.senderId !== '系统通知'"></div>
        <BasicTable
          v-else
          :columns="systemMessageColumn"
          :dataSource="dataSource"
          :canResize="false"
          :pagination="ipagination"
          @change="handleTableChange"
        ></BasicTable>
      </div>
      <div v-if="replyRecord.attachment">
        <JUpload v-model:value="replyRecord.attachment" :disabled="disabled" :buttonVisible="!disabled"></JUpload>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup name="eoa-mail-box-in-form">
  import { ref, watch } from 'vue';
  import { BasicTable } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { inboxListNotTransform, editByEmailIdAndUserId, addEmail, receiverPageList } from '../EoaMailBox.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { systemMessageColumn } from '../EoaMailBox.data';
  import { useRouter } from 'vue-router';

  const props = defineProps({
    formData: { type: Object, default: {} },
  });
  const userStore = useUserStore();
  const title = ref<string>('查看邮件');
  const tags = ref<any>([]);
  const dataSource = ref<any>([]);
  //表单数据
  const replyRecord = ref<any>({});
  const disabled = ref<boolean>(true);
  const visible = ref<boolean>(false);
  const ipagination = ref<any>({
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '30'],
    showQuickJumper: true,
    showSizeChanger: true,
    total: 0,
  });
  const router = useRouter();
  //表单赋值
  const [register, { setModalProps, closeModal }] = useModalInner((data) => {
    //update-begin---author:wangshuai ---date:20220617  for：邮箱弹出高度统一修改--------------
    setModalProps({ height: 400 });
    //update-end---author:wangshuai ---date:20220617  for：邮箱弹出高度统一修改--------------
  });

  /**
   * 关闭弹窗
   */
  function handleCancel() {
    closeModal();
  }

  /**
   * 发送回执邮件
   * @param id
   */
  async function sendReceiptMail(id) {
    await editByEmailIdAndUserId({ id: id }).then((res) => {
      if (res && res.success && res.result) {
        //如果邮件需要回执，则发一封回执邮件
        if (res.result.receiptFlag === '1' && res.result.readFlag === '0') {
          //回执邮件
          let formData = {
            receiverIds: res.result.senderId,
            senderId: userStore.getUserInfo.id,
            content: '您发送的这封邮件已经被打开。',
            title: '回执：' + res.result.title,
          };
          addEmail(formData).then((res) => {});
        }
      }
    });
  }

  /**
   * 获取收件箱的数据
   * @param id
   */
  async function getSendData(id) {
    await inboxListNotTransform({ id: id }).then((res) => {
      if (res.success) {
        let record = res.result.records[0];
        replyRecord.value = record;
        if (record.senderId === '系统通知') {
          loadData(1);
        }
        if (!record.senderId_dictText) {
          record.senderId_dictText = '系统发布';
        }
      }
    });
  }

  /**
   * 加载表格数据
   * @param arg
   */
  async function loadData(arg) {
    if (arg === 1) {
      ipagination.value.current = 1;
    }
    let params = {
      mailId: replyRecord.value.content,
      pageNo: ipagination.value.current,
      pageSize: ipagination.value.pageSize,
    };
    await receiverPageList(params).then((res) => {
      if (res.success) {
        dataSource.value = res.result.records;
        ipagination.value.total = res.result.total;
      }
    });
  }

  /**
   * 表格页数发生改变
   * @param pagination
   */
  async function handleTableChange(pagination) {
    ipagination.value = pagination;
    await loadData(1);
  }

  /**
   * 进入收件箱
   */
  function toEmail() {
    router.push({
      name: 'eoa-email',
      params: { type: 'inbox' },
    });
    closeModal();
  }

  //update-begin---author:wangshuai ---date:20220523  for：消息管理第一次初始化没有数据------------
  /**
   * 监听prop值属性变化
   */
  watch(
    props.formData,
    (formData) => {
      if (formData) {
        sendReceiptMail(props.formData.id);
        getSendData(props.formData.id);
      }
    },
    { deep: true, immediate: true }
  );
  //update-end---author:wangshuai ---date:20220523  for：消息管理第一次初始化没有数据--------------
</script>

<style lang="less" scoped>
  .title {
    font-size: 1.17em;
    word-wrap: break-word;
  }

  .body {
    position: relative;
  }

  div {
    padding: 0;
    margin: 0;
  }

  .author {
    height: 28px;
    color: #858585;
    overflow: hidden;
    text-align: right;
  }

  .summary {
    color: rgba(0, 0, 0, 0.75);
    font-variant-ligatures: common-ligatures;
    line-height: 1.625;
  }

  p {
    margin-bottom: 2em;
  }
</style>
