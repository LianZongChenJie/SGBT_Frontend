<template>
  <div class="room-management-main-box">
    <div class="table-box">
      <BasicTable @register="registerTable">
        <template #tableTitle>
          <a-button
            type="primary"
            :icon="h(PlusOutlined)"
            @click="handleAdd"
          > 新增 </a-button>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'departmentName'">
            <a-button type="link" @click="handleViewDept(record)">查看</a-button>
          </template>
          <template v-if="column.key === 'needApproval'">
            {{ record.needApproval === '1' ? '是' : '否' }}
          </template>
          <template v-if="column.key === 'status'">
            <span :class="record.status === '1' ? 'status-normal' : 'status-locked'">
              {{ record.status === '1' ? '正常' : '锁定' }}
            </span>
          </template>
        </template>
        <template #action="{ record }">
          <div class="action-btns">
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" size="small" @click="handleAccessControl(record)">门禁设置</a-button>
            <a-button type="link" size="small" @click="handleSetPassword(record)">设置密码</a-button>
            <a-button type="link" size="small" @click="handleLock(record)">
              {{ record.status === '1' ? '锁定' : '解锁' }}
            </a-button>
            <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
          </div>
        </template>
      </BasicTable>
    </div>
    <RoomModal
      ref="roomModalRef"
      :reload="reload"
    />

    <AccessControlSettingModal
      ref="accessControlModalRef"
      :reload="reload"
    />

    <SetPasswordModal
      ref="setPasswordModalRef"
      :reload="reload"
    />

    <a-modal
      v-model:open="deptModalOpen"
      title="所属部门"
      :footer="null"
      width="400px"
    >
      <div class="dept-path-box">
        <p class="dept-path">{{ currentDeptPath || '暂无部门信息' }}</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { PlusOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import RoomModal from './components/RoomModal.vue';
import AccessControlSettingModal from './components/AccessControlSettingModal.vue';
import SetPasswordModal from './components/SetPasswordModal.vue';

import { getRoomListApi, deleteRoomApi, lockRoomApi, getAccessControlListByRoomApi } from './Room.api';
import { queryDepartTreeSync } from '/@/api/common/api';
import { queryIdTree } from '/@/views/system/departUser/depart.user.api';

const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '会议室名称',
    dataIndex: 'roomName',
    key: 'roomName',
    width: 150,
  },
  {
    title: '会议室地点',
    dataIndex: 'roomLocation',
    key: 'roomLocation',
    width: 200,
  },
  {
    title: '所属部门',
    dataIndex: 'departmentName',
    key: 'departmentName',
    width: 120,
  },
  {
    title: '是否审批',
    dataIndex: 'needApproval',
    key: 'needApproval',
    width: 100,
  },
  {
    title: '人数',
    dataIndex: 'capacity',
    key: 'capacity',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 200,
  },
  {
    title: '操作',
    key: 'action',
    width: 280,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
];

const searchFormSchema: FormSchema[] = [
  {
    label: '会议室',
    field: 'roomName',
    component: 'JInput',
  },
  {
    label: '所属部门',
    field: 'departmentName',
    component: 'JInput',
  },
  {
    label: '状态',
    field: 'status',
    component: 'Select',
    componentProps: {
      placeholder: '全部',
      options: [
        { label: '全部', value: '' },
        { label: '正常', value: '1' },
        { label: '锁定', value: '0' },
      ],
    },
  },
];

const getRoomList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    roomName: searchData.roomName || undefined,
    departmentName: searchData.departmentName || undefined,
    status: searchData.status || undefined,
  };
  let res = await getRoomListApi(params);
  return {
    records: res.records || res,
    total: res.total || (res.records ? res.records.length : res.length),
  };
};

const { tableContext } = useListPage({
  designScope: 'room-table',
  tableProps: {
    api: getRoomList,
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

const [registerTable, { reload, getForm }] = tableContext;

const roomModalRef = ref();
const accessControlModalRef = ref();
const setPasswordModalRef = ref();

const deptModalOpen = ref(false);
const currentDeptPath = ref('');
const deptTreeData = ref<any[]>([]);

onMounted(() => {
  loadDeptTree();
});

const loadDeptTree = async () => {
  try {
    const res = await queryIdTree();
    if (res && Array.isArray(res)) {
      deptTreeData.value = res;
    }
  } catch (error) {
    console.error('加载部门树失败:', error);
  }
};

const buildDeptPath = (deptId: string, deptName?: string): string => {
  if (!deptId) return deptName || '暂无部门信息';
  if (!deptTreeData.value.length) return deptName || '暂无部门信息';
  const path: string[] = [];
  const findPath = (tree: any[], id: string): boolean => {
    for (const item of tree) {
      const itemId = item.id || item.key;
      const itemName = item.departName || item.title;
      if (itemId === id) {
        path.unshift(itemName);
        return true;
      }
      const children = item.children;
      if (children && children.length > 0) {
        if (findPath(children, id)) {
          path.unshift(itemName);
          return true;
        }
      }
    }
    return false;
  };
  const found = findPath(deptTreeData.value, deptId);
  if (found && path.length > 0) {
    return path.join(' > ');
  }
  return deptName || '暂无部门信息';
};

const handleAdd = () => {
  roomModalRef.value.showModal();
};

const handleEdit = (record) => {
  roomModalRef.value.showModal(record);
};

const handleLock = (record) => {
  const isLock = record.status === '1';
  Modal.confirm({
    title: isLock ? '确认锁定' : '确认解锁',
    content: `确定要${isLock ? '锁定' : '解锁'}会议室 "${record.roomName}" 吗？`,
    onOk: async () => {
      await lockRoomApi({ id: record.id, status: isLock ? '0' : '1' });
      message.success(`${isLock ? '锁定' : '解锁'}成功`);
      reload();
    },
  });
};

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除会议室 "${record.roomName}" 吗？`,
    onOk: async () => {
      await deleteRoomApi({ id: record.id });
      message.success('删除成功');
      reload();
    },
  });
};

const handleAccessControl = (record) => {
  accessControlModalRef.value.showModal(record);
};

const handleSetPassword = async (record) => {
  try {
    const res = await getAccessControlListByRoomApi(record.id);
    const list = res.result || res || [];
    if (list.length === 0) {
      message.warning('该会议室尚未设置门禁，请先设置门禁后再设置密码');
      return;
    }
    setPasswordModalRef.value.showModal(record);
  } catch (error) {
    console.error('检查门禁列表失败:', error);
    message.error('检查门禁列表失败');
  }
};

const handleViewDept = (record) => {
  currentDeptPath.value = buildDeptPath(record.departmentId, record.departmentName);
  deptModalOpen.value = true;
};


</script>

<style lang="less" scoped>
.room-management-main-box {
  height: 100%;
  width: 100%;

  .table-box {
    height: 100%;
    width: 100%;
    padding: 10px 10px;
    background-color: #fff;
  }

  .status-normal {
    color: #52c41a;
  }

  .status-locked {
    color: #faad14;
  }

  .dept-path-box {
    padding: 16px;

    .dept-path {
      font-size: 14px;
      line-height: 1.6;
      word-break: break-all;
    }
  }

  .action-btns {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    white-space: nowrap;

    :deep(.ant-btn) {
      padding: 0 4px;
      font-size: 13px;
    }
  }
}
</style>
