<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit"
    :width="900"
    :z-index="10000"
  >
    <BasicForm @register="registerForm">
      <template #materialName="{ model, field }">
        <a-select
          placeholder="请选择设备"
          v-model:value="model[field]"
          show-search
          style="width: 100%"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="filterOption"
          :not-found-content="null"
          :dropdownStyle="{zIndex: 10001}"
          :fieldNames="{value: 'id', label: 'completeNmae'}"
          :options="materialOptions"
        >
        </a-select>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
import BasicModal from '@/components/Modal/src/BasicModal.vue';
import { useForm } from '@/components/Form';
import BasicForm from '@/components/Form/src/BasicForm.vue';
import { useModalInner } from '@/components/Modal';
import { computed, ref } from 'vue';
import { saveApi } from '@/views/inventory/InventoryManage/api';
import { formSchema } from './data';
import { getAllMaterialList } from './api';
import { onMounted } from 'vue';

const emit = defineEmits(['success', 'register']);
const isUpdate = ref(true);
//表单配置
const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  //labelWidth: 150,
  schemas: formSchema,
  showActionButtonGroup: false,
});
//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({ confirmLoading: false });
  isUpdate.value = !!data?.isUpdate;
  //表单赋值
  await setFieldsValue({
    ...data.record,
  });
});
const getTitle = computed(() => (isUpdate ? '编辑' : '新增'));

async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    //提交表单
    await saveApi(values, isUpdate.value);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success');
  } finally {
    setModalProps({ confirmLoading: false });
  }
}

const materialData = ref<any>([]);
const materialOptions = ref<any>([]);

// 获取下拉框数据
const getMaterialNameData = async () => {
  let res = await getAllMaterialList();
  materialData.value = res;
  materialOptions.value = materialData.value
  materialOptions.value.forEach(item => {
    item.completeNmae = item.name + " " + item.typeName + " " + item.specification + " " + item.brand + " " + item.unit
  })
};

const filterOption = (inputValue, option) => {
  return option.name.includes(inputValue)
}

onMounted(async () => {
  await getMaterialNameData();
});
</script>
<style scoped>
.ant-input-number {
  width: 100%;
}
</style>
