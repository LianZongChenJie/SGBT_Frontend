<template>
  <div>
    <!--定义表格-->
    <BasicTable @register="registerTable">
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <!-- <callRecord @register="registerDrawerCallRecord" />
    <textRecord @register="registerDrawerTextRecord" /> -->
    <detail @register="registerDrawerDetail" />
  </div>
</template>

<script lang="ts" name="basic-table-demo" setup>
  import { ActionItem, BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getList } from './api';
  import { columns, searchFormSchema } from './data';
  import { useDrawer } from '/@/components/Drawer';
  // import callRecord from './callRecord.vue';
  // import textRecord from './textRecord.vue';
  import detail from './detail.vue';

  // const [registerDrawerCallRecord, { openDrawer: openDrawerCallRecord }] = useDrawer();
  // const [registerDrawerTextRecord, { openDrawer: openDrawerTextRecord }] = useDrawer();
  const [registerDrawerDetail, { openDrawer: openDrawerDetail }] = useDrawer();
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      title: '',
      api: getList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        fieldMapToTime: [['answeredTime', ['startTime', 'endTime'], 'YYYY-MM-DD HH:mm:ss']],
      },
      actionColumn: {
        title: '操作',
        width: 80,
        fixed: 'right',
      },
      showIndexColumn: true,
    },
  });
  //BasicTable绑定注册
  const [registerTable] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      // {
      //   label: '通话录音',
      //   onClick: handleCallRecord.bind(null, record),
      // },
      // {
      //   label: '文字记录',
      //   onClick: handleTextRecord.bind(null, record),
      // },
      {
        label: '详情',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }
  function handleDetail(record) {
    openDrawerDetail(true, { record });
  }
  // function handleTextRecord(record) {
  //   openDrawerTextRecord(true, { record });
  // }
  // function handleCallRecord(record) {
  //   openDrawerCallRecord(true, { record });
  // }
</script>
