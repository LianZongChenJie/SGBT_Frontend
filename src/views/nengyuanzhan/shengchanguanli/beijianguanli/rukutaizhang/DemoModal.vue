<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled" class="pr3">
      <template #tableSlotBeijian>
        <BasicTable @register="registerTableBeijian" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button preIcon="ant-design:plus-outlined" type="primary" @click="handleBeijian">添加</a-button>
<!--            <a-button preIcon="ant-design:export-outlined" type="primary"-->
<!--                      @click="handleExportXls('单表示例', getExportUrl, exportParams)"-->
<!--            >导入-->
<!--            </a-button>-->
<!--          </template>-->
<!--            <a-dropdown v-if="checkedKeys.length > 0">-->
<!--              <template #overlay>-->
<!--                <a-menu>-->
<!--                  <a-menu-item v-if="!hasPermission('operation:operation_inspection_point_plan:deleteBatch')"-->
<!--                               @click="batchHandleDelete">-->
<!--                    <Icon icon="ant-design:delete-outlined" />-->
<!--                    批量删除-->
<!--                  </a-menu-item>-->
<!--                </a-menu>-->
<!--              </template>-->
<!--              <a-button>-->
<!--                批量操作-->
<!--                <Icon icon="ant-design:down-outlined" />-->
<!--              </a-button>-->
<!--            </a-dropdown>-->
          </template>
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>

          <template #qty="{ record }">
            <a-input-number v-model:value="record.qty" style="width: 100%" placeholder="请输入" />
          </template>
          <template #remark="{ record }">
            <div style="display: flex; align-items: flex-start; gap: 8px; width: 100%">
              <a-textarea v-model:value="record.remark" :rows="1" style="flex: 1" placeholder="请输入" />
            </div>
          </template>
        </BasicTable>
      </template>
    </BasicForm>

    <DemoModalBeijian :isDisabled="isDisabled" @register="registerModalBeijian" @success="getShebeiID"></DemoModalBeijian>
  </BasicModal>
</template>
<script lang="ts" setup>
import { computed, ref, unref } from 'vue';
import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
import { BasicColumn, BasicTable, TableAction, useTable } from '@/components/Table';
import DemoModalBeijian from '../beijiantaizhang/DemoModalBeijian.vue';
import { getDemoById, saveOrUpdateDemo } from './demo.api';

