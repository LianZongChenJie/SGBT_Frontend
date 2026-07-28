<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="1000px">
    <BasicForm @register="registerForm" />
    <!-- 子表单区域 -->
    <a-tabs>
      <a-tab-pane tab="会议室设备" key="tableRef">
        <JVxeTable
          ref="tableRef"
          stripe
          toolbar
          rowNumber
          rowSelection
          resizable
          keepSource
          :maxHeight="300"
          :checkbox-config="{ range: true }"
          :loading="table.loading"
          :columns="table.columns"
          :dataSource="table.dataSource"
        ></JVxeTable>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema, subColumns } from '../room.data';
  import { saveOrUpdate, queryFlowSelect, getDeviceList } from '../room.api';
  import JVxeTable from '/@/components/jeecg/JVxeTable/src/JVxeTable';
  import { validateTables } from '/@/utils/common/vxeUtils';

  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const flowNoDict = ref([]);
  const tableRef = ref(null);
  const tableRefs = { tableRef };
  // 设备信息
  const table = reactive({
    loading: false,
    dataSource: [],
    columns: subColumns,
  });
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    // labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { lg: 12, md: 24 },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    table.dataSource = [];
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      let depart = data.record.manageDepart;
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      await setFieldsValue({ manageDepart: depart });
      //查询子表数据
      let res = await getDeviceList({ id: data.record.id });
      if (res.success) {
        let { result } = res;
        table.dataSource = result;
      }
    }
    updateSchema({
      field: 'fitProcess',
      componentProps: {
        options: unref(flowNoDict),
        fieldNames:{ label:'bizName', value:'flowNo' },
      },
    });
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  /** 确定按钮点击事件 */
  async function handleSubmit() {
    /** 触发表单验证 */
    let values = await validate();
    let tables = Object.values(tableRefs);
    validateTables(tables).then((tableValue) => {
      let allValues = {
        ...values,
        eoaMettingDeviceList: tableValue[0].tableData,
      };
      requestAddOrEdit(allValues);
    });
  }

  /**
   * 请求保存
   * @param values
   */
  async function requestAddOrEdit(values) {
    setModalProps({ confirmLoading: true });
    //提交表单
    await saveOrUpdate(values, unref(isUpdate));
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success');
  }
  // 加载组件需要的流程信息
  async function loadFlowSelect() {
    let res = await queryFlowSelect();
    if (res && res.length>0) {
      flowNoDict.value = res;
    }
  }

  loadFlowSelect();
</script>
