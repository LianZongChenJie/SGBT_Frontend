<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled" ></BasicForm>


<!--    <DemoModalShebei :isDisabled="isDisabled" @register="registerModalShebei" @success="reload"></DemoModalShebei>-->
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, computed, unref, reactive, toRaw } from 'vue';
import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
import { usePermission } from '/@/hooks/web/usePermission';


const { hasPermission } = usePermission();
import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
import {
  saveAccept,
} from './demo.api';

// 声明Emits
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);

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
  {
    field: 'acceptanceResult',
    label: '验收结果',
    component: 'RadioGroup',
    required: true,
    // colProps: {span: 12},
    componentProps: {
      options: [
        {label: '完成维修',value:1},
        {label: '未完成维修',value:2},
        {label: '重新维修',value:3},
      ]
    },
  },
  {
    field: 'acceptanceScore',
    label: '维修评分',
    component: 'Rate',
    required: true,
    // colProps: {span: 12},
    componentProps: {
    },
  },
  {
    field: 'acceptanceRemark',
    label: '维修评价',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      rows: 3,
      style: { width: '100%' },
    },
  },
{
    field: 'repairOrderNo',
    label: '工单单号',
    component: 'Input',
    required: true,
    show:false,
    componentProps: {
      rows: 3,
      style: { width: '100%' },
    },
  },


];
//表单配置
const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  labelWidth: 150,
  schemas: formSchema,
  showActionButtonGroup: false,
});


//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    const record = Array.isArray(data.record) ? data.record[0] : data.record || {};

    //获取详情
    // data.record = await getDemoById({id: data.record.id});
    //表单赋值
    await setFieldsValue({
      ...record,
      repairOrderNo: record.repairOrderNo || record.orderNo,
    });
  }
});


//设置标题
const title = computed(() => (!unref(isUpdate) ? '验收' : '验收'));



/**
 * 新增事件
 */
const isDisabled = ref(false);

//表单提交事件
async function handleSubmit() {
  try {
    let values = await validate();
    console.log(values,'aaaaaaaaaa');
    const obj = {
      acceptanceRemark:values.acceptanceRemark,
      acceptanceResult:values.acceptanceResult,
      acceptanceScore:values.acceptanceScore,
      repairOrderId:values.id,
      repairOrderNo:values.repairOrderNo
    }
    setModalProps({confirmLoading: true});
    //提交表单
    await saveAccept(obj);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', values);
  } finally {
    setModalProps({confirmLoading: false});
  }
}

</script>
