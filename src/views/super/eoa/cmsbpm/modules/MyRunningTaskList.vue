<template>
  <BasicTable @register="registerTable">
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
    <template #bpmBizTitle="{ text, record }">
      <NotificationTwoTone v-if="record.taskUrge" title="催办提醒" twoToneColor="#eb2f96" @click="taskNotify(record)" />
      <JEllipsis :value="text" :length="15" />
    </template>
  </BasicTable>

  <!-- 办理 -->
  <TaskHandleModal @register="registerHandleModal" @success="reload"></TaskHandleModal>
  <!--委派弹窗-->
  <SelectEntrusterModal @register="registerModal" @selected="handleEntruster"></SelectEntrusterModal>
  <!-- 催办 -->
  <TaskNotifyMeModal @register="registerNotifyModal"></TaskNotifyMeModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import JEllipsis from '/@/components/Form/src/jeecg/components/JEllipsis.vue';
  import { NotificationTwoTone } from '@ant-design/icons-vue';
  import { useMyRunningTaskList } from '/@/hooks/jeecg/process/useMyRunningTaskList';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';
  import { taskList, taskEntrust, taskClaim } from '../cmsbpm.api';
  // 表头
  const columns = [
    {
      title: '业务标题',
      dataIndex: 'bpmBizTitle',
      slots: { customRender: 'bpmBizTitle' },
    },
    {
      title: '流程名称',
      dataIndex: 'processDefinitionName',
    },
    {
      title: '开始时间',
      dataIndex: 'taskBeginTime',
    },
    {
      title: '当前环节',
      dataIndex: 'taskName',
    },
  ];
  //办理弹窗
  const [registerHandleModal, { openModal: openHandleModal }] = useModal();
  //委派弹窗
  const [registerModal, { openModal }] = useModal();
  //催办
  const [registerNotifyModal, { openModal: openNotifyModal }] = useModal();
  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      api: taskList,
      columns,
      pagination: false,
      size: 'small',
      useSearchForm: false,
      beforeFetch: (params) => {
        return Object.assign(params, { pageSize: 5 });
      },
      showTableSetting: false,
      canResize: false,
      actionColumn: {
        width: 120,
      },
    },
  });
  const { getTaskNodeInfo } = useMyRunningTaskList('run');

  //注册table数据
  const [registerTable, { reload }] = tableContext;
  const taskId = ref('');
  /**
   * 办理
   */
  async function handleProcess(record) {
    let { formData, formUrl } = await getTaskNodeInfo(record);
    formData['PROCESS_TAB_TYPE'] = 'run';
    openHandleModal(true, {
      formData,
      formUrl,
      title: '流程办理',
    });
  }
  /**
   * 签收
   */
  async function handleClaim(record) {
    let params = { taskId: record.id };
    let res = await taskClaim(params);
    res.success && reload();
  }
  /**
   * 委派
   */
  function selectEntruster(record) {
    openModal(true, {
      taskId: record.id,
    });
  }
  /**
   * 委派选中回调
   * @data
   */
  async function handleEntruster(params) {
    await taskEntrust(params, reload);
  }
  /**
   * 催办
   **/
  function taskNotify(record) {
    openNotifyModal(true, {
      procInstId: record.processInstanceId,
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '办理',
        onClick: handleProcess.bind(null, record),
        ifShow: record.taskAssigneeName && record.taskAssigneeName != '',
      },
      {
        label: '委托',
        onClick: selectEntruster.bind(null, record),
        ifShow: record.taskAssigneeName && record.taskAssigneeName != '',
      },
      {
        label: '签收',
        popConfirm: {
          title: '确定签收吗？',
          placement: 'left',
          confirm: handleClaim.bind(null, record),
        },
        ifShow: !(record.taskAssigneeName && record.taskAssigneeName != ''),
      },
    ];
  }
</script>
<style lang="less" scoped>
  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px;
  }
</style>
