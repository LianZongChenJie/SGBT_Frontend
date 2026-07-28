<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @cancel="handleCancel"  @ok="handleSubmit" width="80%">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
<!--      <template #action="{ record }">-->
<!--        <TableAction :actions="getActions(record)" />-->
<!--      </template>-->
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
import { usePermission } from '/@/hooks/web/usePermission';

const { hasPermission } = usePermission();
import { ref, computed, unref,nextTick } from 'vue';
import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
import { columnsModalYulan, searchFormSchemaYulan } from './demo.data';
import { getDemoListYulan } from './demo.api';
import { BasicTable, TableAction, useTable } from '@/components/Table';
// 声明Emits
const emit = defineEmits(['register', 'success']);
const checkedKeys = ref<Array<string | number>>([]);
const checkedRows = ref([]);
const isUpdate = ref(true);
const isDisabled = ref(false);
//自定义接受参数
const props = defineProps({
  //是否禁用页面
  isDisabled: {
    type: Boolean,
    default: false,
  },
});
//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  // reload()
  //重置表单
  setSelectedRowKeys([])
  // await resetFields();
  // setModalProps({ confirmLoading: true, });
  isUpdate.value = !!data?.isUpdate;

  let arr = await getDemoListYulan({ ids: data.record.deviceId,bizType:1});
  setTableData(arr);
  const ids = data?.record?.itemIds
    ? String(data.record.itemIds)
        .split(',')
        .filter(Boolean)
        .map((s) => Number(s))
    : [];
  checkedKeys.value = ids;
  checkedRows.value = ids.length ? arr.filter((item) => ids.includes(Number(item.id))) : [];
  setSelectedRowKeys(ids);


  if (unref(isUpdate)) {
    //获取详情
    setModalProps({ confirmLoading: false, });

  }
});
//设置标题
const title = computed(() => (!unref(isUpdate) ? '选择点检项目' : '选择点检项目'));
const [registerTable, { reload, setTableData,setSelectedRowKeys }] = useTable({
  title: '',
  // api: getDemoListYulan,
  columns: columnsModalYulan,
  formConfig: {
    labelWidth: 120,
    schemas: searchFormSchemaYulan,
    autoAdvancedCol: 2,
    // actionColOptions: {
    //   style: { textAlign: 'left' },
    // },
  },
  //自定义默认排序
  defSort: {
    // column: 'createTime,sex',
    // order: 'desc',
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
  pagination: false, // ⭐ 直接禁用分页
  tableSetting: { fullScreen: false },
  canResize: false,
  rowKey: 'id',
  // actionColumn: {
  //   width: 120,
  //   title: '操作',
  //   dataIndex: 'action',
  //   slots: { customRender: 'action' },
  //   fixed: 'right',
  // },
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
function onSelectChange(selectedRowKeys: (string | number)[],selectRows) {
  console.log('checkedKeys------>', checkedKeys);
  checkedKeys.value = selectedRowKeys;
  checkedRows.value =selectRows;
}

//表单提交事件
async function handleSubmit(v) {
  try {
    // let values = await validate();
    setModalProps({ confirmLoading: true });
    //提交表单
    // await saveOrUpdateDemo(values, isUpdate.value);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', checkedRows.value);
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
function handleCancel() {
  closeModal();
  // checkedKeys.value = [];
  // selectRows.value = [];
  // // update-begin--author:liaozhiyang---date:20230908---for：【issues/742】选择后删除默认仍然存在
  // tableRef.value.clearSelectedRowKeys();
  // update-end--author:liaozhiyang---date:20230908---for：【issues/742】选择后删除默认仍然存在
}
</script>
