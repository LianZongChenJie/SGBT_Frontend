<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled" class="mr3"/>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { hasPermission } = usePermission();
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { getDemoById, saveAssign } from './demo.api';
  import { getOptionLabel, normalizeIdList, normalizeNumberId, stringifyIdList } from './repairOrderFields';
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
      field: 'orderType',
      label: '工单类型',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'reporterName',
      label: '报修人',
      component: 'Input',
      required: true,
      colProps: {span: 12},
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'assignerId',
      label: '指派员工ID',
      component: 'Input',
      required: true,
      show:false,
      colProps: {span: 12},
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'assignerName',
      label: '派工人员名称',
      component: 'Input',
      show: false,
    },
    {
      field: 'groupName',
      label: '部门名称',
      component: 'Input',
      show: false,
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
          value: 'id',
          children: 'children',
        },
        onChange: (value, option) => {
          setFieldsValue({
            repairTeamName: getOptionLabel(option, 'groupName'),
            leaderId: normalizeNumberId(option?.leader),
            leaderName: option?.leaderName,
          });
        },
      },
    },
    {
      field: 'repairTeamName',
      label: '维修班组名称',
      component: 'Input',
      show: false,
    },
    {
      field: 'leaderId',
      label: '维修负责人',
      component: 'ApiSelect',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        api:getTreeListRenyuan,
        disabled: false,
        // treeCheckable: true,
        // title: '下拉树',
        treeData: [], // 先给空
        labelField: 'label', // 下拉显示文字
        valueField: 'id', // 实际提交值
        onChange: (value, option) => {
          setFieldsValue({
            leaderName: getOptionLabel(option),
          });
        },
      },
    },
    {
      field: 'leaderName',
      label: '维修负责人名称',
      component: 'Input',
      show: false,
    },
    {
      field: 'otherWorkerIds',
      label: '其他维修人',
      component: 'ApiSelect',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        mode: 'multiple',
        api:getTreeListRenyuan,
        disabled: false,
        // treeCheckable: true,
        // title: '下拉树',
        treeData: [], // 先给空
        labelField: 'label', // 下拉显示文字
        valueField: 'id', // 实际提交值
        onChange: (value, option) => {
          const names = Array.isArray(option) ? option.map((item) => getOptionLabel(item)).filter(Boolean) : [];
          setFieldsValue({
            otherWorkerNames: names.join(','),
          });
        },
      },
    },
    {
      field: 'otherWorkerNames',
      label: '其他维修人名称',
      component: 'Input',
      show: false,
    },
    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      required: false,
      colProps: { span: 24 },
      componentProps: {
        rows:3,
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields,clearValidate, setFieldsValue, validate, updateSchema, appendSchemaByField, removeSchemaByFiled }] = useForm({
    labelWidth: 150,
    labelCol: {span: 24},
    wrapperCol: {span: 24},
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
        field: 'assignerId',
        componentProps: {
          treeData:treeDataRenyuan,
        },
      },
      {
        field: 'leaderId',
        componentProps: {
          treeData:treeDataRenyuan,
        },
      },
      {
        field: 'otherWorkerIds',
        componentProps: {
          treeData:treeDataRenyuan,
        },
      },
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
        assignerId: data.record.assignerId ? Number(data.record.assignerId) : undefined,
        assignerName: data.record.assignerName,
        groupName: data.record.groupName || data.record.useDept,
        leaderId: normalizeNumberId(data.record.leaderId),
        repairTeamName: data.record.repairTeamName,
        leaderName: data.record.leaderName,
        otherWorkerNames: data.record.otherWorkerNames,
        otherWorkerIds: normalizeIdList(data.record.otherWorkerIds)

      });
      await clearValidate()
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '派工' : '派工'));

  //表单提交事件
  async function handleSubmit() {

    try {
      let values = await validate();
      setModalProps({confirmLoading: true});
      const params = {
        id: values.id,
        repairTeamId: values.repairTeamId,
        repairTeamName: values.repairTeamName,
        leaderId: values.leaderId,
        leaderName: values.leaderName,
        otherWorkerIds: stringifyIdList(values.otherWorkerIds),
        otherWorkerNames: values.otherWorkerNames,
        remark: values.remark,
      };
      //提交表单
      await saveAssign(params);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', params);
    } finally {
      setModalProps({confirmLoading: false});
    }
  }
</script>
