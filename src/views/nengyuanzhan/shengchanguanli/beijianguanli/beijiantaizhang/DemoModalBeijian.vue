<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @cancel="handleCancel" @ok="handleSubmit" width="80%">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--      <template #action="{ record }">-->
      <!--        <TableAction :actions="getActions(record)" />-->
      <!--      </template>-->
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { usePermission } from '/src/hooks/web/usePermission';

  const { hasPermission } = usePermission();
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/src/components/Modal';
  import {} from '../rukutaizhang/demo.api';
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { columns, searchFormSchema } from '@/views/nengyuanzhan/shengchanguanli/beijianguanli/beijiantaizhang/demo.data';
  import { getDemoList } from '@/views/nengyuanzhan/shengchanguanli/beijianguanli/beijiantaizhang/demo.api';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const checkedKeys = ref<Array<string | number>>([]);
  const selectedRows = ref<any[]>([]);
  const isUpdate = ref(true);
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '选择备件' : '选择备件'));
  const [registerTable, { reload }] = useTable({
    title: '',
    api: getDemoList,
    columns: columns,
    formConfig: {
      labelWidth: 120,
      schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
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
    useSearchForm: true,
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
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // reload()
    //重置表单
    checkedKeys.value = [];
    await reload();
    // await resetFields();
    // setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    // isUpdate.value = !!data?.isUpdate;
    // if (data.createBy) {
    //   await setFieldsValue({ createBy: data.createBy });
    // }
    // if (data.createTime) {
    //   await setFieldsValue({ createTime: data.createTime });
    // }
    // if (unref(isUpdate)) {
    //   //获取详情
    //   data.record = await getDemoById({ id: data.record.id });
    //   //表单赋值
    //   await setFieldsValue({
    //     ...data.record,
    //   });
    // }
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
  function onSelectChange(selectedRowKeys: (string | number)[], rows) {
    console.log('checkedKeys------>', checkedKeys);
    checkedKeys.value = selectedRowKeys;
    selectedRows.value = rows; // 👈 整条数据
    // selectedRows.value.forEach((row) => {
    //   row.deviceId =row.id;
    // })
    // console.log(selectedRows.value,'aaaaaaaaaa');
  }

  //表单提交事件
  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', selectedRows.value);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  function handleCancel() {
    closeModal();
    checkedKeys.value = [];
    selectedRows.value = [];
  }
</script>
