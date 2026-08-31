<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="选择印章" @ok="handleSubmit" @cancel="handleCancel">
    <a-form ref="formRef" :model="formState" :labelCol="labelCol" :wrapperCol="wrapperCol" :rules="rules">
      <a-row style="margin: auto 0">
        <a-col :span="24">
          <a-form-item label="选择印章" name="id">
            <JDictSelectTag v-model:value="formState.id" placeholder="请选择印章" dictCode="oa_officialdoc_seal,seal_name,id" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="密码" name="sealPassword">
            <div class="flexCenter">
              <a-input-password v-model:value="formState.sealPassword" placeholder="请输入印章密码" style="width: 60%" />
              <a-button type="primary" @click="sealHandle" style="margin-left: 5px">盖章</a-button>
            </div>
          </a-form-item>
        </a-col>
        <a-col :span="24" style="text-align: center">
          <img v-if="sealPic" :src="sealPic" style="width: 200px; height: 200px" />
        </a-col>
      </a-row>
    </a-form>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, unref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getSignature, verifyPassword } from '../seal.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  // Emits声明
  const emit = defineEmits(['register', 'ok']);
  const formRef = ref();
  //提示
  const { createMessage: $message } = useMessage();
  const labelCol = { xs: { span: 24 }, sm: { span: 5 } };
  const wrapperCol = { xs: { span: 24 }, sm: { span: 16 } };
  const formState = ref({
    id: '',
    sealPassword: '',
  });
  //id
  const id = ref(null);
  //盖章图片
  const sealPic = ref(null);
  //表单赋值
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    formRef.value.clearValidate();
    id.value = data.id;
  });

  //验证规则
  const rules = {
    id: [{ required: true, message: '请选择印章!', trigger: 'change' }],
    sealPassword: [{ required: true, message: '请输入印章密码!', trigger: 'change' }],
  };
  /**
   * 表单提交事件
   */
  async function handleSubmit() {
    formRef.value.validate().then(async () => {
      if (!unref(sealPic)) {
        $message.warning('请先盖章！');
        return;
      }
      getSignature({
        id: unref(id),
        realId: unref(formState).id,
      }).then((res) => {
        if (res.success) {
          emit('ok', { tempId: res?.result?.tempId, userId: res?.result?.userId });
          handleCancel();
        } else {
          $message.warning(res.message);
        }
      });
    });
  }

  /**
   * 盖章
   */
  function sealHandle() {
    formRef.value.validate().then(async () => {
      let params = toRaw(unref(formState));
      console.log('params', params);
      verifyPassword(params).then((res) => {
        if (res.success) {
          sealPic.value = getFileAccessHttpUrl(res.message);
        } else {
          $message.warning(res.message);
        }
      });
    });
  }
  /**
   * 关闭事件
   */
  function handleCancel() {
    sealPic.value = null;
    closeModal();
  }
</script>
<style scoped>
  .flexCenter {
    display: flex;
    align-items: center;
  }
</style>
