<template>
  <BasicForm @register="registerForm" />
  <div style="text-align: center; margin-top: 10px; width: 100%">
    <a-button type="primary" @click="handleOk()" :loading="loading">保存</a-button>
  </div>
</template>

<script>
  /**
   * 展示催办表单
   */
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { taskNotification } from '../task.apply.api';
  import {ref} from 'vue'

  export default {
    name: 'NotifyForm',
    props: {
      procInstId: {
        type: String,
        default: '',
      },
    },
    emits: ['ok'],
    components: {
      BasicForm,
    },
    setup(props, { emit }) {
      const formSchema = [
        {
          field: 'notifyType',
          label: '催办类型',
          component: 'JCheckbox',
          defaultValue: '1,2',
          componentProps: {
            options: [
              { value: '1', label: '系统通知' },
              { value: '2', label: '邮件' },
            ],
          },
        },
        {
          field: 'remarks',
          label: '催办内容',
          component: 'InputTextArea',
          required: true,
          componentProps: {
            placeholder: '请输入催办内容',
            rows: 3,
          },
        },
      ];

      //表单配置
      const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, getFieldsValue }] = useForm({
        schemas: formSchema,
        showActionButtonGroup: false,
        showSubmitButton: true,
        baseColProps: { span: 24 },
      });

      const loading = ref(false)
      async function handleOk() {
        try {
          loading.value = true
          let formData = await validate();
          let params = {
            ...formData,
            procInstId: props.procInstId,
          };
          await taskNotification(params);
          emit('ok');
          setTimeout(()=>{
            loading.value = false
          }, 200)
        }catch (e) {
          console.log('催办出错',e)
          loading.value = false
        }
      }

      return {
        registerForm,
        handleOk,
        loading
      };
    },
  };
</script>

<style scoped></style>
