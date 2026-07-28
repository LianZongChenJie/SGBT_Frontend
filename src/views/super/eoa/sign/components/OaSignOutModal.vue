<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" :width="1000" @ok="handleSubmit">
    <BasicForm @register="registerForm" class="basic-form-max-width">
      <template #useCar="{ model, field }">
        <a-select v-model:value="model[field]" placeholder="请选择是否用车" @change="handleChangeUseCar">
          <a-select-option :value="1">需要用车</a-select-option>
          <a-select-option :value="0">不需要用车</a-select-option>
        </a-select>
      </template>
      <template #expectedStartTime="{ model, field }">
        <a-date-picker v-model:value="model[field]" v-bind="expectedTimeProps" @change="(v) => handleTimeChange(v, false)" />
      </template>
      <template #expectedEndTime="{ model, field }">
        <a-date-picker v-model:value="model[field]" v-bind="expectedTimeProps" @change="(v) => handleTimeChange(v, true)" />
      </template>
      <template #actualStartTime="{ model, field }">
        <a-date-picker v-model:value="model[field]" v-bind="timeProps" />
      </template>
      <template #actualEndTime="{ model, field }">
        <a-date-picker v-model:value="model[field]" v-bind="timeProps" />
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { outFormSchema } from '../OaSign.data';
  import { outSaveOrUpdateInfo } from '../OaSign.api';
  import { formatDateTime } from '../utils/util';
  import dayjs from "dayjs";

  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const isEditAfter = ref<any>(false);
  const timeProps = computed(() => {
    return {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      style: { width: '100%' },
    };
  });
  const expectedTimeProps = computed(() => {
    return Object.assign(
      {
        showTime: { defaultValue: dayjs('00:00:00', 'HH:mm:ss') },
        format: 'YYYY-MM-DD HH:mm:ss',
        style: { width: '100%' },
      },
      {
        disabled: isEditAfter.value,
      }
    );
  });
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema, validateFields, clearValidate }] = useForm({
    // labelWidth: 400,
    schemas: outFormSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      if (data.record.useCar === 1) {
        handleChangeUseCar(1);
      }
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  /**
   * 表单提交事件
   */
  async function handleSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      //时间格式化
      values.expectedStartTime = formatDateTime(values.expectedStartTime);
      values.expectedEndTime = formatDateTime(values.expectedEndTime);
      values.actualStartTime = formatDateTime(values.actualStartTime);
      values.actualEndTime = formatDateTime(values.actualEndTime);
      //提交表单
      await outSaveOrUpdateInfo(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /**
   * 是否用车点击事件
   * @param val
   */
  function handleChangeUseCar(val) {
    validateFields(['patchStatus']);
    let required = false;
    if (val === 1) {
      required = true;
    } else {
      clearValidate('carNumber');
    }
    updateSchema([
      {
        field: 'carNumber',
        dynamicRules: ({ model, schema }) => {
          return [{ required: required, message: '车牌号必须填写!' }];
        },
      },
    ]);
  }

  /**
   * 预期时间改变时间
   * @param value
   * @param start
   */
  async function handleTimeChange(value, start) {
    let key = 'actualEndTime';
    try {
      if (start) {
        key = 'actualStartTime';
        await validateFields(['expectedEndTime']);
      } else {
        await validateFields(['expectedStartTime']);
      }
      value = value.format('YYYY-MM-DD HH:mm:ss');
      setFieldsValue({ [key]: value });
    } catch (error) {
      console.error('not passing', error);
    }
  }
</script>

<style lang="less" scoped>
  .basic-form-max-width :deep(.ant-col-sm-4) {
    max-width: 21%;
    min-width: 21%;
  }
</style>
