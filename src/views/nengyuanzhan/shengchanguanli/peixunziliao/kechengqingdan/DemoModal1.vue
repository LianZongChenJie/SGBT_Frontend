<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <!--        <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, getImportUrl, reload)">-->
        <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入</a-button>-->
        <!--        </a-upload>-->
        <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
        <!--          导出-->
        <!--        </a-button>-->
      </template>
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getDemoList } from '@/views/nengyuanzhan/shengchanguanli/peixunziliao/ziliaoku/demo.api';
  import { columns, searchFormSchema } from '@/views/nengyuanzhan/shengchanguanli/peixunziliao/ziliaoku/demo.data';

  // 声明Emits
  const emit = defineEmits(['register', 'success']);

  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const checkedKeys = ref<Array<string | number>>([]);
  const checkedArr = ref<Recordable[]>([]);
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    checkedKeys.value = (data?.selectedIds || []).map((item) => String(item));
    checkedArr.value = [];
  });

  const [registerTable] = useTable({
    title: '资料库',
    api: getDemoList,
    columns,
    formConfig: {
      schemas: searchFormSchema,
      autoAdvancedCol: 2,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
    },
    //自定义默认排序
    defSort: {
      // column: 'createTime,sex',
      // order: 'desc',
    },
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

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], checkedLists: Recordable[]) {
    checkedKeys.value = selectedRowKeys.map((item) => String(item));
    checkedArr.value = checkedLists;
  }

  //设置标题
  const title = computed(() => '资料库');

  //表单提交事件
  async function handleSubmit(v) {
    try {
      setModalProps({ confirmLoading: true });
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', checkedArr.value);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
