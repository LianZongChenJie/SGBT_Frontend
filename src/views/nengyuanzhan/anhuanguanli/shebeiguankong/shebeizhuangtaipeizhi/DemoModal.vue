<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './demo.data';
  import { saveOrUpdateDemo, getDemoById ,getTreeListsbfl} from './demo.api';
  import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
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

  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    //labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    const treeData = await getTreeListBanzu();
    const treeData2 = await getTreeListRenyuan();
    const treeDataList = await getTreeListsbfl();
    updateSchema([
      {
        field: 'deviceTypeId',
        componentProps: {
          treeData:treeDataList,
        },
      },
      {
        field: 'planGroupId',
        componentProps: {
          treeData,
        },
      },
      {
        field: 'employeeId',
        componentProps: {
          treeData:treeData2,
        },
      },
    ]);
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    if (data.createBy) {
      await setFieldsValue({ createBy: data.createBy });
    }
    if (data.createTime) {
      await setFieldsValue({ createTime: data.createTime });
    }
    if (unref(isUpdate)) {
      //获取详情
      data.record = await getDemoById({ id: data.record.id });

      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateDemo(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
