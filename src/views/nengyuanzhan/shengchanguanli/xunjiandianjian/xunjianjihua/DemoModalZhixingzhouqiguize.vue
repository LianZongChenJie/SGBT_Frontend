<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @cancel="handleCancel"  @ok="handleSubmit" width="80%">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
<!--        <a-button  v-if="hasPermission('operation:operation_inspection_plan:add')"   preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd">新增</a-button>-->
        <!--        <a-button    preIcon="ant-design:plus-outlined" type="primary" @click="handleDetail">查看</a-button>-->
<!--        <a-button  preIcon="ant-design:export-outlined" type="primary" @click="onExportXls">导出</a-button>-->
        <!--            <a-button v-if="hasPermission('operation:operation_inspection_point_plan:exportTemplate')"  type="primary" @click="onExportXls">下载模版</a-button>-->
        <!--            <j-upload-button v-if="hasPermission('operation:operation_inspection_point_plan:importExcel')" type="primary" @click="onImportXls">导入计划</j-upload-button>-->

        <!--        <a-upload :customRequest="(file) => handleImportXls(file, getImportUrl, reload)" :showUploadList="false" name="file">-->
        <!--          <a-button preIcon="ant-design:import-outlined" type="primary">导入计划</a-button>-->
        <!--        </a-upload>-->
        <!--        <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)">-->
        <!--          下载模版-->
        <!--        </a-button>-->
<!--        <a-dropdown v-if="checkedKeys.length > 0">-->
<!--          <template #overlay>-->
<!--            <a-menu>-->
<!--              <a-menu-item v-if="hasPermission('operation:operation_inspection_plan:deleteBatch')" @click="batchHandleDelete">-->
<!--                <Icon icon="ant-design:delete-outlined" />-->
<!--                批量删除-->
<!--              </a-menu-item>-->
<!--            </a-menu>-->
<!--          </template>-->
<!--          <a-button>-->
<!--            批量操作-->
<!--            <Icon icon="ant-design:down-outlined" />-->
<!--          </a-button>-->
<!--        </a-dropdown>-->
      </template>
      <template #action="{ record }">
        <TableAction :actions="getActions(record)" />
      </template>
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
import { usePermission } from '/@/hooks/web/usePermission';

const { hasPermission } = usePermission();
import { ref, computed, unref } from 'vue';
import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
import {
  getDemoListGuize,
  saveOrUpdateDemoGuize, deleteDemoGuize, batchDeleteDemoGuize,
} from './demo.api';
import { BasicColumn, BasicTable, TableAction, useTable } from '@/components/Table';
import { filterObj } from '@/utils/common/compUtils';
// 声明Emits
const emit = defineEmits(['register', 'success']);
const checkedKeys = ref<Array<string | number>>([]);
const selectedRow = ref(null);
const isUpdate = ref(true);
const isDisabled = ref(false);
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
  //重置表单
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
//设置标题
const title = computed(() => (!unref(isUpdate) ? '选择执行规则' : '选择执行规则'));

const columnsModalGuize: BasicColumn[] = [
  {
    title: '规则名称',
    dataIndex: 'ruleName',
    width: 140,
    resizable: true,
  },
  {
    title: '执行规则类型',
    dataIndex: 'ruleType',
    width: 140,
    resizable: true,
    customRender: ({ text }) => {
      if (text == 1) {
        return '小时计划';
      } else if (text == 2) {
        return '日计划';
      } else if (text == 3) {
        return '周计划';
      } else if (text == 4) {
        return '月计划';
      } else if (text === 5){
        return '季计划';
      } else{
        return '年计划'
      }
    },
  },
  {
    title: '执行频率',
    dataIndex: 'factoryName',
    width: 140,
    resizable: true,
  },
  {
    title: '执行间隔',
    dataIndex: 'frequencyInterval',
    width: 140,
    resizable: true,
  },
  {
    title: '规则描述',
    dataIndex: 'ruleDescription',
    resizable: true,
    width: 140,
  },
];

const searchFormSchemaGuize: FormSchema[] = [
  {
    field: 'ruleName',
    label: '规则名称',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },

  {
    field: 'ruleType',
    label: '执行规则类型',
    component: 'Select',
    // defaultValue:1,
    componentProps: {
      options: [
        { label: '小时计划', value: 1 },
        { label: '日计划', value: 2 },
        { label: '周计划', value: 3 },
        { label: '月计划', value: 4 },
        { label: '季计划', value: 5 },
        { label: '年计划', value: 6 },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'plan11Name',
    label: '执行频率',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },
  {
    field: 'frequencyInterval',
    label: '执行间隔',
    component: 'Input',
    componentProps: {
    },
    colProps: { span: 8 },
  },

];

const [registerTable, { reload, setProps }] = useTable({
  title: '',
  api: getDemoListGuize,
  columns: columnsModalGuize,
  formConfig: {
    labelWidth: 120,
    schemas: searchFormSchemaGuize,
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
  //定义rowSelection的类型，默认是checkbox多选，可以设置成radio单选
  // rowSelection: { type: 'radio' },
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
function getActions(record) {
  return [
    // {
    //   label: '编辑',
    //   // auth: 'operation:operation_course_material:edit',
    //   onClick: handleEdit.bind(null, record),
    // },
    // // {
    // //   label: '详情',
    // //   onClick: handleDetail.bind(null, record),
    // // },
    // {
    //   label: '删除',
    //   // auth: 'operation:operation_course_material:delete',
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
  type: 'radio',
  columnWidth: 40,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
};

const exportParams = computed(() => {
  let paramsForm = {};
  if (checkedKeys.value && checkedKeys.value.length > 0) {
    paramsForm['selections'] = checkedKeys.value.join(',');
  }
  return filterObj(paramsForm);
});
/**
 * 选择事件
 */
function onSelectChange(selectedRowKeys: (string | number)[],selectedRows) {
  console.log('checkedKeys------>', selectedRow);
  checkedKeys.value = selectedRowKeys;
  selectedRow.value = selectedRows[0];

  console.log(selectedRow.value,'00000');
}
function handleAdd() {
  isDisabled.value = false;
  openModal(true, {
    isUpdate: false,
  });
}

/**
 * 编辑事件
 */
function handleEdit(record) {
  isDisabled.value = false;
  openModal(true, {
    record,
    isUpdate: true,
  });
}

/**
 * 详情页面
 */
function handleDetail(record) {
  isDisabled.value = true;
  openModal(true, {
    record,
    isUpdate: true,
  });
}

/**
 * 删除事件
 */
async function handleDelete(record) {
  await deleteDemoGuize({ id: record.id }, reload);
}

/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDeleteDemoGuize({ ids: checkedKeys.value }, reload);
}
//表单提交事件
async function handleSubmit(v) {
  try {
    // let values = await validate();
    setModalProps({ confirmLoading: true });
    //提交表单
    // await saveOrUpdateDemoGuize(values, isUpdate.value);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', selectedRow.value);
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
</script>
