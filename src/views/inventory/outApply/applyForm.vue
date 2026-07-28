<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" :width="1200">
    <div class="modal-content">
      <!-- 主弹框内容：已选物料列表 -->
      <div class="cart-section">
        <BasicTable :columns="cartColumns" :dataSource="selectData" bordered size="small">
          <template #tableTitle>
            <h3>出库物料清单</h3>
          </template>
          <template #toolbar>
            <a-button type="primary" @click="openMaterialModal(true, { selectData: selectData.value })">+
              添加物料</a-button>
          </template>
          <template #bodyCell="{ column, record, index }">
            <!-- 数量输入：添加change事件主动同步值 -->
            <template v-if="column.dataIndex === 'quantity'">
              <a-input-number v-model:value="record.selectNum" :min="1" :max="record.num" :precision="0"
                style="width: 100%" placeholder="请输入申请数量" @change="handleQuantityChange(record.id, $event)" />
            </template>
            <!-- 操作列 -->
            <template v-if="column.dataIndex === 'action'">
              <a-button type="link" danger @click="handleRemove(record.id)">删除</a-button>
            </template>
          </template>
        </BasicTable>
      </div>
    </div>

    <!-- 二级弹框：物料选择 -->
    <MaterialSelectModal @register="registerMaterialModal" @select-success="handleMaterialSelect" />
  </BasicModal>
</template>

<script setup lang="ts">
// 补充emit定义：添加success事件
const emit = defineEmits(['register', 'ok', 'success']);
import { ref, reactive, watch } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicTable } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import MaterialSelectModal from './MaterialSelectModal.vue';
import { cloneDeep } from 'lodash-es';
import { useMessage } from '/@/hooks/web/useMessage';
import { approveApply } from './api';

const { createMessage } = useMessage();

// ------------- 核心响应式数据 -------------
const title = ref('');
// 已选物料列表（核心：确保每个item都是响应式）
const selectData = ref<Recordable[]>([]);

// ------------- 注册弹框 -------------
const [registerModal, { closeModal }] = useModalInner((data) => {
  title.value = data.isUpdate ? '编辑出库申请' : '新增出库申请';
  // 修复：编辑状态时同步cartList到selectData，且确保响应式
  if (data.isUpdate && data.record?.items) {
    // 深拷贝后给每个item添加selectNum默认值，确保响应式
    selectData.value = cloneDeep(data.record.items).map(item => ({
      ...item,
      selectNum: item.selectNum || 1 // 兜底默认值，避免undefined
    }));
  } else {
    selectData.value = [];
  }
});

// 注册二级弹框
const [registerMaterialModal, { openModal: openMaterialModal }] = useModal();

// ------------- 表格列定义 -------------
const cartColumns = [
  { title: '物料名称', dataIndex: 'materialName', width: 150 },
  { title: '规格型号', dataIndex: 'specification', width: 120 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '库存数量', dataIndex: 'num', width: 100 },
  {
    title: '申请数量',
    dataIndex: 'quantity',
    width: 120,
    customCell: () => ({ style: { padding: '4px 8px' } }),
  },
  { title: '操作', dataIndex: 'action', width: 80 },
];

// ------------- 新增：主动同步申请数量（核心修复） -------------
const handleQuantityChange = (id: string | number, value: number) => {
  // 找到对应物料并强制更新，触发响应式
  const itemIndex = selectData.value.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    // 重构数组项，强制触发Vue响应式检测
    selectData.value[itemIndex] = {
      ...selectData.value[itemIndex],
      selectNum: value
    };
    // 重新赋值数组，确保视图和数据同步
    selectData.value = [...selectData.value];
  }
};

// ------------- 处理物料选择（简化逻辑，确保响应式） -------------
const handleMaterialSelect = (selectedIds: any[], selectedMaterialsData: any[]) => {
  if (!selectedIds.length || !selectedMaterialsData.length) return;

  // 过滤出未添加过的物料（避免重复）
  const newMaterials = selectedMaterialsData.filter(item =>
    !selectData.value.some(exist => exist.id === item.id)
  );

  // 给新物料添加默认申请数量，确保响应式
  const materialsToAdd = newMaterials.map(item => ({
    ...item,
    selectNum: 1 // 初始值1，确保有默认值
  }));

  // 合并到已选列表（直接修改ref数组，确保响应式更新）
  selectData.value = [...selectData.value, ...materialsToAdd];

  // 友好提示
  if (materialsToAdd.length) {
    createMessage.success(`成功添加${materialsToAdd.length}种物料`);
  } else {
    createMessage.warning('所选物料已在列表中，无需重复添加');
  }
};

// ------------- 删除物料 -------------
const handleRemove = (id: string | number) => {
  selectData.value = selectData.value.filter(item => item.id !== id);
  createMessage.success('物料删除成功');
};

// ------------- 提交表单（核心修复） -------------
const handleSubmit = async () => {
  try {
    // 1. 校验：是否选择物料
    if (!selectData.value.length) {
      createMessage.warning('请先选择出库物料');
      return;
    }

    // 2. 校验：申请数量是否合法（彻底校验，终止提交）
    let hasError = false;
    let errorItemName = '';
    for (const item of selectData.value) {
      // 校验空值/小于1/大于库存
      if (!item.selectNum || item.selectNum < 1) {
        errorItemName = item.materialName;
        hasError = true;
        break;
      }
      if (item.selectNum > item.num) {
        errorItemName = item.materialName;
        hasError = true;
        break;
      }
    }

    if (hasError) {
      createMessage.warning(`【${errorItemName}】申请数量不合理，请修正`);
      return; // 有错误直接终止提交
    }

    // 3. 组装提交数据（直接使用最新的selectData）
    const submitData = selectData.value.map((item) => ({
      id: item.id,
      name: item.materialName,
      num: item.selectNum, // 此时拿到的是最新修改后的值
      warehouseName: item.warehouseName,
      warehouseId: item.warehouseId,
    }));

    // 4. 提交接口
    await approveApply(submitData);
    closeModal();
    emit('success'); // 触发父组件成功事件

  } catch (error) {
    console.error('提交失败：', error);
  }
};
</script>

<style scoped>
.cart-section {
  height: 100%;
}

/* 紧凑型表格样式 */
:deep(.ant-table-small .ant-table-thead > tr > th) {
  padding: 8px !important;
}

/* 优化输入框样式 */
:deep(.ant-input-number) {
  width: 100%;
}
</style>