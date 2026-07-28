<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <a-tabs v-model:activeKey="activeKey" class="ml3 mr3">
      <a-tab-pane key="1" tab="单日换班"></a-tab-pane>
      <a-tab-pane key="2" tab="双日换班"></a-tab-pane>
      <a-tab-pane key="3" tab="双人换班"></a-tab-pane>
      <a-tab-pane key="4" tab="替班"></a-tab-pane>
    </a-tabs>
    <BasicForm @register="registerForm" :disabled="isDisabled" style="height: 300px" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { buildScheduleExchangePayload, getTreeListTihuanbanci, saveReplace, saveMulti, saveSingle, saveDoublChange } from './demo.api';
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
  const activeKey = ref('1');
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
      field: 'employeeId',
      label: '换班人',
      component: 'TreeSelect',
      required: true,
      componentProps: {
        allowClear: true,
        treeData: [], // 先给空
        fieldNames: {
          label: 'label',
          value: 'id',
          children: 'children',
        },
        onChange: async (value) => {
          // console.log(value, 'aaaaaaaaaa');
          if (activeKey.value === '1') {
            const res = await getTreeListTihuanbanci({ employeeId: value });

            // 🔥 动态更新替换班次的 treeData
            updateSchema({
              field: 'itemId',
              componentProps: {
                treeData: res,
              },
            });
            // 清空旧值
            setFieldsValue({ itemId: undefined });
          }
        },
      },
    },
    {
      field: 'targetEmployeeId',
      label: '替班人',
      component: 'TreeSelect',
      required: true,
      ifShow: () => {
        return activeKey.value === '3' || activeKey.value === '4';
      },
      componentProps: {
        // multiple: true,      // 🔥 多选关键
        // api:getTreeListRenyuan,
        // disabled: true,
        // treeCheckable: true,
        // title: '下拉树',
        allowClear: true,
        treeData: [], // 先给空
        fieldNames: {
          label: 'label',
          value: 'id',
          children: 'children',
        },
      },
    },
    {
      field: 'planDate',
      label: '换班日期',
      component: 'DatePicker',
      required: true,
      componentProps: {
        showTime: false,
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD',
      },
    },
    {
      field: 'targetDate',
      label: '还班日期',
      component: 'DatePicker',
      required: true,
      ifShow: () => {
        return activeKey.value === '3';
      },
      componentProps: {
        showTime: false,
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD',
      },
    },
    {
      field: 'newPlanDate',
      label: '替换日期',
      component: 'DatePicker',
      required: true,
      ifShow: () => {
        return activeKey.value === '2';
      },
      componentProps: {
        showTime: false,
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD',
      },
    },
    {
      field: 'itemId',
      label: '替换班次',
      component: 'TreeSelect',
      required: true,
      ifShow: () => activeKey.value === '1',
      componentProps: {
        allowClear: true,
        treeDefaultExpandAll: true,
        fieldNames: {
          label: 'label',
          value: 'id',
          children: 'children',
        },
        style: { width: '100%' },
      },
    },
  ];
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
    const treeDataRenyuan = await getTreeListRenyuan();
    updateSchema([
      {
        field: 'employeeId',
        componentProps: {
          treeData: treeDataRenyuan,
        },
      },
      {
        field: 'targetEmployeeId',
        componentProps: {
          treeData: treeDataRenyuan,
        },
      },
    ]);
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    // if (data.createBy) {
    //   await setFieldsValue({ createBy: data.createBy });
    // }
    // if (data.createTime) {
    //   await setFieldsValue({ createTime: data.createTime });
    // }
    // if (unref(isUpdate)) {
    //   //获取详情
    //   data.record = await getDemoById({ id: data.record.id });
    //   //表单赋值
    //   await setFieldsValue({
    //     ...data.record,
    //   });
    // }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '换班信息' : '换班信息'));

  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      const payload = buildScheduleExchangePayload(activeKey.value, values);
      setModalProps({ confirmLoading: true });
      switch (activeKey.value) {
        case '1':
          await saveSingle(payload);
          break;
        case '2':
          await saveMulti(payload);
          break;
        case '3':
          await saveDoublChange(payload);
          break;
        case '4':
          await saveReplace(payload);
          break;
        default:
          break;
      }
      closeModal();
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
