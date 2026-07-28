<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" wrapClassName="process-form-modal" @ok="handleSubmit" :width="800" >
    <BasicForm @register="registerForm">
      <template #titleExp="{ model, field }">
        <a-input v-model:value="model[field]" placeholder="请输入标题表达式"></a-input>
        <span style="color: red; font-size: 12px">参考：XXXX【${busname}】-XXXX【${name}】；其中${}表达式取流程变量的值</span>
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script>
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useProcessFormSchema } from './useProcessFormSchema';
  import { saveOrUpdate } from './process.form.api';

  export default {
    name: 'ProcessFormModal',
    components: {
      BasicModal,
      BasicForm,
    },
    emits: ['success', 'register'],
    setup(_props, { emit }) {
      const isUpdate = ref(false);
      const title = computed(() => {
        return isUpdate.value === true ? '编辑' : '新增';
      });

      const { processFormSchema, changeFormType } = useProcessFormSchema();
      //表单配置
      const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, getFieldsValue }] = useForm({
        schemas: processFormSchema,
        showActionButtonGroup: false,
        baseColProps: { span: 24, style: { marginTop: '10px' } },
      });

      //useModalInner
      const [registerModal, { closeModal }] = useModalInner((data) => {
        console.log('data', data);
        isUpdate.value = data.isUpdate;
        resetFields();
        if (!data.isUpdate) {
          //新增页面 设置表单的 processId,formDealStyle
          const { formDealStyle, processId } = data;
          setFieldsValue({ processId, formDealStyle });
        } else {
          delete data.isUpdate;
          let temp = {...data}
          changeFormType(data.formType);
          if(data.formType == '1'){
            temp['formTableName1'] = temp.formTableName;
          }else if(data.formType == '2'){
            temp['formTableName2'] = temp.formTableName;
          }else if(data.formType == '3'){
            temp['formTableName3'] = temp.formTableName;
          }
          delete temp.formTableName;
          setFieldsValue(temp);
        }
      });

      async function handleSubmit() {
        const values = await validate();
        Object.keys(values).map(k=>{
          if(k.indexOf('formTableName')>=0){
            values['formTableName'] = values[k];
            delete values[k]
          }
        });
        await saveOrUpdate(values, isUpdate.value);
        emit('success');
        closeModal();
      }

      return {
        registerModal,
        title,
        handleSubmit,
        registerForm,
      };
    },
  };
</script>
