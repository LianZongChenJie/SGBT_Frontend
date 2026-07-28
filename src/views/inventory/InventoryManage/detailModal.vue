<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="详情" defaultFullscreen :showCancelBtn="false"
    :showOkBtn="false">
    <BasicTable @register="registerTable2">
    </BasicTable>
  </BasicModal>

</template>
<script lang="ts" setup>

import { useListPage } from "@/hooks/system/useListPage";
import { detailListApi } from "@/views/inventory/InventoryManage/api";
import BasicTable from "@/components/Table/src/BasicTable.vue";
import { detailColumns } from "./data";
import { BasicModal, useModalInner } from '/@/components/Modal';
import { ref, watch, toRaw } from 'vue';
const modalData = ref<Recordable>({});
const [registerModal, { setModalProps }] = useModalInner(async (data) => {
  // 修改4：确保数据完整性和响应式
  if (data?.record) {
    modalData.value = {
      ...data.record,
    }
  }
  setModalProps({ confirmLoading: false });
  setProps({ searchInfo: toRaw({ warehouseId: modalData.value.warehouseId, materialId: modalData.value.materialId }) });
});
const { tableContext } = useListPage({
  designScope: 'material-type-template',
  tableProps: {
    //title: '详情',
    api: detailListApi,
    columns: detailColumns,
    actionColumn: null,
    showIndexColumn: true,
  }
});
const [registerTable2, { reload, setProps }] = tableContext;

watch(() => modalData, () => {
  setProps({ searchInfo: toRaw({ warehouseId: modalData.value.warehouseId, materialId: modalData.value.materialId }) });
  reload();
}, { deep: true });
</script>
<style scoped>
.ant-input-number {
  width: 100%;
}
</style>
