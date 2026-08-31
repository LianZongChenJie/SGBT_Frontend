<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" :width="700" :z-index="10000" :max-height="1000">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import BasicModal from '@/components/Modal/src/BasicModal.vue';
  import { useForm } from '@/components/Form';
  import BasicForm from '@/components/Form/src/BasicForm.vue';
  import { useModalInner } from '@/components/Modal';
  import { computed, ref } from 'vue';
  import { saveOrUpdate } from './space.api';
  import { nodeFormSchema } from './space.data';

  const emit = defineEmits(['success', 'register']);
  const isUpdate = ref(true);
  const parentId = ref<Number>();
  const nodePath = ref<string[]>([]);
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    //labelWidth: 150,
    schemas: nodeFormSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    console.log(data);
    await resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    parentId.value = data?.parentId;
    nodePath.value = data?.nodePath;
    //表单赋值
    await setFieldsValue({
      ...data.record,
      fullName: nodePath.value,
    });
  });
  const getTitle = computed(() => (isUpdate.value ? '编辑空间' : '新增空间'));

  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (parentId.value) {
        values.parentId = parentId.value;
      }
      delete values.projectDept;
      values.spacePropertyList = JSON.parse(values.spacePropertyList || '[]');
      //提交表单
      await saveOrUpdate(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
