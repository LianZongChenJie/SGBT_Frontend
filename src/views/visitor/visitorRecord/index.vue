<template>
  <div class="visitor-record-main-box">
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
import { h } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { getVisitorRecordListApi } from './VisitorRecord.api';

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
    title: '访客姓名',
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
    label: '访客姓名',
    field: 'name',
    component: 'Input',
  },
  {
    label: '来访公司',
    field: 'company',
    component: 'Input',
  },
  {
    label: '来访事由',
    field: 'memo',
    component: 'Input',
  },
  {
    label: '通行方式',
    field: 'accessType',
    component: 'Select',
    componentProps: {
      options: accessTypeOptions,
      placeholder: '请选择通行方式',
    },
  },
  {
    label: '申请时间',
    field: 'applyTime',
    component: 'RangePicker',
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    label: '通行时间',
    field: 'createTime',
    component: 'RangePicker',
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
];

// 获取表格数据
const getVisitorRecordList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    name: searchData.name || undefined,
    company: searchData.company || undefined,
    memo: searchData.memo || undefined,
    accessType: searchData.accessType || undefined,
    applyTimeStart: searchData.applyTime ? searchData.applyTime.split(',')[0] : undefined,
    applyTimeEnd: searchData.applyTime ? searchData.applyTime.split(',')[1] : undefined,
    createTimeStart: searchData.createTime ? searchData.createTime.split(',')[0] : undefined,
    createTimeEnd: searchData.createTime ? searchData.createTime.split(',')[1] : undefined,
  };
  let res = await getVisitorRecordListApi(params);
  return {
    records: res.records || res,
    total: res.total || (res.records ? res.records.length : res.length),
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
const [registerTable, { getForm }] = tableContext;

const getAccessTypeLabel = (value) => {
  const item = accessTypeOptions.find((opt) => opt.value === String(value));
  return item ? item.label : value;
};
</script>

<style lang="less" scoped>
.visitor-record-main-box {
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
