<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!-- 审批记录 -->
    <BpmProcessFormTrackModal ref="trackRef"></BpmProcessFormTrackModal>
    <!-- 表单区域 -->
    <DesformDataModal ref="desformModal" @added="handleDesformDataAdded" @edited="handleDesformDataEdited" @close="reload" />
  </div>
</template>
<script lang="ts" name="process-order-list" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import BpmProcessFormTrackModal from '/@/views/super/bpm/process/manage/components/BpmProcessFormTrackModal.vue';
  import DesformDataModal from './components/DesformDataModal.vue';
  import { columns, searchFormSchema } from './my.apply.data';
  import { list, startProcess, startDesFormProcess, deleteOne, saveOrUpdate } from './my.apply.api';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage } = useMessage();
  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'my-process-order',
    tableProps: {
      title: '我的工单',
      api: list,
      columns: columns,
      canResize: false,
      scroll: { x: 1800 },
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 150,
        fixed: 'right',
      },
    },
  });
  const [registerTable, { reload, clearSelectedRowKeys }, { rowSelection, selectedRowKeys }] = tableContext;

  const flowCodePre = 'desform_';
  const trackRef = ref();
  const desformModal = ref();
  /**
   * 提交流程
   *  @param record
   */
  async function handleStartProcess(record) {
    const success = async (res) => {
      if (res && res.success) {
        let jsonData = res.result.desformDataJson;
        let param = {
          flowCode: flowCodePre + record.desformCode,
          id: record.id,
          formUrl: '{{DOMAIN_URL}}/desform/detail/' + record.desformCode + '/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}',
          formUrlMobile: '{{DOMAIN_URL}}/desform/detail/' + record.desformCode + '/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}',
          jsonData: jsonData,
        };
        let result = await startProcess(param);
        if (result && result.success) {
          createMessage.success(result.message);
          reload();
          clearSelectedRowKeys();
        } else {
          createMessage.warning(res.message || '流程启动异常');
        }
      } else {
        createMessage.warning(res?.message || '数据加载失败');
      }
    };
    await startDesFormProcess({ desformCode: record.desformCode,id: record.desformDataId }, success);
  }
  /**
   * 编辑
   *  @param record
   */
  function handleEdit(record) {
    let title = '【' + record.desformName + '】详情';
    openDesformModal('edit', record, title);
  }
  /**
   * 详情
   * @param record
   */
  function handleDetail(record) {
    let title = '详情【' + record.desformName + '】';
    openDesformModal('detail', record, title);
  }

  function openDesformModal(mode, record, title) {
    let desform = record,
      dataId = null;
    if (mode === 'edit' || mode === 'detail') {
      let { desformId: id, desformCode, desformDataId } = record;
      dataId = desformDataId;
      desform = { id, desformCode };
    }
    desformModal.value.open(mode, desform, dataId, title);
  }
  /**
   * 删除
   * @param id
   */
  async function handleDelete(id) {
    await deleteOne({ id }, reload);
  }
  /**
   * 审批进度
   * @param record
   */
  function handleTrack(record) {
    console.log('审批进度', record);
    let flowCode = flowCodePre + record.desformCode;
    let params = { flowCode: flowCode, dataId: record.id }; //查询条件
    trackRef.value.handleTrack(params);
    trackRef.value.data.title = '审批跟踪记录';
  }
  /** 流程数据保存成功后触发该事件 */
  async function handleDesformDataAdded(event) {
    // 将流程保存至后台
    let { desform, dataId } = event;

    //发起流程（往设计表单和流程的关系表中，插入一条数据）
    let res = await saveOrUpdate(
      {
        desformId: desform.id,
        desformCode: desform.desformCode,
        desformDataId: dataId,
        desformName: desform.desformName,
        processName: desform.procName,
        flowCode: flowCodePre + desform.desformCode,
        titleExp: desform.titleExp,
      },
      false
    );
    if (!res.success) {
      createMessage.error(res.message);
    } else {
      reload();
    }
  }

  /** 流程数据更新成功后触发该事件 */
  function handleDesformDataEdited(event) {
    // 将流程保存至后台
    let { desform, dataId } = event;
    saveOrUpdate(
      {
        desformDataId: dataId,
      },
      true
    ).then((res) => {
      console.log('res', res);
      if (!res.success) {
        createMessage.error(res.message);
      } else {
        reload();
      }
    });
  }
  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '提交流程',
        onClick: handleStartProcess.bind(null, record),
        ifShow: () => {
          return record.bpmStatus === '1';
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
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        ifShow: () => {
          return record.bpmStatus === '1';
        },
      },
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
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
      {
        label: '审批进度',
        onClick: handleTrack.bind(null, record),
        ifShow: () => {
          return record.bpmStatus !== '1';
        },
      },
    ];
  }
</script>
