<template>
  <BasicModal v-bind="getProps">
    <a-spin wrapperClassName="p-2" :spinning="loading">
      <BasicForm @register="registerForm" />
    </a-spin>
  </BasicModal>
</template>

<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import {ref, defineComponent, computed, unref, nextTick} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { settingAuth } from '../auth.data';

  export default defineComponent({
    name: 'SettingAuthModal',
    components: {
      BasicForm,
      BasicModal,
    },
    emits: ['register', 'save'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      // 当前是否正在加载中
      const loading = ref(false);
      // 表单model
      const model = ref<Recordable>();
      // 弹窗标题
      const title = computed(() => `授权（${model.value?.authTitle}）`);
      // 注册弹窗
      const [registerModal, { closeModal, setModalProps }] = useModalInner(open);
      // 注册表单
      const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
        schemas: settingAuth.formSchemas,
        showActionButtonGroup: false,
      });

      // 弹窗最终props
      const getProps = computed(() => {
        let modalProps: Partial<ModalProps> = {
          width: 800,
          title: unref(title),
          confirmLoading: unref(loading),
        };
        let finalProps: Recordable = {
          ...unref(attrs),
          ...modalProps,
          ...props,
          onOk: onSubmit,
          onCancel: close,
          onRegister: registerModal,
        };
        return finalProps;
      });

      /** 弹窗开启 */
      async function open(data) {
        // 重置表单
        await resetFields();
        model.value = cloneDeep(data?.record);
        await nextTick()
        await setFieldsValue({ ...model.value });
      }

      /** 弹窗关闭 */
      function close() {
        closeModal();
      }

      /** 提交表单 */
      async function onSubmit() {
        try {
          // 表单验证
          let values = await validate();
          let formData = Object.assign({}, model.value, values);
          // 如果是临时ID, 剔除掉
          if (formData.id.startsWith('temp-')) {
            delete formData.id;
          }
          setLoading(true);
          await new Promise<any>((resolve) => {
            emit('save', {
              formData,
              resolve: (value?) => {
                close();
                return resolve(value);
              },
            });
          });
        } finally {
          setLoading(false);
        }
      }

      /** 设置加载状态*/
      function setLoading(flag) {
        loading.value = flag;
        setModalProps({ confirmLoading: flag });
      }

      return {
        registerForm,
        getProps,
        loading,
      };
    },
  });
</script>

<style scoped lang="less"></style>
