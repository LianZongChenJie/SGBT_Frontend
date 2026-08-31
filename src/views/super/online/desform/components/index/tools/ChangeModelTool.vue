<template>
  <BasicForm ref="formRef" @register="registerForm" />
</template>

<script lang="ts">
  import { defineComponent, onMounted, watchEffect } from 'vue';
  import { BasicForm } from '/@/components/Form';
  import { propTypes } from '/@/utils/propTypes';
  import { defHttp } from '/@/utils/http/axios';
  import { changeModelTool as data } from './tool.data';
  import { useIndexTools } from './useIndexTools';

  export default defineComponent({
    name: 'ChangeModelTool',
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
      const { useFormRes, formRef, execute, packageWidgetOptions } = useIndexTools(
        props,
        setupContext,
        {
          schemas: data.formSchemas,
        },
        doAction
      );
      const [registerForm, { updateSchema, resetFields }] = useFormRes;

      onMounted(() => {
        watchEffect(async () => {
          let options: any[] = [];
          if (props.widgetInfo?.length > 0) {
            options = packageWidgetOptions(props.widgetInfo);
          }
          await updateSchema({ field: 'newKey', componentProps: { options } });
        });
      });

      function doAction(params) {
        return defHttp.put(
          {
            url: '/desform/tools/index/changeModel',
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
