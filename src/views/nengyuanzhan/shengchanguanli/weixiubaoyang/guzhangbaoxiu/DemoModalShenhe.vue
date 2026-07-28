<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { hasPermission } = usePermission();
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import {
    saveAuditPass,
    saveAuditReject,
  } from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/guzhangbaoxiu/demo.api';
  // import { saveShenhe } from './demo.api';

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
const num = ref(1)
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const formSchema: FormSchema[] = [
    {
      field: 'id',
      label: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'createBy',
      label: 'createBy',
      component: 'Input',
      show: false,
    },
    {
      field: 'createTime',
      label: 'createTime',
      component: 'Input',
      show: false,
    },

    // {
    //   field: 'auditResult',
    //   label: '审核结果',
    //   component: 'Select',
    //   required: true,
    //   // colProps: { span: 12 },
    //   // ifShow:false,
    //   show: false,
    //   componentProps: {
    //     options:[
    //       {label:'通过',value:1},
    //       {label:'驳回',value:2},
    //     ]
    //   },
    // },
    {
      field: 'remark',
      label: '审批意见',
      component: 'InputTextArea',
      required: true,
      // colProps: { span: 24 },
      componentProps: {
        rows: 3,
        style: { width: '100%' },
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields,clearValidate, setFieldsValue, validate }] = useForm({
    labelWidth: 120,
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    // await resetFields();
    setModalProps({confirmLoading: false,});
    isUpdate.value = !!data?.isUpdate;
    // if (data.createBy) {
    //   await setFieldsValue({createBy: data.createBy})
    // }
    // if (data.createTime) {
    //   await setFieldsValue({createTime: data.createTime})
    // }
    if (unref(isUpdate)) {
      // 获取详情
      // data.record = await getDemoById({id: data.record.id});
      // 表单赋值
      // if (data.record.inspectionYear) {
      //   data.record.inspectionYear = String(data.record.inspectionYear);
      // }
      // data.record.remark = ''
      // data.record.auditResult = data.num
      num.value = data.num
      const obj = {
        remark:'',
        id:data.record.id,
        handlerId:null,
        handlerName:null
      }
       setFieldsValue({
          // ...data.record,
        ...obj,
      });
      clearValidate()

    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '审核' : '审核'));

  //表单提交事件
  async function handleSubmit(v) {

    try {
      let values = await validate();
      setModalProps({confirmLoading: true});
      //提交表单
      const params ={
        id:Number(values.id),
        remark:values.remark,
      }
      if(num.value ===1){
        await saveAuditPass(params, isUpdate.value);
      }else{
        await saveAuditReject(params, isUpdate.value);
      }

      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({confirmLoading: false});
    }
  }
</script>
