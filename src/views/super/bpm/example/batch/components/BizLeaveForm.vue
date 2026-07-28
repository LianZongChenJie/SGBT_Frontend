<template>
  <div>
    <BasicForm ref="form" @register="registerForm" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '/src/components/Form';
  import { formSchema } from '../leave.data';
  import { queryById } from '../leave.api';

  const props = defineProps({
    formData: {
      type: Object,
    },
  });
  const form = ref(null);
  //表单配置
  const [registerForm] = useForm({
    // labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
    disabled: true,
  });

  /**
   * 初始化表单数据
   */
  async function initFormData() {
    if (unref(form)) {
      form.value.resetFields();
      let res = await queryById({ id: props.formData.dataId });
      if (res.success) {
        form.value.setFieldsValue(res.result);
      }
    } else {
      setTimeout(() => {
        initFormData();
      }, 10);
    }
  }
  initFormData();
</script>
