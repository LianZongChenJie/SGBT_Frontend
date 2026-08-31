<template>
  <BasicTable @register="registerTable" :rowSelection="rowSelection"> </BasicTable>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable } from '/src/components/Table';
  import { getNotifyMeList } from '/src/views/super/bpm/process/manage/components/bpm.api.ts';
  import { useListPage } from '/src/hooks/system/useListPage';
  import { propTypes } from '/src/utils/propTypes';

  const props = defineProps({
    procInstId: propTypes.string.def(''),
  });
  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    tableProps: {
      api: getNotifyMeList,
      columns: [
        {
          title: '流程名称',
          align: 'center',
          dataIndex: 'procName',
        },
        {
          title: '任务名称',
          align: 'center',
          dataIndex: 'taskName',
        },
        {
          title: '任务处理人',
          align: 'center',
          dataIndex: 'taskAssignee',
        },
        {
          title: '催办时间',
          align: 'center',
          dataIndex: 'opTime',
        },
        {
          title: '催办类型',
          align: 'center',
          dataIndex: 'notifyType',
          customRender: ({ text }) => {
            var srtArr = text.split(',');
            var value = '';
            if (srtArr.includes('1')) {
              value += ',系统通知';
            }
            if (srtArr.includes('2')) {
              value += ',邮件';
            }
            return value.substring(1);
          },
        },
        {
          title: '催办说明',
          align: 'center',
          dataIndex: 'remarks',
        },
      ],
      size: 'middle',
      maxHeight: 200,
      useSearchForm: false,
      showTableSetting: false,
      showActionColumn: false,
      searchInfo: { procInstId: props.procInstId },
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;
</script>
