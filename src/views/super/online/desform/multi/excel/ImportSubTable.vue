<template>
  <div>
    <!-- 第1步、数据导入 - 上传Excel -->
    <!--    <ImportModal @register="registerImportModal" @success="uploadExcelSuccess" @next="goSecond" />-->

    <!-- 第2步、导入数据 - 选择内容 -->
    <ImportContentModal @register="registerContentModal" @next="showFieldInfo" />

    <!-- 第3步、 数据导入 - 建立映射 -->
    <ImportFieldSetModal @register="registerFieldModal" @back="backSecond" @next="onMapping" />
  </div>
</template>
<script setup lang="ts">
  import type { sheetInfo } from './useExcelAction';
  import { getCurrentInstance, ref } from 'vue';
  import { useModal, useModalInner } from '@/components/Modal';
  // import ImportModal from './ImportModal.vue';
  import ImportContentModal from './ImportContentModal.vue';
  import ImportFieldSetModal from './ImportFieldSetModal.vue';

  const instance = getCurrentInstance();
  const emit = defineEmits(['register']);

  const fileKey = ref<string>();
  const fileName = ref<string>();
  const desformName = ref<string>();
  const subField = ref<Recordable>({});
  const selectedSheetName = ref('');
  const subTableModel = ref('');
  const viewFieldOptions = ref<any[]>([]);
  const sheetList = ref<sheetInfo[]>([]);

  const [register] = useModalInner((data) => {
    fileKey.value = data.fileKey;
    fileName.value = data.fileName;
    subField.value = data.field;
    sheetList.value = data.sheetList;
    desformName.value = data.desformName;
    viewFieldOptions.value = data.viewFieldOptions;
    subTableModel.value = data.field.model;

    showSheetInfo();
  });

  if (instance) {
    register(
      {
        setModalProps: () => void 0,
      },
      // @ts-ignore
      instance.uid
    );
  }

  const [registerContentModal, { openModal: openContentModal, closeModal: closeContentModal }] = useModal();

  const [registerFieldModal, { openModal: openFieldModal, closeModal: closeFieldModal }] = useModal();

  function showSheetInfo() {
    openContentModal(true, {
      fileKey: fileKey.value,
      sheetList: sheetList.value,
      fileName: fileName.value,
    });
  }

  function showFieldInfo(titleList, sheetName) {
    closeContentModal();
    selectedSheetName.value = sheetName;
    openFieldModal(true, {
      titleList,
      desformName: desformName.value,
      viewFieldOptions: viewFieldOptions.value,
      sheetList: sheetList.value,
      isSubTable: true,
      subTableModel: subTableModel.value,
    });
  }

  function backSecond() {
    closeFieldModal();
    showSheetInfo();
  }

  function onMapping(cfg) {
    closeFieldModal();
    subField.value.isImport = 'Y';
    subField.value.mapping = {
      fileKey: fileKey.value,
      sheetName: selectedSheetName.value,
      ...cfg,
    };
  }
</script>

<style scoped lang="less"></style>
