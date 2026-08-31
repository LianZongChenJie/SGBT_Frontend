<template>
  <div>
    <!--定义表格-->
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="addHandle">新增</a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
    <versionModal @register="registerModal" @success="handleSuccess" />
    <spaceModal @register="registerSpaceModal" />
    <userModal @register="registerUserModal" />
  </div>
</template>

<script lang="ts" name="basic-table-demo" setup>
  import { ActionItem, BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { list, deleteSingle } from './renter.api';
  import { columns, searchFormSchema } from './renter.data';
  import { useModal } from '/src/components/Modal';
  import versionModal from './components/renterModal.vue';
  import spaceModal from './components/spaceModal.vue';
  import userModal from './components/userModal.vue';
  const [registerModal, { openModal }] = useModal();
  const [registerSpaceModal, { openModal: openSpaceModal }] = useModal();
  const [registerUserModal, { openModal: openUserModal }] = useModal();
  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      title: '',
      api: list,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
      },
      showIndexColumn: true,
      actionColumn: {
        width: 250,
        title: '操作',
      },
    },
  });
  //BasicTable绑定注册
  const [registerTable, { reload }] = tableContext;
  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
      {
        label: '空间绑定',
        onClick: spaceBind.bind(null, record),
      },
      {
        label: '用户绑定',
        onClick: userBind.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '确定删除吗?',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  /**
   * 处理编辑操作
   *
   * @param record 需要编辑的记录对象
   */
  function handleEdit(record) {
    console.log(record);
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 新增编辑操作
   *
   * 打开一个模态框，并设置isUpdate为false。
   */
  function addHandle() {
    openModal(true, {
      isUpdate: false,
    });
  }
  /**
   * 删除操作的处理函数
   *
   * @returns 无返回值
   */
  async function handleDelete(record) {
    await deleteSingle({ id: record.id }, reload);
  }
  /**
   * 成功回调
   */
  async function handleSuccess() {
    reload();
  }
  /**
   * 空间绑定操作的处理函数
   *
   * @param record 需要绑定空间的记录对象
   */
  function spaceBind(record) {
    openSpaceModal(true, {
      record,
    });
  }
  function userBind(record) {
    openUserModal(true, {
      record,
    });
  }
</script>
