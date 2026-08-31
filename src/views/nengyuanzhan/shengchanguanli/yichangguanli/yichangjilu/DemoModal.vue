<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled">
      <template #handleOpinion="{ model, field }">
        <div style="display: flex; align-items: flex-start;margin-top: 6px;">
          <!-- 输入框 -->
          <a-textarea
            v-model:value="model[field]"
            placeholder="请输入内容"
            allowClear
            :auto-size="{ minRows: 9, maxRows: 9 }"
            style="width: 360px; margin-right: 12px"
          />

          <!-- 不需要 Form 收集的字段 -->
          <a-form-item-rest>
            <div>
              <div>快捷输入：</div>
              <div class="textBox" @click="onClickKjsr(1)">告警准确,已安排相关人员处理</div>
              <div class="textBox" @click="onClickKjsr(2)">告警准确,已重复异常</div>
              <div class="textBox" @click="onClickKjsr(3)">告警准确,已处理完成</div>
              <div class="textBox" @click="onClickKjsr(4)">告警准确,正在处理</div>
            </div>
          </a-form-item-rest>
        </div>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
import {ref, computed, unref} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm,FormSchema, useForm} from '/@/components/Form/index';
import { getDemoById, sbHandle } from './demo.api';
// 声明Emits
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const id = ref(0)
//自定义接受参数
const props = defineProps({
  //是否禁用页面
  isDisabled: {
    type: Boolean,
    default: false,
  },
});
const formSchema:FormSchema[]  = [
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
    field: 'handleOpinion',
    label: '处理意见',
    component: 'InputTextArea',
    required: true,
    slot: 'handleOpinion',
    componentProps: {
      rows:3,
    },
  },

  {
    field: 'createWorkOrder',
    label: '创建事件工单',
    component: 'RadioGroup',
    required: true,
    componentProps: {
      options:[
        {label:'创建',value:true},
        {label:'无需创建',value:false},
      ]
    },
  },
];
//表单配置
const [registerForm, {resetFields, setFieldsValue, validate}] = useForm({
  labelWidth: 120,
  labelCol: {span: 24},
  wrapperCol: {span: 24},
  schemas: formSchema,
  showActionButtonGroup: false,
});
//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
  isUpdate.value = !!data?.isUpdate;
  if (data.createBy) {
    await setFieldsValue({createBy: data.createBy})
  }
  if (data.createTime) {
    await setFieldsValue({createTime: data.createTime})
  }
  if (unref(isUpdate)) {
    //获取详情
    data.record = await getDemoById({id: data.record.id});
    id.value = data.record.id;
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
  }
});
//设置标题
const title = computed(() => (!unref(isUpdate) ? '告警处置' : '告警处置'));

function onClickKjsr(index) {
        if (index === 1){
          setFieldsValue({
            handleOpinion: `告警准确,已安排相关人员处理`,
          });
        }else if (index === 2){
          setFieldsValue({
            handleOpinion: `告警准确,已重复异常`,
          });
        }else if (index === 3){
          setFieldsValue({
            handleOpinion: `告警准确,已处理完成`,
          });
        }else if(index === 4){
          setFieldsValue({
            handleOpinion: `告警准确,正在处理`,
          });
        }
}
//表单提交事件
async function handleSubmit() {
  try {
    let values = await validate();
    setModalProps({confirmLoading: true});
    //提交表单
    await sbHandle({
      ...values,
      id:id.value,
    });
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', values);
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>
<style lang="less" scoped>
.textBox{
  padding: 6px 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}
</style>