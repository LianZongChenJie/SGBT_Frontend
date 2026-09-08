<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './demo.data';
  import { getQueryByCode, saveSubmitAlarm, uploadAlarmImage } from './demo.api';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

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
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    if (data.createBy) {
      await setFieldsValue({ createBy: data.createBy });
    }
    if (data.createTime) {
      await setFieldsValue({ createTime: data.createTime });
    }
    if (unref(isUpdate)) {
      const device = await getQueryByCode({ deviceCode: data.cameraCode });
      await setFieldsValue({
        ...data,
        location: device.location,
        imageUrl: data.imageUrl || '',
      });
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '发起告警' : '发起告警'));

  function dataUrlToFile(dataUrl: string) {
    const [header, content = ''] = dataUrl.split(',');
    const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
    const binary = window.atob(content);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new File([bytes], `alarm_screenshot_${Date.now()}.jpeg`, { type: mime });
  }

  async function uploadScreenshotBeforeSubmit(dataUrl: string) {
    const file = dataUrlToFile(dataUrl);
    return uploadAlarmImage(file);
  }

  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      if (typeof values.imageUrl === 'string' && values.imageUrl.startsWith('data:image/')) {
        values.imageUrl = await uploadScreenshotBeforeSubmit(values.imageUrl);
      }
      //提交表单
      await saveSubmitAlarm(values);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
