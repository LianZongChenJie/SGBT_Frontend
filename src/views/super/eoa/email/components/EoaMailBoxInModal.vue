<template>
  <BasicModal v-bind="$attrs" :title="title" @register="registerModal" width="800px" destroyOnClose :afterClose="afterClose">
    <template #footer>
      <a-button type="primary" @click="handleReply(1)">转发</a-button>
      <a-button type="primary" @click="handleReply(2)" v-if="replyRecord.senderId != '系统通知'">回复</a-button>
      <a-button type="primary" @click="handleReply(3)" v-if="replyRecord.type && replyRecord.type == '1'">再次发送 </a-button>
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>
    <div class="body">
      <div style="text-align: left">
        <h3>主题：{{ replyRecord.title }}</h3>
      </div>
      <div style="display: flex">
        <div v-for="tag in tags">
          <a-tag :color="tag.color" :key="tag.value" style="margin-top: 10px">
            <span>{{ tag.title }}</span>
          </a-tag>
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

<script lang="ts" setup name="eoa-mail-box-in-modal">
  import { ref } from 'vue';
  import { BasicTable } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { inboxListNotTransform, editByEmailIdAndUserId, addEmail, receiverPageList } from '../EoaMailBox.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { systemMessageColumn } from '/@/views/super/eoa/email/EoaMailBox.data';

  const emit = defineEmits(['register', 'success', 'reply']);
  const userStore = useUserStore();
  const title = ref<string>('查看邮件');
  const tags = ref<any>([]);
  const dataSource = ref<any>([]);
  //表单数据
  const replyRecord = ref<any>({});
  const disabled = ref<boolean>(true);
  const ipagination = ref<any>({
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '30'],
    showQuickJumper: true,
    showSizeChanger: true,
    total: 0,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //update-end---author:wangshuai ---date:20220608  for：[VUEN-1241]收件箱与垃圾箱 邮件详情弹框太小了--------------
    setModalProps({ minHeight: 400 });
    //update-begin---author:wangshuai ---date:20220608  for：[VUEN-1241]收件箱与垃圾箱 邮件详情弹框太小了------------
    await sendReceiptMail(data.id);
    await getSendData(data.id);
  });

  const color = ref<any>(['purple', 'red', 'orange', 'green', 'cyan', 'blue', 'pink']);

  /**
   * 回复
   * @param type 1 转发 2回复 3 继续发送
   */
  function handleReply(type) {
    replyRecord.value.replyType = type;
    emit('reply', replyRecord);
    closeModal();
  }

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
        setTags(record);
      }
    });
  }

  /**
   * 初始化tag标签
   * @param labelName
   */
  function setTags(record) {
    const tool = ref<any>([]);
    let j = 0;
    if (record.labelName) {
      let labelNames = record.labelName.split(',');
      let mailboxValue = record.categoryId.split(',');
      for (let k = 0; k < mailboxValue.length; k++) {
        if (j >= color.value.length) {
          j = 0;
        }
        let tab = {
          id: record.receiverId,
          value: mailboxValue[k],
          title: labelNames[k],
          color: color.value[j],
        };
        j++;
        tool.value.push(tab);
      }
    }
    tags.value = tool.value;
  }

  /**
   * 加载数据
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
   * 分页改变事件
   * @param pagination
   */
  async function handleTableChange(pagination) {
    ipagination.value = pagination;
    await loadData(1);
  }

  /**
   * 彈窗关闭之后的事件
   */
  function afterClose() {
    return new Promise<void>((resolve) => {
      //刷新列表
      emit('success');
      resolve();
    })
  }
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
