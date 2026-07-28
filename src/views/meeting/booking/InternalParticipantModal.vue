<template>
  <a-modal
    v-model:open="open"
    title="选择内部参会人"
    width="700px"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-transfer
      v-model:target-keys="targetKeys"
      :data-source="userList"
      :titles="['可选人员', '已选人员']"
      :render="item => item.title"
      :list-style="{ width: '300px', height: '400px' }"
      show-search
      :filter-option="filterOption"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { listNoCareTenant } from '/@/views/system/user/user.api';

const open = ref(false);
const userList = ref<any[]>([]);
const targetKeys = ref<string[]>([]);

const emit = defineEmits(['confirm']);

onMounted(() => {
  loadUsers();
});

const loadUsers = async () => {
  try {
    const res = await listNoCareTenant({ pageNo: 1, pageSize: 1000 });
    const users = res.records || res || [];
    userList.value = users.map((user: any) => ({
      key: user.id,
      title: `${user.realname || user.username} (${user.orgCodeTxt || user.departName || '无部门'})`,
      ...user,
    }));
  } catch (error) {
    console.error('加载用户列表失败', error);
  }
};

const filterOption = (inputValue: string, option: any) => {
  return option.title.indexOf(inputValue) > -1;
};

const showModal = () => {
  open.value = true;
  targetKeys.value = [];
};

const handleConfirm = () => {
  const selectedUsers = userList.value.filter(user => targetKeys.value.includes(user.key));
  emit('confirm', selectedUsers);
  open.value = false;
};

const handleCancel = () => {
  open.value = false;
};

defineExpose({ showModal });
</script>
