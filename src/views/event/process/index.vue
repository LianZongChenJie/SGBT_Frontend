<template>
  <div>
    <!--定义表格-->
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-space>
          <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> 新增 </a-button>
        </a-space>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"></TableAction>
      </template>
    </BasicTable>
    <addProcess @register="registerAddProcess" @save="save" />
  </div>
</template>

<script lang="ts" name="basic-table-demo" setup>
  import { ActionItem, BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getList, disableProcess, enableProcess, deletePosition } from './api';
  import { columns, searchFormSchema } from './data';
  import { useModal } from '/@/components/Modal';
  import addProcess from './addProcess.vue';
  import { message } from 'ant-design-vue';
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      title: '表单搜索',
      api: getList,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      actionColumn: {
        width: 160,
        fixed: 'right',
      },
    },
  });
  const [registerAddProcess, { openModal: openAddProcessModel }] = useModal();
  //BasicTable绑定注册
  const [registerTable, { reload, setLoading }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: record.isEnable ? '禁用' : '启用',
        popConfirm: {
          title: record.isEnable ? '确认禁用？' : '确认启用？',
          confirm: isEnableEdit.bind(null, record), // 确保传递正确的参数
        },
        onClick: () => {},
      },
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '确认删除？',
          confirm: handleDelete.bind(null, record), // 确保传递正确的参数
        },
        onClick: () => {},
      },
    ];
  }
  /**
   * 处理新增按钮点击事件
   *
   * @returns 无返回值
   */
  const handleAdd = () => {
    openAddProcessModel(true, { title: '新增流程' });
  };
  /**
   * 处理编辑流程的函数
   *
   * @param record 要编辑的流程记录
   */
  function handleEdit(record) {
    openAddProcessModel(true, { record, title: '编辑流程' });
  }
  /**
   * 根据记录的启用状态启用或禁用流程
   *
   * @param record 记录对象，包含isEnable字段，表示当前流程的启用状态
   */
  const isEnableEdit = (record) => {
    setLoading(true);
    if (record.isEnable) {
      disableProcess({ id: record.id })
        .then(() => {
          message.success('流程禁用成功');
          setLoading(false);
          reload();
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      enableProcess({ id: record.id })
        .then(() => {
          message.success('流程启用成功');
          setLoading(false);
          reload();
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };
  /**
   * 删除指定记录
   *
   * @param record 要删除的记录对象
   */
  const handleDelete = (record) => {
    setLoading(true);
    deletePosition({ id: record.id })
      .then(() => {
        message.success('流程删除成功');
        setLoading(false);
        reload();
      })
      .catch(() => {
        setLoading(false);
      });
  };
  const save = () => {
    reload();
  };
</script>
