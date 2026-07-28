<template>
  <!-- table区域-begin -->
  <BasicTable @register="registerTable">
    <template #title="{ text, record }">
      <a @click="handClick(record)">
        <JEllipsis :value="text" :length="12" />
      </a>
    </template>
  </BasicTable>
  <!-- table区域-end -->
  <EoaMailBoxInModal @register="registerModal" @success="getEmailList" @reply="handReply"></EoaMailBoxInModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useUserStore } from '/@/store/modules/user';
  import { emailList } from '../cmsbpm.api';
  import EoaMailBoxInModal from '/@/views/super/eoa/email/components/EoaMailBoxInModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useRouter } from 'vue-router';
  import { JEllipsis } from '/@/components/Form';

  const emailData = ref([]);
  const userStore = useUserStore();
  const id = userStore.getUserInfo?.id || '';
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      align: 'center',
      slots: { customRender: 'title' },
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: 'readFlagText',
    },
    {
      title: '发件人',
      align: 'center',
      dataIndex: 'senderId_dictText',
    },
    {
      title: '日期',
      align: 'center',
      dataIndex: 'sendTime',
    },
  ];

  const [registerTable] = useTable({
    columns: columns,
    pagination: false,
    dataSource: emailData,
    striped: true,
    useSearchForm: false,
    showTableSetting: false,
    bordered: false,
    showIndexColumn: false,
    canResize: false,
    rowKey: 'id',
  });

  //update-begin---author:wangshuai ---date:20220520  for：流程门户邮箱列表点击标题出现邮件预览页面/回复路由跳转------------
  const router = useRouter();
  const [registerModal, { openModal }] = useModal();

  /**
   * 标题点击事件
   * @param record
   */
  function handClick(record) {
    openModal(true, record);
  }

  /**
   * 回复
   * @param record
   */
  function handReply(record) {
    //跳转到邮箱
    router.push({ name: 'eoa-email', params: { type: 'process', rec: JSON.stringify(record.value) } });
  }
  //update-end---author:wangshuai ---date:20220520  for：流程门户邮箱列表点击标题出现邮件预览页面-------------

  getEmailList();
  function getEmailList() {
    emailList({ pageNo: 1, pageSize: 5, userId: id, status: '0' }).then((res) => {
      if (res.success) {
        let data = res.result.records;
        if (data) {
          for (let i = 0; i < data.length; i++) {
            data[i].readFlagText = data[i]?.readFlag === '0' ? '未读' : '已读';
            data[i].sendTime = data[i]?.sendTime.substring(0, 10);
          }
          emailData.value = data;
          console.log('emailData', emailData);
        }
      }
    });
  }
</script>
<style scoped></style>
