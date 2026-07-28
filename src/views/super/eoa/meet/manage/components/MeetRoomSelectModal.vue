<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="会议室选择" @ok="handleSubmit" width="1200px">
    <BasicTable @register="registerTable" :rowSelection="rowSelection"></BasicTable>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, unref, watch, toRaw } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getList } from '/@/views/super/eoa/meet/meetingRoom/room.api';
  import { columns, searchFormSchema } from '/@/views/super/eoa/meet/meetingRoom/room.data';
  import { useListPage } from '/@/hooks/system/useListPage';

  // Emits声明
  const emit = defineEmits(['register', 'initComp', 'ok']);
  // props声明
  const props = defineProps({
    multi: {
      type: Boolean,
      default: true,
      required: false,
    },
    roomIds: {
      type: String,
      default: '',
    },
  });
  // 列表页面公共参数、方法
  const { prefixCls, tableContext } = useListPage({
    designScope: 'meet-room-select',
    tableProps: {
      api: getList,
      columns: columns,
      canResize: false,
      showTableSetting: false,
      showActionColumn: false,
      rowSelection: {
        type: 'radio',
      },
      formConfig: {
        schemas: searchFormSchema,
      },
    },
  });
  const [registerTable, { reload }, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    initUserNames();
  });
  watch(
    () => props.roomIds,
    (val) => {
      initUserNames();
    }
  );

  /**
   * 初始化会议室名称
   */
  async function initUserNames() {
    if (props.roomIds) {
      // 这里最后加一个 , 的原因是因为无论如何都要使用 in 查询，防止后台进行了模糊匹配，导致查询结果不准确
      let values = props.roomIds.split(',') + ',';
      let result = await getList({
        id: values,
        pageNo: 1,
        pageSize: values.length,
      });
      if (result && result.records) {
        let selectedKeys = [];
        let realNames = [];
        result.records.forEach((room) => {
          realNames.push(room['name']);
          selectedKeys.push(room['id']);
        });
        selectedRowKeys.value = selectedKeys;
        emit('initComp', realNames.join(','));
      }
    } else {
      emit('initComp', '');
    }
  }

  /**
   * 确认提交
   */
  function handleSubmit() {
    let roomIds = toRaw(unref(selectedRowKeys)).join(',');
    emit('ok', toRaw(unref(selectedRows)), roomIds);
    closeModal();
  }
</script>
