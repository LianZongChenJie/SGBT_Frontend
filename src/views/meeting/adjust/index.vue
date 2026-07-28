<template>
  <div class="adjust-record-main-box">
    <div class="table-box">
      <BasicTable @register="registerTable">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'meetingTitle'">
            {{ record.meetingTitle || '-' }}
          </template>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { getAdjustRecordListApi } from './AdjustRecord.api';

const columns: BasicColumn[] = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60, customRender: ({ index }) => index + 1 },
  { title: '会议主题', dataIndex: 'meetingTitle', key: 'meetingTitle', width: 200 },
  { title: '调整内容', dataIndex: 'adjustContent', key: 'adjustContent', width: 150 },
  { title: '调整前', dataIndex: 'oldValue', key: 'oldValue', width: 150 },
  { title: '调整后', dataIndex: 'newValue', key: 'newValue', width: 150 },
  { title: '调整原因', dataIndex: 'adjustReason', key: 'adjustReason', width: 200 },
  { title: '操作人', dataIndex: 'createBy', key: 'createBy', width: 100 },
  { title: '操作时间', dataIndex: 'createTime', key: 'createTime', width: 160 },
];

const searchFormSchema: FormSchema[] = [
  { label: '会议主题', field: 'meetingTitle', component: 'JInput' },
  { label: '调整内容', field: 'adjustContent', component: 'JInput' },
  { label: '操作人', field: 'createBy', component: 'JInput' },
];

const getAdjustRecordList = async (pageParams: any) => {
  const { pageNo, pageSize } = pageParams;
  let searchData = {};
  try {
    const form = getForm();
    if (form && form.getFieldsValue) {
      searchData = form.getFieldsValue();
    }
  } catch (e) {
    // form not ready yet
  }
  let params = { pageNo, pageSize, ...searchData };
  let res = await getAdjustRecordListApi(params);
  return { records: res.records || res, total: res.total || (res.records ? res.records.length : res.length) };
};

const { tableContext } = useListPage({
  designScope: 'adjust-record-table',
  tableProps: {
    api: getAdjustRecordList,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    rowKey: 'id',
    pagination: { pageSize: 10, showSizeChanger: true },
    showTableSetting: false,
    formConfig: {
      schemas: searchFormSchema,
      showAdvancedButton: false,
      submitOnReset: true,
      rowProps: { gutter: 24, justify: 'start', align: 'middle' },
      baseColProps: { span: 6 },
      baseRowStyle: { width: '100%' },
      labelCol: { style: { width: 'auto' } },
    },
  },
});

const [registerTable, { getForm }] = tableContext;
</script>

<style lang="less" scoped>
.adjust-record-main-box {
  height: 100%;
  width: 100%;
  .table-box {
    height: 100%;
    width: 100%;
    padding: 10px 10px;
    background-color: #fff;
  }
}
</style>
