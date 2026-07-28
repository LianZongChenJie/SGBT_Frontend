<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { hasPermission } = usePermission();
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { saveOrUpdateDemo, getDemoById, saveAssignTask } from './demo.api';
  import {
    getTreeListBanzu
  } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
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
    //   field: 'baseTitle',
    //   component: 'Divider',
    //   label: '基础信息',
    //   componentProps: {
    //     orientation: 'left',
    //     plain: true,
    //   },
    // },
    {
      field: 'orderNo',
      label: '工单单号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'theme',
      label: '工单主题',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        style: { width: '100%' },
      },
    },
    {
      field: 'plan232Name',
      label: '工单类型',
      component: 'Input',
      required: true,
      defaultValue:'维修工单',
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'reporterName',
      label: '派工人员',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'repairTeamId',
      label: '维修班组',
      required: true,
      colProps: { span: 12 },
      component: 'TreeSelect',
      componentProps: {
        disabled: false,
        api:getTreeListBanzu(),
        // treeCheckable: true,
        // title: '下拉树',
        treeData: [], // 先给空
        fieldNames: {
          label: 'groupName',
          value: 'groupCode',
          children: 'children',
        },
      },
    },
    {
      field: 'handlerId',
      label: '维修人姓名',
      component: 'TreeSelect',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        api:getTreeListRenyuan,
        disabled: false,
        // treeCheckable: true,
        // title: '下拉树',
        treeData: [], // 先给空
        fieldNames: {
          label: 'label',
          value: 'id',
          children: 'children',
        },
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, appendSchemaByField, removeSchemaByFiled }] = useForm({
    labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    const treeDataRenyuan = await getTreeListRenyuan();
    const treeData = await getTreeListBanzu();
    updateSchema([
      {
        field: 'repairTeamId',
        componentProps: {
          treeData,
        },
      },
      {
        field: 'handlerId',
        componentProps: {
          treeData:treeDataRenyuan,
        },
      }
    ]);

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
      //表单赋值
      // if (data.record.inspectionYear) {
      //   data.record.inspectionYear = String(data.record.inspectionYear);
      // }
      await setFieldsValue({
        ...data.record,
      });
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '派工' : '派工'));

  //表单提交事件
  async function handleSubmit() {

    try {
      let values = await validate();
      setModalProps({confirmLoading: true});
      //提交表单
      await saveAssignTask(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({confirmLoading: false});
    }
  }
</script>
