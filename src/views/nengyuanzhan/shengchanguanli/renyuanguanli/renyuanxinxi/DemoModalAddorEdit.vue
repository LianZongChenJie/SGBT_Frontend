<template>
  <BasicModal :title="title" v-bind="$attrs" width="40%" @ok="handleSubmit" @register="registerModal">
    <BasicForm v-if="isUpdate" :disabled="isDisabled" @register="registerForm" />
    <a-form
      v-else
      class="system-user-form"
      :label-col="{ style: { width: '80px' } }"
      :wrapper-col="{ style: { flex: 1 } }"
    >
      <a-form-item label="用户名" required>
        <a-select
          v-model:value="selectedUserId"
          allow-clear
          show-search
          :filter-option="filterUserOption"
          :loading="userLoading"
          :not-found-content="userNotFoundContent"
          :options="userOptions"
          placeholder="请选择系统用户"
        />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, nextTick, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { listNoCareTenant } from '/@/views/system/user/user.api';
  import { formSchema } from './demo.data';
  import { saveOrUpdateDemo, getDemoById, buildEmployeePayload } from './demo.api';
  import { buildEmployeeCreatePayload, type SystemUserRecord } from './employeePayload';

  interface UserSelectOption extends SystemUserRecord {
    label: string;
    value: string;
    searchText: string;
  }

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const selectedUserId = ref<string>();
  const userOptions = ref<UserSelectOption[]>([]);
  const userLoading = ref(false);
  const userLoadError = ref(false);
  const { createMessage } = useMessage();

  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    //labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  const userNotFoundContent = computed(() => {
    if (userLoading.value) return '加载中...';
    if (userLoadError.value) return '系统用户加载失败';
    return '暂无系统用户';
  });

  function formatUserLabel(user: SystemUserRecord) {
    const name = user.realname || user.username || '未命名用户';
    const workNo = user.workNo || '无工号';
    const department = user.orgCodeTxt || '无部门';
    return `${name}（${workNo}｜${department}）`;
  }

  function filterUserOption(input: string, option: UserSelectOption) {
    return option.searchText.includes(input.trim().toLowerCase());
  }

  async function loadSystemUsers() {
    userOptions.value = [];
    userLoadError.value = false;
    userLoading.value = true;
    try {
      const response = await listNoCareTenant({ pageNo: 1, pageSize: 1000, column: 'createTime', order: 'desc' });
      const users: SystemUserRecord[] = Array.isArray(response) ? response : response?.records || [];
      userOptions.value = users.map((user) => ({
        ...user,
        label: formatUserLabel(user),
        value: String(user.id),
        searchText: [user.realname, user.workNo, user.username, user.phone, user.orgCodeTxt]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      }));
    } catch (error) {
      userLoadError.value = true;
      createMessage.error('系统用户加载失败，请稍后重试');
    } finally {
      userLoading.value = false;
    }
  }

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    selectedUserId.value = undefined;

    if (unref(isUpdate) && data?.record?.id) {
      await nextTick();
      await resetFields();
      //获取详情
      data.record = await getDemoById({ id: data.record.id });
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    } else if (!unref(isUpdate)) {
      await loadSystemUsers();
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  //表单提交事件
  async function handleSubmit() {
    try {
      let payload;
      if (unref(isUpdate)) {
        const values = await validate();
        payload = buildEmployeePayload(values);
      } else {
        const selectedUser = userOptions.value.find((user) => user.value === selectedUserId.value);
        if (!selectedUser) {
          createMessage.warning(userLoadError.value ? '系统用户加载失败，请重新打开弹框后重试' : '请选择系统用户');
          return;
        }
        payload = buildEmployeeCreatePayload(selectedUser);
      }
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateDemo(payload, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  .system-user-form {
    padding: 8px 24px 0;
  }
</style>
