<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" />
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { patchFormSchema } from '../OaSign.data';
  import dayjs from 'dayjs';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { queryPatchById } from '/@/views/super/eoa/sign/OaSign.api';
  import { getSignStatus, getSignType } from '/@/views/super/eoa/sign/utils/util';
  import { SignTypeEnum } from '/@/views/super/eoa/sign/utils/constant';

  //今天
  const today = dayjs(dayjs().format('YYYY-MM-DD'));
  //昨天
  const loading = ref<boolean>(false);
  const { createMessage } = useMessage();
  //自定义接受参数
  const props = defineProps({
    //流程表单data
    formData: {
      type: Object,
      default: () => {},
      required: false,
    },
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  });
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  //表单配置
  const [registerForm, { resetFields, setFieldsValue }] = useForm({
    labelWidth: 150,
    schemas: patchFormSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
    disabled: props.disabled,
  });

  /**
   * 初始化表单数据
   */
  function initFlowData() {
    resetFields();
    queryPatchById({ id: props.formData.dataId }).then((res) => {
      if (res.success) {
        let obj = res.result;
        obj.signType = getSignType(obj.patchType);
        obj.abnormalStatus = getSignStatus(obj.patchStatus);
        //表单赋值
        setFieldsValue({
          ...obj,
        });
      }
    });
  }
  //初始化数据
  // update-begin--author:liaozhiyang---date:20231207---for：【QQYUN-7334】解决前端报错
  onMounted(() => {
    initFlowData();
  });
  // update-end--author:liaozhiyang---date:20231207---for：【QQYUN-7334】解决前端报错
</script>

<style lang="less" scoped>
  .hide-tabs-bar {
    & > :deep(.ant-tabs-nav) {
      display: none;
    }
  }

  .bottom-btn {
    width: 100%;
    background: #fff;
    text-align: right;
    padding-top: 10px;

    &.border {
      border-top: 1px solid #e9e9e9;
    }
  }
</style>
