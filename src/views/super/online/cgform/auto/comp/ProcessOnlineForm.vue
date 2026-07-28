<template>
  <div class="cust-onl-form">
    <a-spin :spinning="spinLoading">
      <online-form
        ref="onlineFormCompRef"
        :id="formId"
        :disabled="disabled"
        :form-template="formTemplate"
        :isTree="isTreeForm"
        :pidField="pidFieldName"
        :taskId="taskId"
        @rendered="renderSuccess"
        @success="handleSuccess"
        @close="handleClose"
      >
        <template #bottom>
          <div style="width: 100%; text-align: center; margin-top: 5px" v-if="!disabled && !spinLoading">
            <a-button preIcon="ant-design:check" style="width: 126px" type="primary" @click="handleSubmit" :loading="buttonLoading"> 提 交 </a-button>
          </div>
        </template>
      </online-form>
    </a-spin>
  </div>
</template>

<script>
  /**
   * 工作流online表单调--中转的意义在于在此查询表单信息
   */
  import OnlineForm from './OnlineForm.vue';
  import { defineComponent, ref, watch, nextTick } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { getRefPromise } from '../../hooks/auto/useAutoForm';

  export default defineComponent({
    name: 'ProcessOnlineForm',
    inheritAttrs: false,
    components: {
      OnlineForm,
    },
    props: {
      dataId: {
        type: String,
        default: '',
      },
      tableName: {
        type: String,
        default: '',
      },
      taskId: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const onlineFormCompRef = ref();
      const formId = ref('');
      const formTemplate = ref(1);
      const isTreeForm = ref(false);
      const pidFieldName = ref('');
      const spinLoading = ref(false);

      //监听表名改变 重新加载表单
      watch(
        () => props.tableName,
        (val) => {
          if (!val) {
            return;
          }
          loadFormItems();
        },
        { immediate: true }
      );

      //加载表单
      async function loadFormItems() {
        spinLoading.value = true;
        const url = `/online/cgform/api/getFormItemBytbname/${props.tableName}`;
        const params = { taskId: props.taskId };
        try {
          let result = await defHttp.get({ url, params });
          console.log('动态表单查询结果是：', result);
          formId.value = result.head.id;
          formTemplate.value = Number(result.head.formTemplate || 1);
          isTreeForm.value = result.head.isTree === 'Y';
          pidFieldName.value = result.head.treeParentIdField || '';
          await nextTick(async () => {
            let myForm = await getRefPromise(onlineFormCompRef);
            myForm.createRootProperties(result);
          });
        } catch (e) {
          console.error('流程表单查询异常', e);
        }
      }

      //渲染完成 装载数据
      async function renderSuccess() {
        let myForm = await getRefPromise(onlineFormCompRef);
        spinLoading.value = false;
        myForm.show(true, {
          id: props.dataId,
        });
      }

      //表单提交
      const buttonLoading = ref(false);
      async function handleSubmit() {
        buttonLoading.value = true;
        onlineFormCompRef.value.handleSubmit();
      }
      function handleSuccess() {
        buttonLoading.value = false;
      }
      function handleClose() {
        buttonLoading.value = false;
      }

      return {
        onlineFormCompRef,
        formId,
        formTemplate,
        isTreeForm,
        pidFieldName,
        renderSuccess,
        handleSuccess,
        handleClose,
        handleSubmit,
        buttonLoading,
        spinLoading,
      };
    },
  });
</script>

<style scoped>
  .cust-onl-form .ant-input-disabled {
    background-color: #fff;
    color: #000;
  }
  .cust-onl-form .ant-select-disabled .ant-select-selection {
    background: #fff;
    color: #000;
  }
  .cust-onl-form .ant-input-number-disabled {
    background-color: #fff;
    color: #000;
  }
</style>
