<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled" class="mr3" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { hasPermission } = usePermission();
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { getDemoById, saveOrUpdateDemoTiaozheng } from './demo.api';
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
      field: 'planCode',
      label: '计划编号',
      component: 'Input',
      required: true,
      // colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'planName',
      label: '计划名称',
      component: 'Input',
      required: true,
      // colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'startTime',
      label: '计划开始时间',
      component: 'DatePicker',
      required: true,
      // colProps: { span: 12 },
      componentProps: {
        disabled: true,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'endTime',
      label: '计划结束时间',
      component: 'DatePicker',
      required: true,
      // colProps: { span: 12 },
      componentProps: {
        disabled: true,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'teamId',
      label: '巡检班组',
      required: true,
      // colProps: {span: 12},
      component: 'TreeSelect',
      componentProps: {
        disabled: true,
        // treeCheckable: true,
        // title: '下拉树',
        treeData: [], // 先给空
        fieldNames: {
          label: 'groupName',
          value: 'id',
          children: 'children',
        },
      },
    },
    {
      field: 'teamName',
      label: '点检班组名称',
      component: 'Input',
      show: false,
    },
    {
      field: 'chargerId',
      label: '巡检负责人',
      component: 'TreeSelect',
      required: true,
      colProps: { span: 24 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
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
    {
      field: 'chargerName',
      label: '点检人',
      component: 'Input',
      required: true,
      // colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'adjustType',
      label: '调整类型',
      component: 'Select',
      required: true,
      defaultValue: 1,
      // colProps: { span: 12 },
      componentProps: {
        options: [
          { label: '无', value: 0 },
          { label: '调整计划时间', value: 1 },
          { label: '修改点检执行人', value: 2 },
        ],
      },
    },
    {
      field: 'adjustEndDate',
      label: '调整结束时间',
      component: 'DatePicker',
      required: ({ values }) => values.adjustType === 1,
      // colProps: { span: 12 },
      ifShow: ({ values }) => values.adjustType === 1,
      componentProps: {
        showTime: false,
        valueFormat: 'YYYY-MM-DD',
      },
    },

    {
      field: 'adjustment',
      label: '调整原因',
      component: 'InputTextArea',
      required: true,
      colProps: { span: 24 },
      componentProps: {
        rows: 3,
        style: { width: '100%' },
        disabled: false,
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, appendSchemaByField, removeSchemaByFiled, clearValidate }] = useForm({
    labelWidth: 150,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
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
        field: 'teamId',
        componentProps: {
          treeData,
        },
      },
      {
        field: 'chargerId',
        componentProps: {
          treeData: treeDataRenyuan,
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
      // if (data.record.inspectionYear) {
      //   data.record.inspectionYear = String(data.record.inspectionYear);
      // }
      await setFieldsValue({
        ...data.record,
      });
    }
    await clearValidate();
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '调整计划' : '调整计划'));

  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      const params = {
        adjustEndDate: values.adjustEndDate,
        adjustType: values.adjustType,
        adjustment: values.adjustment,
        chargerId: values.chargerId,
        chargerName: values.chargerName,
        teamId: values.teamId,
        teamName: values.teamName,
        id: values.id,
      };
      await saveOrUpdateDemoTiaozheng(params, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
