<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="引用巡检内容"
    width="700px"
    @ok="handleSubmit"
  >
    <BasicForm
      ref="formElRef"
      :schemas="templateFormSchema"
      :labelWidth="120"
      :actionColOptions="{ span: 24 }"
      :showActionButtonGroup="false"
    />
    <a-divider>模板预览</a-divider>
    <a-table
      :columns="templatePreviewColumns"
      :data-source="templatePreviewList"
      :pagination="false"
      size="small"
    />
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormActionType } from '/@/components/Form';
  import { message } from 'ant-design-vue';
  import { templateFormSchema, templatePreviewColumns } from './inspectionPlan.data';
  import { savePlanTemplate } from './inspectionPlan.api';

  export default defineComponent({
    name: 'PlanTemplateModal',
    components: { BasicModal, BasicForm },
    emits: ['success', 'register'],
    setup(props, { emit }) {
      const formElRef = ref<FormActionType | null>(null);

      const templatePreviewList = ref([
        { itemName: '外观检查', content: '锁体外观是否完好', resultType: '选项' },
        { itemName: '运行状态', content: '门禁通讯是否正常', resultType: '选项' },
      ]);

      const [registerModal, { closeModal }] = useModalInner(() => {
        if (formElRef.value) {
          formElRef.value.resetFields();
        }
      });

      async function handleSubmit() {
        try {
          const values = await formElRef.value?.validate();
          if (!values) return;
          await savePlanTemplate(values);
          message.success('引用成功');
          emit('success');
          closeModal();
        } catch (error) {
          console.error('验证失败', error);
        }
      }

      return {
        registerModal,
        formElRef,
        templateFormSchema,
        templatePreviewColumns,
        templatePreviewList,
        handleSubmit,
      };
    },
  });
</script>