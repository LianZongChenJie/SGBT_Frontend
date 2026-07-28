<template>
  <a-spin :spinning="confirmLoading">
    <BasicForm @register="registerForm" />
  </a-spin>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { saveOrUpdateConfig } from '../appdes.api';
  const confirmLoading = ref(false);
  const emit = defineEmits(['ok']);
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 150,
    schemas: [
      {
        label: '主键',
        field: 'id',
        component: 'Input',
        show: false,
      },
      {
        field: 'appTitle',
        label: '登录标题',
        component: 'Input',
        required: true,
      },
      {
        field: 'appLogo',
        label: '登录Logo',
        component: 'JImageUpload',
        componentProps: {
          fileMax: 1,
        },
      },
      {
        field: 'carouselImgJson',
        label: '首页轮播图',
        component: 'JImageUpload',
        componentProps: {
          fileMax: 5,
        },
      },
    ],
    showActionButtonGroup: false,
  });

  /**
   * 初始化表单数据
   * @param record
   */
  function initFormData(record) {
    setFieldsValue(record);
  }
  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      confirmLoading.value = true;
      //提交表单
      await saveOrUpdateConfig(values, values.id);
      //刷新
      emit('ok');
    } finally {
      confirmLoading.value = false;
    }
  }

  defineExpose({
    initFormData,
    handleSubmit,
  });
</script>
