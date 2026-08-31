<template>
  <!--催办form-->
  <div style="padding: 24px">
    <a-form ref="formRef" :rules="rules" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="催办类型">
        <a-checkbox-group v-model:value="formState.notifyType">
          <a-checkbox value="1" name="type">页面通知</a-checkbox>
          <a-checkbox value="2" name="type">邮件</a-checkbox>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item label="催办内容" name="remarks">
        <a-textarea rows="3" v-model:value="formState.remarks" />
      </a-form-item>
    </a-form>
    <div style="text-align: center; margin-top: 10px">
      <a-button type="primary" :loading="loading" @click="handleOk()">保存</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { saveOrUpdateNotify } from '/src/views/super/bpm/process/manage/components/bpm.api.ts';
  import { propTypes } from '/src/utils/propTypes';
  import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface';
  //props声明
  const props = defineProps({
    procInstId: propTypes.string.def(''),
  });
  // Emits声明
  const emit = defineEmits(['success']);
  const loading = ref(false);
  const formRef = ref();
  const formState = reactive({
    notifyType: '1,2',
    remarks: '',
    procInstId: props.procInstId,
  });
  const labelCol = {
    xs: { span: 24 },
    sm: { span: 5 },
  };
  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 16 },
  };
  const rules = {
    remarks: [{ required: true, message: '催办内容不允许为空!' }],
  };
  /**
   * 初始化表单数据
   */
  function initFormData() {
    formState.notifyType = '1,2';
    formState.procInstId = props.procInstId;
  }

  //表单提交事件
  function handleOk() {
    let values = toRaw(unref(formState));
    formRef.value
      .validate()
      .then(async () => {
        loading.value = true;
        values.notifyType = Array.isArray(values.notifyType) ? values.notifyType.join(',') : values.notifyType;
        //提交表单
        await saveOrUpdateNotify(values);
        loading.value = false;
        //刷新列表
        emit('success');
      })
      .catch((error: ValidateErrorEntity<any>) => {
        console.log('error', error);
      });
  }

  initFormData();
</script>
