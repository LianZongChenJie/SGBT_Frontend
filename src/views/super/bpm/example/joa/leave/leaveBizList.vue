<template>
  <BasicTable @register="registerTable">
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" />
    </template>
  </BasicTable>
  <!--角色工单授权-->
  <LeaveModal @register="registerModal" @success="reload" />
  <BpmPictureModal @register="registerBpmModal" />
  <!--业务办理弹窗-->
  <BpmBizTaskDealModal ref="taskDealModal" :path="path" :formData="formData" @ok="taskOk"></BpmBizTaskDealModal>
</template>
<script lang="ts" name="leave-list" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';
  import LeaveModal from './components/LeaveModal.vue';
  import BpmPictureModal from '/@/views/super/bpm/process/manage/components/BpmPictureModal.vue';
  import BpmBizTaskDealModal from '/@/views/super/bpm/example/batch/components/BpmBizTaskDealModal.vue';
  import { columns, searchFormSchema } from './leave.data';
  import { taskList } from './leave.api';
  import { claim, getBizProcessNodeInfo } from '/@/views/super/bpm/process/manage/components/bpm.api.ts';

  const [registerModal, { openModal }] = useModal();
  const [registerBpmModal, { openModal: bpmPicModal }] = useModal();
  const { createMessage, createConfirm } = useMessage();

  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'leave-list',
    tableProps: {
      api: taskList,
      columns: columns,
      canResize: false,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 120,
      },
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
  const flowCode = 'joa_leave_01';
  const path = ref('');
  const formData = ref({});
  const taskDealModal = ref(null);
  /**
   * 签收
   */
  function handleClaim(record) {
    createConfirm({
      iconType: 'warning',
      title: '确认签收吗',
      content: '是否签收该任务?',
      onOk: async () => {
        let res = await claim({ taskId: record.taskId });
        if (res.success) {
          createMessage.success(res.message);
        } else {
          createMessage.warning(res.message);
        }
        reload();
      },
    });
  }
  /**
   * 办理
   */
  async function handleProcess(record) {
    let res = await getBizProcessNodeInfo({ flowCode: flowCode, dataId: record.id });
    if (res.success) {
      console.log('获取流程节点信息', res);
      console.log('表单数据', res.result.records);
      let data = {
        dataId: res.result.dataId,
        taskId: res.result.taskId,
        flowCode: flowCode,
        taskDefKey: res.result.taskDefKey,
        procInsId: res.result.procInsId,
        tableName: res.result.tableName,
        permissionList: res.result.permissionList,
        bizTaskList: res.result.bizTaskList,
        vars: res.result.records,
      };
      formData.value = data;
      path.value = res.result.formUrl;
      console.log('------获取流程节点信息>>', data);
      console.log('------流程表单地址>>', path.value);
      taskDealModal.value.deal(data);
    }
  }

  function taskOk() {
    reload();
  }
  /**
   * 审批进度
   */
  function handlePreviewPic(record) {
    bpmPicModal(true, {
      flowCode,
      dataId: record.id,
    });
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '签收',
        onClick: handleClaim.bind(null, record),
        ifShow: !!!record.assignee,
      },
      {
        label: '办理',
        onClick: handleProcess.bind(null, record),
        ifShow: !!record.assignee,
      },
      {
        label: '审批进度',
        onClick: handlePreviewPic.bind(null, record),
      },
    ];
  }
</script>
