<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #signStatus="{ text, record }">
        <a-tag v-if="text === SignStatusEnum.NO_SIGN.value" :color="record.isPatch ? 'green' : '#D3D3D3'">缺卡</a-tag>
        <a-tag v-else-if="text === SignStatusEnum.NORMAL.value" color="green">正常</a-tag>
        <a-tag v-else-if="text === SignStatusEnum.LATE.value" :color="record.isPatch ? 'green' : 'red'">迟到</a-tag>
        <a-tag v-else-if="text === SignStatusEnum.ABSENT.value" :color="record.isPatch ? 'green' : 'red'">旷工</a-tag>
        <a-tag v-else-if="text === SignStatusEnum.LEAVE_EARLY.value" :color="record.isPatch ? 'green' : 'red'">早退 </a-tag>
        <a-tag v-else>{{ text }}</a-tag>
        <a-tag v-if="record.isPatch" color="orange">已补卡</a-tag>
      </template>
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="signNowHandleClick" preIcon="ant-design:plus-outlined">立即打卡</a-button>
        <a-button type="primary" @click="statisticsHandleClick" preIcon="ant-design:pie-chart-filled">打卡统计</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <OaSignInfoModal @register="registerModal" @success="handleSuccess"></OaSignInfoModal>
    <OaSignNowModal @register="registerSignNowModal" @success="handleSuccess"></OaSignNowModal>
    <OaSignStatisticsModal @register="registerStatisticsModal"></OaSignStatisticsModal>
  </div>
</template>

<script lang="ts" name="oa-sign-info" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import OaSignInfoModal from './components/OaSignInfoModal.vue';
  import OaSignNowModal from './components/OaSignNowModal.vue';
  import { columnsInfo, infoSearchFormSchema } from './OaSign.data';
  import { list, batchDelete, getExportUrl } from './OaSign.api';
  import { SignStatusEnum } from './utils/constant';
  import { getOptionsSignType } from './utils/util';
  import OaSignStatisticsModal from './components/OaSignStatisticsModal.vue';

  const checkedKeys = ref<Array<string | number>>([]);
  //注册model
  const [registerModal, { openModal }] = useModal();
  const [registerSignNowModal, { openModal: openSignNowModal }] = useModal();
  const [registerStatisticsModal, { openModal: openStatisticsModal }] = useModal();
  //注册table数据
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '打卡',
      api: list,
      columns: columnsInfo,
      canResize: false,
      formConfig: {
        labelWidth: 120,
        schemas: infoSearchFormSchema,
        autoSubmitOnEnter: true,
        showAdvancedButton: true,
        fieldMapToTime: [['signTime', ['signTimeBegin', 'signTimeEnd'], 'YYYY-MM-DD']],
      },
      actionColumn: {
        width: 120,
      },
      //update-begin---author:wangshuai ---date:20220627  for：[VUEN-1465]考勤打卡 列表 查询失败------------
      defSort: {
        column: 'signTime',
        order: 'desc',
      },
      //update-end---author:wangshuai ---date:20220627  for：[VUEN-1465]考勤打卡 列表 查询失败--------------
    },
    exportConfig: {
      name: '打卡列表',
      url: getExportUrl,
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 立即打卡
   */
  function signNowHandleClick() {
    openSignNowModal(true, {});
  }

  /**
   * 打卡统计
   */
  function statisticsHandleClick() {
    openStatisticsModal(true, {});
  }

  /**
   * 编辑事件
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
    });
  }

  /**
   * 详情
   * @param record
   */
  function handleDetail(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: false,
    });
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess() {
    (selectedRowKeys.value = []) && reload();
  }

  /**
   * 操作栏
   * @param record
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
    ];
  }

  /**
   * 下拉操作栏
   * @param record
   */
  function getDropDownAction(record) {
    return [
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
</script>
