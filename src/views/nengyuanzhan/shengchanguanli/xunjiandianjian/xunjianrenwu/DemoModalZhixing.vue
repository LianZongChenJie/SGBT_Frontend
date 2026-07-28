<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" class="mr3">
      <template #inspectTime="{ model, field }">
        <a-space>
          <!-- 主字段 -->
          <a-input-number v-model:value="model[field]" :min="0" placeholder="总分钟" style="width: 100px" disabled v-show="false" />

          <!-- 其它字段放到 rest -->
          <a-form-item-rest>
            <a-input-number v-model:value="model.inspectHour" :min="0" placeholder="小时" style="width: 80px" disabled />
            <span class="ml2 mr2" style="vertical-align: middle">小时</span>

            <a-input-number v-model:value="model.inspectMinute" :min="0" :max="59" placeholder="分钟" style="width: 80px" disabled />
            <span class="ml2 mr2" style="vertical-align: middle">分钟</span>
          </a-form-item-rest>

          <a-button type="primary" @click="calcTime(model)">计算</a-button>
        </a-space>
      </template>
    </BasicForm>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button
          v-if="hasPermission('operation:operation_inspection_task_detail:jump')"
          preIcon="ant-design:plus-outlined"
          type="primary"
          @click="handleSkip"
          >跳过巡检
        </a-button>
        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('巡检明细', getExportDetail, exportParams)">
          导出
        </a-button>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
    <DemoModalTiaoguoxunjian :isDisabled="isDisabled" @register="registerModalTiaoguoxunjian" @success="successTiaoguo" />
    <DemoModalZhixingxunjian :isDisabled="isDisabled" @register="registerModalZhixingxunjian" @success="successZXXJ" />
    <DemoModalImg :isDisabled="isDisabled" @register="registerModalImg" @success="successImg" />
    <template #insertFooter>
      <a-button @click="handleZancun">暂存</a-button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { usePermission } from '/@/hooks/web/usePermission';

  const { hasPermission } = usePermission();
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import {
    saveOrUpdateDemo,
    getDemoById,
    getSkip,
    getExportDetail,
    saveExecute,
    SaveInsDraft,
    getListByTaskId,
  } from './demo.api';
  import { BasicColumn, BasicTable, useTable, TableAction } from '@/components/Table';
  import DemoModalTiaoguoxunjian from './DemoModalTiaoguoxunjian.vue';
  import DemoModalZhixingxunjian from './DemoModalZhixingxunjian.vue';
  import DemoModalImg from './DemoModalImg.vue';
  import { useMethods } from '/@/hooks/system/useMethods';

  const { handleExportXls, handleImportXls } = useMethods();
  import { filterObj } from '/@/utils/common/compUtils';

  const [registerModalTiaoguoxunjian, { openModal: openModalTiaoguoxunjian }] = useModal();
  const [registerModalZhixingxunjian, { openModal: openModalZhixingxunjian }] = useModal();
  const [registerModalImg, { openModal: openModalImg }] = useModal();
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const id = ref(null);
  const detailId = ref(null);
  const isUpdate = ref(true);
  const checkedKeys = ref<Array<string | number>>([]);
  const checkedRows = ref<Array<string | number>>([]);
  const exportParams = computed(() => {
    let paramsForm = {
      id: id.value,
    };
    if (checkedKeys.value && checkedKeys.value.length > 0) {
      paramsForm['selections'] = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  const formSchema: FormSchema[] = [
    {
      field: 'id',
      label: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'createBy',
      label: 'createBy',
      component: 'Input',
      show: false,
    },
    {
      field: 'createTime',
      label: 'createTime',
      component: 'Input',
      show: false,
    },
    {
      field: 'baseTitle',
      component: 'Divider',
      label: '基础信息',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'taskCode',
      label: '任务编号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'taskName',
      label: '任务名称',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
      },
    },
    {
      field: 'planName',
      label: '计划名称',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
      },
    },
    {
      field: 'planSeq',
      label: '计划序号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
      },
    },
    {
      field: 'planStartTime',
      label: '计划开始时间',
      component: 'DatePicker',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'planEndTime',
      label: '计划结束时间',
      component: 'DatePicker',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      // labelWidth:140,
      colProps: { span: 24 },
      required: true,
      componentProps: {
        rows: 3,
        style: { width: '100%' },
      },
    },
    {
      field: 'baseTitle1',
      component: 'Divider',
      label: '巡检人员',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'teamName',
      label: '巡检班组',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
      },
    },
    {
      field: 'chargerName',
      label: '巡检人',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
      },
    },

    {
      field: 'baseTitle1',
      component: 'Divider',
      label: '巡检时间',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'actualStartTime',
      label: '巡检开始时间',
      component: 'DatePicker',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      field: 'actualEndTime',
      label: '巡检结束时间',
      component: 'DatePicker',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    // {
    //   field: 'durationMinutes',
    //   label: '巡检用时',
    //   component: 'Input',
    //   required: false,
    //   colProps: { span: 12 },
    //   componentProps: {
    //     disabled: true,
    //     suffix:'分钟'
    //   },
    //   // slot: 'inspectTime', // ⭐ 自定义插槽
    //   // componentProps:{
    //   //   disabled: true,
    //   // }
    // },
    //
    {
      field: 'baseTitle1',
      component: 'Divider',
      label: '巡检明细',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    // {
    //   field: 'itemTable111',
    //   label: '明细列表',
    //   slot: 'itemTable', // ⭐ 占位
    // }
  ];
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, getFieldsValue, validate,clearValidate }] = useForm({
    labelWidth: 150,
    labelCol: {span: 24},
    wrapperCol: {span: 24},
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    checkedKeys.value = [];
    checkedRows.value = [];
    detailId.value = null;
    setTableData([]);
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    if (data.createBy) {
      await setFieldsValue({ createBy: data.createBy });
    }
    if (data.createTime) {
      await setFieldsValue({ createTime: data.createTime });
    }
    if (unref(isUpdate)) {
      //获取详情
      id.value = data.record.id;
      data.record = await getDemoById({ id: data.record.id });
      //表单赋值

      await setFieldsValue({
        ...data.record,
      });
      clearValidate()
      let arr = await getListByTaskId({taskId:data.record.id})
      setTableData(arr || []);
      // if (arr && arr.details.length > 0) {
      //   checkedKeys.value = data.record.details.map((item) => item.detailId);
      // }
    }
  });
  //注册table数据

  const columnsTable: BasicColumn[] = [
    {
      title: '巡检项目数',
      dataIndex: 'totalItems',
      width: 130,
      resizable: true,
    },
    {
      title: '已检',
      dataIndex: 'checkedItems',
      width: 140,
      resizable: true,
    },
    {
      title: '未检',
      dataIndex: 'uncheckedItems',
      width: 140,
      resizable: true,
    },
    {
      title: '异常',
      dataIndex: 'abnormalItems',
      width: 140,
      resizable: true,
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      width: 140,
      resizable: true,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      width: 140,
      resizable: true,
    },
    {
      title: '规格型号',
      dataIndex: 'deviceModule',
      width: 140,
      resizable: true,
    },
    {
      title: '设备类型',
      dataIndex: 'category',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (text == 1) {
          return '设备';
        } else if (text == 2) {
          return '备件';
        } else if (text == 3) {
          return '工具';
        }
      },
    },
    // {
    //   title: '使用部门A',
    //   dataIndex: 'sysOrgCodeName',
    //   width: 140,
    //   resizable: true,
    // },
    //
    // {
    //   title: '存放位置A',
    //   dataIndex: 'insp323ectionCycle',
    //   width: 140,
    //   resizable: true,
    // },
    // {
    //   title: '执行时间A',
    //   dataIndex: '32ds',
    //   width: 140,
    //   resizable: true,
    // },
    {
      title: '跳过原因',
      dataIndex: 'skipReason',
      width: 140,
      resizable: true,
      customRender: ({ text }) => {
        if (!text) {
          return '-';
        }
      },
    },
  ];
  const [registerTable, { reload, setTableData, getDataSource }] = useTable({
    api: getListByTaskId,
    rowKey: 'id',
    columns: columnsTable,
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
    rowSelection: {
      type: 'checkbox',
      columnWidth: 50,
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },

    beforeFetch: (params) => {
      return {
        ...params,
        taskId: id.value
      };
    },
    actionColumn: {
      width: 150,
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
  function getActions(record) {
    return [
      {
        label: '执行巡检',
        onClick: handleEdit.bind(null, record),
        auth: 'operation:operation_inspection_task:execute',
      },
      {
        label: '上传图片',
        onClick: handleImg.bind(null, record),
        auth: 'operation:operation_inspection_task:execute',
      },
      // {
      //   label: '详情',
      //   onClick: handleDetail.bind(null, record),
      // },
      // {
      //   label: '删除',
      //   auth: 'energy:energy_device_info:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      //   popConfirm: {
      //     title: '是否确认删除',
      //     confirm: handleDelete.bind(null, record),
      //   },
      // },
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
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], selectedRows) {
    console.log('checkedKeys------>', checkedKeys);
    checkedKeys.value = selectedRowKeys;
    checkedRows.value = selectedRows;
    console.log('selectedRows------>', selectedRows);
  }

  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '执行巡检' : '执行巡检'));

  function handleSkip() {
    const record = {
      deviceIds: checkedKeys.value,
      // taskId:data.record.id,
      ...getFieldsValue(),
    };
    // console.log(record,'aaaaaaaaaaa');
    openModalTiaoguoxunjian(true, {
      record,
      isUpdate: true,
    });
  }

  function handleEdit(record) {
    detailId.value = record.id;
    console.log(record,'11111111');
    openModalZhixingxunjian(true, {
      record,
      isUpdate: true,
    });
  }

  function handleImg(record) {
    // console.log(record,'aaaaaaaaaaa');
    detailId.value = record.id;
    record.detailId = record.id
    openModalImg(true, {
      record,
      isUpdate: true,
    });
  }

  async function successTiaoguo() {
    // let obj = await getDemoById({ id: id.value });
    // setTableData(obj.details);
    // checkedKeys.value.
    reload()
  }

 async function successZXXJ() {
    // id.value = data.record.id;
    // let obj = await getDemoById({ id: id.value });
    // //表单赋值
    //
    // await setFieldsValue({
    //   ...obj,
    // });
    // clearValidate()
    // let arr = await getListByTaskId({taskId:id.value})
    // setTableData(arr);
    reload()
  }

  function successImg(record) {
    // let img = record.devicePic;
    // let arr = getDataSource();
    // // console.log(arr,'ccccccccccccc');
    // arr.forEach((item) => {
    //   if (item.id === detailId.value) {
    //     item.images = img;
    //   }
    // });
    // setTableData(arr);
    reload()
  }

  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      values.details = checkedRows.value.map((item) => {
        return {
          detailId:Number(item.id) ,
          results: item.results,
          images: item.images,
        };
      });
      const obj = {
        actualEndTime:values.actualEndTime,
        actualStartTime:values.actualStartTime,
        details:values.details,
        remark:values.remark,
        taskId:id.value
      }
      // console.log(values,'88888888888');
      setModalProps({ confirmLoading: true });
      //提交表单
      // await saveOrUpdateDemo(values, isUpdate.value);
      await saveExecute(obj);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', obj);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  //暂存
  async function handleZancun() {
    try {
      let values = await validate();
      values.details = checkedRows.value.map((item) => {
        return {
          detailId:Number(item.id) ,
          results: item.results,
          images: item.images,
        };
      });
      const obj = {
        actualEndTime:values.actualEndTime,
        actualStartTime:values.actualStartTime,
        details:values.details,
        remark:values.remark,
        taskId:id.value
      }
      setModalProps({ confirmLoading: true });
      //提交表单
      // await saveOrUpdateDemo(values, isUpdate.value);
      await SaveInsDraft(obj);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', obj);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  const calcTime = (model) => {
    model.inspectTime = model.inspectHour * 60 + model.inspectMinute;
    console.log(model.inspectTime);
  };
</script>
