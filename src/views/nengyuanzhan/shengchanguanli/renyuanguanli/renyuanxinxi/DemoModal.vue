<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <a-transfer
      v-model:target-keys="targetKeys"
      :data-source="mockData"
      show-search
      :titles="['待选列表', '已选列表']"
      :filter-option="filterOption"
      :render="(item) => item.title"
      @change="handleChange"
      :list-style="{
        width: '40%',
        height: '600px',
      }"
    />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import type { TransferProps } from 'ant-design-vue/es/transfer';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getTreeListRenyuan, type TreeSelectDTO } from './demo.api';

  interface TransferOption {
    key: string;
    title: string;
    description: string;
  }

  const title = '人员调整';
  const emit = defineEmits(['register', 'success']);
  defineProps({
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const mockData = ref<TransferOption[]>([]);
  const targetKeys = ref<string[]>([]);

  function flattenTreeOptions(list: TreeSelectDTO[], prefix = ''): TransferOption[] {
    return list.flatMap((item) => {
      const label = item.label || item.title || '';
      const currentLabel = prefix ? `${prefix} / ${label}` : label;
      const currentItem: TransferOption = {
        key: String(item.id),
        title: currentLabel,
        description: currentLabel,
      };
      const children = item.children?.length ? flattenTreeOptions(item.children, currentLabel) : [];
      return [currentItem, ...children];
    });
  }

  const getMock = async () => {
    const list = await getTreeListRenyuan();
    mockData.value = flattenTreeOptions(list ?? []);
    targetKeys.value = [];
  };

  const filterOption: TransferProps['filterOption'] = (inputValue, option) => {
    return (option.description || '').includes(inputValue);
  };

  const handleChange: TransferProps['onChange'] = (keys) => {
    targetKeys.value = keys.map((key) => String(key));
  };

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async () => {
    await getMock();
  });

  //表单提交事件
  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      closeModal();
      emit('success', { selectedEmployeeIds: targetKeys.value });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
