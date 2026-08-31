<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable">
      <template #headerTop>
        <a-alert type="info" show-icon class="alert">
          <template #message>
            <span>当前统计的是：</span>
            <a> {{ alertMonthShow }} </a>
            <a-divider type="vertical" />
            <span>该月共有</span>
            <a> {{ monthDayTotal }} </a>
            <span>天</span>
            <a-divider type="vertical" />
            <span>其中工作日共有</span>
            <a> {{ expectedWorkingDays }} </a>
            <span>天</span>
          </template>
        </a-alert>
      </template>
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <OaSignStatisticsModal :username="username" :title="title" @register="registerModal"></OaSignStatisticsModal>
  </div>
</template>

<script lang="ts" name="oa-sign-statistics" setup>
  import { ref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import OaSignStatisticsModal from './components/OaSignStatisticsModal.vue';
  import { statisticsColumns, staticSearchFormSchema } from './OaSign.data';
  import { statisticsByMonthAll, getStatisticsExportXls } from './OaSign.api';
  import dayjs from 'dayjs';
  import { useMessage } from '/@/hooks/web/useMessage';

  const searchInfo = ref<any>({});
  const { createMessage } = useMessage();
  const checkedKeys = ref<Array<string | number>>([]);
  //注册model
  const [registerModal, { openModal }] = useModal();
  const currentMonth = dayjs();
  const monthValue = ref<any>(currentMonth);
  const alertMonthShow = ref<any>(currentMonth.format('YYYY年MM月'));
  const alertMonthValue = ref<any>(currentMonth);
  const monthDayTotal = ref<any>();
  const expectedWorkingDays = ref<any>();
  const title = ref<any>('');
  const username = ref<any>('');
  //注册table数据
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      title: '考勤统计',
      api: statisticsByMonthAll,
      columns: statisticsColumns,
      rowKey: 'realname',
      canResize: false,
      formConfig: {
        labelWidth: 120,
        schemas: staticSearchFormSchema,
        autoSubmitOnEnter: true,
        showResetButton: false,
      },
      actionColumn: {
        width: 120,
      },
      beforeFetch: (params) => {
        return getTableParams(params);
      },
      afterFetch: (result) => setTableMessage(result),
      handleSearchInfoFn: (params) => {
        return getFormParams(params);
      },
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 详情
   * @param record
   */
  function handleDetail(record: Recordable) {
    title.value = '考勤统计：' + record.realname;
    username.value = record.username;
    record.alertMonthValue = alertMonthValue.value;
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: false,
    });
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
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }

  /**
   * 列表请求之前参数做处理
   * @param params
   */
  function getTableParams(params) {
    let date = dayjs(params.monthValue);
    params.year = date.format('YYYY');
    params.month = date.format('MM');
    return params;
  }

  /**
   * 查询之前做处理
   * @param params
   */
  function getFormParams(params) {
    if (params.monthValue == null) {
      createMessage.warning('请选择统计月份');
      return;
    }
    alertMonthValue.value = dayjs(params.monthValue);
    return params;
  }

  /**
   * 列表请求之后参数做处理
   * @param record
   */
  function setTableMessage(record) {
    if (record && record.length > 0) {
      alertMonthShow.value = alertMonthValue.value.format('YYYY年MM月');
      monthDayTotal.value = record[0].monthDayTotal;
      expectedWorkingDays.value = record[0].expectedWorkingDays;
    } else {
      alertMonthShow.value = '';
      monthDayTotal.value = '';
      expectedWorkingDays.value = '';
    }
    return record;
  }

  /**
   * 导出excel
   */
  async function onExportXls() {
    const name = '考勤统计 - ' + alertMonthValue.value.format('YYYY年MM月');
    const data = await getStatisticsExportXls({
      year: alertMonthValue.value.format('YYYY'),
      month: alertMonthValue.value.format('MM'),
    });
    if (!data) {
      createMessage.warning('文件下载失败');
      return;
    }
    let blobOptions = { type: 'application/vnd.ms-excel' };
    let fileSuffix = '.xls';
    let url = window.URL.createObjectURL(new Blob([data], blobOptions));
    let link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', name + fileSuffix);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); //下载完成移除元素
    window.URL.revokeObjectURL(url); //释放掉blob对象
  }
</script>
