<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #form-bizTaskType="{ model, field }">
        <a-radio-group v-model:value="queryParam.bizTaskType" @change="onBizTaskTypeChange(model, field)">
          <a-radio value="1">待我审批</a-radio>
          <a-radio value="2">我发起的申请</a-radio>
        </a-radio-group>
      </template>
      <template #notify="{ text, record }">
        <SoundTwoTone title="催办提醒" v-if="record.taskUrge" twoToneColor="#eb2f96" @click.stop="taskNotifyMe(flowCode, record.id)" />
        {{ text }}
      </template>
      <template #tableTitle>
        <template v-if="queryParam.bizTaskType == '2'">
          <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button>
          <a-dropdown v-if="selectedRowKeys.length > 0">
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="batchHandleDelete">
                  <Icon icon="ant-design:delete-outlined"></Icon>
                  删除
                </a-menu-item>
              </a-menu>
            </template>
            <a-button
              >批量操作
              <Icon icon="mdi:chevron-down"></Icon>
            </a-button>
          </a-dropdown>
        </template>
        <template v-else>
          <a-button @click="handleBatch(1)" type="primary" preIcon="ant-design:caret-right-outlined">批量发送</a-button>
          <a-button @click="handleBatch(2)" type="primary" preIcon="ant-design:user-outlined">批量委托</a-button>
          <a-button @click="handleBatch(3)" type="primary" preIcon="ant-design:rollback-outlined">批量退回</a-button>
          <a-button @click="handleBatch(4)" type="primary" preIcon="ant-design:lock-outlined">批量挂起</a-button>
          <a-button @click="handleBatch(5)" type="primary" preIcon="ant-design:unlock-outlined">批量解挂</a-button>
        </template>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!--新增编辑弹窗-->
    <BizLeaveModal @register="registerModal" @success="reload"></BizLeaveModal>
    <!--业务办理弹窗-->
    <BpmBizTaskDealModal ref="taskDealModal" :path="path" :formData="formData" @ok="handleClear"></BpmBizTaskDealModal>
    <!--审批跟踪记录弹窗-->
    <BpmProcessTrackModal ref="trackModal"></BpmProcessTrackModal>
    <!--催办弹窗-->
    <BizTaskNotifyModal ref="taskNotifyModal"></BizTaskNotifyModal>
    <!--催办自己弹窗-->
    <BizTaskNotifyMeModal ref="taskNotifyMeModal"></BizTaskNotifyMeModal>
    <!--批量发送-->
    <BpmBizBatchCompleteDealModal ref="completeModal" @ok="handleClear"></BpmBizBatchCompleteDealModal>
    <!--批量委托-->
    <BpmBizBatchEntrusterDealModal ref="entrusterModal" @ok="handleClear"></BpmBizBatchEntrusterDealModal>
    <!--批量退回-->
    <BpmBizBatchRejectDealModal ref="rejectModal" @ok="handleClear"></BpmBizBatchRejectDealModal>
    <!--批量挂起-->
    <BpmBizBatchSuspendDealModal ref="suspendModal" @ok="handleClear"></BpmBizBatchSuspendDealModal>
    <!--批量解挂-->
    <BpmBizBatchRestartDealModal ref="restartModal" @ok="handleClear"></BpmBizBatchRestartDealModal>

    <!-- 测试流程设计modal -->
    <mini-des-flow-modal @register="registerMiniDesFlowModal"></mini-des-flow-modal>
  </div>
