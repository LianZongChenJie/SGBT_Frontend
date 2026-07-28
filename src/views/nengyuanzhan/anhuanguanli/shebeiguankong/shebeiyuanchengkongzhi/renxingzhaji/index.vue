<template>
  <div style="padding: 10px">
    <BasicTable @register="registerTable" :rowSelection="rowSelection" :class="{ 'p-4': customSearch }">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">开</a-button>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">应急开</a-button>
        <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">取消应急</a-button>
<!--        <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, getImportUrl, reload)">-->
<!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入</a-button>-->
<!--        </a-upload>-->
<!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
<!--          导出-->
<!--        </a-button>-->
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
    <JImportModal @register="registerModalJimport" :url="getImportUrl" online />
  </div>
</template>
<script lang="ts" setup name="renxingzhaji">
  import { ref, unref, reactive, toRaw, watch, computed } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import DemoModal from './DemoModal.vue';
  import JImportModal from '/@/components/Form/src/jeecg/components/JImportModal.vue';

  import { useMethods } from '/@/hooks/system/useMethods';
  import { getDemoList, deleteDemo, batchDeleteDemo, getExportUrl, getImportUrl } from './demo.api';
  import { columns, searchFormSchema } from './demo.data';

  import { filterObj } from '/@/utils/common/compUtils';


  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();
  const [registerModalJimport, { openModal: openModalJimport }] = useModal();
  const { handleExportXls, handleImportXls } = useMethods();
  const min = ref();
  const max = ref();
  const isDisabled = ref(false);

  const [registerTable, { reload, setProps }] = useTable({
    title: '单表示例',
    api: getDemoList,
    columns,
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
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
      {
        label: '开',
        onClick: handleEdit.bind(null, record),
      },{
        label: '应急开',
        onClick: handleEdit.bind(null, record),
      },{
        label: '取消应急',
        onClick: handleEdit.bind(null, record),
      },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
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
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    console.log('checkedKeys------>', checkedKeys);
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

  /**
   * 年龄修改事件
   */
  function ageChange(model, field) {
    model[field] = [unref(min), unref(max)];
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
