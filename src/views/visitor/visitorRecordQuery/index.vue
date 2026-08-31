<template>
  <div class="visitor-record-query-main-box">
    <div class="table-box">
      <BasicTable @register="registerTable">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'accessType'">
            {{ getAccessTypeLabel(record.accessType) }}
          </template>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { getVisitorRecordListApi } from './VisitorRecordQuery.api';
import dayjs from 'dayjs';

// 通行方式下拉选项
const accessTypeOptions = [
  { label: '单次通行', value: '1' },
  { label: '多次通行', value: '2' },
];

// 表格列配置
const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '申请人',
    dataIndex: 'name',
    key: 'name',
    width: 120,
  },
  {
    title: '来访公司',
    dataIndex: 'company',
    key: 'company',
    width: 180,
  },
  {
    title: '来访事由',
    dataIndex: 'memo',
    key: 'memo',
    width: 200,
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
    width: 170,
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
    width: 170,
  },
  {
    title: '通行方式',
    dataIndex: 'accessType',
    key: 'accessType',
    width: 100,
  },
  {
    title: '申请时间',
    dataIndex: 'applyTime',
    key: 'applyTime',
    width: 170,
  },
  {
    title: '通行时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 170,
  },
];

// 表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '申请人',
    field: 'name',
    component: 'JInput',
  },
  {
    label: '通行时间',
    field: 'timeRange',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      placeholder: ['开始日期', '结束日期'],
    },
    colProps: { span: 8 },
  },
];

// 获取表格数据
const getVisitorRecordList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();

  // 处理时间范围，RangePicker返回的是逗号分隔的字符串
  let startTime = undefined;
  let endTime = undefined;
  if (searchData.timeRange) {
    const timeArr = searchData.timeRange.split(',');
    if (timeArr.length === 2) {
      startTime = timeArr[0];
      endTime = timeArr[1];
    }
  }

  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    name: searchData.name || undefined,
    startTime: startTime,
    endTime: endTime,
  };
  let res = await getVisitorRecordListApi(params);
  let data = res.result || res;
  return {
    records: data.records || data,
    total: data.total || (data.records ? data.records.length : data.length),
  };
};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    api: getVisitorRecordList,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    rowKey: 'id',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
    },
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

// BasicTable绑定注册
const [registerTable, { reload, getForm }] = tableContext;

const getAccessTypeLabel = (value) => {
  const item = accessTypeOptions.find((opt) => opt.value === String(value));
  return item ? item.label : value;
};
</script>

<style lang="less" scoped>
.visitor-record-query-main-box {
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
