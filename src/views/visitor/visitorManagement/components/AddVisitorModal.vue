<template>
  <a-modal
    v-model:open="open"
    :title="modalTitle"
    @ok="handleOk"
    width="900px"
    :footer="null"
  >
    <div
      class="form-box"
      v-if="open"
    >
      <BasicForm
        @register="registerForm"
        :schemas="formSchemas"
        :model="formState"
        :labelWidth="100"
        :showActionButtonGroup="false"
      />
      <div class="button-box">
        <a-button @click="handleReset">取消</a-button>
        &emsp;
        &emsp;
        <a-button
          type="primary"
          @click="handleSubmit"
        >保存</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { useForm, BasicForm, FormSchema } from '/@/components/Form';
import { addVisitorApi } from '../Visitor.api';

const props = defineProps({
  reload: {
    type: Function,
    default: () => {},
  },
});

const open = ref<boolean>(false);

// 弹框标题
const modalTitle = ref<string>('新增访客');

// 被访人下拉选项
const ownerOptions = [
  { label: '陈文', value: '15801339446' },
  { label: '姚嘉', value: '13522063683' },
];

// 通行方式下拉选项
const accessTypeOptions = [
  { label: '单次通行', value: '1' },
  { label: '多次通行', value: '2' },
];

// 自定义表单字段
const formSchemas: FormSchema[] = [
  {
    field: 'name',
    component: 'Input',
    label: '访客姓名',
    required: true,
    colProps: {
      span: 12,
    },
  },
  {
    field: 'idNumber',
    component: 'Input',
    label: '身份证号',
    required: true,
    colProps: {
      span: 12,
    },
  },
  {
    field: 'mobile',
    component: 'Input',
    label: '手机号',
    required: true,
    colProps: {
      span: 12,
    },
  },
  {
    field: 'company',
    component: 'Input',
    label: '来访公司',
    required: true,
    colProps: {
      span: 12,
    },
  },
  {
    field: 'memo',
    component: 'InputTextArea',
    label: '来访事由',
    required: true,
    colProps: {
      span: 24,
    },
  },
  {
    field: 'ownerDeptID',
    component: 'Input',
    label: '被访单位',
    required: true,
    defaultValue: '首程物业',
    colProps: {
      span: 12,
    },
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'ownerMobile',
    component: 'Select',
    label: '被访人',
    required: true,
    colProps: {
      span: 12,
    },
    componentProps: {
      options: ownerOptions,
      placeholder: '请选择被访人',
    },
  },
  {
    field: 'startTime',
    component: 'DatePicker',
    label: '开始时间',
    required: true,
    colProps: {
      span: 12,
    },
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
    },
  },
  {
    field: 'endTime',
    component: 'DatePicker',
    label: '结束时间',
    required: true,
    colProps: {
      span: 12,
    },
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      showTime: true,
    },
  },
  {
    field: 'accessType',
    component: 'Select',
    label: '通行方式',
    required: true,
    colProps: {
      span: 12,
    },
    componentProps: {
      options: accessTypeOptions,
      placeholder: '请选择通行方式',
    },
  },
];

/**
 * BasicForm绑定注册;
 */
const [registerForm, { validate, resetFields, setFieldsValue }] = useForm();

const formState = ref<Record<string, any>>({
  name: '',
  idNumber: '',
  mobile: '',
  company: '',
  memo: '',
  ownerDeptID: '首程物业',
  ownerMobile: undefined,
  startTime: '',
  endTime: '',
  accessType: undefined,
});

// 打开弹框
const showModal = async () => {
  open.value = true;
  await nextTick();
  resetFields();
  modalTitle.value = '新增访客';
  setFieldsValue({
    ownerDeptID: '首程物业',
  });
};

// 提交表单
const handleSubmit = async () => {
  try {
    const values = await validate();
    let params = {
      ...values,
      ownerDeptID: '10405',
    };
    let res = await addVisitorApi(params);
    if (res) {
      message.success('新增成功！');
      resetFields();
      open.value = false;
      props.reload();
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 重置表单
const handleReset = () => {
  resetFields();
  open.value = false;
};

// 关闭弹框
const handleOk = () => {
  open.value = false;
};

defineExpose({
  showModal,
});
</script>

<style lang="less" scoped>
.form-box {
  padding: 16px;
  padding-left: 0;

  .button-box {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
}
</style>
