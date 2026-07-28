<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" :width="1200">
    <div class="modal-content">
      <div class="cart-section">
        <BasicTable @register="registerTable">
          <template #bodyCell="{ column, record, index }">
            <!-- 数量输入（使用InputNumber控件） -->
            <template v-if="column.dataIndex === 'num'">
              <a-input-number
                v-model:value="record.num"
                :min="0"
                :precision="0"
                style="width: 100%"
                @change="(value) => handleNumChange(value, record)"
              />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
  const emit = defineEmits(['register', 'ok', 'success']);
  import { ref, watch, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getBackList, approveApply } from './api';
  import { backColums } from './data';
  import { useMessage } from '/@/hooks/web/useMessage';
  const tableRows = reactive<Array<any>>([]);
  const { createMessage } = useMessage();
  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      title: '退库',
      api: getBackList,
      columns: backColums,
      pagination: false,
      pageSize: 9999,
      beforeFetch: (params) => {
        // 把approveId添加到请求参数中，字段名可根据后端需求调整（如approveId、id等）
        if (approveId.value) {
          params.approveId = approveId.value;
        }
        return params; // 返回修改后的参数
      },
      afterFetch: (data) => {
        tableRows.length = 0;
        const filteredData = data
          .filter((item) => item.realNum > 0)
          .map((item) => {
            return { ...item, num: 0 };
          });
        tableRows.push(...filteredData);
        return filteredData;
      },
      showIndexColumn: true,
      actionColumn: false,
    },
  });
  const approveId = ref('');
  // BasicTable绑定注册
  const [registerTable, { reload, getDataSource }] = tableContext;
  const [registerModal, { closeModal }] = useModalInner((data) => {
    approveId.value = data.record?.id || '';
  });
  const submitData = ref<Array<any>>([]);
  const title = ref('');

  watch(approveId, (newVal) => {
    if (newVal) {
      reload(); // 刷新表格，触发getBackList请求
    }
  });
  const handleNumChange = (value: number | null, record: any) => {
    // 处理空值
    if (value === null || value === undefined) return;
    if (value === 0) {
      const materialName = record.name || record.materialName;
      createMessage.warning(`【${materialName}】申请数量不能为0，请输入大于0的数值`);
      return;
    }
    // 核心校验逻辑
    if (value > record.realNum) {
      const materialName = record.name || record.materialName;
      createMessage.warning(`【${materialName}】申请数量${record.num}不能大于实际数量${record.realNum}`);
    }
  };
  // 提交表单
  // const handleSubmit = async () => {
  //   try {
  //     const tableData = getDataSource() || [];
  //     if (!tableData.length) {
  //       createMessage.warning('请选择物料');
  //       return;
  //     }
  //     let hasError = false;
  //     for (const item of tableData) {
  //       // 跳过空值（理论上InputNumber已限制min=1，此处兜底）
  //       if (!item.num || item.num < 1) {
  //         createMessage.warning(`【${item.name}】请输入有效的退回数量（至少1）`);
  //         hasError = true;
  //         break;
  //       }
  //       // 核心校验：申请数量 > 实际数量
  //       if (item.num > item.realNum) {
  //         createMessage.warning(`【${item.name}】退回数量不能大于实际数量${item.realNum}`);
  //         hasError = true;
  //         break;
  //       }
  //     }
  //     if (hasError) return;
  //     submitData.value = tableData.map((item) => ({
  //       approveId: item.approveId,
  //       materialId: item.materialId,
  //       warehouseId: item.warehouseId,
  //       num: item.num,
  //       warehouseName: item.warehouseName,
  //       approveItemId: item.id,
  //     }));
  //     //提交表单
  //     await approveApply(submitData.value);
  //     await reload();
  //     createMessage.success('退库提交成功');
  //     closeModal();
  //     emit('success');
  //   } catch (error) {
  //     console.error('提交失败', error);
  //   }
  // };
  const handleSubmit = async () => {
    try {
      const tableData = getDataSource() || [];
      if (!tableData.length) {
        createMessage.warning('请选择物料');
        return;
      }
      const validData = tableData.filter((item) => item.num !== 0 && item.num >= 1);
      if (validData.length === 0) {
        createMessage.warning('请至少填写一项非0的退库数量后再提交');
        return;
      }
      let hasError = false;
      for (const item of validData) {
        const materialName = item.name || item.materialName;
        // 兜底校验：num<1（理论上handleNumChange已提示，此处兜底）
        if (item.num < 1) {
          createMessage.warning(`【${materialName}】请输入有效的退库数量（至少1）`);
          hasError = true;
          break;
        }
        // 核心校验：申请数量>实际数量
        if (item.num > item.realNum) {
          createMessage.warning(`【${materialName}】退库数量不能大于实际数量${item.realNum}`);
          hasError = true;
          break;
        }
      }
      if (hasError) return;

      // 步骤4：仅组装num≠0的数据提交
      submitData.value = validData.map((item) => ({
        approveId: approveId.value, // 改用父组件传递的approveId，确保参数正确
        materialId: item.materialId,
        warehouseId: item.warehouseId,
        num: item.num,
        warehouseName: item.warehouseName,
        approveItemId: item.id,
      }));
      // 提交表单
      await approveApply(submitData.value);
      await reload();
      createMessage.success('退库提交成功');
      closeModal();
      emit('success');
    } catch (error) {
      createMessage.error('退库提交失败，请重试');
      console.error('提交失败', error);
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
</style>
