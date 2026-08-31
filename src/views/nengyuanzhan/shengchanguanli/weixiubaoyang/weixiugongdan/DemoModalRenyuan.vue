<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @cancel="handleCancel"  @ok="handleSubmit" width="80%">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
<!--      <template #action="{ record }">-->
<!--        <TableAction :actions="getActions(record)" />-->
<!--      </template>-->
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
import { usePermission } from '/@/hooks/web/usePermission';

const { hasPermission } = usePermission();
import { ref, computed, unref } from 'vue';
import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
import { BasicColumn, BasicTable, FormSchema, TableAction, useTable } from '@/components/Table';
import { getDemoList } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
import { render } from '@/utils/common/renderUtils';
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
const columnsModalRenyuan: BasicColumn[] = [
  {
    title: '人员姓名',
    dataIndex: 'employeeName',
    width: 170,
    resizable: true,
  },{
    title: '人员编码',
    dataIndex: 'employeeCode',
    width: 170,
    resizable: true,
  },
  {
    title: '人员类型',
    dataIndex: 'employeeType',
    width: 170,
    resizable: true,
    // dictCode: 'employeeType',
    customRender: ({ text }) => {
      return render.renderDict(text, 'employeeType');
    },
  },
  {
    title: '单位',
    dataIndex: 'company',
    width: 130,
    resizable: true,
  },
  {
    title: '证件号码',
    dataIndex: 'idCard',
    width: 140,
    resizable: true,
  },
  {
    title: '岗位',
    dataIndex: 'position',
    width: 140,
    resizable: true,
  },
  {
    title: '所属部门',
    dataIndex: 'sysOrgCode',
    width: 140,
    resizable: true,
  },
  {
    title: '联系方式',
    dataIndex: 'contactNo',
    width: 140,
    resizable: true,
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    width: 140,
    resizable: true,
  },{
    title: '创建时间',
    dataIndex: 'createTime',
    width: 140,
    resizable: true,
  },{
    title: '修改人',
    dataIndex: 'updateBy',
    width: 140,
    resizable: true,
  },{
    title: '修改时间',
    dataIndex: 'updateTime',
    width: 140,
    resizable: true,
  },
];
const searchFormSchemaRenyuan: FormSchema[] = [
  {
    field: 'employeeName',
    label: '人员姓名',
    component: 'Input',
    colProps: { span: 10 },
    componentProps: {
    }
  },
  {
    field: 'employeeCode',
    label: '人员编码',
    component: 'Input',
    colProps: { span: 10 },
    componentProps: {
    }
  },
  {
    field: 'employeeType',
    label: '人员类型',
    component: 'JDictSelectTag',
    colProps: { span: 10 },
    componentProps: {
      dictCode: 'employeeType',
    },
  },
  {
    field: 'company',
    label: '单位',
    component: 'Input',
    colProps: { span: 10 },
    componentProps: {
    }
  },
];
//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  // reload()
  //重置表单
  checkedKeys.value = []
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
const title = computed(() => (!unref(isUpdate) ? '添加人员' : '添加人员'));
const [registerTable, ] = useTable({
  title: '',
  api: getDemoList,
  columns: columnsModalRenyuan,
  formConfig: {
    labelWidth: 120,
    schemas: searchFormSchemaRenyuan,
    // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
    // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
    autoAdvancedCol: 3,
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

/**
 * 选择列配置
 */
const rowSelection = {
  type: 'radio',//checkbox radio
  columnWidth: 40,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
};

/**
 * 选择事件
 */
function onSelectChange(selectedRowKeys: (string | number)[],rows) {
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
    emit('success', selectedRows.value[0]);
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
