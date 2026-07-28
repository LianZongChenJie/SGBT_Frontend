<template>
  <BasicModal v-bind="$attrs" @register="register" title="详情" defaultFullscreen :showCancelBtn="false" :showOkBtn="false">
    <div class="event-title">基本信息</div>
    <div class="event-box" style="position: relative">
      <span class="event-status" :style="{ color: statusColor[detailData.status] }">{{ detailData.status }}</span>
      <Info :detailData="detailData" />
    </div>
    <div class="event-title">物料清单</div>
    <div class="event-box" style="position: relative">
      <BasicTable @register="registerTable"> </BasicTable>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { approveApplyDetail } from './api';
  import { BasicTable } from '/@/components/Table';
  import { applyFormListDetail, statusColor } from './outapply.data';
  import { useListPage } from '/@/hooks/system/useListPage';
  import Info from './components/info.vue';
  const selectData = ref<Recordable[]>([]);
  const detailData = ref<Recordable>({});
  const [register, { closeModal, setModalProps }] = useModalInner(async (record) => {
    setModalProps({ loading: true });
    approveApplyDetail({ id: record.id }).then((res) => {
      detailData.value = res;
      selectData.value = res.itemList;
      setModalProps({ loading: false });
    });
  });
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      title: '',
      dataSource: selectData,
      columns: applyFormListDetail,
      size: 'small',
      actionColumn: {
        width: 120,
      },
      showActionColumn: false,
      showTableSetting: false,
      pagination: false,
      showIndexColumn: true,
    },
  });
  // BasicTable绑定注册
  const [registerTable] = tableContext;
</script>
<style lang="less" scoped>
  .event-box {
    padding: 0 30px;
  }

  .event-title {
    font-size: 16px;
    margin-bottom: 10px;
    margin-left: 10px;
  }

  .event-title::before {
    content: '';
    position: relative;
    top: 2px;
    bottom: 0;
    left: 0;
    width: 3px;
    background-color: #007bff;
    display: inline-block;
    height: 16px;
    margin-right: 5px;
  }

  .event-handle {
    float: right;
    margin-right: 96px;
    margin-top: -23px;

    button {
      margin-left: 10px;
    }
  }
  .event-status {
    font-size: 16px;
    font-weight: bold;
    position: absolute;
    top: -24px;
    right: 20px;
  }
  .event-handle:after {
    display: block;
    content: '';
    clear: both;
  }
</style>
