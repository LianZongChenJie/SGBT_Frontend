<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm" :disabled="isDisabled" />
    <a-row class="ml3 patrol-group-row">
      <a-col :span="24">
        <div class="patrol-group-field">
          <span class="patrol-group-field__label"><span class="patrol-group-field__required">*</span>调用摄像机组：</span>
          <a-tree-select
            v-model:value="fenzuValue"
            show-search
            :multiple="true"
            :maxTagCount="3"
            class="patrol-group-field__control"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="调用摄像机组"
            allow-clear
            tree-default-expand-all
            :tree-data="treeData"
            tree-node-filter-prop="label"
            :fieldNames="{ children: 'children', label: 'groupName', value: 'id', key: 'id' }"
          />
        </div>
      </a-col>
    </a-row>
    <!--        <a-button @click="addRenyuan" preIcon="ant-design:plus-outlined" type="primary" class="ml4">添加人员</a-button>-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection" class="ml2">
      <template #tableTitle>
        <a-button :disabled="checkedKeys.length < 1" type="primary" @click="handleEdit">批量编辑</a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
      <template #sort="{ index }">
        <Icon @click="moveUp(index)" icon="ant-design:arrow-up-outlined" />
        <Icon @click="moveDown(index)" icon="ant-design:arrow-down-outlined" />
      </template>
    </BasicTable>
  </BasicModal>
  <DemoModalEdit :isDisabled="isDisabled" @register="registerModalEdit" @success="sucessEdit" />
