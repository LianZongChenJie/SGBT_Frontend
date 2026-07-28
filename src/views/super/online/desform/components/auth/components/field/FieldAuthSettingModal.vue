<template>
  <BasicModal v-bind="getProps">
    <a-spin wrapperClassName="p-2" :spinning="loading">
      <a-tabs v-model="tabActiveKey">
        <a-tab-pane v-for="auth of authTypes" :tab="auth.text" :key="auth.key" forceRender>
          <BasicForm @register="auth.registerForm" />
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </BasicModal>
</template>

<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormActionType } from '/@/components/Form';
  import { BasicForm, useForm } from '/@/components/Form';
  import { computed, defineComponent, ref, unref } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { settingAuth } from '../../auth.data';
  import { settingAuthApi } from '../../auth.api';

  export default defineComponent({
    name: 'FieldAuthSettingModal',
    components: {
      BasicForm,
      BasicModal,
    },
    emits: ['register', 'ok'],
    setup(props, {emit}) {
      const attrs = useAttrs();
      // 当前是否正在加载中
      const loading = ref(false);
      // 表单model
      const model = ref<Recordable>();
      // 当前 tab key
      const tabActiveKey = ref('1');
      // 权限类型
      const authTypes = ref<Recordable[]>([]);
      const formActionMap = new Map<string, FormActionType>();
      // 弹窗标题
      const title = computed(() => `授权（${model.value?.authTitle}）`);
      // 注册弹窗
      const [registerModal, { closeModal, setModalProps }] = useModalInner(open);
      // 注册表单
      addForm('1', '可见');
      addForm('2', '可编辑');
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

      /**
       * 查询数据
       * @param record
       */
      async function requestData(record) {
        setLoading(true);
        let { desformCode, authComKey } = record;
        try {
          let result: Recordable[] = await settingAuthApi.queryByCodeAndAuthComKey(desformCode, authComKey);
          for (let auth of authTypes.value) {
            for (let item of result) {
              if (auth.key === item.authType) {
                formActionMap.get(auth.key)?.setFieldsValue(item);
                break;
              }
            }
          }
        } finally {
          setLoading(false);
        }
      }

      /** 添加表单 */
      function addForm(key: string, text: string) {
        // 注册表单
        const [registerForm, actions] = useForm({
          schemas: settingAuth.formSchemas,
          showActionButtonGroup: false,
        });
        authTypes.value.push({ key, text, registerForm });
        formActionMap.set(key, actions);
      }

      /** 弹窗开启 */
      async function open(data) {
        // 重置表单
        await eaForm((form) => form.resetFields());
        model.value = cloneDeep(data?.record);
        requestData(model.value);
      }

      /** 弹窗关闭 */
      function close() {
        closeModal();
      }

      /** 提交表单 */
      async function onSubmit() {
        try {
          let { desformCode, authComKey } = model.value!;
          let values: Recordable[] = [];
          for (let auth of authTypes.value) {
            let value = Object.assign(
              {
                desformCode,
                authComKey,
                authType: auth.key,
              },
              await formActionMap.get(auth.key)?.validate()
            );
            values.push(value);
          }
          setLoading(true);
          await settingAuthApi.updateBatch(values);
          close();
          emit('ok');
        } finally {
          setLoading(false);
        }
      }

      /** 设置加载状态*/
      function setLoading(flag) {
        loading.value = flag;
        setModalProps({ confirmLoading: flag });
      }

      /**
       * 执行所有form的操作
       * execute all form
       * @param fn
       */
      async function eaForm(fn: (form: FormActionType) => any) {
        let res: Recordable = {};
        for (let [key, form] of formActionMap.entries()) {
          res[key] = await fn(form);
        }
        return res;
      }

      return {
        authTypes,
        tabActiveKey,
        getProps,
        loading,
      };
    },
  });
</script>

<style scoped lang="less"></style>
