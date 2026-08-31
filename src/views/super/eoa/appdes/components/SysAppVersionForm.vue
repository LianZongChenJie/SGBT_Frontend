<template>
  <a-spin :spinning="confirmLoading">
    <a-form ref="formRef" :model="model" :labelCol="labelCol" :wrapperCol="wrapperCol" :rules="validatorRules">
      <a-row>
        <a-col :span="24">
          <a-form-item label="版本" name="appVersion">
            <a-input v-model:value="model.appVersion" placeholder="请输入版本" />
          </a-form-item>
        </a-col>
        <!--        <a-col :span="24">-->
        <!--          <a-form-item label="版本号" name="versionNum">-->
        <!--            <a-input-number v-model:value="model.versionNum" placeholder="请输入版本号" />-->
        <!--          </a-form-item>-->
        <!--        </a-col>-->
        <a-col :span="24">
          <a-form-item label="APP安装apk" name="downloadUrl">
            <a-input placeholder="设置APP安装apk" v-model:value="model.downloadUrl">
              <template #addonAfter>
                <Icon icon="ant-design:upload-outlined" style="cursor: pointer" @click="showUploadModal('apk')"></Icon>
              </template>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="APP热更新文件" name="wgtUrl">
            <a-input placeholder="设置APP热更新文件" v-model:value="model.wgtUrl">
              <template #addonAfter>
                <Icon icon="ant-design:upload-outlined" style="cursor: pointer" @click="showUploadModal('wgt')"></Icon>
              </template>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="更新内容">
            <a-input v-model:value="model.updateNote" placeholder="请输入更新内容" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <JUploadModal :value="modalValue" :bizPath="filePath" :maxCount="1" @register="registerModel" @change="uploadBack" />
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, unref, reactive, toRaw } from 'vue';
  import { JUpload, JUploadModal } from '/@/components/Form/src/jeecg/components/JUpload';
  import { saveOrUpdateConfig } from '../appdes.api';
  import { useModal } from '@/components/Modal';
  const [registerModel, { openModal }] = useModal();
  const emit = defineEmits(['ok']);
  const confirmLoading = ref(false);
  const formRef = ref<any>(null);
  const filePath = 'appVersion';
  const uploadType = ref('');
  const modalValue = ref('');
  const labelCol = {
    xs: { span: 24 },
    sm: { span: 5 },
  };
  const wrapperCol = {
    xs: { span: 24 },
    sm: { span: 16 },
  };
  const model = reactive({
    id: '',
    appVersion: '',
    versionNum: 0,
    updateNote: '',
    downloadUrl: '',
    wgtUrl: '',
  });

  /**
   * 初始化表单数据
   * @param record
   */
  function initFormData(record) {
    Object.assign(model, record);
  }

  /**
   * 提交保存路由信息
   */
  function handleSubmit() {
    const form = unref(formRef);
    form.validate().then(async () => {
      let obj = toRaw(model);
      if (obj.appVersion.indexOf('.') != -1) {
        obj.versionNum = Number(obj.appVersion.replace(/\./g, ''));
      }
      confirmLoading.value = true;
      await saveOrUpdateConfig(obj, obj.id);
      confirmLoading.value = false;
      //刷新
      emit('ok');
    });
  }

  /**
   * 显示设置弹窗
   * @param type
   */
  function showUploadModal(type) {
    uploadType.value = type;
    modalValue.value = type == 'apk' ? model.downloadUrl : model.wgtUrl;
    openModal(true, {
      maxCount: 1,
      bizPath: filePath,
    });
  }

  /**
   *上传返回
   */
  function uploadBack(value) {
    if (unref(uploadType) == 'apk') {
      model.downloadUrl = value;
    } else {
      model.wgtUrl = value;
    }
  }
  //表单校验规则
  const validatorRules = {
    appVersion: [{ required: true, message: '版本不能为空', trigger: 'blur' }],
    downloadUrl: [{ required: true, message: 'APP安装apk不能为空', trigger: 'change' }],
    wgtUrl: [{ required: true, message: 'APP热更新文件不能为空', trigger: 'change' }],
  };

  defineExpose({
    initFormData,
    handleSubmit,
  });
</script>
