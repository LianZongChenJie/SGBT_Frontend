<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #tableTitle>
        <a-space>
          <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增 </a-button>

          <a-button
            type="primary"
            @click="toggleAutoRefresh"
            :preIcon="autoRefreshEnabled ? 'ant-design:pause-outlined' : 'ant-design:sync-outlined'"
          >
            {{ autoRefreshEnabled ? '停止自动刷新' : '自动刷新' }}
          </a-button>

          <a-tag color="blue" v-if="autoRefreshEnabled"> <ClockCircleOutlined /> {{ countdown }}秒后刷新 </a-tag>
          <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出报表</a-button>
        </a-space>
      </template>
    </BasicTable>
    <OrderModal @register="registerModal" @success="reload" />
    <DetailModal @register="registerModal2" @success="reload" :footer="null" @handleTakeOrder="handleTakeOrder" @doAction="doAction"> </DetailModal>
    <Process @register="registerModal4" @success="reload" />
    <Appraise @register="registerModal6" @success="reload" />
    <TransferModel @register="transferModal" @success="reload" />
    <OrderDetailModal @register="registerModal7" />
  </div>
</template>

<script setup lang="ts" name="event-event">
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { useListPage } from '@/hooks/system/useListPage';
  import { getEventOrderList, takeOrder } from './eventOrder.api';
  import { columns, searchFormSchema } from './event.data';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useModal } from '@/components/Modal';
  import OrderModal from './eventModel.vue';
  import DetailModal from './detailModel.vue';
  import OrderDetailModal from '../manager/detailModel.vue';
  import TableAction from '@/components/Table/src/components/TableAction.vue';
  import Process from '@/views/event/event/process.vue';
  import Appraise from '@/views/event/event/appraise.vue';
  import TransferModel from '@/views/event/event/transferModel.vue';
  import { ClockCircleOutlined } from '@ant-design/icons-vue';
  import { onBeforeUnmount, reactive, ref } from 'vue';

  // 自动刷新相关代码
  const autoRefreshEnabled = ref(false);
  const countdown = ref(60);
  let refreshTimer: NodeJS.Timeout | null = null;

  const toggleAutoRefresh = () => {
    autoRefreshEnabled.value = !autoRefreshEnabled.value;

    if (autoRefreshEnabled.value) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  };

  const startAutoRefresh = () => {
    // 立即刷新一次
    reload();

    // 设置定时器
    refreshTimer = setInterval(() => {
      countdown.value--;

      if (countdown.value <= 0) {
        reload();
        countdown.value = 60; // 重置倒计时
      }
    }, 1000);
  };

  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
    countdown.value = 60;
  };

  onBeforeUnmount(() => {
    stopAutoRefresh();
  });

  // 你原有的代码
  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
  const [registerModal2, { openModal: openModal2 }] = useModal();
  const [registerModal4, { openModal: openModal4 }] = useModal();
  const [registerModal6, { openModal: openModal6 }] = useModal();
  const [registerModal7, { openModal: openModal7 }] = useModal();
  const [transferModal, { openModal: openTransferModal }] = useModal();

  const { tableContext, onExportXls } = useListPage({
    designScope: 'eventOder-template',
    exportConfig: {
      name: '事件管理',
      url: '/jeecg-demo/event/event/exportReport',
      // isXlsx: true,
    },
    tableProps: {
      title: '事件工单',
      api: getEventOrderList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        fieldMapToTime: [['timeRange', ['createdTimeStart', 'createdTimeEnd'], 'YYYY-MM-DD']],
      },
      showIndexColumn: true,
      actionColumn: {
        width: 150,
        align: 'center',
        title: '操作',
        fixed: 'right',
      },
    },
  });

  const [registerTable, { reload }] = tableContext;

  function handleAdd() {
    openModal(true, {
      isUpdate: false,
    });
  }

  function getActions(record: any) {
    let actions = [
      {
        label: '详情',
        onClick: doAction.bind(null, record, '详情'),
      },
    ];
    if (record.orderId) {
      actions.push({
        label: '工单详情',
        onClick: doAction.bind(null, record, '工单详情'),
      });
    }
    let eventOperationList = record.eventOperationList;

    eventOperationList.forEach((item: any) => {
      actions.push({
        label: item.name,
        onClick: doAction.bind(null, record, item.name),
      });
    });
    return actions;
  }

  function doAction(record: any, name: any) {
    if (name == '详情') {
      openModal2(true, {
        record,
        isUpdate: true,
        showFooter: false,
      });
    }
    if (name == '工单详情') {
      const recordCopy = reactive({
        ...record,
        id: record.orderId,
      });
      openModal7(true, {
        record: recordCopy,
        isUpdate: true,
        showFooter: false,
        name,
      });
    }
    if (name == '转工单') {
      openTransferModal(true, {
        record: record,
      });
    }
    if (name == '处理') {
      openModal4(true, { record });
    }
    if (name == '评价') {
      openModal6(true, { record });
    }
  }

  async function handleTakeOrder(record: any, callback: any) {
    try {
      await takeOrder({
        id: record.id,
      });
      reload().then(() => {
        createMessage.success('接单成功');
        callback?.();
      });
    } catch (error) {
      createMessage.error('接单失败');
      console.error('接单失败:', error);
    }
  }
</script>
