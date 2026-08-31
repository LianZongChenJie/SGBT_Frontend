<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @cancel="handleCancel"  @ok="handleSubmit" width="80%">
    <BasicTable @register="registerTable" >
<!--      <template #action="{ record }">-->
<!--        <TableAction :actions="getActions(record)" />-->
<!--      </template>-->
      <template #resultType="{ record }">
        <a-radio-group
          v-model:value="record.resultType"
          :disabled="isDisabled"
        >
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
      </template>
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
import { usePermission } from '/@/hooks/web/usePermission';

const { hasPermission } = usePermission();
import { ref, computed, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import {columnsModalYulan, searchFormSchemaYulan } from './demo.data';
import {  deleteDemo, batchDeleteDemo,getDemoListYulan } from './demo.api';
import { BasicTable, TableAction, useTable } from '@/components/Table';
import { filterObj } from '@/utils/common/compUtils';
// 声明Emits
const emit = defineEmits(['register', 'success']);
const checkedKeys = ref<Array<string | number>>([]);
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
  setModalProps({ confirmLoading: true,});
  console.log(data, 'aaaaaaaaaaaaa');
  // await resetFields();
  // setModalProps({ confirmLoading: true, });
  isUpdate.value = !!data?.isUpdate;
  let arr = await getDemoListYulan({ ids: data.record.deviceId,bizType:2});
  const ids = data.record.itemIds
    ? String(data.record.itemIds)
        .split(',')
        .filter(Boolean)
        .map((s) => Number(s))
    : [];

  const newArr = arr.filter(item => ids.includes(item.id));

  // console.log(newArr);
  setTableData(newArr)
  // if (unref(isUpdate)) {
  //   //获取详情
  //   let arr = await getDemoListYulan({ ids: data.record.id});


  // setTableData(data.record)
  setModalProps({ confirmLoading: false,});
  //
  // }
});
//设置标题
const title = computed(() => (!unref(isUpdate) ? '巡检项目预览' : '巡检项目预览'));
const [registerTable, { reload,setTableData }] = useTable({
  title: '',
  // api: getDemoListYulan,
  columns: columnsModalYulan,
  formConfig: {
    //labelWidth: 120,
    // schemas: searchFormSchemaYulan,
    // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
    // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
    // autoAdvancedCol: 2,
    // actionColOptions: {
    //   style: { textAlign: 'left' },
    // },
  },
  //自定义默认排序
  defSort: {
    // column: 'createTime,sex',
    // order: 'desc',
  },
  pagination: false,
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
  // actionColumn: {
  //   width: 120,
  //   title: '操作',
  //   dataIndex: 'action',
  //   slots: { customRender: 'action' },
  //   fixed: 'right',
  // },
});

/**
 * 操作列定义
 * @param record
 */
function getActions(record) {
  return [
    {
      label: '编辑',
      auth: 'operation:operation_course_material:edit',
      onClick: handleEdit.bind(null, record),
    },
    // {
    //   label: '详情',
    //   onClick: handleDetail.bind(null, record),
    // },
    {
      label: '删除',
      auth: 'operation:operation_course_material:delete',
      popConfirm: {
        title: '是否确认删除',
        confirm: handleDelete.bind(null, record),
      },
    },
  ];
}
/**
 * 选择列配置
 */
const rowSelection = {
  type: 'checkbox',
  columnWidth: 40,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
};

// const exportParams = computed(() => {
//   let paramsForm = {};
//   if (checkedKeys.value && checkedKeys.value.length > 0) {
//     paramsForm['selections'] = checkedKeys.value.join(',');
//   }
//   return filterObj(paramsForm);
// });
/**
 * 选择事件
 */
function onSelectChange(selectedRowKeys: (string | number)[]) {
  console.log('checkedKeys------>', checkedKeys);
  checkedKeys.value = selectedRowKeys;
}
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
//表单提交事件
async function handleSubmit(v) {
  closeModal();
  // try {
  //   // let values = await validate();
  //   setModalProps({ confirmLoading: true });
  //   //提交表单
  //   // await saveOrUpdateDemo(values, isUpdate.value);
  //   //关闭弹窗
  //   closeModal();
  //   //刷新列表
  //   emit('success', );
  // } finally {
  //   setModalProps({ confirmLoading: false });
  // }
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
