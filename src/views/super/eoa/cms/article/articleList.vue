<template>
  <!--引用表格-->
  <BasicTable @register="registerTable" :rowSelection="rowSelection">
    <!--插槽:table标题-->
    <template #tableTitle>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleCreate"> 新增</a-button>
      <a-button @click="onCreateByAi" type="primary" preIcon="bxs:bot">AI生成</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> 导出</a-button>
      <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入</j-upload-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchHandleDelete">
              <Icon icon="ant-design:delete-outlined"></Icon>
              删除
            </a-menu-item>
          </a-menu>
        </template>
        <a-button
          >批量操作
          <Icon icon="mdi:chevron-down"></Icon>
        </a-button>
      </a-dropdown>
    </template>
    <!--操作栏-->
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
    </template>
  </BasicTable>
  <!--文章modal-->
  <ArticleModal @register="articleDrawer" @success="reload" :showFooter="showFooter" />
  <!-- 通过Ai生成cms文章 -->
  <ArticleAigcModal @register="registerAigcModal" @success="onModalOk" />
</template>

<script lang="ts" name="article-list" setup>
  //ts语法
  import { ref, computed, unref } from 'vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  import ArticleModal from './components/articleModal.vue';
  import ArticleAigcModal from './components/articleAigcModal.vue';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';
  const showFooter = ref(true);
  import { columns, searchFormSchema } from './article.data';
  import { list, deleteOne, batchDelete, updateIsPublish, getImportUrl, getExportUrl } from './article.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useDrawer } from '/@/components/Drawer';

  const { createMessage } = useMessage();
  const [articleDrawer, { openDrawer }] = useDrawer();
  // 注册Aigc弹窗
  const [registerAigcModal, articleAigcModal] = useModal();
  // 列表页面公共参数、方法
  const { prefixCls, tableContext, onExportXls, onImportXls } = useListPage({
    designScope: 'article-list',
    tableProps: {
      title: '文章列表',
      api: list,
      columns: columns,
      size: 'small',
      formConfig: {
        //labelWidth: 120,
        schemas: searchFormSchema,
        fieldMapToTime: [['publishDate', ['publishDateStart', 'publishDateEnd'], 'YYYY-MM-DD 00:00:00']],
      },
      actionColumn: {
        width: 120,
      },
    },
    exportConfig: {
      name: '文章列表',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrl,
    },
  });

  //注册table数据
  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  /**
   * 新增事件
   */
  function handleCreate() {
    showFooter.value = true;
    openDrawer(true, {
      isUpdate: false,
    });
  }
  /**
   * ai写文章
   */
  function onCreateByAi() {
    articleAigcModal.openModal(true, {});
  }

  /**
   * aiModal回調
   */
  function onModalOk() {
    reload();
  }
  /**
   * 编辑事件
   */
  async function handleEdit(record: Recordable) {
    showFooter.value = true;
    openDrawer(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 发布
   */
  async function handlePublish(id, isPublish) {
    const res = await updateIsPublish({ id, isPublish });
    if (res.success) {
      createMessage.success(isPublish == '1' ? '发布成功' : '取消发布成功');
      reload();
    }
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteOne({ id: record.id }, reload);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, () => {
      selectedRowKeys.value = [];
      reload();
    });
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
    ];
  }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
      {
        label: '发布',
        ifShow: record.isPublish == '0',
        popConfirm: {
          title: '确定发布吗?',
          placement: 'left',
          confirm: handlePublish.bind(null, record.id, '1'),
        },
      },
      {
        label: '取消发布',
        ifShow: record.isPublish == '1',
        onClick: handlePublish.bind(null, record.id, '0'),
      },
    ];
  }
</script>

<style scoped></style>
