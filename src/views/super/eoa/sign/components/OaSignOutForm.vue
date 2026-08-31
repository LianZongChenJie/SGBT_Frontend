<template>
  <BasicForm @register="registerForm" class="basic-form-max-width">
    <template #useCar="{ model, field }">
      <a-select v-model:value="model[field]" placeholder="请选择是否用车" :disabled="disabled">
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
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { outFormSchema } from '../OaSign.data';
  import { queryOutById } from '/@/views/super/eoa/sign/OaSign.api';
  //自定义接受参数
  const props = defineProps({
    //流程表单data
    formData: {
      type: Object,
      default: () => {},
      required: false,
    },
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  });
  // Emits声明
  const emit = defineEmits(['register', 'success']);
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
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        style: { width: '100%' },
      },
      {
        disabled: true,
      }
    );
  });
  //表单配置
  const [registerForm, { setFieldsValue, validateFields }] = useForm({
    schemas: outFormSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
    disabled: true,
  });

  /**
   * 初始化表单数据
   */
  function initFlowData() {
    queryOutById({ id: props.formData.dataId }).then((res) => {
      if (res.success) {
        //表单赋值
        setFieldsValue({
          ...res.result,
        });
      }
    });
  }
  //初始化数据
  initFlowData();

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
