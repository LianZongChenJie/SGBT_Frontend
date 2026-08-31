<template>
  <BasicForm ref="formRef" @register="registerForm" />
</template>

<script lang="ts">
  import { defineComponent, onMounted, watchEffect } from 'vue';
  import { BasicForm } from '/@/components/Form';
  import { propTypes } from '/@/utils/propTypes';
  import { defHttp } from '/@/utils/http/axios';
  import { changeDataTool as data } from './tool.data';
  import { useIndexTools } from './useIndexTools';

  export default defineComponent({
    name: 'ChangeDataTool',
    components: {
      BasicForm,
    },
    props: {
      timeout: propTypes.number,
      desformCode: propTypes.string,
      widgetInfo: propTypes.array,
    },
    emits: ['update:loading'],
    setup(props, setupContext) {
      // 注册表单
      const { useFormRes, formRef, formModel, execute, packageWidgetOptions } = useIndexTools(
        props,
        setupContext,
        {
          schemas: data.formSchemas,
        },
        doAction
      );
      const [registerForm, { updateSchema, setFieldsValue, clearValidate, resetFields }] = useFormRes;

      onMounted(() => {
        watchEffect(async () => {
          const { widgetType } = formModel.value ?? {};
          let options = [];
          if (widgetType) {
            options = data.actions[widgetType];
          }
          await updateSchema({ field: 'action', componentProps: { options } });
          await setFieldsValue({ action: undefined, model: undefined });
          await clearValidate();
        });

        watchEffect(async () => {
          const { widgetType, action } = formModel.value ?? {};
          let tip = '';
          if (widgetType && action) {
            tip = (data.tips[widgetType] || {})[action];
          }
          await updateSchema({ field: 'action', helpMessage: tip });
        });

        watchEffect(async () => {
          let options: any[] = [];
          if (props.widgetInfo?.length > 0 && formModel.value?.widgetType) {
            options = packageWidgetOptions(props.widgetInfo, formModel.value.widgetType);
          }
          await updateSchema({ field: 'model', componentProps: { options } });
        });
      });

      function doAction(params) {
        return defHttp.put(
          {
            url: '/desform/tools/index/formatData',
            params: {
              ...params,
              desformCode: props.desformCode,
            },
            timeout: props.timeout,
          },
          { isTransformResponse: false }
        );
      }

      return {
        formRef,
        execute,
        resetFields,
        registerForm,
      };
    },
  });
</script>

<style scoped lang="less"></style>
