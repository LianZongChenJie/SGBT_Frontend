<template>
  <div class="visitor-management-dept-main-box">
    <div class="table-box">
      <BasicTable @register="registerTable">
        <template #tableTitle>
          <a-button
            v-auth="'bems:visitor:add'"
            type="primary"
            :icon="h(PlusOutlined)"
            @click="handleAdd"
          > 新增 </a-button>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'accessType'">
            {{ getAccessTypeLabel(record.accessType) }}
          </template>
          <template v-if="column.key === 'deptId'">
            {{ record.deptName || record.deptId }}
          </template>
          <template v-if="column.key === 'userId'">
            {{ record.userName || record.userId }}
          </template>
          <template v-if="column.key === 'status'">
            {{ getStatusLabel(record.status) }}
          </template>
        </template>
      </BasicTable>
    </div>
    <AddVisitorDeptModal
      ref="addVisitorModalRef"
      :reload="reload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { PlusOutlined } from '@ant-design/icons-vue';
import AddVisitorDeptModal from './components/AddVisitorDeptModal.vue';
import { getVisitorListApi } from './VisitorDept.api';

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
    title: '身份证号',
    dataIndex: 'idNumber',
    key: 'idNumber',
    width: 180,
  },
  {
    title: '手机号',
    dataIndex: 'mobile',
    key: 'mobile',
    width: 140,
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
    title: '被访单位',
    dataIndex: 'deptId',
    key: 'deptId',
    width: 150,
  },
  {
    title: '被访人',
    dataIndex: 'userId',
    key: 'userId',
    width: 120,
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
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
];

// 表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '访客姓名',
    field: 'name',
    component: 'JInput',
  },
  {
    label: '身份证号',
    field: 'idNumber',
    component: 'JInput',
  },
  {
    label: '手机号',
    field: 'mobile',
    component: 'JInput',
  },
  {
    label: '来访公司',
    field: 'company',
    component: 'JInput',
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
];

// 获取表格数据
const getVisitorList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    name: searchData.name || undefined,
    idNumber: searchData.idNumber || undefined,
    mobile: searchData.mobile || undefined,
    company: searchData.company || undefined,
    accessType: searchData.accessType || undefined,
  };
  let res = await getVisitorListApi(params);
  let data = res.result || res;
  return {
    records: data.records || data,
    total: data.total || (data.records ? data.records.length : data.length),
  };
};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    api: getVisitorList,
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

const addVisitorModalRef = ref();

// 新增访客
const handleAdd = () => {
  addVisitorModalRef.value.showModal();
};

const getAccessTypeLabel = (value) => {
  const item = accessTypeOptions.find((opt) => opt.value === String(value));
  return item ? item.label : value;
};

const getStatusLabel = (value) => {
  const statusMap = {
    '0': '待审核',
    '1': '同意',
    '2': '不同意',
  };
  return statusMap[String(value)] || value;
};
</script>

<style lang="less" scoped>
.visitor-management-dept-main-box {
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
