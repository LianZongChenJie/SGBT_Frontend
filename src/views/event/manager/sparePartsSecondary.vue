<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="选择备件" @ok="handleSubmit" :width="1000" :z-index="1009"
    defaultFullscreen @open="searchReset">
    <!--自定义查询区域-->
    <div class="jeecg-basic-table jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" class="jeecg-basic-form--compact" :model="queryParam" :label-col="labelCol"
        :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :lg="8">
            <a-form-item label="仓库名称">
              <a-select v-model:value="queryParam.warehouseId" @change="changeWarehouseId">
                <a-select-option :value="item.id" v-for="(item, index) in options" :key="index">{{ item.name
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-form-item label="物料名称">
              <a-input placeholder="请输入物料名称" v-model:value="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
            <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <BasicTable @register="registerTable" bordered style="margin-left:5px;margin-right:8px;"></BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup name="OrderUserSelect">
import { ref, reactive, onMounted, toRaw, nextTick } from 'vue';
import { cloneDeep } from 'lodash-es';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicTable, useTable } from '/@/components/Table';
import { getAllWarehouseList } from "@/views/inventory/InventoryManage/api";
import { getSparePartsList } from './eventOrder.api';
import { spareColumns } from './event.data';
import { message } from "ant-design-vue";
const emit = defineEmits(['select-success', 'register']);
const queryParam = reactive({
  warehouseId: '',
  name: '',
});
const copyWarehouseId = ref('');
const options = ref<Recordable[]>([]);
const tableData = ref<Recordable[]>([])
const selectData = ref<Recordable[]>([])
const selectedKeys = ref<string[]>([]);
// 选中变化时的回调
const onSelectChange = (keys: any, rows: any) => {
  selectedKeys.value = keys;
  selectData.value = rows;
};

const [
  registerTable,
  {
    setProps,
    setSelectedRowKeys,
    reload
  },
] = useTable({
  canResize: true,
  title: '',
  titleHelpMessage: '',
  api: getSparePartsList,
  columns: spareColumns,
  rowKey: 'id',
  immediate: false,
  rowSelection: {
    type: 'checkbox',
    selectedRowKeys: selectedKeys.value,
    onChange: onSelectChange,
  }
});

//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  setModalProps({ confirmLoading: false });
  tableData.value = data.selectData;
  getAllWarehouseList().then((res) => {
    options.value = res;
    queryParam.warehouseId = options.value[0].id;
    copyWarehouseId.value = queryParam.warehouseId;
    setProps({ searchInfo: toRaw(queryParam) });
    reload();
    nextTick(() => {
      selectedKeys.value = [];
      setSelectedRowKeys(selectedKeys.value);
      selectedKeys.value = cloneDeep(tableData.value.map(item => item.id));
      setSelectedRowKeys(selectedKeys.value);
    })
  })
});

//-----自定义查询----begin--------
const labelCol = reactive({
  xs: { span: 24 },
  sm: { span: 5 },
});
const wrapperCol = reactive({
  xs: { span: 24 },
  sm: { span: 19 },
});
function changeWarehouseId() {
  console.log(selectedKeys.value)
  const rawData = cloneDeep(tableData.value.map(item => item.id));
  const tableSelectData = selectedKeys.value
  if (rawData.length !== tableSelectData.length) {
    queryParam.warehouseId = copyWarehouseId.value;
    return message.warning('当前仓库有改动，请先保存当前仓库再查询其他仓库');
  } else {
    const sortedArr1 = [...rawData].sort();
    const sortedArr2 = [...tableSelectData].sort();
    if (!sortedArr1.every((value, index) => value === sortedArr2[index])) {
      queryParam.warehouseId = copyWarehouseId.value;
      return message.warning('当前仓库有改动，请先保存当前仓库再查询其他仓库');
    }
  }
  copyWarehouseId.value = queryParam.warehouseId;
  searchQuery();
}
function searchQuery() {
  setProps({ searchInfo: toRaw(queryParam) });
  reload();
  nextTick(() => {
    setSelectedRowKeys(selectedKeys.value);
    console.log(selectedKeys.value)
  })
}
function searchReset() {
  queryParam.name = '';
  setProps({ searchInfo: toRaw(queryParam) });
  reload();
  nextTick(() => {
    setSelectedRowKeys(selectedKeys.value);
  })
}
//-----自定义查询----end--------
//表单提交事件
async function handleSubmit() {
  emit('select-success', selectedKeys.value, selectData.value);
  closeModal();
}
</script>
<style scoped lang="less"></style>
