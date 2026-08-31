<template>
  <!--定义表格-->
  <BasicTable @register="registerTable">
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
    <template #tableTitle>
      <a-tabs class="custom-tab-pane" v-model:activeKey="activeKey" :tabBarGutter="30" style="width: 100%" :tabBarStyle="{ padding: '0 20px' }">
        <a-tab-pane key="待出库" tab="待出库"></a-tab-pane>
        <a-tab-pane key="已出库" tab="已出库"></a-tab-pane>
      </a-tabs>
    </template>
  </BasicTable>
  <applyDetail @register="registerApplyFormModal" @outboundHandle="outboundHandle" />
  <send-back @register="registerSendBack" @success="reload"></send-back>
</template>

<script lang="ts" name="basic-table-demo" setup>
  import { ref, watch } from 'vue';
  import { ActionItem, BasicColumn, BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getOutApplyList, outbound } from './api';
  import { columns, searchFormSchema } from './data';
  import applyDetail from './applyDetail.vue';
  import { useModal } from '@/components/Modal';
  import { useMessage } from '@/hooks/web/useMessage';
  import sendBack from './sendBack.vue';
  import ApplyForm from '@/views/inventory/outApply/applyForm.vue';
  const activeKey = ref('待出库');
  const { createMessage } = useMessage();
  const [registerSendBack, { openModal: openSendBackModal }] = useModal();
  const [registerApplyFormModal, { openModal: openApplyDetailModel }] = useModal();
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      title: '',
      api: getOutApplyList,
      columns: columns,
      size: 'small',
      actionColumn: {
        width: 120,
      },
      formConfig: {
        schemas: searchFormSchema,
      },
      beforeFetch: (params) => {
        params.outStatus = activeKey.value;
      },
    },
  });
  // 添加watch监听activeKey的变化
  watch(activeKey, (newVal) => {
    // 当tab切换时，重新加载列表数据
    reload();
  });
  // BasicTable绑定注册
  const [registerTable, { reload }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '详情',
        onClick: detailHandle.bind(null, record),
      },
      {
        label: '出库',
        popConfirm: {
          title: '是否确认出库',
          confirm: outboundHandle.bind(null, record),
        },
        ifShow: record.outStatus == '待出库',
      },
      {
        label: '退库',
        onClick: backHandle.bind(null, record),
      },
    ];
  }

  /**
   * 处理详情操作
   *
   * @param record 记录对象
   */
  function detailHandle(record) {
    openApplyDetailModel(true, record);
  }
  function backHandle(record) {
    openSendBackModal(true, {
      isUpdate: true,
      record: record,
    });
  }
  /**
   * 出库事件
   *
   * @param record
   */
  // const outboundHandle = async (record) => {
  //   await outbound(record.id);
  // };
  async function outboundHandle(record: any, callback: any) {
    try {
      await outbound(record.id);
      // 接单成功后刷新列表
      reload().then(() => {
        createMessage.success('出库成功');
        // 执行回调
        callback?.();
      });
    } catch (error) {
      createMessage.error('出库失败');
      console.error('接单失败:', error);
    }
  }
</script>
<style scoped lang="less">
  /* 使用深度选择器自定义标签页宽度 */
  :deep(.custom-tab-pane .ant-tabs-tab) {
    width: 80px; /* 设置为你需要的宽度 */
    text-align: center;
    display: block;
  }
  :deep(.custom-tab-pane .ant-tabs-nav) {
    margin-bottom: 0;
  }
</style>
