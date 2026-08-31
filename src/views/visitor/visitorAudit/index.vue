<template>
  <div class="visitor-audit-main-box">
    <div class="table-box">
      <BasicTable @register="registerTable">
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
          <template v-if="column.key === 'action'">
            <template v-if="record.status === '0'">
              <a-button type="link" size="small" @click="handleAudit(record, '1')">同意</a-button>
              <a-button type="link" size="small" danger @click="handleAudit(record, '2')">拒绝</a-button>
            </template>
            <template v-else>
              <span style="color: #999;">-</span>
            </template>
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
import { useMessage } from '/@/hooks/web/useMessage';
import { useUserStore } from '/@/store/modules/user';
import { getVisitorListApi, auditVisitorApi } from './VisitorAudit.api';

const { createMessage, createConfirm } = useMessage();
const userStore = useUserStore();

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
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
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

// 获取当前登录用户ID
const getCurrentUserId = () => {
  const userInfo = userStore.getUserInfo;
  return userInfo?.id || userInfo?.userId || '';
};

// 获取表格数据
const getVisitorList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  const currentUserId = getCurrentUserId();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    name: searchData.name || undefined,
    idNumber: searchData.idNumber || undefined,
    mobile: searchData.mobile || undefined,
    company: searchData.company || undefined,
    accessType: searchData.accessType || undefined,
    userId: currentUserId,
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

// 审核操作
const handleAudit = (record, status) => {
  const actionText = status === '1' ? '同意' : '拒绝';
  createConfirm({
    iconType: 'warning',
    title: `确认${actionText}`,
    content: `确定要${actionText}访客「${record.name}」的申请吗？`,
    onOk: async () => {
      try {
        await auditVisitorApi(record.id, status);
        reload();
      } catch (error) {
        createMessage.error(`${actionText}失败：` + (error.message || '未知错误'));
      }
    },
  });
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
.visitor-audit-main-box {
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
