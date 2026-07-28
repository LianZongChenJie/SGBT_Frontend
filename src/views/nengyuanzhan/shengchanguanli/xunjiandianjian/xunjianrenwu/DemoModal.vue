<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" style="padding-right: 20px" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './demo.data';
  import { getDemoById, saveAdjust } from './demo.api';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
  import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';

  type TreeNode = Record<string, any>;

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const groupTreeData = ref<TreeNode[]>([]);
  const employeeTreeData = ref<TreeNode[]>([]);

  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, setProps }] = useForm({
    labelWidth: 150,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  function normalizeId(value: unknown) {
    if (value === '' || value == null) {
      return undefined;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? value : numericValue;
  }

  function findTreeNodeLabel(treeData: TreeNode[], targetValue: unknown, labelKeys: string[]) {
    if (targetValue === '' || targetValue == null) {
      return undefined;
    }

    const normalizedTargetValue = String(targetValue);
    const queue = Array.isArray(treeData) ? [...treeData] : [];

    while (queue.length > 0) {
      const currentNode = queue.shift();
      if (!currentNode) {
        continue;
      }

      if (String(currentNode.id) === normalizedTargetValue) {
        for (const labelKey of labelKeys) {
          const labelValue = currentNode[labelKey];
          if (labelValue != null && labelValue !== '') {
            return String(labelValue);
          }
        }
        return undefined;
      }

      if (Array.isArray(currentNode.children) && currentNode.children.length > 0) {
        queue.push(...currentNode.children);
      }
    }

    return undefined;
  }

  function buildAdjustPayload(values: Record<string, any>) {
    const payload = {
      ...values,
    };

    if (payload.adjustType === 2) {
      const nextTeamId = normalizeId(payload.teamId1 ?? payload.teamId);
      const nextChargerId = normalizeId(payload.chargerId1 ?? payload.chargerId);

      payload.teamId = nextTeamId;
      payload.chargerId = nextChargerId;
      payload.teamName = findTreeNodeLabel(groupTreeData.value, nextTeamId, ['groupName', 'label', 'title']);
      payload.chargerName = findTreeNodeLabel(employeeTreeData.value, nextChargerId, ['label', 'title', 'employeeName']);
    } else {
      payload.teamId = normalizeId(payload.teamId);
      payload.chargerId = normalizeId(payload.chargerId);
    }

    delete payload.teamId1;
    delete payload.chargerId1;

    return payload;
  }

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    const formDisabled = !!(data?.disabled ?? props.isDisabled);
    // const res = await getTreeList();
    employeeTreeData.value = await getTreeListRenyuan();
    groupTreeData.value = await getTreeListBanzu();
    updateSchema([
      {
        field: 'teamId',
        componentProps: {
          treeData: groupTreeData.value,
        },
      },
      {
        field: 'chargerId',
        componentProps: {
          treeData: employeeTreeData.value,
        },
      },
      {
        field: 'teamId1',
        componentProps: {
          treeData: groupTreeData.value,
        },
      },
      {
        field: 'chargerId1',
        componentProps: {
          treeData: employeeTreeData.value,
        },
      },
    ]);
    // const options = (res || []).map(item => ({
    //   label: item.groupName,
    //   value: item.groupCode,
    // }));
    // updateSchema({
    //   field: 'inspectionGroup',
    //   componentProps: {
    //     options,
    //   },
    // });
    setProps({ disabled: formDisabled });
    setModalProps({ confirmLoading: false, showOkBtn: !formDisabled });
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
  const title = computed(() => (!unref(isUpdate) ? '新增' : '调整任务'));

  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      const payload = buildAdjustPayload(values);
      //提交表单
      await saveAdjust(payload);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
