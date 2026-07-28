<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @cancel="handleCancel" @ok="handleSubmit" width="80%">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--      <template #action="{ record }">-->
      <!--        <TableAction :actions="getActions(record)" />-->
      <!--      </template>-->
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
            <a-radio :value="1">是</a-radio>
            <a-radio :value="0">否</a-radio>
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
          <a-radio :value="0">是</a-radio>
          <a-radio :value="1">否</a-radio>
        </a-radio-group>
      </template>
      <template #remark="{ record }">
        <a-textarea :disabled="isDisabled" v-model:value="record.remark" :rows="1"></a-textarea>
      </template>
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { usePermission } from '/@/hooks/web/usePermission';

  const { hasPermission } = usePermission();
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { columnsModalYulan, searchFormSchemaYulan } from './demo.data';
  import { BasicTable, TableAction, useTable } from '@/components/Table';
  import { getDemoListYulan } from '@/views/nengyuanzhan/shengchanguanli/xunjiandianjian/xunjianjihua/demo.api';
  import { saveDetailExecute } from '@/views/nengyuanzhan/shengchanguanli/xunjiandianjian/xunjianrenwu/demo.api';
  import { message } from 'ant-design-vue';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const checkedKeys = ref<Array<string | number>>([]);
  const checkedRows = ref<Array<string | number>>([]);
  const isUpdate = ref(true);
  const detailId = ref(0);
  const taskId = ref(0);
  //自定义接受参数
  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // reload()
    // 重置表单
    // await resetFields();
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    checkedKeys.value = [];
    checkedRows.value = [];
    detailId.value = 0;
    taskId.value = 0;
    setTableData([]);
    isUpdate.value = !!data?.isUpdate;
    // if (data.createBy) {
    //   await setFieldsValue({ createBy: data.createBy });
    // }
    // if (data.createTime) {
    //   await setFieldsValue({ createTime: data.createTime });
    // }
    if (unref(isUpdate)) {
      //获取详情
      detailId.value = data.record.id;
      taskId.value = data.record.taskId;
      console.log(data.record, '执行传过来的对象1111111');
      // if (data.record.itemIds) {
      //   let arr = await getDemoListYulan({ ids: data.record.itemIds, bizType: 2 });
      //
      //   setTableData(arr);
      //   console.log(data.record, '传过来的数据');
      //   console.log(arr,data.record.detailItems,'bbbbbbbbbbbb');
      //
      const detailItems = data.record.detailItems || [];
      if (detailItems.length > 0) {
        detailItems.forEach((item) => {
          normalizeTaskItem(item);
        });
        setTableData(detailItems);
        checkedRows.value = detailItems.filter((item) => hasTaskItemValue(item.actualValue));
        checkedKeys.value = checkedRows.value.map((item) => item.id);
        // checkedKeys.value = data.record.detailItems.map((item) =>{
        //   if(item.checked){
        //     return item.id
        //   }
        // });
      }
      // if (data.record.detailItems && data.record.detailItems.length > 0) {
      //   arr.forEach((item) => {
      //     // itemId
      //     if (item.resultType === 'checkbox') {
      //       item.actualValue = Array.isArray(item.actualValue)
      //         ? item.actualValue.filter(v => v != null && v !== '')
      //         : [];
      //     }
      //     data.record.detailItems.forEach((list) => {
      //       if (item.id === list.id) {
      //         Object.assign( list,item);
      //       }
      //     });
      //   });
      //   setTableData(arr);
      //   checkedKeys.value = data.record.detailItems.map((item) =>{
      //     if(item.actualValue){
      //       return item.id
      //     }
      //   });
      // }
      // } else {
      //   message.error('请绑定项目后再操作！');
      // }

      //表单赋值
      // await setFieldsValue({
      //   ...data.record,
      // });
      // console.log(data.record,'3333333');
    }
  });
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
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '执行巡检任务' : '执行巡检任务'));
  const [registerTable, { reload, setTableData, setProps }] = useTable({
    title: '',
    // api: getDemoListYulan,
    columns: columnsModalYulan,
    formConfig: {
      labelWidth: 120,
      schemas: searchFormSchemaYulan,
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
    pagination: false,
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
    console.log('checkedKeys------>', checkedKeys);
    checkedKeys.value = selectedRowKeys;
    checkedRows.value = selectedRows;
    console.log(checkedRows.value, '选择的对象');
  }

  //表单提交事件
  async function handleSubmit() {
    try {
      // let values = await validate();
      let values = checkedRows.value.map((item) => {
        return {
          exceptionDesc: item.remark,
          actualValue: Array.isArray(item.actualValue) ? `${item.actualValue}` : item.actualValue,
          isAbnormal: item.isAbnormal,
          itemId: item.id,
        };
      });
      const obj = {
        detailId: detailId.value,
        results: values,
        taskId: taskId.value,
      };
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveDetailExecute(obj);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  function handleCancel() {
    closeModal();
    // checkedKeys.value = [];
    // selectRows.value = [];
    // // update-begin--author:liaozhiyang---date:20230908---for：【issues/742】选择后删除默认仍然存在
    // tableRef.value.clearSelectedRowKeys();
    // update-end--author:liaozhiyang---date:20230908---for：【issues/742】选择后删除默认仍然存在
  }

  function hasTaskItemValue(value) {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  }
</script>
