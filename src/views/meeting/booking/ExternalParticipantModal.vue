<template>
  <a-modal
    v-model:open="open"
    title="添加外部参会人"
    width="500px"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-form :model="formState" ref="formRef" layout="vertical">
      <a-form-item label="姓名" name="name" :rules="[{ required: true, message: '请输入姓名' }]">
        <a-input v-model:value="formState.name" placeholder="请输入姓名" />
      </a-form-item>
      <a-form-item label="联系方式" name="contact">
        <a-input v-model:value="formState.contact" placeholder="请输入联系方式" />
      </a-form-item>
      <a-form-item label="单位/部门" name="dept">
        <a-input v-model:value="formState.dept" placeholder="请输入单位或部门" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const open = ref(false);
const formRef = ref();
const emit = defineEmits(['confirm']);

const formState = reactive({
  name: '',
  contact: '',
  dept: '',
});

const showModal = () => {
  open.value = true;
  formState.name = '';
  formState.contact = '';
  formState.dept = '';
};

const handleConfirm = async () => {
  try {
    await formRef.value.validate();
    emit('confirm', { ...formState });
    open.value = false;
  } catch (error) {
    // validation failed
  }
};

const handleCancel = () => {
  open.value = false;
};

defineExpose({ showModal });
</script>
