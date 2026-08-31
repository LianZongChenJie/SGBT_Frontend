<template>
  <a-modal
    v-model:open="open"
    :title="title"
    @ok="handleSubmit"
    width="900px"
  >
    <div class="room-modal-content">
      <!-- 左侧部门树 -->
      <div class="left-dept-tree">
        <a-tree
          :tree-data="deptTreeData"
          :field-names="{ title: 'title', key: 'key', children: 'children' }"
          :checkable="true"
          :check-strictly="true"
          :checked-keys="checkedDeptKeys"
          @check="handleDeptCheck"
          v-model:expanded-keys="expandedKeys"
        />
      </div>
      <!-- 右侧表单 -->
      <div class="right-form">
        <BasicForm
          @register="registerForm"
          :schemas="formSchemas"
          :showActionButtonGroup="false"
          :labelWidth="90"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { BasicForm, FormSchema, useForm } from '/@/components/Form';
import { message } from 'ant-design-vue';
import { addRoomApi, editRoomApi, getRoomByIdApi, bindDeviceApi, bindTerminalApi } from '../Room.api';
import { getUserList } from '/@/api/common/api';
import { queryIdTree } from '/@/views/system/departUser/depart.user.api';
import { getDeviceListApi } from '../../device/Device.api';
import { getTerminalListApi } from '../../terminal/Terminal.api';

const props = defineProps({
  reload: {
    type: Function,
    required: true,
  },
});

const open = ref(false);
const isUpdate = ref(false);
const recordId = ref('');
const deptTreeData = ref([]);
const checkedDeptKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);
const userOptions = ref([]);
const deviceOptions = ref<any[]>([]);
const terminalOptions = ref<any[]>([]);

const title = computed(() => (isUpdate.value ? '编辑会议室' : '新建会议室'));

// 转换树数据格式
const transformTreeData = (data: any[]): any[] => {
  return data.map((item) => {
    const id = String(item.id || item.key);
    const node: any = {
      title: item.departName || item.title,
      value: id,
      key: id,
      isLeaf: item.isLeaf || item.leaf || false,
    };
    if (item.children && item.children.length > 0) {
      node.children = transformTreeData(item.children);
    }
    return node;
  });
};

// 加载部门树（完整树）
const loadDeptTree = async () => {
  try {
    const res = await queryIdTree();
    if (res && Array.isArray(res)) {
      deptTreeData.value = transformTreeData(res);
    }
  } catch (error) {
    console.error('加载部门树失败:', error);
  }
};

// 根据部门ID获取父节点路径（用于展开树）
const getParentKeyPath = (tree: any[], targetId: string): string[] => {
  const path: string[] = [];
  const findPath = (nodes: any[], id: string): boolean => {
    for (const node of nodes) {
      const nodeId = node.key || node.id;
      if (nodeId === id) {
        return true;
      }
      const children = node.children;
      if (children && children.length > 0) {
        if (findPath(children, id)) {
          path.unshift(nodeId);
          return true;
        }
      }
    }
    return false;
  };
  findPath(tree, targetId);
  return path;
};

