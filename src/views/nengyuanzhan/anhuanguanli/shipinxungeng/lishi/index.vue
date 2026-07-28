<template>
  <div style="padding: 10px">
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>

    <DemoModal @register="registerModal" @success="reload" :isDisabled="isDisabled" />
  </div>
</template>
<script lang="ts" setup name="shipinxungenglishi">
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import { getDemoList } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';
  const [registerModal, { openModal }] = useModal();
  const isDisabled = ref(false);

  const [registerTable, { reload }] = useTable({
    title: '',
    api: getDemoList,
    columns,
    formConfig: {
      labelWidth: 120,
      schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      autoAdvancedCol: 2,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    //自定义默认排序
    // defSort: {
    //   column: 'createTime,sex',
    //   order: 'desc',
    // },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: true,
    rowKey: 'id',
    actionColumn: {
      width: 180,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      // {
      //   label: '编辑',
      //   onClick: handleEdit.bind(null, record),
      // },
      {
        label: '查看记录',
        onClick: handleDetail.bind(null, record),
      },
      // {
      //   label: '删除',
      //   popConfirm: {
      //     title: '是否确认删除',
      //     confirm: handleDelete.bind(null, record),
      //   },
      // },
    ];
  }

  /**
   * 详情页面
   */
  function handleDetail(record) {
    isDisabled.value = true;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }
</script>
<style lang="less" scoped>
  .jeecg-basic-table-form-container {
    padding: 0;

    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
</style>
