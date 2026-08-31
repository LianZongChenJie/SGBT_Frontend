<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @cancel="handleCancel" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled"> </BasicForm>
    <a-button v-if="hasPermission('operation:operation_course_material:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"
      >添加资料
    </a-button>
    <!--    <a-dropdown v-if="checkedKeys.length > 0">-->
    <!--      <template #overlay>-->
    <!--        <a-menu>-->
    <!--          <a-menu-item v-if="hasPermission('operation:operation_course_material:deleteBatch')" key="1" @click="batchHandleDelete">-->
    <!--            <Icon icon="ant-design:delete-outlined"></Icon>-->
    <!--            删除-->
    <!--          </a-menu-item>-->
    <!--        </a-menu>-->
    <!--      </template>-->
    <!--      <a-button-->
    <!--        >批量操作-->
    <!--        <Icon style="fontsize: 12px" icon="ant-design:down-outlined"></Icon>-->
    <!--      </a-button>-->
    <!--    </a-dropdown>-->
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DemoModal1 @register="registerModal1" @success="changeLists" :isDisabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { usePermission } from '/@/hooks/web/usePermission';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';

  const { hasPermission } = usePermission();
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import DemoModal1 from './DemoModal1.vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { columnsModal, formSchema, searchFormSchema } from './demo.data';
  import { buildCoursePayload, getDemoById, saveOrUpdateDemo } from './demo.api';
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const checkedKeys = ref<Array<string | number>>([]);
  const newArr = ref<Recordable[]>([]);
  const isUpdate = ref(true);
  const isDisabled = ref(false);
  const currentRecordId = ref<string | number>();
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const [registerModal1, { openModal }] = useModal();
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    // labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: {
      span: 8, // 24 / 8 = 3 个
    },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    currentRecordId.value = data?.record?.id;
    if (data.createBy) {
      await setFieldsValue({ createBy: data.createBy });
    }
    if (data.createTime) {
      await setFieldsValue({ createTime: data.createTime });
    }
    if (unref(isUpdate)) {
      //获取详情
      data.record = await getDemoById({ id: data.record.id });
      currentRecordId.value = data.record?.id ?? currentRecordId.value;
      data.record.coverImage = getFileAccessHttpUrl(data.record.coverImage);
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      data.record.materials.forEach((item) => {
        item.id = item.materialId;
      });
      newArr.value = [...data.record.materials];

      //给资料table赋值
      setTableData(newArr.value);
    } else {
      newArr.value = [];
      setTableData([]);
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  const [registerTable, { reload, setProps, setTableData }] = useTable({
    title: '',
    // api: getDemoList1,
    columns: columnsModal,
    formConfig: {
      //labelWidth: 120,
      // schemas: searchFormSchema,
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
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record: Recordable) {
    return [
      // {
      //   label: '编辑',
      //   auth: 'operation:operation_course_material:edit',
      //   onClick: handleEdit.bind(null, record),
      // },
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
    showCheckbox: false,
  };

  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

  function handleAdd() {
    isDisabled.value = false;
    openModal(true, {
      isUpdate: false,
      selectedIds: newArr.value.map((item) => item.id),
    });
  }

  /**
   * 编辑事件
   */
  function handleEdit(record: Recordable) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 详情页面
   */
  function handleDetail(record: Recordable) {
    isDisabled.value = true;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record: Recordable) {
    newArr.value = newArr.value.filter((item) => item.id !== record.id);
    setTableData(newArr.value);
  }

  //表单提交事件
  async function handleSubmit(v) {
    try {
      let values = await validate();
      if (isUpdate.value && values.id == null) {
        values.id = currentRecordId.value;
      }
      const materialIds = newArr.value.map((item) => item.id).join(',');
      Object.assign(values, { materialIds });
      const payload = buildCoursePayload(values);
      setModalProps({ confirmLoading: true });
      await saveOrUpdateDemo(payload, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', payload);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  function handleCancel() {
    closeModal();
  }

  function changeLists(arr: Recordable[]) {
    const mergedMap = new Map<string | number, Recordable>();
    [...newArr.value, ...arr].forEach((item) => {
      const key = item.id ?? item.materialId;
      if (key == null) {
        return;
      }
      mergedMap.set(key, { ...item, id: key });
    });
    newArr.value = Array.from(mergedMap.values()).map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));
    setTableData(newArr.value);
  }
</script>
