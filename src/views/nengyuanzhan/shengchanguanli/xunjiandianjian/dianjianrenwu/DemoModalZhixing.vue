<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" style="padding-right: 20px">
      <!--      <template #inspectTime="{ model, field }">-->
      <!--        <a-space>-->
      <!--          &lt;!&ndash; 主字段 &ndash;&gt;-->
      <!--          <a-input-number-->
      <!--            v-model:value="model[field]"-->
      <!--            :min="0"-->
      <!--            placeholder="总分钟"-->
      <!--            style="width: 100px"-->
      <!--            disabled-->
      <!--            v-show="false"-->
      <!--          />-->

      <!--          &lt;!&ndash; 其它字段放到 rest &ndash;&gt;-->
      <!--          <a-form-item-rest>-->
      <!--            <a-input-number-->
      <!--              v-model:value="model.inspectHour"-->
      <!--              :min="0"-->
      <!--              placeholder="小时"-->
      <!--              style="width: 80px"-->
      <!--              disabled-->
      <!--            />-->
      <!--            <span class="ml2 mr2 " style="vertical-align: middle;">小时</span>-->

      <!--            <a-input-number-->
      <!--              v-model:value="model.inspectMinute"-->
      <!--              :min="0"-->
      <!--              :max="59"-->
      <!--              placeholder="分钟"-->
      <!--              style="width: 80px"-->
      <!--              disabled-->
      <!--            />-->
      <!--            <span class="ml2 mr2" style="vertical-align: middle;">分钟</span>-->
      <!--          </a-form-item-rest>-->

      <!--          <a-button type="primary" @click="calcTime(model)">计算</a-button>-->
      <!--        </a-space>-->
      <!--      </template>-->
      <template #tableSlot>
        <BasicTable @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button
              v-if="hasPermission('operation:operation_inspection_task:exportXls')"
              preIcon="ant-design:export-outlined"
              type="primary"
              @click="handleExportXls('点检明细', getExportUrl, exportParams)"
            >
              导出
            </a-button>
          </template>
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
          <template #resultType="{ record }">
            <div v-if="record.resultType === 'numerical'">
              <a-input-number
                :disabled="isDisabled"
                v-model:value="record.actualValue"
                placeholder="请输入数值，保留两位小数"
                style="width: 100%"
              ></a-input-number>
            </div>
            <div v-if="record.resultType === 'text'">
              <a-textarea :rows="1" :disabled="isDisabled" v-model:value="record.actualValue" placeholder="请输入长文本内容" />
            </div>
            <div v-if="record.resultType === 'radio'">
              <a-radio-group :disabled="isDisabled" v-model:value="record.actualValue">
                <a-radio value="1">是</a-radio>
                <a-radio value="0">否</a-radio>
              </a-radio-group>
            </div>
            <div v-if="record.resultType === 'checkbox'">
              <a-select
                :disabled="isDisabled"
                v-model:value="record.actualValue"
                mode="multiple"
                style="width: 100%"
                placeholder="请选择"
                allowClear
                showArrow
                :maxTagCount="1"
                :options="record.inspectionItemOptions"
                :fieldNames="{ label: 'optionLabel', value: 'optionLabel' }"
              />
              <!--          <a-input :disabled="isDisabled" v-model:value="record.actualValue" placeholder="如果多个，请使用“，”分割"></a-input>-->
            </div>
          </template>
          <template #isAbnormal="{ record }">
            <a-radio-group :disabled="isDisabled" v-model:value="record.isAbnormal">
              <a-radio :value="0">正常</a-radio>
              <a-radio :value="1">异常</a-radio>
            </a-radio-group>
          </template>
          <template #remark="{ record }">
            <a-textarea :disabled="isDisabled" v-model:value="record.remark" :rows="1"></a-textarea>
          </template>
        </BasicTable>
      </template>
    </BasicForm>

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
  import { getDemoById, getItemByTaskId, saveDetailDraft, saveDetailExecute, getExportUrl } from './demo.api';
  import { BasicColumn, BasicTable, useTable, TableAction } from '@/components/Table';
  import { useMethods } from '/@/hooks/system/useMethods';

  import { message } from 'ant-design-vue';
  import { filterObj, getFileAccessHttpUrl } from '@/utils/common/compUtils';
  const taskId = ref(0);
  const detailId = ref(0);
  const { handleExportXls } = useMethods();
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const checkedKeys = ref<Array<string | number>>([]);
  const checkedRows = ref<Array<string | number>>([]);
  const exportParams = computed(() => {
    const params: Record<string, unknown> = {
      id: taskId.value,
      taskId: taskId.value,
    };
    if (checkedKeys.value.length > 0) {
      params.selections = checkedKeys.value.join(',');
    }
    return filterObj(params);
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
      colProps: { span: 24 },
      required: true,
      componentProps: {
        rows: 3,
      },
    },

    {
      field: 'baseTitle2',
      component: 'Divider',
      label: '设备信息',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'deviceName',
      label: '设备名称',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
      },
    },
    {
      field: 'deviceCode',
      label: '设备编号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
      },
    },
    {
      field: 'deviceModule',
      label: '规格型号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
      },
    },
    {
      field: 'category',
      label: '设备类型',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        style: { width: '100%' },
        disabled: true,
      },
    },
    // {
    //   field: 'planName',
    //   label: '存放位置A',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     style: { width: '100%' },
    //     disabled: true,
    //   },
    // },
    // {
    //   field: 'sysOrgCode',
    //   label: '所属部门A',
    //   component: 'JSelectDept',
    //   colProps: {span: 12},
    //   componentProps: {
    //     showButton: false,
    //     style: {
    //       width: '100%',
    //     },
    //     labelKey: 'departName',
    //     rowKey: 'orgCode',
    //   },
    // },

    {
      field: 'baseTitle3',
      component: 'Divider',
      label: '点检人员',
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
      field: 'baseTitle4',
      component: 'Divider',
      label: '点检时间',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'actualStartTime',
      label: '点检开始时间',
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
      label: '点检结束时间',
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
    //   label: '点检用时',
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
      field: 'baseTitle5',
      component: 'Divider',
      label: '点检项目',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'tableSlot',
      label: '',
      component: 'Input',
      slot: 'tableSlot',
      colProps: { span: 24 },
    },

    {
      field: 'baseTitle5',
      component: 'Divider',
      label: '上传图片',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'images',
      label: '点检图片',
      required: false,
      helpMessage: '最多上传10张图片',
      component: 'JImageUpload',
      componentProps: {
        //按钮显示文字
        text: '上传图片',
        //支持两种基本样式picture和picture-card
        // listType:'picture-card',
        //用于控制文件上传的业务路径,默认temp
        // bizPath:'temp',
        //是否禁用
        disabled: false,
        //最大上传数量
        fileMax: 10,
      },
    },
  ];
  //表单配置

  const [registerForm, { resetFields, clearValidate, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 120,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    // baseColProps: { span: 24 },
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    checkedKeys.value = [];
    checkedRows.value = [];
    taskId.value = 0;
    detailId.value = 0;
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
      taskId.value = data.record.id;
      data.record = await getDemoById({ id: data.record.id });
      detailId.value = data.record.detailId;
      data.record.images = getFileAccessHttpUrl(data.record.images);
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      clearValidate();

      if (data.record.itemIds) {
        let arr = (await getItemByTaskId({ taskId: data.record.id })) || [];
        setTableData(arr);
        // let arr = await getDemoListYulan({ ids: data.record.itemIds, bizType: 1 });
        //
        // setTableData(arr);
        if (data.record.taskItems && data.record.taskItems.length > 0) {
          arr.forEach((item) => {
            normalizeTaskItem(item);
            // itemId
            data.record.taskItems.forEach((list) => {
              if (item.id === list.id) {
                Object.assign(item, list);
                normalizeTaskItem(item);
              }
            });
          });

          setTableData(arr);
          checkedRows.value = arr.filter((item) => hasTaskItemValue(item.actualValue));
          checkedKeys.value = checkedRows.value.map((item) => item.id);
        }
      } else {
        message.error('请绑定项目后再操作！');
      }
    }
  });
  //注册table数据
  function normalizeInspectionItemOptions(options) {
    if (!Array.isArray(options)) {
      return [];
    }

    const seenLabels = new Set<string>();

    return options
      .map((item, index) => {
        if (item == null) {
          return null;
        }

        if (typeof item === 'string' || typeof item === 'number') {
          const optionLabel = String(item).trim();
          return optionLabel ? { optionLabel, sortOrder: index + 1 } : null;
        }

        const option = item as Record<string, any>;
        const optionLabel = String(option.optionLabel ?? option.label ?? option.value ?? '').trim();
        if (!optionLabel) {
          return null;
        }

        return {
          ...option,
          optionLabel,
        };
      })
      .filter((item): item is Record<string, any> => {
        if (!item?.optionLabel || seenLabels.has(item.optionLabel)) {
          return false;
        }
        seenLabels.add(item.optionLabel);
        return true;
      });
  }

  function toArray(val) {
    if (Array.isArray(val)) return val; // 已经是数组
    if (!val) return []; // null / undefined / ''
    return String(val)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function normalizeTaskItem(item) {
    item.inspectionItemOptions = normalizeInspectionItemOptions(item.inspectionItemOptions);

    if (item.resultType !== 'checkbox') {
      return item;
    }

    const validOptionLabels = new Set((item.inspectionItemOptions || []).map((option) => String(option.optionLabel).trim()).filter(Boolean));

    item.actualValue = toArray(item.actualValue).filter((value) => validOptionLabels.has(String(value).trim()));
    return item;
  }

  const columnsTable: BasicColumn[] = [
    {
      title: '点检项目名称',
      dataIndex: 'itemName',
      width: 130,
      resizable: true,
    },
    {
      title: '点检项目编号',
      dataIndex: 'itemCode',
      width: 140,
      resizable: true,
    },
    {
      title: '点检部位',
      dataIndex: 'categoryName',
      width: 140,
      resizable: true,
    },
    {
      title: '点检方法',
      dataIndex: 'categoryName',
      width: 140,
      resizable: true,
    },
    // {
    //   title: '巡检分类',
    //   dataIndex: 'categoryId',
    //   width: 140,
    //   resizable: true,
    //   customRender: ({ text }) => {
    //     if (text === 1) {
    //       return '日计划';
    //     } else if (text === 2) {
    //       return '周计划';
    //     } else if (text === 3) {
    //       return '月计划';
    //     } else if (text === 4) {
    //       return '季计划';
    //     } else if (text === 5) {
    //       return '年计划';
    //     }
    //   },
    // },
    {
      title: '点检内容',
      dataIndex: 'content',
      width: 140,
      resizable: true,
    },
    {
      title: '判定标准',
      dataIndex: 'content',
      width: 140,
      resizable: true,
    },
    {
      title: '点检结果',
      dataIndex: 'resultType',
      width: 240,
      resizable: true,
      slots: { customRender: 'resultType' },
    },
    {
      title: '是否正常',
      dataIndex: 'isAbnormal',
      width: 170,
      resizable: true,
      slots: { customRender: 'isAbnormal' }, // ⭐ 自定义渲染
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 140,
      resizable: true,
      slots: { customRender: 'remark' }, // ⭐ 自定义渲染
    },
  ];
  const [registerTable, { reload, setTableData }] = useTable({
    // api: list,
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
    // rowSelection: {
    //   type: 'checkbox',
    //   columnWidth: 50,
    //   fixed: 'left',
    // },
    tableSetting: { fullScreen: true },
    // beforeFetch: (params) => {
    //   return Object.assign({column: 'createTime', order: 'desc'}, params);
    // },
    // actionColumn: {
    //   width: 150,
    //   title: '操作',
    //   dataIndex: 'action',
    //   slots: {customRender: 'action'},
    //   fixed: 'right',
    // },
  });

  /**
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    fixed: 'left',
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[], selectedRows) {
    checkedKeys.value = selectedRowKeys;
    checkedRows.value = selectedRows;
  }
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '执行点检' : '执行点检'));

  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      // console.log(values,'aaaaaaaaaa');
      let arr = checkedRows.value.map((item) => {
        return {
          exceptionDesc: item.remark,
          actualValue: Array.isArray(item.actualValue) ? `${item.actualValue}` : item.actualValue,
          isAbnormal: item.isAbnormal,
          itemId: item.itemId,
        };
      });
      const obj = {
        actualEndTime: values.actualEndTime,
        actualStartTime: values.actualStartTime,
        results: arr,
        remark: values.remark,
        taskId: taskId.value,
        detailId: detailId.value,
        images: values.images,
      };
      // console.log(values,'88888888888');
      setModalProps({ confirmLoading: true });
      //提交表单
      // await saveOrUpdateDemo(values, isUpdate.value);
      await saveDetailExecute(obj);
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
      let arr = checkedRows.value.map((item) => {
        return {
          exceptionDesc: item.remark,
          actualValue: Array.isArray(item.actualValue) ? `${item.actualValue}` : item.actualValue,
          isAbnormal: item.isAbnormal,
          itemId: item.itemId,
        };
      });
      const obj = {
        actualEndTime: values.actualEndTime,
        actualStartTime: values.actualStartTime,
        results: arr,
        remark: values.remark,
        taskId: taskId.value,
        detailId: detailId.value,
        images: values.images,
      };
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveDetailDraft(obj);
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
  };

  function hasTaskItemValue(value) {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  }
</script>
