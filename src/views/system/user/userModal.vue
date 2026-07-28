<template>
  <BasicModal @register="register" v-bind="$attrs" title="用户信息" width="920px" @ok="getSectionRow">
    <div class="search-form-wrap">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input v-model:value="searchForm.userName" placeholder="人员姓名" @pressEnter="handleSearch" />
        </a-col>
        <a-col :span="6">
          <a-input v-model:value="searchForm.departmentName" placeholder="部门" @pressEnter="handleSearch" />
        </a-col>
        <a-col :span="6">
          <a-button type="primary" @click="handleSearch">
            <span>查询</span>
          </a-button>
        </a-col>
      </a-row>
    </div>
    <div class="selection-tip">
      <span v-if="selectedCount > 0"
        >已选择 <span class="count">{{ selectedCount }}</span> 条数据</span
      >
      <span v-else>请选择人员</span>
    </div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :row-selection="{
        selectedRowKeys: currentPageSelectedKeys,
        onChange: handleSelectionChange,
        type: props.userObj?.radioType || 'checkbox',
        columnWidth: 50,
      }"
      :row-key="(record) => record.id"
      :bordered="true"
      :size="'middle'"
      :scroll="{ x: 840, y: 400 }"
      @change="handlePaginationChange"
      class="user-table"
    >
      <template #userDescription="{ record }">
        <span>{{ userTypeObj[record.userDescription] }}</span>
      </template>
    </a-table>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, watch, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { userTypeObj } from '/@/utils/allData';
  import { getToken } from '@/utils/auth';
  import { getAppEnvConfig } from '/@/utils/env';
  const emit = defineEmits(['register', 'update:data']);

  const props = defineProps({
    userObj: Object,
  });

  const columns = [
    {
      title: '人员姓名',
      dataIndex: 'userName',
      width: 140,
      ellipsis: true,
    },
    // {
    //   title: "证件号码",
    //   dataIndex: "certificatesNumber",
    //   width: 160,
    //   ellipsis: true,
    // },
    {
      title: '人员类型',
      dataIndex: 'userDescription',
      slots: { customRender: 'userDescription' },
      width: 120,
      ellipsis: true,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      width: 140,
      ellipsis: true,
    },
    {
      title: '科组',
      dataIndex: 'sectionName',
      width: 140,
      ellipsis: true,
    },
    {
      title: '职务',
      dataIndex: 'userDuties',
      width: 120,
      ellipsis: true,
    },
  ];

  const searchForm = reactive({
    userName: '',
    departmentName: '',
  });

  const dataSource = ref<any[]>([]);
  const loading = ref(false);
  const allSelectedKeys = ref<Set<number>>(new Set());
  const allSelectedRows = ref<Map<number, any>>(new Map());

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50'],
  });

  const currentPageSelectedKeys = computed(() => {
    return dataSource.value.filter((row) => allSelectedKeys.value.has(row.id)).map((row) => row.id);
  });

  const selectedCount = computed(() => allSelectedKeys.value.size);

  const [register, { closeModal }] = useModalInner(async (data) => {});

  async function fetchUserList() {
    loading.value = true;
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.current.toString());
      queryParams.append('pageSize', pagination.pageSize.toString());
      queryParams.append('theaterDistrict', props.userObj?.campus || '');
      if (searchForm.userName) {
        queryParams.append('userName', searchForm.userName);
      }
      if (searchForm.departmentName) {
        queryParams.append('departmentName', searchForm.departmentName);
      }
      const { VITE_GLOB_SPSDOMAIN_URL } = getAppEnvConfig();
      console.log(VITE_GLOB_SPSDOMAIN_URL, 'VITE_GLOB_SPSDOMAIN_URL');
      const url = VITE_GLOB_SPSDOMAIN_URL + `/sps-web/personnelUser/queryListSysForPage?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getToken(),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      dataSource.value = res.data?.list || [];
      pagination.total = res.data?.total || 0;
    } catch (error) {
      console.error('Fetch error:', error);
      dataSource.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  }

  function handleSelectionChange(keys: any[], rows: any[]) {
    const currentPageIds = new Set(dataSource.value.map((row) => row.id));

    allSelectedKeys.value = new Set(allSelectedKeys.value);
    allSelectedRows.value = new Map(allSelectedRows.value);

    currentPageIds.forEach((id) => {
      allSelectedKeys.value.delete(id);
      allSelectedRows.value.delete(id);
    });

    keys.forEach((key, index) => {
      allSelectedKeys.value.add(key);
      allSelectedRows.value.set(key, rows[index]);
    });
  }

  function handlePaginationChange(pag: any) {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    fetchUserList();
  }

  function handleSearch() {
    pagination.current = 1;
    fetchUserList();
  }

  function getSectionRow() {
    const selectedRows = Array.from(allSelectedRows.value.values());
    emit('update:data', selectedRows, props.userObj?.type);
    closeModal();
  }

  watch(
    () => props.userObj,
    (newVal) => {
      if (newVal?.assigneeIds && newVal.assigneeIds.length > 0) {
        const ids = newVal.assigneeIds.map((id: string | number) => Number(id));
        allSelectedKeys.value = new Set(ids);
        allSelectedRows.value = new Map();
      } else {
        allSelectedKeys.value = new Set();
        allSelectedRows.value = new Map();
      }
    },
    { deep: true, immediate: true }
  );

  watch(dataSource, (newDataSource) => {
    newDataSource.forEach((row) => {
      if (allSelectedKeys.value.has(row.id)) {
        allSelectedRows.value.set(row.id, row);
      }
    });
  });

  onMounted(() => {
    fetchUserList();
  });
</script>

<style lang="scss" scoped>
  .search-form-wrap {
    margin-bottom: 16px;
    padding: 16px;
    background: #fafafa;
    border-radius: 4px;
  }

  .selection-tip {
    margin-bottom: 12px;
    padding: 8px 16px;
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
    color: #1890ff;
    font-size: 14px;

    .count {
      font-weight: 600;
      font-size: 16px;
    }
  }

  .user-table {
    :deep(.ant-table) {
      .ant-table-thead > tr > th {
        background: #fafafa;
        font-weight: 500;
        text-align: center;
      }
      .ant-table-tbody > tr > td {
        text-align: center;
      }
      .ant-table-tbody > tr:hover > td {
        background: #e6f7ff;
      }
    }
  }
</style>
