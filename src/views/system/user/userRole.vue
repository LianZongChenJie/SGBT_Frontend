<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit"
              :width="700"
              :z-index="10000">
    <BasicForm @register="registerForm"/>
  </BasicModal>
</template>
<script lang="ts" setup name="OrderAppraise">
import {ref, computed, unref} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm, useForm} from '/@/components/Form/index';
import {useEventStoreWithOut} from '/@/store/modules/event';
import {storeToRefs} from 'pinia';
import {getEventRoles, saveUserRoleRelation} from "@/views/system/user/user.api";

const useEventStor = useEventStoreWithOut();
const {changeFlag} = storeToRefs(useEventStor);
// 声明Emits
const emit = defineEmits(['success', 'register']);
const isUpdate = ref(true);
let code;
const userId = ref("");


//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({confirmLoading: false});
  code = data.code;
  userId.value = data.id
  //表单赋值
  await setFieldsValue({
    userId: data.id
  });
});
//表单配置
const [registerForm, {resetFields, setFieldsValue, validate}] = useForm({
  //labelWidth: 150,
  schemas: [
    {
      label: '主键',
      field: 'userId',
      component: 'Input',
      show: false,
    },
    {
      label: '事件角色',
      field: 'roleIds',
      component: 'ApiSelect',
      defaultValue: [],
      componentProps: {
        mode: 'multiple',
        api: async () => {
          const roles = await getEventRoles({ userId: unref(userId) });
          // 提取 checked=true 的 id 组成数组
          const checkedIds = roles.filter(role => role.checked).map(role => role.id);
          // 动态设置表单的 roleIds
          setFieldsValue({ roleIds: checkedIds });
          return roles; // 返回完整数据供选择器渲染
        },
        labelField: 'name',
        valueField: 'id',
        immediate: false,
      },
    }
  ],
  showActionButtonGroup: false,
});
//设置标题
const getTitle = computed(() => '事件角色选择');

//表单提交事件
async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({confirmLoading: true});
    const formData = {
      ...values,
      roleIds: formatRoleIds(values.roleIds), // 统一转换
    };
    //提交表单
    await saveUserRoleRelation(formData);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success');
    changeFlag.value = !changeFlag.value;
  } finally {
    setModalProps({confirmLoading: false});
  }
}
const formatRoleIds = (roleIds) => {
  if (Array.isArray(roleIds)) return roleIds;
  if (typeof roleIds === 'string') {
    return roleIds.split(',').map(Number).filter(v => !isNaN(v));
  }
  return [];
};
</script>
