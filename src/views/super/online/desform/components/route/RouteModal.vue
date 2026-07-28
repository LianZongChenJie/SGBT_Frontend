<template>
  <BasicModal v-bind="getProps">
    <a-spin wrapperClassName="p-2" :spinning="loading">
      <BasicForm @register="registerForm" />
    </a-spin>
  </BasicModal>
</template>

<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import { ref, defineComponent, computed, unref } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { formSchemas } from '/@/views/super/online/desform/components/route/route.data';
  import { formApi } from '/@/views/super/online/desform/components/route/route.api';

  export default defineComponent({
    name: 'RouteModal',
    components: {
      BasicForm,
      BasicModal,
    },
    props: {
      desformId: propTypes.string,
      desformCode: propTypes.string,
    },
    emits: ['register', 'success'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      // 当前是否正在加载中
      const loading = ref(false);
      // 表单model
      const model = ref<Recordable>();
      // 是否是更新模式
      const isUpdate = ref(false);
      // 弹窗标题
      const title = computed(() => (isUpdate.value ? '编辑' : '新增'));
      // 注册弹窗
      const [registerModal, { closeModal, setModalProps }] = useModalInner(open);
      // 注册表单
      const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
        schemas: formSchemas,
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
      function open(data) {
        isUpdate.value = !!unref(data?.isUpdate);
        if (!isUpdate.value) {
          add();
        } else {
          edit(data?.record);
        }
      }

      /** 弹窗关闭 */
      function close() {
        closeModal();
      }

      /** 新增 */
      function add() {
        edit({});
      }

      /** 编辑 */
      async function edit(record) {
        // 重置表单
        await resetFields();
        model.value = cloneDeep(record);
        await setFieldsValue({ ...model.value });
      }

      /** 提交表单 */
      async function onSubmit() {
        try {
          // 表单验证
          let values = await validate();
          let formData = Object.assign({}, model.value, values, {
            desformId: props.desformId,
            desformCode: props.desformCode,
          });
          setLoading(true);
          // 提交表单
          await formApi.saveOrUpdate(formData, isUpdate.value);
          close();
          emit('success');
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
