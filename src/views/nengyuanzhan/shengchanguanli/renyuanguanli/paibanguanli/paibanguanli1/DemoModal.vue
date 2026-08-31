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
  import { buildDutyEmployeePayload, saveOrUpdateDemo } from './demo.api';
  import {
    getDemoById as getGroupById,
    getTreeListBanzu,
  } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
  import { getShiftListByOrgCode } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.data';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

  const props = defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  function normalizeGroupId(value: unknown) {
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }

  function formatGroupDescribe(groupRecord: Record<string, any> = {}) {
    const headerLines = [
      groupRecord.groupName ? `班组名称：${groupRecord.groupName}` : '',
      groupRecord.groupCode ? `班组编码：${groupRecord.groupCode}` : '',
      groupRecord.leaderName ? `班组负责人：${groupRecord.leaderName}` : groupRecord.leader ? `班组负责人：${groupRecord.leader}` : '',
      groupRecord.sysOrgName ? `所属部门：${groupRecord.sysOrgName}` : groupRecord.sysOrgCode ? `所属部门：${groupRecord.sysOrgCode}` : '',
      groupRecord.cycleDays ? `倒班周期：${groupRecord.cycleDays}天` : '',
    ].filter(Boolean);

    const itemLines = Array.isArray(groupRecord.itemList)
      ? groupRecord.itemList
          .map((item) => {
            const index = item.itemIndex ?? item.index;
            const name = item.itemName || item.planItemName || item.label || item.planName || item.itemCode;
            if (index == null && !name) {
              return '';
            }
            return `第${index}天：${name || '--'}`;
          })
          .filter(Boolean)
      : [];

    if (!itemLines.length && groupRecord.itemCodes) {
      const fallbackItems = String(groupRecord.itemCodes)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      fallbackItems.forEach((item, index) => {
        itemLines.push(`第${index + 1}天：${item}`);
      });
    }

    return [...headerLines, ...itemLines].join('\n') || '暂无班组信息';
  }

  async function enrichGroupItemNames(groupRecord: Record<string, any> = {}) {
    if (!Array.isArray(groupRecord.itemList) || !groupRecord.itemList.length || !groupRecord.sysOrgCode) {
      return groupRecord;
    }

    const shiftList = await getShiftListByOrgCode(groupRecord.sysOrgCode);
    const shiftNameMap = new Map(
      (Array.isArray(shiftList) ? shiftList : []).map((item) => [String(item.id), item.label || item.planName || item.itemName || item.itemCode])
    );

    return {
      ...groupRecord,
      itemList: groupRecord.itemList.map((item) => ({
        ...item,
        itemName: item.itemName || item.planItemName || shiftNameMap.get(String(item.itemId)) || item.itemCode || '--',
      })),
    };
  }

  async function loadGroupDescribe(planGroupId?: unknown) {
    const groupId = normalizeGroupId(planGroupId);
    if (!groupId) {
      await setFieldsValue({ describe: '' });
      return;
    }

    const groupRecord = await getGroupById({ id: groupId as string | number });
    const normalizedGroupRecord = await enrichGroupItemNames(groupRecord);
    await setFieldsValue({
      describe: formatGroupDescribe(normalizedGroupRecord),
    });
  }

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    const treeData = await getTreeListBanzu();
    const treeData2 = await getTreeListRenyuan();
    updateSchema([
      {
        field: 'planGroupId',
        componentProps: {
          treeData,
          async onChange(value) {
            await loadGroupDescribe(value);
          },
        },
      },
      {
        field: 'employeeId',
        componentProps: {
          treeData: treeData2,
        },
      },
    ]);
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate) && data.record) {
      await setFieldsValue({
        ...data.record,
      });
      await loadGroupDescribe(data.record.planGroupId);
    }
  });
  const title = computed(() => '设置排班');

  async function handleSubmit() {
    try {
      const values = await validate();
      const payload = buildDutyEmployeePayload(values);
      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(payload);
      closeModal();
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style scoped lang="less">
  :deep(.ant-form-item-label > label) {
    color: #1f2329;
    font-weight: 700;
  }

  :deep(.ant-form-item:has(.group-info)) {
    align-items: flex-start;
  }

  :deep(.ant-form-item:has(.group-info) .ant-form-item-control) {
    width: 100%;
  }

  :deep(.ant-form-item:has(.group-info) .ant-form-item-control-input) {
    min-height: auto;
  }

  :deep(.group-info) {
    width: 100%;
    padding-top: 6px;
  }

  :deep(.group-info__divider) {
    height: 1px;
    width: 100%;
    margin-bottom: 12px;
    background: #e5e6eb;
  }

  :deep(.group-info__content) {
    display: block;
    width: 100%;
    color: #4e5969;
    font-size: 13px;
    line-height: 1.8;
    white-space: pre-line;
  }
</style>