</template>
<script lang="ts" setup>
  import { Icon } from '/@/components/Icon';
  import { ref, computed, unref, watch, reactive } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './demo.data';
  import { saveOrUpdateDemo, getDemoById } from './demo.api';
  import { BasicColumn, BasicTable, TableAction, useTable } from '@/components/Table';
  import { message } from 'ant-design-vue';
  import DemoModalEdit from './DemoModalEdit.vue';
  import { getTreeListShipinjiankongfenzu } from '@/views/nengyuanzhan/anhuanguanli/shebeiguankong/shipinjiankongfenzu/demo.api';
  import { getDemoList } from '@/views/nengyuanzhan/anhuanguanli/shebeiguankong/shipinshebeiguanli/demo.api';

  const [registerModalEdit, { openModal: openModalEdit }] = useModal();
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const treeData = ref([]);
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const getEditForm = reactive({});
  const checkedKeys = ref<Array<string | number>>([]);
  const editingDeviceIds = ref<Set<string>>(new Set());
  const fenzuValue = ref<Array<string | number>>([]);
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    //labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  const columnsTable: BasicColumn[] = [
    {
      title: '摄像头名称',
      dataIndex: 'deviceName',
      width: 150,
      resizable: true,
    },
    {
      title: '播放时长(秒)',
      dataIndex: 'playDuration',
      width: 80,
      resizable: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 70,
      slots: {
        customRender: 'sort',
      },
      // edit: true,
      // editComponent: 'DatePicker',
      // editComponentProps: {
      //   showTime: true,
      //   timer:true,
      //   valueFormat: 'YYYY-MM-DD HH:mm',
      //   format: 'YYYY-MM-DD HH:mm',
      // },
    },
  ];
  const [registerTable, { getDataSource, setTableData }] = useTable({
    title: '摄像机名称',
    // api: getDemoListAll,
    columns: columnsTable,
    formConfig: {
      //labelWidth: 120,
      // schemas: searchFormSchema,
      // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
      // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
      autoAdvancedCol: 3,
      actionColOptions: {
        style: { textAlign: 'left' },
      },
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
    tableSetting: { fullScreen: true },
    canResize: false,
    pagination: false, // 🔥 直接不显示分页
    rowKey: 'id',
    // beforeFetch: (params) => {
    //   return {
    //     ...params,
    //     tabType: activeKey.value,
    //   };
    // },
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    checkedKeys.value = [];
    fenzuValue.value = [];
    setTableData([]);
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;
    if (data.createBy) {
      await setFieldsValue({ createBy: data.createBy });
    }
    if (data.createTime) {
      await setFieldsValue({ createTime: data.createTime });
    }
    if (unref(isUpdate)) {
      //获取详情
      data.record = await getDemoById({ id: data.record.id });
      Object.assign(getEditForm, data.record);
      //表单赋值
      fenzuValue.value = (data.record.deviceItems || []).map((item) => item.videoGroupId);
      await setFieldsValue({
        ...data.record,
      });
    }
  });

  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    fixed: 'left',
    onChange: onSelectChange,
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], _selectedRows) {
    checkedKeys.value = selectedRowKeys;
  }

  function getActions(record) {
    return [
      // {
      //   label: '下载',
      //   onClick: handleDownLoad.bind(null, record),
      //   // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      //
      // },
      // {
      //   label: '预览',
      //   onClick: handleDetail.bind(null, record),
      // },
      {
        label: '编辑',
        onClick: handleRowEdit.bind(null, record),
      },
      {
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        // auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
    ];
  }

  function handleEdit() {
    const selectedIdSet = new Set(checkedKeys.value.map((key) => String(key)));
    const selectedRows = getDataSource().filter((item) => selectedIdSet.has(String(item.id)));
    if (!selectedRows.length) {
      message.warning('请勾选需要修改播放时长的摄像头');
      return;
    }
    editingDeviceIds.value = new Set(selectedRows.map((item) => String(item.id)));
    openModalEdit(true, {
      editMode: 'batch',
      record: {
        playDuration: selectedRows[0].playDuration,
        interactionCount: getEditForm.interactionCount,
      },
    });
  }

  function handleRowEdit(record) {
    editingDeviceIds.value = new Set([String(record.id)]);
    openModalEdit(true, {
      editMode: 'single',
      record: {
        playDuration: record.playDuration,
        interactionCount: getEditForm.interactionCount,
      },
    });
  }

  async function handleDelete(record) {
    let arr = getDataSource();
    arr.forEach((item, index) => {
      if (item.id === record.id) {
        arr.splice(index, 1);
      }
    });
    setTableData(arr);
  }

  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

  const getFenzu = async () => {
    treeData.value = await getTreeListShipinjiankongfenzu();
  };
  getFenzu();
  const sucessEdit = (values) => {
    // console.log(`selected ${value}`);
    // nextTick(()=>{
    //   setFieldsValue({
    //     playDuration: values.playDuration,
    //     interactionCount: values.interactionCount,
    //   });
    // })

    const playDuration = Number(values.playDuration);
    if (!Number.isInteger(playDuration) || playDuration < 1 || playDuration > 3600) {
      message.warning('播放时长请输入 1 至 3600 秒之间的整数');
      return;
    }
    Object.assign(getEditForm, { interactionCount: values.interactionCount });
    const arr = getDataSource();
    arr.forEach((item) => {
      if (editingDeviceIds.value.has(String(item.id))) {
        item.playDuration = playDuration;
        item.interactionCount = values.interactionCount;
      }
    });
    setTableData(arr);
    editingDeviceIds.value = new Set();
  };

  const moveUp = (index) => {
    let arr = getDataSource();
    if (index === 0) return; // 第一条不能上移

    const temp = arr[index];
    arr[index] = arr[index - 1];
    arr[index - 1] = temp;
    setTableData(arr);
  };
  const moveDown = (index) => {
    let arr = getDataSource();
    if (index === arr.length - 1) return; // 最后一条不能下移

    const temp = arr[index];
    arr[index] = arr[index + 1];
    arr[index + 1] = temp;
    setTableData(arr);
  };

  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      let arr = getDataSource();
      const groups = Array.isArray(fenzuValue.value) ? fenzuValue.value : [];
      const selectedKeySet = new Set(checkedKeys.value.map((key) => String(key)));
      const selectedRows = arr.filter((item) => selectedKeySet.has(String(item.id)));
      const submitRows = unref(isUpdate) && selectedRows.length < 1 ? arr : selectedRows;

      if (!unref(isUpdate)) {
        if (groups.length < 1) {
          message.warning('请选择摄像机组');
          return;
        }
        if (arr.length < 1) {
          message.warning('摄像头列表不能为空');
          return;
        }
        if (selectedRows.length < 1) {
          message.warning('请勾选需要提交的摄像头');
          return;
        }
      }

      values.playDuration = getEditForm.playDuration ?? values.playDuration;
      values.interactionCount = getEditForm.interactionCount ?? values.interactionCount;
      values.videoGroupIds = groups.join(',');
      values.deviceItems = submitRows.map((item, i) => {
        return {
          deviceId: item.id,
          sortOrder: i + 1,
          videoGroupId: item.videoGroupId,
          playDuration: item.playDuration,
        };
      });
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateDemo(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  watch(
    () => fenzuValue.value,
    async (newVal) => {
      const groups = Array.isArray(newVal) ? newVal : [];
      if (!groups.length) {
        setTableData([]);
        checkedKeys.value = [];
        return;
      }
      try {
        const results = await Promise.all(
          groups.map(async (item) => {
            const obj = await getDemoList({ videoGroupId: item });
            return obj.records || [];
          })
        );
        const merged = results.flat();
        // 以设备ID去重，避免多分组交叉导致重复摄像头
        const mapById = new Map();
        merged.forEach((item) => {
          if (!mapById.has(item.id)) {
            mapById.set(item.id, item);
          }
        });
        const finalArray = Array.from(mapById.values());
        if (getEditForm.playDuration) {
          finalArray.forEach((item) => {
            item.playDuration = getEditForm.playDuration;
          });
        }
        setTableData(finalArray);
        if (finalArray.length < 1) {
          checkedKeys.value = [];
        }
      } catch (error) {
        console.error('加载摄像头失败', error);
      }
    },
    { deep: true }
  );
</script>
<style lang="less" scoped>
  .patrol-group-row {
    margin-bottom: 12px;
  }

  .patrol-group-field {
    display: flex;
    align-items: center;
  }

  .patrol-group-field__label {
    flex: 0 0 150px;
    padding-right: 12px;
    color: rgba(0, 0, 0, 0.85);
    text-align: right;
    white-space: nowrap;
  }

  .patrol-group-field__required {
    margin-right: 4px;
    color: #ff4d4f;
    font-family: SimSun, sans-serif;
  }

  .patrol-group-field__control {
    flex: 1;
    width: 100%;
  }
</style>
