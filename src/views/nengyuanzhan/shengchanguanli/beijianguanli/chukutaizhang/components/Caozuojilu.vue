<template>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
<!--        <a-button v-if="hasPermission('energy:energy_device_info:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">跳过巡检</a-button>-->
        <a-button v-if="hasPermission('energy:energy_device_info:exportXls')" preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getCaozuoHistoryExportXls,exportParams)">
          导出
        </a-button>
      </template>
<!--      <template #action="{ record }" >-->
<!--        <TableAction :actions="getActions(record)"/>-->
<!--      </template>-->
    </BasicTable>

</template>
<script lang="ts" setup>
import { usePermission } from '/@/hooks/web/usePermission'
const { hasPermission } = usePermission();
import { ref, onMounted, watch, computed } from 'vue';
import { BasicColumn, BasicTable,useTable } from '@/components/Table';
import { useMethods } from '@/hooks/system/useMethods';

const { handleExportXls, handleImportXls } = useMethods();
import {
  getCaozuoHistory,
  getCaozuoHistoryExportXls,
} from '../demo.api';
import { filterObj } from '@/utils/common/compUtils';

// 声明Emits
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const id = ref(0)
const checkedKeys = ref<Array<string | number>>([]);
//自定义接受参数
const props = defineProps({
  //是否禁用页面
  isDisabled: {
    type: Boolean,
    default: false,
  },
  data: {type: Object, default: () => ({})},
});
const exportParams = computed(() => {
  let paramsForm = {
    id: id.value,
  };
  if (checkedKeys.value && checkedKeys.value.length > 0) {
    paramsForm['selections'] = checkedKeys.value.join(',');
  }
  return filterObj(paramsForm);
});
const columnsTable: BasicColumn[] = [
  {
    title: '操作人',
    dataIndex: 'operatorName',
    width: 130,
    resizable: true,
  },
  {
    title: '操作时间',
    dataIndex: 'opTime',
    width: 140,
    resizable: true,
  },
  {
    title: '操作内容',
    dataIndex: 'opContent',
    width: 350,
    resizable: true,
  },
];
const [registerTable,{reload}] = useTable({
  api: getCaozuoHistory,
  rowKey: 'id',
  columns:columnsTable,
  // formConfig: {
  //   labelWidth: 120,
  //   schemas: searchFormSchema,
  //   autoSubmitOnEnter: true,
  // },
  striped: true,
  useSearchForm: false,
  showTableSetting: true,
  clickToRowSelect: false,
  bordered: true,
  showIndexColumn: true,
  indexColumnProps: {
    fixed: 'left',
  },
  tableSetting: {fullScreen: true},
  beforeFetch: (params) => {
    return Object.assign({id: id.value}, params);
  },
  // actionColumn: {
  //   width: 150,
  //   title: '操作',
  //   dataIndex: 'action',
  //   slots: {customRender: 'action'},
  //   fixed: 'right',
  // },
});


/**
 * 选择列配置
 */
const rowSelection = {
  type: 'checkbox',
  columnWidth: 20,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
};

/**
 * 选择事件
 */
function onSelectChange(selectedRowKeys: (string | number)[]) {
  console.log('checkedKeys------>', checkedKeys);
  checkedKeys.value = selectedRowKeys;
}


onMounted(() => {
  // 禁用字段
  // updateSchema([
  //   {field: 'parentId', componentProps: {disabled: true}},
  //   {field: 'orgCode', componentProps: {disabled: true}},
  // ]);
  // // data 变化，重填表单
  watch(
    () => props.data,
    async (newValue) => {
      console.log(newValue,'父组件传过来的值');
      id.value = newValue.id
      reload()
    },
    {deep: true, immediate: true}
  );

});
</script>