const [registerModalBeijian, { openModal: openModalBeijian }] = useModal();
const { createMessage } = useMessage();
const checkedKeys = ref<Array<string | number>>([]);
// 声明Emits
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const columnsTableBeijian: BasicColumn[] = [
  {
    title: '备件编码',
    dataIndex: 'deviceCode',
    width: 170,
    resizable: true,
  },
  {
    title: '备件名称',
    dataIndex: 'deviceName',
    width: 170,
    resizable: true,
  },
  {
    title: '规格型号',
    dataIndex: 'deviceModule',
    width: 130,
    resizable: true,
  },
  {
    title: '备件类型',
    dataIndex: 'deviceTypeName',
    width: 130,
    resizable: true,
  },
  {
    title: '品牌',
    dataIndex: 'factory',
    width: 140,
    resizable: true,
  },
  {
    title: '单位',
    dataIndex: 'unit',
    width: 140,
    resizable: true,
  },
  {
    title: '当前库存',
    dataIndex: 'invQty',
    width: 140,
    resizable: true,
  },
  {
    title: '入库数量(必填)',
    dataIndex: 'qty',
    width: 140,
    resizable: true,
    slots: {customRender: 'qty'},
  },
  // {
  //   title: '存放位置',//后端给的是设备位置
  //   dataIndex: 'spaceId',
  //   width: 140,
  //   resizable: true,
  // },
  // {
  //   title: '备注',
  //   dataIndex: 'remark',
  //   width: 140,
  //   resizable: true,
  //   slots: {customRender: 'remark'},
  // },
];
const [registerTableBeijian,{setTableData,getDataSource}] = useTable({
  title: '',
  // api: getDemoListAll,
  columns: columnsTableBeijian,
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
  showTableSetting: true,
  clickToRowSelect: false,
  bordered: true,
  showIndexColumn: true,
  indexColumnProps: {
    fixed: 'left',
  },
  tableSetting: { fullScreen: true },
  canResize: false,
  rowKey: 'id',
  pagination: false, // 🔥 直接不显示分页
  beforeFetch: (params) => {
    return {
      ...params,
      // tabType: activeKey.value,
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
const rowSelection = {
  type: 'checkbox',
  columnWidth: 40,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
};
function onSelectChange(selectedRowKeys: (string | number)[]) {
  checkedKeys.value = selectedRowKeys;
}
function getActions(record) {
  return [
    // {
    //   label: '下载',
    //   // onClick: handleEdit.bind(null, record),
    //   // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
    // },
    // {
    //   label: '预览',
    //   onClick: handleDetail.bind(null, record),
    // },
    {
      label: '删除',
      popConfirm: {
        title: '是否确认删除',
        confirm: handleDeleteBeijian.bind(null, record),
      },
      // auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
    },
  ];
}
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
    label: '基本信息',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    field: 'sheetType',
    label: '入库类型',
    component: 'Select',
    required: true,
    colProps: {span: 12},
    componentProps: {
      options:[
        {label:'普通入库',value:'1'},
        {label:'领用退还',value:'2'}
      ]
    },
  },
  // {
  //   field: 'sheetNo',
  //   label: '入库单号',
  //   component: 'Input',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps: {
  //     disabled: true,
  //   },
  // },
  {
    field: 'subject',
    label: '入库主题',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      style: { width: '100%' },
    },
  },
  // {
  //   field: 'opDate',
  //   label: '入库日期',
  //   component: 'DatePicker',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps: {
  //     valueFormat: 'YYYY-DD-MM',
  //     disabled: false,
  //     style: { width: '100%' },
  //   },
  // },
  // {
  //   field: 'applicant',
  //   label: '入库申请人',
  //   component: 'Input',
  //   required: true,
  //   // show:false,
  //   colProps: {span: 12},
  //   componentProps: {
  //     disabled: true,
  //     style: { width: '100%' },
  //   },
  // },
  // {
  //   field: 'deptNameA',
  //   label: '所在部门',
  //   component: 'Input',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps: {
  //     disabled: true,
  //     style: { width: '100%' },
  //   },
  // },
  // {
  //   field: 'deptNa333meA',
  //   label: '仓库名称',
  //   component: 'Input',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps: {
  //     disabled: false,
  //     style: { width: '100%' },
  //   },
  // },
  // {
  //   field: 'deptNam33eA',
  //   label: '仓库管理员',
  //   component: 'Input',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps: {
  //     disabled: true,
  //     style: { width: '100%' },
  //   },
  // },
  // {
  //   field: 'chargerIdA',
  //   label: '入库人员',
  //   component: 'TreeSelect',
  //   required: false,
  //   colProps: {span: 12},
  //   componentProps: {
  //     style: { width: '100%' },
  //     disabled: false,
  //     // treeCheckable: true,
  //     // title: '下拉树',
  //     treeData: [], // 先给空
  //     fieldNames: {
  //       label: 'label',
  //       value: 'id',
  //       children: 'children',
  //     },
  //   },
  // },
  //
  // {
  //   field: 'sysOrgCode',
  //   label: '所在部门A',
  //   component: 'JSelectDept',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps:{
  //     disabled: true,
  //     showButton: false,
  //     style: {
  //       width: '100%',
  //     },
  //     labelKey:'departName',
  //     rowKey:'orgCode'
  //   }
  // },

  {
    field: 'remark',
    label: '退还原因',
    component: 'InputTextArea',
    required: false,
    ifShow: ({ values }) => {
      return values.sheetType === '2';
    },
    colProps: { span: 24 },
    componentProps: {
      rows: 3,
      disabled: false,
      style: { width: '100%' },
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    required: false,
    ifShow: ({ values }) => {
      return values.sheetType !== '2';
    },
    colProps: { span: 24 },
    componentProps: {
      rows: 3,
      disabled: false,
      style: { width: '100%' },
    },
  },

  {
    field: 'baseTitle2',
    component: 'Divider',
    label: '入库明细',
    componentProps: {
      //是否虚线
      dashed: false,
      //分割线标题的位置（left | right | center）
      orientation: 'left',
      //文字是否显示为普通正文样式
      plain:true,
      //水平还是垂直类型（horizontal | vertical）
      type:'horizontal',
    },
  },
  {
    field: 'tableSlot',
    label: '',
    component: 'Input',
    slot: 'tableSlotBeijian',
    colProps: { span: 24 },

  },

  // {
  //   field: 'baseTitle3',
  //   component: 'Divider',
  //   label: '附件',
  //   componentProps: {
  //     //是否虚线
  //     dashed: false,
  //     //分割线标题的位置（left | right | center）
  //     orientation: 'left',
  //     //文字是否显示为普通正文样式
  //     plain:true,
  //     //水平还是垂直类型（horizontal | vertical）
  //     type:'horizontal',
  //   },
  // },
  // {
  //   field: 'tableSlot1',
  //   label: '',
  //   component: 'Input',
  //   slot: 'tableSlotFujian',
  //   colProps: { span: 24 },
  //
  // },
];

//表单配置
const [registerForm, { clearValidate, resetFields, setFieldsValue, validate }] = useForm({
  labelWidth: 150,
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
  schemas: formSchema,
  showActionButtonGroup: false,
});
//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
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
    //表单赋值

    await setFieldsValue({
      ...data.record,
    });
    clearValidate();
    setTableData(data.record.spareParts || []);
  } else {
    setTableData([]);
  }
});


//设置标题
const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
function handleBeijian() {
  openModalBeijian(true, {
    record: {},
    isUpdate: false,
  });
}
function getShebeiID(record) {
  setTableData(record || []);
}


/**
 * 新增事件
 */
const isDisabled = ref(false);

function handleDeleteBeijian(record) {
  const arr = getDataSource().filter((item) => item.id !== record.id);
  setTableData(arr);
}

//表单提交事件
async function handleSubmit() {
  try {
    const values = await validate();
    const spareParts = getDataSource();
    if (!spareParts.length) {
      createMessage.warning('请先添加入库明细');
      return;
    }
    const hasInvalidQty = spareParts.some((item) => !item.qty || Number(item.qty) <= 0);
    if (hasInvalidQty) {
      createMessage.warning('请输入大于 0 的入库数量');
      return;
    }
    const arr = spareParts.map((item) => {
      return {
        deviceId: item.id,
        qty: item.qty,
      };
    });
    let obj = {
      ...values,
      spareParts: arr,
    };
    setModalProps({confirmLoading: true});
    //提交表单
    await saveOrUpdateDemo(obj, isUpdate.value);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', values);
  } finally {
    setModalProps({confirmLoading: false});
  }
}

</script>
