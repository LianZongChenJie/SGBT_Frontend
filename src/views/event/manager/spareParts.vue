<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="备件" @ok="handleSubmit" :width="1000" :z-index="1009"
    defaultFullscreen>
    <!--自定义查询区域-->
    <a-button style="margin-left:10px;margin-bottom:12px;" type="primary" preIcon="ant-design:plus-outlined"
      @click="openSparePartsSecondarylModal(true, { selectData })">选择备件
    </a-button>
    <a-table :columns="columnsSelect" :dataSource="selectData" :loading="loading" bordered :scroll="{ y: tableHeight }"
      style="margin-left:5px;margin-right:5px;" :pagination="false">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.dataIndex === 'selectNum'">
          <a-input-number v-model:value="record.selectNum" :min="1" :max="record.num" />
        </template>
        <template v-if="column.dataIndex === 'action'">
          <a @click="cancelItem(record.id)">删除</a>
        </template>
      </template>
    </a-table>
    <!-- 二级弹框：物料选择 -->
    <SparePartsSecondary @register="registerSparePartsSecondary" @select-success="handleMaterialSparePartsSelect" />
  </BasicModal>
</template>
<script lang="ts" setup name="OrderUserSelect">
import { ref, onMounted } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { defaultTransfer } from './eventOrder.api';
import { useModal } from '/@/components/Modal';
import { useEventStoreWithOut } from '/@/store/modules/event';
import SparePartsSecondary from './sparePartsSecondary.vue'; // 新建的二级弹框组件
import { useMessage } from '/@/hooks/web/useMessage';
import { storeToRefs } from 'pinia';
import { cloneDeep } from 'lodash-es';
const useEventStor = useEventStoreWithOut();
const { changeFlag } = storeToRefs(useEventStor);
const { createMessage } = useMessage();
const tableHeight = ref(100);
const code = ref('');
const columnsSelect = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: '5%',
    align: 'center',
  },
  {
    title: '物料名称',
    dataIndex: 'materialName',
    key: 'materialName',
    width: '10%',
    align: 'center',
  },
  {
    title: '仓库名称',
    dataIndex: 'warehouseName',
    key: 'warehouseName',
    width: '10%',
    align: 'center',
  },
  {
    title: '物料分类',
    dataIndex: 'typeName',
    key: 'typeName',
    width: '10%',
    align: 'center',
  },
  {
    title: '规格',
    dataIndex: 'specification',
    key: 'specification',
    width: '15%',
    align: 'center',
  },
  {
    title: '单位',
    dataIndex: 'unit',
    key: 'unit',
    width: '15%',
    align: 'center',
  },
  {
    title: '库存数量',
    dataIndex: 'num',
    key: 'num',
    width: '14%',
    align: 'center',
  },
  {
    title: '选择数量',
    dataIndex: 'selectNum',
    key: 'num',
    width: '13%',
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'x',
    width: '8%',
    align: 'center',
  },
];
const selectData = ref<Recordable[]>([])
const allData = ref<Recordable[]>([]);
const loading = ref(false);
const submitData = ref({ id: '', materialInfo: [{ id: '', name: '', num: '' }] })

// 注册二级弹框
const [registerSparePartsSecondary, { openModal: openSparePartsSecondarylModal }] = useModal();

// 声明Emits
const emit = defineEmits(['success', 'register']);
//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  setModalProps({ confirmLoading: false });
  console.log(data)
  submitData.value.id = data.record.id;
  code.value = data.code;
  selectData.value = [];
});
//-----自定义查询----begin--------

function cancelItem(id: any) {
  selectData.value = selectData.value.filter(item => item.id !== id);
}
const calculateHeight = () => {
  const offset = 280; // 根据页面布局调整
  tableHeight.value = window.innerHeight - offset;
};
//-----自定义查询----end--------
//表单提交事件
async function handleSubmit() {
  try {
    setModalProps({ confirmLoading: true });
    if (!selectData.value.length) {
      createMessage.warning('请选择备件');
    } else {
      for (let i = 0; i < selectData.value.length; i++) {
        if (!selectData.value[i].selectNum) {
          createMessage.warning('请输入选择数量');
          break; // 不符合条件时退出循环
        }
      }
      submitData.value.materialInfo = [];
      selectData.value.forEach(item => {
        submitData.value.materialInfo.push({ id: item.id, name: item.materialName, num: item.selectNum })
      });
      //提交表单
      await defaultTransfer(submitData.value, code.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
      changeFlag.value = !changeFlag.value;
    }

  } finally {
    setModalProps({ confirmLoading: false });
  }
}
// 处理从二级弹框返回的选中物料
const handleMaterialSparePartsSelect = (selectedMaterials: any, selectedMaterialsData: any) => {
  allData.value = [];
  const result = selectData.value.filter(item => selectedMaterials.includes(item.id));
  allData.value = allData.value.concat(result);
  const result2 = selectedMaterials.filter(num => !selectData.value.some(item => item.id === num));
  result2.forEach(item => {
    selectedMaterialsData.forEach(item2 => {
      if (item == item2.id) {
        item2.selectNum = 1;
        allData.value.push(item2)
      }
    });
  });
  selectData.value = cloneDeep(allData.value);
};
onMounted(() => {
  calculateHeight();
  window.addEventListener('resize', calculateHeight);
});
</script>
<style scoped lang="less"></style>
