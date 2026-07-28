<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!--委派弹窗-->
    <DelegateModal @register="registerModal" @success="handleEntruster" title="请选择委派人"></DelegateModal>
    <!--转办弹窗-->
    <DelegateModal @register="registerModalComplaint" @success="handleComplaint" title="请选择转办人"></DelegateModal>
    <!--跳转弹窗-->
    <SelectTaskNodeModal @register="registerSkipModal" @success="reload"></SelectTaskNodeModal>
    <!--历史-->
    <HisTaskDealModal ref="taskDealRef" :path="path" :formData="formData"></HisTaskDealModal>
  </div>
</template>
<script lang="ts" name="process-instance-list" setup>
  import { ref, unref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import DelegateModal from '../components/DelegateModal.vue';
  import SelectTaskNodeModal from '../components/SelectTaskNodeModal.vue';
  import HisTaskDealModal from '../components/HisTaskDealModal.vue';
  import { useModal } from '/@/components/Modal';
  import { columns, searchFormSchema } from './instance.data';
  import { list, suspend, restart, closeProcess, taskEntrust, taskComplaint } from './instance.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useBpmNodeInfo } from '../components/hooks/useBpmNodeInfo';
  //委派弹窗
  const [registerModal, { openModal }] = useModal();
  //委派弹窗
  const [registerModalComplaint, { openModal: openModalComplaint }] = useModal();
  //跳转弹窗
  const [registerSkipModal, { openModal: openSkipModal }] = useModal();

  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'process-expression',
    tableProps: {
      api: list,
      isTreeTable: true,
      rowKey: 'processInstanceId',
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  const taskId = ref('');
  const path = ref('');
  const taskDealRef = ref(null);
  let { getHisProcessNodeInfo, formData } = useBpmNodeInfo(path, taskDealRef);
  /**
   * 激活
   * @param id
   */
  async function handleRestart(id) {
    await restart({ processInstanceId: id }, reload);
  }
  /**
   * 挂起
   * @param id
   */
  async function handleSuspend(id) {
    await suspend({ processInstanceId: id }, reload);
  }
  /**
   * 关闭
   * @param id
   */
  async function handleClose(id) {
    await closeProcess({ processInstanceId: id }, reload);
  }
  /**
   * 选择委派人员弹窗
   * @param record
   */
  function handleSelectEntruster(record) {
    taskId.value = record.taskId;
    openModal(true);
  }
  /**
   * 选择转办人员弹窗
   * @param record
   */
  function handleSelectComplaint(record) {
    taskId.value = record.taskId;
    openModalComplaint(true);
  }
  /**
   * 跳转
   * @param taskId
   */
  function handleSkipNode(taskId) {
    openSkipModal(true, { taskId });
  }
  /**
   * 显示历史
   * @param record
   */
  function showHistory(record) {
    getHisProcessNodeInfo(record);
  }

  /**
   * 委派
   * @data
   */
  async function handleEntruster(data) {
    console.log('handleEntruster委派返回值data：', data);
    let params = { taskId: unref(taskId), taskAssignee: data.username };
    await taskEntrust(params, reload);
  }
  /**
   * 转办
   * @data
   */
  async function handleComplaint(data) {
    console.log('handleComplaint转办返回值data：', data);
    let params = { taskId: unref(taskId), taskAssignee: data.username };
    await taskComplaint(params, reload);
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '激活',
        popConfirm: {
          title: '是否激活？',
          confirm: handleRestart.bind(null, record.id),
        },
        ifShow: () => {
          return record.isSuspended != '' && record.isSuspended === 'true';
        },
      },
      {
        label: '挂起',
        popConfirm: {
          title: '是否挂起？',
          confirm: handleSuspend.bind(null, record.id),
        },
        ifShow: () => {
          return record.isSuspended != '' && record.isSuspended === 'false';
        },
      },
    ];
  }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      {
        label: '关闭',
        popConfirm: {
          title: '是否关闭吗?',
          confirm: handleClose.bind(null, record.id),
        },
        ifShow: () => {
          return record.isSuspended != '' && record.isSuspended != 'finished';
        },
      },
      {
        label: '转办',
        onClick: handleSelectComplaint.bind(null, record),
        ifShow: () => {
          return record.isSuspended != '' && record.isSuspended === 'false' && record.isSuspended != 'finished';
        },
      },
      {
        label: '委派',
        onClick: handleSelectEntruster.bind(null, record),
        ifShow: () => {
          return record.isSuspended != '' && record.isSuspended === 'false' && record.isSuspended != 'finished';
        },
      },
      {
        label: '跳转',
        onClick: handleSkipNode.bind(null, record.taskId),
        ifShow: () => {
          return record.isSuspended != '';
        },
      },
      {
        label: '历史',
        onClick: showHistory.bind(null, record),
        ifShow: () => {
          return record.isSuspended != '';
        },
      },
    ];
  }
</script>