// 加载用户列表（用于审批人选择）
const loadUserList = async () => {
  try {
    const res = await getUserList({ pageSize: 1000 });
    const users = res.records || res || [];
    userOptions.value = users.map(user => ({
      label: user.realname || user.username,
      value: user.id,
    }));
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
};

// 加载设备列表
const loadDeviceList = async () => {
  try {
    const res = await getDeviceListApi({ pageNo: 1, pageSize: 999 });
    const list = res.records || res || [];
    deviceOptions.value = list.map((item: any) => ({
      label: item.deviceName,
      value: item.id,
    }));
  } catch (error) {
    console.error('加载设备列表失败:', error);
  }
};

// 加载终端列表
const loadTerminalList = async () => {
  try {
    const res = await getTerminalListApi({ pageNo: 1, pageSize: 999 });
    const list = res.records || res || [];
    terminalOptions.value = list.map((item: any) => ({
      label: `${item.terminalName || '-'} (${item.terminalIp || '-'})`,
      value: item.id,
    }));
  } catch (error) {
    console.error('加载终端列表失败:', error);
  }
};

onMounted(() => {
  loadDeptTree();
  loadUserList();
  loadDeviceList();
  loadTerminalList();
});

// 部门树勾选事件（单选处理）
const handleDeptCheck = (checkedKeys, e) => {
  // checkedKeys 在 check-strictly 模式下是数组
  const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
  if (keys && keys.length > 1) {
    // 只保留最新选中的节点
    const newKey = keys.find((k) => !checkedDeptKeys.value.includes(k));
    checkedDeptKeys.value = newKey ? [newKey] : [keys[keys.length - 1]];
  } else {
    checkedDeptKeys.value = keys || [];
  }
  if (checkedDeptKeys.value.length > 0) {
    const deptId = checkedDeptKeys.value[0];
    const dept = findDeptById(deptTreeData.value, deptId);
    if (dept) {
      setFieldsValue({
        departmentId: deptId,
        departmentName: dept.title,
      });
    }
  }
};

// 递归查找部门
const findDeptById = (tree, id) => {
  for (const item of tree) {
    if (item.key === id) return item;
    if (item.children) {
      const found = findDeptById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};



const formSchemas: FormSchema[] = [
  {
    field: 'status',
    component: 'Input',
    label: '',
    colProps: { span: 0 },
    ifShow: () => false,
    defaultValue: '1',
  },
  {
    field: 'roomName',
    component: 'Input',
    label: '名称：',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      placeholder: '',
    },
  },
  {
    field: 'roomLocation',
    component: 'Input',
    label: '地点：',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      placeholder: '',
    },
  },
  {
    field: 'capacity',
    component: 'InputNumber',
    label: '人数：',
    required: true,
    colProps: { span: 12 },
    componentProps: {
      placeholder: '',
      min: 1,
    },
  },
  {
    field: 'needApproval',
    component: 'RadioGroup',
    label: '是否审批：',
    required: true,
    colProps: { span: 12 },
    defaultValue: '1',
    componentProps: {
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
    },
  },
  {
    field: 'approverIds',
    component: 'Select',
    label: '审批人：',
    required: true,
    colProps: { span: 24 },
    componentProps: {
      placeholder: '',
      mode: 'multiple',
      showSearch: true,
      options: userOptions.value,
      valueType: 'array',
      filterOption: (input, option) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
    },
    ifShow: ({ values }) => values.needApproval === '1',
  },
  {
    field: 'deviceIds',
    component: 'Select',
    label: '绑定设备：',
    required: false,
    colProps: { span: 24 },
    componentProps: {
      placeholder: '',
      mode: 'multiple',
      showSearch: true,
      options: deviceOptions.value,
      valueType: 'array',
      filterOption: (input, option) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
    },
  },
  {
    field: 'terminalId',
    component: 'Select',
    label: '绑定终端：',
    required: true,
    colProps: { span: 24 },
    componentProps: {
      placeholder: '',
      showSearch: true,
      options: terminalOptions.value,
      filterOption: (input, option) => {
        return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
    },
  },
  {
    field: 'remark',
    component: 'InputTextArea',
    label: '备注：',
    colProps: { span: 24 },
    componentProps: {
      placeholder: '',
      rows: 2,
    },
  },
];

const [registerForm, { validate, resetFields, setFieldsValue, updateSchema }] = useForm();

const showModal = async (record?) => {
  open.value = true;
  await nextTick();
  resetFields();
  isUpdate.value = !!record?.id;
  recordId.value = record?.id || '';
  checkedDeptKeys.value = [];
  expandedKeys.value = [];

  // 确保部门树已加载
  if (!deptTreeData.value || deptTreeData.value.length === 0) {
    await loadDeptTree();
  }

  // 更新下拉选项
  updateSchema([
    {
      field: 'approverIds',
      componentProps: { options: userOptions.value },
    },
    {
      field: 'deviceIds',
      componentProps: { options: deviceOptions.value },
    },
    {
      field: 'terminalId',
      componentProps: { options: terminalOptions.value },
    },
  ]);

  if (isUpdate.value) {
    const res = await getRoomByIdApi({ id: record.id });
    const deptId = res.departmentId ? String(res.departmentId) : '';
    setFieldsValue({
      roomName: res.roomName,
      roomLocation: res.roomLocation,
      capacity: res.capacity,
      needApproval: res.needApproval || '0',
      remark: res.remark,
      departmentId: deptId,
      departmentName: res.departmentName,
      approverIds: res.approverList ? res.approverList.map(item => item.approverUserId) : [],
      deviceIds: res.deviceIdList || [],
      terminalId: res.terminalId || undefined,
    });
    if (deptId) {
      checkedDeptKeys.value = [deptId];
      await nextTick();
      const parentPath = getParentKeyPath(deptTreeData.value, deptId);
      expandedKeys.value = [...parentPath, deptId];
    }
  } else {
    setFieldsValue({
      needApproval: '1',
      status: '1',
    });
  }
};

const handleSubmit = async () => {
  try {
    const values = await validate();
    const params = {
      ...values,
      id: recordId.value,
      departmentId: checkedDeptKeys.value[0],
      approverIds: values.needApproval === '1' ? values.approverIds : undefined,
    };
    let roomId = recordId.value;
    if (isUpdate.value) {
      await editRoomApi(params);
    } else {
      const res = await addRoomApi(params);
      roomId = res?.result?.id || res?.id || recordId.value;
    }

    // 保存绑定关系
    if (roomId) {
      const deviceIds = values.deviceIds;
      const terminalId = values.terminalId;
      await bindDeviceApi({ roomId, deviceIds: deviceIds || [] });
      if (terminalId) {
        await bindTerminalApi({ roomId, terminalId });
      }
    }

    message.success(isUpdate.value ? '编辑成功' : '新增成功');
    open.value = false;
    props.reload();
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

defineExpose({
  showModal,
});
</script>

<style lang="less" scoped>
.room-modal-content {
  display: flex;
  min-height: 400px;

  .left-dept-tree {
    width: 280px;
    border-right: 1px solid #f0f0f0;
    padding-right: 16px;
    margin-right: 16px;
  }

  .right-form {
    flex: 1;
  }
}
</style>
