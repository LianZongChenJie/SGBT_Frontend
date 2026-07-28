<template>
  <a-modal
    v-model:open="open"
    title="会议审批"
    width="500px"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form :model="formState" ref="formRef" layout="vertical">
      <a-form-item label="会议主题">
        <a-input v-model:value="formState.meetingTitle" disabled />
      </a-form-item>
      <a-form-item label="会议室">
        <a-input v-model:value="formState.roomName" disabled />
      </a-form-item>
      <a-form-item label="审批结果" name="status" :rules="[{ required: true, message: '请选择审批结果' }]">
        <a-radio-group v-model:value="formState.status">
          <a-radio value="approved">通过</a-radio>
          <a-radio value="rejected">不通过</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="审批备注" name="remark" v-if="formState.status === 'rejected'" :rules="[{ required: true, message: '请填写不通过原因' }]">
        <a-textarea v-model:value="formState.remark" :rows="3" placeholder="请填写不通过原因" />
      </a-form-item>
      <a-form-item label="审批备注" name="remark" v-else>
        <a-textarea v-model:value="formState.remark" :rows="3" placeholder="请输入审批备注（可选）" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { approveMeetingApi } from './MeetingList.api';

const open = ref(false);
const formRef = ref();
const emit = defineEmits(['reload']);

const formState = reactive<any>({
  id: '', meetingTitle: '', roomName: '', status: 'approved', remark: '',
});

const showModal = (record: any) => {
  open.value = true;
  formState.id = record.id;
  formState.meetingTitle = record.meetingTitle;
  formState.roomName = record.roomName;
  formState.status = 'approved';
  formState.remark = '';
};

const handleCancel = () => { open.value = false; };

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    await approveMeetingApi({ id: formState.id, status: formState.status, remark: formState.remark });
    message.success('审批成功');
    open.value = false;
    emit('reload');
  } catch (error) {
    console.error('审批失败', error);
  }
};

defineExpose({ showModal });
</script>
