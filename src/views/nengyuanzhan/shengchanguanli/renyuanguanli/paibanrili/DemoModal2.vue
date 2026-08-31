<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">选择值班干部</a-button>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" />
<!--    <DemoModal1 @register="registerModal1" @success="reload" :isDisabled="isDisabled" />-->
  </BasicModal>
</template>
<script lang="ts" setup>
import {ref, computed, unref} from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
// import DemoModal1 from './DemoModal1.vue';
import { columns2, searchFormSchema2 } from './demo.data';
import { getDemoList } from './demo.api';
import { BasicTable, useTable } from '@/components/Table';
// 声明Emits
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const props = defineProps({
  //是否禁用页面
  isDisabled: {
    type: Boolean,
    default: false,
  },
});
const checkedKeys = ref<Array<string | number>>([]);
const selectedRows = ref<Record<string, any>[]>([]);

//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
  isUpdate.value = !!data?.isUpdate;
  checkedKeys.value = [];
  selectedRows.value = [];
});
//设置标题
const title = computed(() => (!unref(isUpdate) ? '选择值班干部' : '选择值班干部'));
const [registerTable, { setProps }] = useTable({
  title: '',
  api: getDemoList,
  columns:columns2,
  formConfig: {
    // labelWidth: 80,
    schemas: searchFormSchema2,
    autoAdvancedCol: 2,
    actionColOptions: {
      style: { textAlign: 'left' },
    },
  },
  //自定义默认排序
  defSort: {
    column: 'createTime,sex',
    order: 'desc',
  },
  striped: true,
  useSearchForm: false,
  showTableSetting: false,
  clickToRowSelect: false,
  bordered: true,
  showIndexColumn: true,
  indexColumnProps: {
    fixed: 'left',
  },
  tableSetting: { fullScreen: false },
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
function onSelectChange(selectedRowKeys: (string | number)[], rows: Record<string, any>[]) {
  checkedKeys.value = selectedRowKeys;
  selectedRows.value = rows;
}
function handleAdd() {
  setProps({
    useSearchForm: true,
    clickToRowSelect: true,
  })
}
//表单提交事件
async function handleSubmit(v) {
  try {
    setModalProps({confirmLoading: true});
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', {
      selectedIds: checkedKeys.value,
      selectedRows: selectedRows.value,
    });
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>
