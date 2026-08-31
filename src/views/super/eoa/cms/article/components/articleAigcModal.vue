<template>
  <BasicModal v-bind="getProps" destroyOnClose>
    <a-spin wrapperClassName="p-2" :spinning="loading">
      <div class="aiWrap">
        <div class="titleArea">
          <svg
            t="1707100353985"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="4235"
            width="26"
            height="26"
          >
            <path
              d="M512 64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m32 704h-64v-64h64v64z m11.2-203.2l-5.6 4.8c-3.2 2.4-5.6 8-5.6 12.8v58.4h-64v-58.4c0-24.8 11.2-48 29.6-63.2l5.6-4.8c56-44.8 83.2-68 83.2-108C598.4 358.4 560 320 512 320c-49.6 0-86.4 36.8-86.4 86.4h-64C361.6 322.4 428 256 512 256c83.2 0 150.4 67.2 150.4 150.4 0 72.8-49.6 112.8-107.2 158.4z"
              p-id="4236"
              fill="currentColor"
            ></path>
          </svg>
          <h3>创建文章需要专业建议？试试AI智能写文章吧</h3>
        </div>
        <p class="tip">可输入相应修饰词，例如：以2024年巴黎奥运会开幕式为主题，写一篇文章</p>
        <div class="content">
          <a-textarea v-model:value.trim="model.prompt" placeholder="请输入修饰词" :rows="3" :disabled="step !== 1" />
        </div>

        <div v-show="step === 2">
          <p class="tip" style="margin-top: 20px">文章已生成，请继续确认文章栏目及封面图</p>
          <BasicForm @register="registerForm" />
        </div>
      </div>
    </a-spin>

    <template #footer>
      <a-button @click="onCancel">关闭</a-button>
      <a-button v-if="step === 1" type="primary" :loading="loading" preIcon="carbon:ai-generate" @click="onSubmit"> 立即生成 </a-button>
      <a-button v-else type="primary" :loading="loading" preIcon="ant-design:save" @click="onSubmit"> 保存 </a-button>
    </template>
  </BasicModal>
</template>

<script lang="ts" setup>
  import type { ModalProps } from '/@/components/Modal';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { computed, ref, unref } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { defHttp } from '@/utils/http/axios';
  import { BasicForm, useForm } from '@/components/Form';
  import { selectTreeData } from '@/views/super/eoa/cms/menu/cms.menu.api';
  import { useUserStore } from '@/store/modules/user';
  import { saveOrUpdate } from '../article.api';
  enum Api {
    AIGC = '/eoa/cms/eoaCmsArticle/aigc',
  }

  const props = defineProps({});
  const emit = defineEmits(['register', 'success', 'added']);
  const attrs = useAttrs();
  const userStore = useUserStore();

  const { createMessage: $message } = useMessage();

  // model
  const model = ref<Recordable>({
    prompt: '',
    title: '',
    content: '',
  });
  // 当前是否正在加载中
  const loading = ref(true);
  const step = ref(1);

  // 注册表单
  const [registerForm, { validate, setFieldsValue }] = useForm({
    schemas: [
      {
        field: 'columnId',
        label: '栏目',
        component: 'ApiTreeSelect',
        componentProps: {
          api: selectTreeData,
          resultField: 'list',
          dropdownStyle: {
            maxHeight: '50vh',
          },
        },
      },
      {
        field: 'imageHref',
        label: '封面图片',
        component: 'JImageUpload',
        componentProps: {
          fileMax: 1,
        },
      },
      {
        field: 'isPublish',
        label: '是否发布',
        component: 'RadioGroup',
        defaultValue: '0',
        componentProps: {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
        },
      },
    ],
    showActionButtonGroup: false,
    labelAlign: 'right',
  });

  // 注册弹窗
  const [registerModal, { closeModal, setModalProps }] = useModalInner(() => {
    setLoading(false);
    step.value = 1;
    model.value.prompt = '';
    model.value.title = '';
    model.value.content = '';
  });

  // 弹窗最终props
  const getProps = computed(() => {
    let modalProps: Partial<ModalProps> = {
      width: 600,
      height: step.value === 2 ? 500 : 200,
      title: '通过Ai生成文章',
      maskClosable: false,
      canFullscreen: false,
      confirmLoading: unref(loading),
    };
    let finalProps: Recordable = {
      ...modalProps,
      ...unref(attrs),
      ...props,
      onCancel: close,
      onRegister: registerModal,
    };
    return finalProps;
  });

  /** 设置加载状态*/
  function setLoading(flag) {
    loading.value = flag;
    setModalProps({ confirmLoading: flag });
  }

  async function onSubmit() {
    if (step.value === 1) {
      await onStepGenerate();
    } else {
      await onStepSubmit();
    }
  }

  async function onStepGenerate() {
    const { prompt } = model.value;
    if (!prompt) {
      $message.warning('请输入修饰词');
      return;
    }
    setLoading(true);
    try {
      const url = Api.AIGC + '?prompt=' + prompt;
      const { success, result, message } = await defHttp.post({ url: url, timeout: 60000 }, { isTransformResponse: false });
      console.log('onStepGenerate', success);
      console.log('result', result);
      console.log('message', message);
      if (success && result) {
        const { schemaLite } = result;
        if (schemaLite && schemaLite.length == 2) {
          model.value.title = schemaLite[0];
          model.value.content = schemaLite[1].content;
          step.value = 2;
        } else {
          $message.warn('生成失败，Ai开小差了，请稍后重试…');
        }
      } else {
        $message.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onStepSubmit() {
    setLoading(true);
    try {
      // 校验表单
      const formData = await validate();
      formData.title = model.value.title;
      formData.content = model.value.content;
      formData.type = 'article';
      formData.author = userStore.getUserInfo?.realname;
      // 提交表单
      await saveOrUpdate(formData, false);
      // 刷新列表
      emit('success');
      onCancel();
    } finally {
      setLoading(false);
    }
  }

  function onCancel() {
    closeModal();
  }
</script>

<style scoped lang="less">
  html[data-theme='light'] {
    .aiWrap {
      h3 {
        color: #333;
      }

      .tip {
        color: #666;
      }
    }
  }

  .aiWrap {
    padding: 30px 20px 20px;

    .titleArea {
      position: relative;
      color: #ffb308;
      width: fit-content;
      margin: 0 auto;

      svg {
        position: absolute;
        left: -30px;
        margin-right: 8px;
      }
    }

    h3 {
      text-align: center;
      margin-bottom: 0;
    }

    .tip {
      text-align: center;
      margin-bottom: 26px;
    }

    .content {
      display: flex;
    }

    .ant-btn {
      margin-left: 16px;
    }
  }
</style>
