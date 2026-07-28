<template>
  <div class="app-container">
    <a-row type="flex" :gutter="10" style="max-height: 800px">
      <a-col :xl="4" :lg="24" :md="24" style="margin-bottom: 10px">
        <!--        <DepartLeftTree ref="leftTree" @select="onTreeSelect" />-->
        <a-card size="small" class="h-full">
          <!-- 搜索 -->
          <a-input-search v-model:value="keyword" placeholder="关键字查询" allowClear @search="loadLeftList" />

          <!-- 新增 -->
          <div class="mt-2 mb-2">
            <a-button type="dashed" style="width: 100%" @click="handleAddList">
              <PlusOutlined />
              新增配置
            </a-button>
          </div>

          <!-- 扁平列表 -->
          <a-list :data-source="listData" :renderItem="renderItem" size="small" />
        </a-card>
      </a-col>
      <a-col :xl="20" :lg="24" :md="24" style="margin-bottom: 10px">
        <BasicTable @register="registerTable" :rowSelection="rowSelection" :class="{ 'p-4': customSearch }" style="padding: 0">
          <template #tableTitle>
            <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">添加设备</a-button>
            <a-button :disabled="checkedKeys.length < 1" type="primary" @click="handleAdd">执行常开</a-button>
            <a-button :disabled="checkedKeys.length < 1" type="primary" @click="handleAdd">单次开</a-button>
            <a-button :disabled="checkedKeys.length < 1" type="primary" @click="handleAdd">取消常开</a-button>

            <!--            <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, getImportUrl, reload)">-->
            <!--              <a-button preIcon="ant-design:import-outlined" type="primary">导入</a-button>-->
            <!--            </a-upload>-->
            <!--            <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
            <!--              导出-->
            <!--            </a-button>-->
            <a-dropdown v-if="checkedKeys.length > 0">
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
                <Icon style="fontsize: 12px" icon="ant-design:down-outlined"></Icon>
              </a-button>
            </a-dropdown>
          </template>
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
        </BasicTable>
        <DemoModal @register="registerModal" @success="reload" :isDisabled="isDisabled" />
        <DemoModalList @register="registerModalList" @success="reload" :isDisabled="isDisabled" />
        <JImportModal @register="registerModalJimport" :url="getImportUrl" online />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts" name="shebeizhuangtaipeizhi">
  import { h, ref, unref, reactive, toRaw, watch, computed, onMounted } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import DemoModalList from './DemoModalList.vue';
  import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import JImportModal from '/@/components/Form/src/jeecg/components/JImportModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { getDemoList, deleteDemo, batchDeleteDemo, getExportUrl, getImportUrl, getStatusList, deleteStatus } from './demo.api';
  import { columns, searchFormSchema, formSchema } from './demo.data';

  import { filterObj } from '/@/utils/common/compUtils';
  import DepartLeftTree from './components/DepartLeftTree.vue';

  const keyword = ref('');
  const listData = ref([]);
  const activeId = ref<string | null>(null);
  // 当前选中的部门code
  const orgCode = ref('0');
  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();
  const [registerModalList, { openModal: openModalList }] = useModal();
  const [registerModalJimport, { openModal: openModalJimport }] = useModal();
  const { handleExportXls, handleImportXls } = useMethods();
  const isDisabled = ref(false);

  const [registerTable, { reload, setProps }] = useTable({
    title: '单表示例',
    api: getDemoList,
    columns,
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      // autoAdvancedCol: 2,
      // actionColOptions: {
      //   style: { textAlign: 'left' },
      // },
    },
    beforeFetch(params) {
      // ⭐ 统一注入 orgCode
      params.orgCode = orgCode.value;
      return params;
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
    canResize: false,
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
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  const exportParams = computed(() => {
    let paramsForm = {};
    if (checkedKeys.value && checkedKeys.value.length > 0) {
      paramsForm['selections'] = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
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
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

  /**
   * 新增事件
   */
  function handleAdd() {
    isDisabled.value = false;
    openModal(true, {
      isUpdate: false,
    });
  }
  function handleAddList() {
    isDisabled.value = false;
    openModalList(true, {
      isUpdate: false,
    });
  }

  /**
   * 编辑事件
   */
  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
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

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, reload);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteDemo({ ids: checkedKeys.value }, reload);
  }

  const customSearch = ref(false);
  const queryParam = reactive({
    name: '',
    age_begin: '',
    age_end: '',
    sex: '',
    id: '',
  });
  watch(customSearch, () => {
    setProps({ useSearchForm: !unref(customSearch) });
  });

  function searchQuery() {
    setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }

  // 左侧树选择后触发
  function onTreeSelect(data) {
    orgCode.value = data.id;
    reload({
      searchInfo: {
        orgCode: orgCode.value,
      },
    });
  }

  function renderItem(item) {
    const active = item.id === activeId.value;

    return h(
      'div',
      {
        class: ['left-item', active && 'active'],
        onClick: () => handleSelect(item),
      },
      [
        // 左侧名称
        h('span', { class: 'title' }, item.name),

        // 右侧操作按钮
        h('span', { class: 'actions' }, [
          h(EditOutlined, {
            class: 'icon',
            onClick: (e) => {
              e.stopPropagation();
              handleEditList(item);
            },
          }),
          h(DeleteOutlined, {
            class: 'icon danger',
            onClick: (e) => {
              e.stopPropagation();
              handleDeleteList(item);
            },
          }),
        ]),
      ]
    );
  }
  function handleEditList(record) {
    openModalList(true, {
      isUpdate: true,
      record,
    });
  }

  function handleDeleteList(record) {
    const { createConfirm } = useMessage();
    createConfirm({
      iconType: 'warning',
      title: '确认删除',
      content: `确认删除【${record.name}】吗？`,
      onOk: async () => {
        await deleteStatus({ id: record.id });
        loadLeftList();
      },
    });
  }

  function handleSelect(item) {
    activeId.value = item.id;

    reload({
      searchInfo: {
        statusId: item.id, // 你自己的字段
      },
    });
  }

  //左侧搜索
  function loadLeftList() {
    getStatusList({
      keyword: keyword.value,
    }).then((res) => {
      // listData.value = res;
    });
  }

  onMounted(async () => {
    await loadLeftList();
    if (listData.value.length) {
      handleSelect(listData.value[0]);
    }
  });
</script>

<style scoped lang="less">
  .app-container {
    padding: 10px;

    .left-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      cursor: pointer;
      border-radius: 4px;
    }

    .left-item:hover {
      background: #f5f7fa;
    }

    .left-item.active {
      background: #1890ff;
      color: #fff;
    }

    .actions {
      display: flex;
      gap: 6px;
    }

    .icon {
      font-size: 14px;
      color: #999;
    }

    .left-item.active .icon {
      color: #fff;
    }

    .icon.danger:hover {
      color: #ff4d4f;
    }
  }
</style>
