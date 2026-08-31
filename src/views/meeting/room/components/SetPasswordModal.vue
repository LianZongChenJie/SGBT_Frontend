<template>
  <a-modal
    v-model:open="open"
    :title="title"
    @ok="handleSubmit"
    width="450px"
  >
    <div class="password-setting">
      <div class="form-item">
        <label class="form-label">
          <span class="required">*</span> 门禁密码：
        </label>
        <div class="password-input-wrapper">
          <a-input
            v-model:value="password"
            placeholder="请输入4位数字密码"
            maxlength="4"
            style="width: 150px"
          />
          <a-button type="primary" size="small" @click="generatePassword">
            自动生成
          </a-button>
        </div>
      </div>
      <div class="password-hint">
        <span>提示：密码为4位数字，保存后将统一应用到该会议室所有门禁</span>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { updateAccessPasswordApi, getAccessControlListByRoomApi } from '../Room.api';

const props = defineProps({
  reload: {
    type: Function,
    required: true,
  },
});

const open = ref(false);
const roomId = ref('');
const roomName = ref('');
const password = ref('');

const title = computed(() => `设置门禁密码 - 会议室：${roomName.value}`);

const showModal = async (record) => {
  open.value = true;
  roomId.value = record.id;
  roomName.value = record.roomName;
  password.value = '';
  // 加载当前会议室已设置的密码
  try {
    const res = await getAccessControlListByRoomApi(record.id);
    const list = res.result || res || [];
    if (list.length > 0 && list[0].accessPassword) {
      password.value = list[0].accessPassword;
    }
  } catch (error) {
    console.error('加载密码失败:', error);
  }
};

const generatePassword = () => {
  // 生成4位随机数字密码
  const randomPassword = Math.floor(1000 + Math.random() * 9000).toString();
  password.value = randomPassword;
};

const handleSubmit = async () => {
  try {
    if (!password.value) {
      message.error('请输入密码');
      return;
    }
    if (!/^\d{4}$/.test(password.value)) {
      message.error('密码必须为4位数字');
      return;
    }

    await updateAccessPasswordApi(roomId.value, password.value);
    message.success('密码设置成功');
    open.value = false;
    props.reload();
  } catch (error) {
    console.error('设置密码失败:', error);
  }
};

defineExpose({
  showModal,
});
</script>

<style lang="less" scoped>
.password-setting {
  padding: 16px;

  .form-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .form-label {
      width: 100px;
      text-align: right;
      margin-right: 8px;
      flex-shrink: 0;

      .required {
        color: #ff4d4f;
        margin-right: 2px;
      }
    }

    .password-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .password-hint {
    margin-left: 108px;
    color: #999;
    font-size: 12px;
  }
}
</style>
