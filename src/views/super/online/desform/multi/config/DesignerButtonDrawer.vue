<!-- 表单设计器调用自定义按钮抽屉 -->
<template>
  <ZdyanDrawer
    ref="innerDrawerRef"
    :code="desformCode"
    :designFormName="desformName"
    :allColumns="allColumns"
    mask
    :contentWrapperStyle="{ top: '0px' }"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
  import { ref, toRefs, provide, watch } from 'vue';
  import ZdyanDrawer from './ZdyanDrawer.vue';
  import { useColumns } from '../../auto/hooks/useColumns';
  import { useColumnConfig } from '../ts/useFilterField';

  const props = defineProps({
    desformCode: {
      type: String,
      required: true,
    },
    desformName: {
      type: String,
      required: true,
    },
    designForm: {
      type: Object,
      required: true,
    },
  });
  const emit = defineEmits(['command']);
  const { desformCode, desformName } = toRefs(props);
  const innerDrawerRef = ref();

  // 加载列配置
  const { allColumns, loadColumnsInfo } = useColumns(
    {
      desformCode,
      translData: ref({}),
      remoteOptionsMap: ref({}),
      desformName,
      notBaseList: 1,
    },
    {}
  );

  // 获取列配置
  const { columnList, initColumnList } = useColumnConfig();
  provide('globalColumnList', columnList);

  watch(
    () => props.designForm,
    (val) => {
      if (val) {
        // 初始化列配置
        initColumnList(val);
      }
    },
    { immediate: true }
  );

  const defaultButton = {
    showStatus: 'always',
    clickThen: 'execute',
    flowStatus: true,
    color: 'rgb(33, 150, 243)',
    // 在这里添加的按钮，默认都是全局按钮
    allView: true,
  };

  async function openDrawer(data) {
    await loadColumnsInfo(desformCode.value);
    innerDrawerRef.value.show(data);
    emit('command', { type: 'opened' });
  }

  function doAdd() {
    openDrawer({
      title: '添加按钮',
      button: { ...defaultButton },
      isUpdate: false,
    });
  }

  function doEdit(item) {
    openDrawer({
      title: '编辑按钮',
      button: { ...item },
      isUpdate: true,
    });
  }

  function onSuccess() {
    emit('command', { type: 'success' });
  }

  defineExpose({
    doAdd,
    doEdit,
  });
</script>

<style scoped lang="scss"></style>
