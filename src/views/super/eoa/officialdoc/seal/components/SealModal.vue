<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #sealpic="{ model, field }">
        <a-upload
          listType="picture-card"
          :action="uploadUrl"
          :headers="headers"
          v-model:fileList="uploadFileList"
          :beforeUpload="beforeUpload"
          @change="handleChange"
          @preview="handlePreview"
        >
          <div v-if="uploadVisible">
            <div>
              <div class="ant-upload-text">印章图片</div>
            </div>
          </div>
        </a-upload>
        <a-modal :open="previewVisible" :footer="null" @cancel="handleCancel()">
          <img alt="example" style="width: 100%" :src="previewImage" />
        </a-modal>
      </template>

      <template #password="{ model, field }">
        <a-input-password v-model:value="model[field]" style="width: 200px"></a-input-password>
        <span style="margin-left: 10px; color: red; font-size: 10px">注意：需要正确输入密码之后才允许修改</span>
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '../seal.data';
  import { saveOrUpdate, uploadUrl } from '../seal.api';
  import { getToken } from '/@/utils/auth';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getRandom } from '/@/utils/common/compUtils';
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const uploadText = ref('印章上传');
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    // labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  //token
  const headers = ref<object>({
    'X-Access-Token': getToken(),
  });
  //文件列表
  let uploadFileList = ref<any[]>([]);
  //预览图
  const previewImage = ref<string | undefined>('');
  //预览框状态
  const previewVisible = ref<boolean>(false);
  //计算是否可以继续上传
  const uploadVisible = computed(() => {
    return uploadFileList.value.length < 1;
  });
  const { createMessage, createErrorModal } = useMessage();
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({
      confirmLoading: false,
      showCancelBtn: !!data?.showFooter,
      showOkBtn: !!data?.showFooter,
      height: 400,
      width: 600,
    });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      initFileList(data.record.sealPic);
    } else {
      initFileList('');
    }
    updateSchema([
      {
        field: 'sealPassword',
        show: !unref(isUpdate),
      },
      {
        field: 'password',
        show: unref(isUpdate),
        dynamicRules: ({ model, schema }) => {
          return [{ required: !!unref(isUpdate), message: '请输入印章密码!' }];
        },
      },
      {
        field: 'divider',
        show: unref(isUpdate),
      },
    ]);
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
      if (values.id) {
        values.sealPassword = values.password;
      }
      //提交表单
      await saveOrUpdate(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /**
   * 预览图片
   * @param file 文件
   */
  function handlePreview(file) {
    previewImage.value = file.url || file.thumbUrl;
    previewVisible.value = true;
  }

  /**
   * 预览图片关闭事件
   */
  function handleCancel() {
    previewVisible.value = false;
  }

  /**
   * 文件上传结果回调
   * @param file 文件
   * @param fileList 文件列表
   */
  function handleChange({ file, fileList }) {
    uploadFileList.value = fileList;
    if (file.status === 'error') {
      createMessage.error(`${file.name} 上传失败.`);
    }
    let fileUrls = <any>[];
    //上传完成
    if (file.status != 'uploading') {
      fileList.forEach((file) => {
        if (file.status === 'done') {
          fileUrls.push(file.response.message);
        }
      });
    }
    if (file.status === 'done' || file.status === 'removed') {
      if (fileUrls.length > 0) {
        //表单赋值
        setFieldsValue({
          sealPic: fileUrls[0],
        });
      } else {
        setFieldsValue({
          sealPic: '',
        });
      }
    }
  }

  /**
   * 上传前校验
   * @param file 文件
   */
  function beforeUpload(file) {
    let fileType = file.type;
    if (fileType.indexOf('image') < 0) {
      createMessage.info('请上传图片');
      return false;
    }
  }

  /**
   * 初始化文件列表
   * @param path 文件路径
   */
  function initFileList(path) {
    if (!path) {
      uploadFileList.value = [];
      return;
    }
    uploadFileList.value = [
      {
        uid: getRandom(10),
        name: '印章',
        status: 'done',
        url: path,
        response: {
          status: 'history',
          message: path,
        },
      },
    ];
  }
</script>
