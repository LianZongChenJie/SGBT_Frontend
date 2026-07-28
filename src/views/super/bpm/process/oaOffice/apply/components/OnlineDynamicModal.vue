<template>
  <BasicModal :title="title" :width="modalWidth" v-bind="$attrs" @register="registerModal" wrapClassName="jeecg-online-modal" @ok="handleSubmit">
    <template #footer>
      <a-button
        v-for="btn in cgButtonList"
        :key="btn.id"
        type="primary"
        @click="handleCgButtonClick(btn.optType, btn.buttonCode)"
        :preIcon="btn.buttonIcon ? 'ant-design:' + btn.buttonIcon : ''"
      >
        {{ btn.buttonName }}
      </a-button>

      <a-button v-if="!disableSubmit" key="submit" type="primary" @click="handleSubmit" :loading="submitLoading">确定</a-button>
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>
    <online-form
      ref="onlineFormCompRef"
      :id="tableId"
      :disabled="disableSubmit"
      :form-template="formTemplate"
      :isTree="isTreeForm"
      :pidField="pidFieldName"
      :submitTip="false"
      @rendered="renderSuccess"
      @success="handleSuccess"
    >
    </online-form>
  </BasicModal>
</template>

<script lang="ts">
  import { defineComponent, ref, nextTick } from 'vue';
  import { BasicModal } from '/@/components/Modal';
  import OnlineForm from '/@/views/super/online/cgform/auto/comp/OnlineForm.vue';
  import { useAutoModal } from '/@/views/super/online/cgform/hooks/auto/useAutoModal';
  import { startProcess } from '/@/views/super/bpm/example/batch/leave.api';
  import { SUBMIT_FLOW_ID } from '/@/views/super/online/cgform/types/onlineRender';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getRefPromise } from '/@/views/super/online/cgform/hooks/auto/useAutoForm';

  export default defineComponent({
    name: 'OnlineDynamicModal',
    components: {
      BasicModal,
      OnlineForm,
    },
    emits: ['register'],
    setup() {
      console.log('工单申请-进入表单弹框》》》》modal');
      const flow_code_pre = 'onl_';
      const tableName = ref('');
      const tableId = ref('');

      const { createMessage } = useMessage();
      let {
        title,
        modalWidth,
        registerModal,
        closeModal,
        cgButtonList,
        handleCgButtonClick,
        disableSubmit,
        handleSubmit,
        submitLoading,
        handleCancel,
        modalObject,
        isUpdate,
        handleFormConfig,
        onlineFormCompRef,
        formTemplate,
        isTreeForm,
        pidFieldName,
        renderSuccess,
        formRendered,
      } = useAutoModal(true);

      /**
       * 打开弹窗触发
       * @param data
       */
      modalObject.handleOpenModal = async (data) => {
        const { id, name } = data;
        tableId.value = id;
        tableName.value = name;
        isUpdate.value = false;
        disableSubmit.value = false;
        formRendered.value = false;
        console.log('工单申请-重新渲染表单》》》》modal', data);
        await handleFormConfig(id);
        await nextTick(async () => {
          await getRefPromise(formRendered);
          await onlineFormCompRef.value.show(isUpdate);
        });
      };

      /**
       * 表单提交完成触发
       * @param formData
       */
      function handleSuccess(formData) {
        handleStartProcess(formData[SUBMIT_FLOW_ID]);
      }

      /**
       * 提交流程
       * @param id
       */
      async function handleStartProcess(id) {
        let param = {
          flowCode: flow_code_pre + tableName.value,
          id: id,
          formUrl: 'super/bpm/process/components/OnlineFormDetail',
          formUrlMobile: 'check/onlineForm/detail',
        };
        let res = await startProcess(param);
        if (res.success) {
          createMessage.success(res.message);
          closeModal();
        } else {
          createMessage.warning(res.message);
        }
      }

      const that = {
        title,
        onlineFormCompRef,
        renderSuccess,
        registerModal,
        handleSubmit,
        handleSuccess,
        handleCancel,
        modalWidth,
        formTemplate,
        disableSubmit,
        cgButtonList,
        handleCgButtonClick,
        isTreeForm,
        pidFieldName,
        submitLoading,
        tableId,
      };

      return that;
    },
  });
</script>

<style scoped></style>
