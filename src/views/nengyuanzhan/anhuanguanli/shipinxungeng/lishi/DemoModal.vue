<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" width="80%">
    <a-tabs v-model:activeKey="activeKey" class="record-tabs" @change="handleTabChange">
      <a-tab-pane key="1" tab="相机记录">
        <BasicTable @register="registerTable" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="报警记录" force-render>
        <BasicTable @register="registerTable2" />
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, useTable } from '@/components/Table';
  import { getQueryAlarmRecords, getQueryCameraRecords } from './demo.api';
  import { columnsAlarm, columnsCamera } from './demo.data';

  const taskId = ref<string | number>();
  const taskName = ref('');

  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    activeKey.value = '1';
    taskName.value = data?.record?.taskName || '';
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      taskId.value = data.record.id;
      await Promise.all([reloadCameraRecords(), reloadAlarmRecords()]);
    }
  });

  const [registerTable, { reload: reloadCameraRecords }] = useTable({
    title: '',
    api: getQueryCameraRecords,
    columns: columnsCamera,
    striped: true,
    useSearchForm: false,
    showTableSetting: false,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: true,
    rowKey: 'id',
    immediate: false,
    pagination: false,
    beforeFetch: () => {
      return { taskId: taskId.value };
    },
  });

  const [registerTable2, { reload: reloadAlarmRecords }] = useTable({
    title: '',
    api: getQueryAlarmRecords,
    columns: columnsAlarm,
    striped: true,
    useSearchForm: false,
    showTableSetting: false,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    immediate: false,
    pagination: false,
    beforeFetch: () => {
      return { taskId: taskId.value };
    },
  });

  async function handleTabChange(key: string) {
    if (taskId.value == null) {
      return;
    }

    if (key === '1') {
      await reloadCameraRecords();
    } else if (key === '2') {
      await reloadAlarmRecords();
    }
  }

  const isUpdate = ref(true);
  const activeKey = ref('1');
  const props = defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const title = computed(() => {
    return taskName.value ? `${taskName.value} - 巡更任务详情` : '巡更任务详情';
  });
</script>
<style lang="less" scoped>
  .record-tabs {
    padding: 0 10px;
  }
</style>
