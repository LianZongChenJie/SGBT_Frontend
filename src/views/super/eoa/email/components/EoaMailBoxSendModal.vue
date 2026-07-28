<template>
  <BasicModal v-bind="$attrs" :title="title" @register="registerModal" width="800px">
    <template #footer>
      <a-button type="primary" @click="handleReply(1)">转发</a-button>
      <a-button type="primary" @click="handleWithdraw" v-if="replyRecord.withdrawFlag != '1'">撤回</a-button>
      <a-button type="primary" @click="handleReply(3)">再次发送</a-button>
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>
    <div class="body">
      <div style="text-align: left">
        <h3
          >主题：{{ replyRecord.title }}
          <a @click="readHandleClick" style="margin-left: 8px">
            <a-icon type="eye" />
          </a>
        </h3>
      </div>
      <div style="display: flex">
        <div style="width: 50%; text-align: left">
          <span>收件人：{{ replyRecord.receiverIds_dictText }}</span>
        </div>
        <div style="width: 50%; text-align: right" class="author">
          <span> {{ replyRecord.sendTime }}</span>
        </div>
      </div>
      <div v-if="replyRecord.withdrawFlag === '1'">
        <div style="width: 50%; text-align: left">
          <span>撤回状态：已撤回</span>
          <a @click="handleDetail" style="margin-left: 8px">
            {{ detailStatus ? '关闭' : '查看详情' }}
          </a>
        </div>
      </div>
      <BasicTable
        v-if="detailStatus"
        :columns="systemMessageColumn"
        :dataSource="dataSource"
        :canResize="false"
        :pagination="ipagination"
        @change="handleTableChange"
      />
      <div style="margin-top: 20px; border-top: 1px solid #e0e0e0">
        <div v-html="replyRecord.content"></div>
      </div>
      <div v-if="replyRecord.attachment">
        <JUpload v-model:value="replyRecord.attachment" :disabled="disabled" :buttonVisible="!disabled"></JUpload>
      </div>
    </div>
  </BasicModal>
  <EoaMailBoxReaderModal @register="readerModal"></EoaMailBoxReaderModal>
</template>

<script lang="ts" setup name="eoa-mail-box-send-modal">
  import { ref } from 'vue';
  import { BasicTable } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useModal } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import { inboxListNotTransform, receiverPageList, emailWithdraw } from '../EoaMailBox.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { systemMessageColumn } from '../EoaMailBox.data';
  import { Modal } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import EoaMailBoxReaderModal from './EoaMailBoxReaderModal.vue';

  const emit = defineEmits(['register', 'success', 'reply']);
  const userStore = useUserStore();
  const title = ref<string>('查看邮件');
  const tags = ref<any>([]);
  const dataSource = ref<any>([]);
  const $message = useMessage();
  //表单数据
  const replyRecord = ref<any>({});
  const disabled = ref<boolean>(true);
  const detailStatus = ref<boolean>(false);
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
    //update-begin---author:wangshuai ---date:20220617  for：邮箱弹出高度统一修改--------------
    setModalProps({ height: 400 });
    //update-end---author:wangshuai ---date:20220617  for：邮箱弹出高度统一修改--------------
    replyRecord.value = data;
    if (data.withdrawFlag === '1') {
      await loadData(1);
    }
  });
  const [readerModal, { openModal }] = useModal();

  /**
   * 回复
   * @param type 1 转发 2回复
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
    //刷新列表
    emit('success');
    detailStatus.value = false;
    closeModal();
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
   * 初始化数据
   * @param arg 当前多少页
   */
  async function loadData(arg) {
    if (arg === 1) {
      ipagination.value.current = 1;
    }
    let params = {
      mailId: replyRecord.value.id,
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
   * 表格分页数点击事件
   * @param pagination
   */
  async function handleTableChange(pagination) {
    ipagination.value = pagination;
    await loadData(1);
  }

  /**
   * 撤回
   */
  async function handleWithdraw() {
    Modal.confirm({
      title: '撤回',
      content: '确定要撤回吗；如果对方已读则不可撤回；如果撤回成功，对方将只能看到邮件的主题，并得到已被撤回的提示',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        emailWithdraw({ id: replyRecord.value.id }).then((res) => {
          if (res.success) {
            if (res.result == '2') {
              $message.createMessage.success('撤回部分邮件成功');
            } else if (res.result == '1') {
              $message.createMessage.success('撤回邮件成功');
            } else {
              $message.createMessage.error('撤回邮件失败，对方可能已阅读或者删除邮件，无法撤回');
            }
            handleCancel();
          }
        });
      },
    });
  }

  /**
   * 预览
   */
  function readHandleClick() {
    openModal(true, { id: replyRecord.value.id });
  }

  /**
   * 查看详情
   */
  function handleDetail() {
    detailStatus.value = !detailStatus.value;
  }
</script>
