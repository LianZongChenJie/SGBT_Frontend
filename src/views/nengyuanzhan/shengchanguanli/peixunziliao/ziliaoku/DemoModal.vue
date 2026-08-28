<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled">
      <template #materialUpload="{ model, field }">
        <div class="material-upload">
          <j-upload-button v-if="!isDisabled" type="primary" preIcon="ant-design:upload-outlined" @click="handleMaterialUpload">文件上传</j-upload-button>
          <template v-if="getMaterialFilePath(model, field)">
            <a class="material-upload__file" :href="getMaterialFileUrl(model, field)" target="_blank">{{ getMaterialFileName(model, field) }}</a>
            <a-button v-if="!isDisabled" danger type="link" size="small" @click="handleRemoveMaterial(model, field)">删除</a-button>
          </template>
          <span v-else class="material-upload__empty">未上传</span>
        </div>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { uploadImg } from '/@/api/sys/upload';
  import { formSchema } from './demo.data';
  import { buildTrainingMaterialPayload, getDemoById, saveOrUpdateDemo } from './demo.api';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const currentRecordId = ref<string | number>();
  const materialFilePath = ref('');
  const materialFileName = ref('');
  const { createMessage } = useMessage();

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
    materialFilePath.value = '';
    materialFileName.value = '';
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    currentRecordId.value = data?.record?.id;
    if (data.createBy) {
      await setFieldsValue({ createBy: data.createBy });
    }
    if (data.createTime) {
      await setFieldsValue({ createTime: data.createTime });
    }
    if (unref(isUpdate)) {
      //获取详情
      data.record = await getDemoById({ id: data.record.id });
      currentRecordId.value = data.record?.id ?? currentRecordId.value;
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      materialFilePath.value = data.record?.filePath || '';
      materialFileName.value = getDisplayFileName(data.record?.filePath);
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      if (isUpdate.value && values.id == null) {
        values.id = currentRecordId.value;
      }
      values.filePath = materialFilePath.value || values.filePath;
      const payload = buildTrainingMaterialPayload(values);
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateDemo(payload, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  async function handleMaterialUpload(data) {
    const originalName = data?.file?.name || '';
    const res = await uploadImg(
      { file: data.file, filename: buildSafeUploadFileName(originalName) },
      () => {}
    );
    const response = getUploadResponse(res);
    const filePath = getUploadPath(response);
    if (!filePath) {
      createMessage.error(response?.message || '文件上传失败');
      return;
    }
    materialFilePath.value = filePath;
    materialFileName.value = originalName || getDisplayFileName(filePath);
    await setFieldsValue({ filePath });
    createMessage.success('文件上传成功');
  }

  async function handleRemoveMaterial(model?: Recordable, field?: string) {
    materialFilePath.value = '';
    materialFileName.value = '';
    if (model && field) {
      model[field] = '';
    }
    await setFieldsValue({ filePath: '' });
  }

  function getMaterialFilePath(model?: Recordable, field?: string) {
    return String((field && model?.[field]) || materialFilePath.value || '');
  }

  function getMaterialFileUrl(model?: Recordable, field?: string) {
    const filePath = getMaterialFilePath(model, field);
    return filePath ? getFileAccessHttpUrl(filePath) : '';
  }

  function getMaterialFileName(model?: Recordable, field?: string) {
    const filePath = getMaterialFilePath(model, field);
    return materialFileName.value || getDisplayFileName(filePath);
  }

  function getUploadResponse(res: any) {
    return res?.data || res;
  }

  function getUploadPath(res: any): string {
    if (res?.success === false || (res?.code != null && res.code !== 200)) {
      return '';
    }
    const result = res?.result;
    if (typeof result === 'string') {
      return result;
    }
    return result?.url || result?.fileUrl || result?.filePath || (res?.success === true ? res?.message : '') || '';
  }

  function getDisplayFileName(filePath = '') {
    if (!filePath) {
      return '';
    }
    return decodeURIComponent(String(filePath).split('/').pop() || '已上传文件');
  }

  function buildSafeUploadFileName(fileName = '') {
    const extMatch = fileName.match(/\.([A-Za-z0-9]+)$/);
    const ext = extMatch ? `.${extMatch[1]}` : '';
    return `material_${Date.now()}${ext}`;
  }
</script>
<style lang="less" scoped>
  .material-upload {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 12px;
  }

  .material-upload__file {
    overflow: hidden;
    max-width: 280px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .material-upload__empty {
    color: rgba(0, 0, 0, 0.45);
  }
</style>
