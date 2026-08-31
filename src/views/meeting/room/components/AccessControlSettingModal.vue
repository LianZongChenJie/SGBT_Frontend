<template>
  <a-modal
    v-model:open="open"
    :title="title"
    @ok="handleSubmit"
    width="700px"
  >
    <div class="access-control-setting">
      <div
        v-for="(item, index) in accessControlList"
        :key="index"
        class="access-control-item"
      >
        <div class="item-header">
          <span class="item-title">门禁 {{ index + 1 }}</span>
          <a-button
            v-if="accessControlList.length > 1"
            type="link"
            danger
            size="small"
            @click="removeAccessControl(index)"
          >
            删除
          </a-button>
        </div>
        <div class="item-form">
          <div class="form-row">
            <div class="form-col">
              <div class="form-item">
                <label class="form-label">
                  <span class="required">*</span> IP：
                </label>
                <a-input
                  v-model:value="item.deviceIp"
                  placeholder="请输入IP地址"
                />
              </div>
            </div>
            <div class="form-col">
              <div class="form-item">
                <label class="form-label">
                  <span class="required">*</span> 服务端口：
                </label>
                <a-input-number
                  v-model:value="item.servicePort"
                  placeholder="请输入服务端口"
                  :min="1"
                  :max="65535"
                  style="width: 100%"
                />
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-col">
              <div class="form-item">
                <label class="form-label">
                  <span class="required">*</span> 用户名：
                </label>
                <a-input
                  v-model:value="item.username"
                  placeholder="请输入用户名"
                />
              </div>
            </div>
            <div class="form-col">
              <div class="form-item">
                <label class="form-label">
                  <span class="required">*</span> 密码：
                </label>
                <a-input-password
                  v-model:value="item.password"
                  placeholder="请输入密码"
                />
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-col">
              <div class="form-item">
                <label class="form-label">
                  <span class="required">*</span> 门锁编号：
                </label>
                <a-input
                  v-model:value="item.lockNo"
                  placeholder="请输入门锁编号"
                />
              </div>
            </div>
            <div class="form-col">
              <div class="form-item">
                <label class="form-label">门类型：</label>
                <a-input
                  v-model:value="item.doorType"
                  placeholder="请输入门类型，如：前门"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
      <div class="add-btn-wrapper">
        <a-button type="dashed" block @click="addAccessControl">
          <PlusOutlined />
          添加门禁
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { getAccessControlListByRoomApi, saveAccessControlListApi } from '../Room.api';

const props = defineProps({
  reload: {
    type: Function,
    required: true,
  },
});

const open = ref(false);
const roomId = ref('');
const roomName = ref('');

const title = computed(() => `设置门禁控制器 - 会议室：${roomName.value}`);

const accessControlList = ref<any[]>([]);

const showModal = async (record) => {
  open.value = true;
  roomId.value = record.id;
  roomName.value = record.roomName;
  // 加载当前会议室的门禁列表
  try {
    const res = await getAccessControlListByRoomApi(record.id);
    const list = res.result || res || [];
    if (list.length > 0) {
      accessControlList.value = list.map((item) => ({
        id: item.id,
        deviceIp: item.deviceIp || '',
        servicePort: item.servicePort || 80,
        username: item.username || '',
        password: item.password || '',
        lockNo: item.lockNo || '',
        doorType: item.doorType || '',
      }));
    } else {
      accessControlList.value = [createEmptyAccessControl()];
    }
  } catch (error) {
    console.error('加载门禁列表失败:', error);
    accessControlList.value = [createEmptyAccessControl()];
  }
};

const createEmptyAccessControl = () => ({
  deviceIp: '',
  servicePort: 80,
  username: '',
  password: '',
  lockNo: '',
  doorType: '',
});

const addAccessControl = () => {
  accessControlList.value.push(createEmptyAccessControl());
};

const removeAccessControl = (index: number) => {
  accessControlList.value.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    // 验证必填字段
    for (let i = 0; i < accessControlList.value.length; i++) {
      const item = accessControlList.value[i];
      if (!item.deviceIp) {
        message.error(`门禁 ${i + 1} 的IP地址不能为空`);
        return;
      }
      if (!item.servicePort) {
        message.error(`门禁 ${i + 1} 的服务端口不能为空`);
        return;
      }
      if (!item.username) {
        message.error(`门禁 ${i + 1} 的用户名不能为空`);
        return;
      }
      if (!item.password) {
        message.error(`门禁 ${i + 1} 的密码不能为空`);
        return;
      }
      if (!item.lockNo) {
        message.error(`门禁 ${i + 1} 的门锁编号不能为空`);
        return;
      }
    }

    await saveAccessControlListApi(roomId.value, accessControlList.value);
    message.success('保存成功');
    open.value = false;
    props.reload();
  } catch (error) {
    console.error('保存门禁失败:', error);
  }
};

defineExpose({
  showModal,
});
</script>

<style lang="less" scoped>
.access-control-setting {
  max-height: 500px;
  overflow-y: auto;
  padding: 8px;

  .access-control-item {
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    background-color: #fafafa;

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .item-title {
        font-weight: 500;
        font-size: 14px;
        color: #333;
      }
    }

    .item-form {
      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .form-col {
          flex: 1;
        }
      }

      .form-item {
        display: flex;
        align-items: center;

        .form-label {
          width: 90px;
          text-align: right;
          margin-right: 8px;
          flex-shrink: 0;

          .required {
            color: #ff4d4f;
            margin-right: 2px;
          }
        }

        :deep(.ant-input),
        :deep(.ant-input-number),
        :deep(.ant-input-password) {
          flex: 1;
        }
      }
    }
  }

  .add-btn-wrapper {
    margin-top: 8px;
  }
}
</style>