</template>
<script lang="ts" name="biz-leave-list" setup>
  import { ref, reactive, toRaw, getCurrentInstance, unref } from 'vue';
  import { BasicTable, TableAction } from '/src/components/Table';
  import BizLeaveModal from './components/BizLeaveModal.vue';
  import BpmBizTaskDealModal from './components/BpmBizTaskDealModal.vue';
  import BpmProcessTrackModal from './components/BpmProcessTrackModal.vue';
  import BizTaskNotifyModal from './components/BizTaskNotifyModal.vue';
  import BizTaskNotifyMeModal from './components/BizTaskNotifyMeModal.vue';
  import BpmBizBatchCompleteDealModal from './components/BpmBizBatchCompleteDealModal.vue';
  import BpmBizBatchEntrusterDealModal from './components/BpmBizBatchEntrusterDealModal.vue';
  import BpmBizBatchRejectDealModal from './components/BpmBizBatchRejectDealModal.vue';
  import BpmBizBatchSuspendDealModal from './components/BpmBizBatchSuspendDealModal.vue';
  import BpmBizBatchRestartDealModal from './components/BpmBizBatchRestartDealModal.vue';
  import { SoundTwoTone } from '@ant-design/icons-vue';
  import { useModal } from '/src/components/Modal';
  import { useMessage } from '/src/hooks/web/useMessage';
  import { showDealBtn } from '/src/utils';
  import { columns, searchFormSchema } from './leave.data';
  import { list, startProcess, deleteOne, invalidProcess, queryFlowData, batchDelete, checkNotify } from './leave.api';
  import { getBizProcessNodeInfo } from '/src/views/super/bpm/process/manage/components/bpm.api.ts';
  import { useListPage } from '/src/hooks/system/useListPage';
  const { createMessage } = useMessage();
  //弹窗
  const [registerModal, { openModal }] = useModal();
  //查询条件
  const queryParam = reactive({
    bizTaskType: '1',
    name: '',
  });
  //弹窗示例
  const instance = getCurrentInstance();
  const formData = ref({});
  const path = ref('');
  const flowCode = 'TEST001';
  const formUrl = 'super/bpm/example/batch/components/BizLeaveForm';
  const formUrlMobile = 'super/bpm/example/batch/components/BizLeaveForm';
  // 列表页面公共参数、方法 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
  const { prefixCls, tableContext } = useListPage({
    designScope: 'leave-list',
    tableProps: {
      title: '业务办理',
      api: list,
      columns: columns,
      canResize: false,
      afterFetch: afterFetch,
      formConfig: {
        schemas: searchFormSchema,
        resetFunc: handleReset,
      },
      actionColumn: {
        width: 120,
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, clearSelectedRowKeys }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  const [registerMiniDesFlowModal, { openModal: openDesignModalTest }] = useModal();
  /**
   * 新增
   */
  function handleCreate() {
    openModal(true, {
      isUpdate: false,
    });
  }
  /**
   * 编辑
   */
  function handleEdit(record: Recordable) {
    console.log('点击了编辑', record);
    openModal(true, {
      record,
      isUpdate: true,
    });
  }
  /**
   * 删除
   * @param id
   */
  async function handleDelete(id) {
    console.log('点击了删除', id);
    await deleteOne({ id }, reload);
  }
  /**
   * 详情
   * @param id
   */
  async function handleDetail(record) {
    console.log('点击了详情', record);
    openModal(true, {
      record,
      isUpdate: true,
      isDetail: true,
    });
  }
  /**
   * 办理
   * @param record
   */
  async function handleProcess(record) {
    console.log('点击了办理', record);
    let res = await getBizProcessNodeInfo({ flowCode: flowCode, dataId: record.id });
    if (res.success) {
      console.log('获取流程节点信息', res);
      let data = {
        dataId: res.result.dataId,
        taskId: res.result.taskId,
        taskDefKey: res.result.taskDefKey,
        procInsId: res.result.procInsId,
        tableName: res.result.tableName,
        permissionList: res.result.permissionList,
        bizTaskList: res.result.bizTaskList,
        vars: res.result.records,
      };
      formData.value = data;
      console.log('------获取流程节点信息', unref(formData));
      path.value = res.result.formUrl;
      console.log('获取流程节点信息', unref(path));
      instance.refs.taskDealModal.deal(data);
      instance.refs.taskDealModal.title = '流程办理';
    }
  }
  /**
   * 提交流程
   * @param record
   */
  async function handleStartProcess(record) {
    let params = {
      flowCode: flowCode,
      id: record.id,
      formUrl: formUrl,
      formUrlMobile: formUrlMobile,
    };
    let res = await startProcess(params);
    if (res && res.success) {
      createMessage.success(res.message);
      handleClear();
    } else {
      createMessage.warning(res.message || '流程启动异常');
    }
  }
  /**
   * 清空并重新加载
   * @param record
   */
  function handleClear() {
    reload();
    clearSelectedRowKeys();
  }
  /**
   * 列表接口请求后处理
   * @param record
   */
  async function afterFetch(data) {
    if (queryParam.bizTaskType == '1') {
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let params = { flowCode: flowCode, dataId: item.id }; //查询条件
        let res2 = await checkNotify(params);
        if (res2.result) {
          item.taskUrge = true;
        }
      }
    }
  }
  //提醒我的
  async function taskNotifyMe(flowCode, dataId) {
    let params = { flowCode: flowCode, dataId: dataId }; //查询条件
    await queryFlowData(params, (res) => {
      if (res.success) {
        instance.refs.taskNotifyMeModal.notify(res.result.processInstId);
        instance.refs.taskNotifyMeModal.title = '催办提醒';
      }
    });
  }
  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, () => {
      selectedRowKeys.value = [];
      reload();
    });
  }
  //批量挂起
  function handleBatch(type) {
    let rows = toRaw(selectedRows.value);
    if (rows.length > 0) {
      let param = [];
      for (let i = 0; i < rows.length; i++) {
        let data = { dataId: rows[i].id, flowCode, bizTitle: rows[i].name };
        param.push(data);
      }
      switch (type) {
        case 1:
          instance.refs.completeModal.deal(param);
          instance.refs.completeModal.title = '批量发送';
          break;
        case 2:
          instance.refs.entrusterModal.deal(param);
          instance.refs.entrusterModal.title = '批量委派';
          break;
        case 3:
          instance.refs.rejectModal.deal(param);
          instance.refs.rejectModal.title = '批量退回';
          break;
        case 4:
          instance.refs.suspendModal.deal(param);
          instance.refs.suspendModal.title = '批量挂起';
          break;
        case 5:
          instance.refs.restartModal.deal(param);
          instance.refs.restartModal.title = '批量解挂';
          break;
      }
    } else {
      createMessage.warning('请选择一条记录！');
    }
  }

  //催办
  async function taskNotify(record) {
    let params = { flowCode: flowCode, dataId: record.id }; //查询条件
    await queryFlowData(params, (res) => {
      if (res.success) {
        instance.refs.taskNotifyModal.notify(res.result.processInstId);
        instance.refs.taskNotifyModal.data.title = '催办提醒';
      }
    });
  }
  //审批进度
  function handleTrack(record) {
    let params = { flowCode: flowCode, dataId: record.id }; //查询条件
    instance.refs.trackModal.handleTrack(params);
    instance.refs.trackModal.data.title = '审批跟踪记录';
  }
  //审批进度(简版)
  function handleSimpleTrack(record) {
    openDesignModalTest(true, {
      dataId: record.id,
      preview:"true",
      flowCode: flowCode
    });
  }
  //作废流程
  async function handleInvalidProcess(record) {
    await invalidProcess({ flowCode: flowCode, dataId: record.id }, reload);
  }
  //类型切换
  function onBizTaskTypeChange(model, field) {
    model[field] = queryParam.bizTaskType;
    reload();
  }
  //自定义重置
  function handleReset() {
    queryParam.bizTaskType = '1';
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        ifShow: () => {
          return record.bpmStatus === '1';
        },
      },
      {
        label: '提交流程',
        popConfirm: {
          title: '确认提交流程吗?',
          confirm: handleStartProcess.bind(null, record),
        },
        ifShow: () => {
          return record.bpmStatus === '1';
        },
      },
      {
        label: '办理',
        onClick: handleProcess.bind(null, record),
        ifShow: () => {
          return showDealBtn(record.bpmStatus) && queryParam.bizTaskType == '1';
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
        label: '详情',
        onClick: handleDetail.bind(null, record),
        ifShow: () => {
          return queryParam.bizTaskType == '2';
        },
      },
      {
        label: '催办',
        onClick: taskNotify.bind(null, record),
        ifShow: () => {
          return record.bpmStatus !== '1' && record.bpmStatus !== '3' && queryParam.bizTaskType == '2';
        },
      },
      {
        label: '审批进度',
        onClick: handleTrack.bind(null, record),
        ifShow: () => {
          return record.bpmStatus !== '1';
        },
      },
      // {
      //   label: '审批进度(简版)',
      //   onClick: handleSimpleTrack.bind(null, record),
      //   ifShow: () => {
      //     return record.bpmStatus !== '1';
      //   },
      // },
      {
        label: '作废流程',
        popConfirm: {
          title: '是否确认作废',
          confirm: handleInvalidProcess.bind(null, record),
        },
        ifShow: () => {
          return showDealBtn(record.bpmStatus) && queryParam.bizTaskType == '2';
        },
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record.id),
        },
        ifShow: () => {
          return record.bpmStatus === '1';
        },
      },
    ];
  }
</script>
