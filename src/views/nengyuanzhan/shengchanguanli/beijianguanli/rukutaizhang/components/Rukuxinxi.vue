<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" class="mr3">
      <template #tableSlot>
        <BasicTable @register="registerTableUpdate" :rowSelection="rowSelectionFujian">
          <template #tableTitle>
            <!--        <BasicUpload :maxSize="20000" :maxNumber="10"  :api="uploadApi" class="my-5" :accept="['png/*']" />-->
            <!--          <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">上传文档 </j-upload-button>-->
            <!--        <j-upload-button type="primary" preIcon="ant-design:import-outlined"  @click="handleImport">上传文档 </j-upload-button>-->

            <a-button v-if="hasPermission('energy:energy_device_info:exportXls')" preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl,exportParams)">
              批量下载
            </a-button>
            <!--        <a-dropdown v-if="checkedKeysUpdate.length > 0">-->
            <!--          <template #overlay>-->
            <!--            <a-menu>-->
            <!--              <a-menu-item @click="batchHandleDeleteFujian">-->
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
            <TableAction :actions="getActionsUpdate(record)" />
          </template>
        </BasicTable>
      </template>

    </BasicForm>
  </a-spin>
</template>

<script lang="ts" setup>
import { watch, ref, unref, onMounted, computed } from 'vue';
import {BasicForm, FormSchema, useForm} from '/@/components/Form/index';
import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
import { getUserData } from '@/views/system/usersetting/UserSetting.api';
import { queryTreeList } from '@/api/common/api';
import { BasicColumn, BasicTable, TableAction } from '@/components/Table';
import { useListPage } from '@/hooks/system/useListPage';
import { getExportUrl } from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeitaizhang/demo.api';
import { usePermission } from '@/hooks/web/usePermission';
const { hasPermission } = usePermission();
import { useMethods } from '@/hooks/system/useMethods';
import { filterObj } from '@/utils/common/compUtils';
const { handleExportXls, handleImportXls } = useMethods();
const emit = defineEmits(['success']);
const props = defineProps({
  data: {type: Object, default: () => ({})},
  rootTreeData: {type: Array, default: () => []},
});
const loading = ref<boolean>(false);
// 当前是否是更新模式
const isUpdate = ref<boolean>(true);
const checkedKeysUpdate = ref<Array<string | number>>([]);
const exportParams = computed(() => {
  let paramsForm = {
    // id: id.value,
  };
  if (checkedKeysUpdate.value && checkedKeysUpdate.value.length > 0) {
    paramsForm['selections'] = checkedKeysUpdate.value.join(',');
  }
  return filterObj(paramsForm);
});
// 当前的弹窗数据
const model = ref<object>({});
function findEmployeeInfo(treeData: any[], employeeId: string | number, parentLabel = ''): { name: string; deptName: string } | null {
  if (!employeeId || !Array.isArray(treeData)) {
    return null;
  }
  for (const node of treeData) {
    if (String(node?.id) === String(employeeId)) {
      return {
        name: node?.label || '',
        deptName: parentLabel,
      };
    }
    if (Array.isArray(node?.children) && node.children.length) {
      const match = findEmployeeInfo(node.children, employeeId, node?.label || parentLabel);
      if (match) {
        return match;
      }
    }
  }
  return null;
}
const columnsTableUpdata: BasicColumn[] = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 130,
    resizable: true,
    ifShow: false,
  },
  {
    title: '文件名',
    dataIndex: 'fileName',
    width: 130,
    resizable: true,
  },
  {
    title: '上传时间',
    dataIndex: 'createTime',
    width: 130,
    resizable: true,
    ifShow: () => {
      return isUpdate.value;
    },
  },
  {
    title: '上传者',
    dataIndex: 'createBy',
    width: 130,
    resizable: true,
    ifShow: () => {
      return isUpdate.value;
    },
  },
  {
    title: '文档大小',
    dataIndex: 'fileSize',
    width: 130,
    resizable: true,
  },
];
const { tableContext: tableContextFujian, onImportXls } = useListPage({
  tableProps: {
    title: '',
    // api: getXunjianjihuafujianList,
    rowKey: 'id',
    columns: columnsTableUpdata,
    formConfig: {
      // schemas: searchFormSchema,
      autoAdvancedCol: 2,
    },
    striped: true,
    bordered: true,
    showIndexColumn: true,
    actionColumn: {
      width: 180,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  },
  exportConfig: {
    name: '下载模版',
    url: getExportUrl,
  },
});
const [registerTableUpdate, { setTableData: setTableDataFujian }] = tableContextFujian;
const rowSelectionFujian = {
  type: 'checkbox',
  columnWidth: 40,
  selectedRowKeys: checkedKeysUpdate,
  onChange: onSelectChangeUpdate,
};
function getActionsUpdate(record) {
  return [
    {
      label: '下载',
      // onClick: handleEdit.bind(null, record),
      // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
    },
    // {
    //   label: '预览',
    //   onClick: handleDetail.bind(null, record),
    // },
    // {
    //   label: '删除',
    //   popConfirm: {
    //     title: '是否确认删除',
    //     confirm: handleDeleteFujian.bind(null, record),
    //   },
    //   // auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
    // },
  ];
}
function onSelectChangeUpdate(selectedRowKeys: (string | number)[], selectedRows) {
  console.log('checkedKeys222------>', checkedKeys);
  checkedKeysUpdate.value = selectedRowKeys;
  selectedRowsFujian.value = selectedRows;
}
//注册表单
const schemas: FormSchema[] = [
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
  // {
  //   field: 'createTime',
  //   label: 'createTime',
  //   component: 'Input',
  //   show: false,
  // },
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
    field: 'sheetNo',
    label: '入库单号',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'subject',
    label: '入库主题',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'sheetType',
    label: '入库类型',
    component: 'Select',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      options:[
        {label:'普通入库',value:"1"},
        {label:'领用退还',value:"2"},
      ]
    },
  },
  {
    field: 'opDate',
    label: '入库日期',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'applicantName',
    label: '入库申请人',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'deptName',
    label: '所在部门',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  // {
  //   field: 'sysOrgCode',
  //   label: '所属部门',
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
  // {
  //   field: 'contactPhone',
  //   label: '仓库名称',
  //   component: 'Input',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps: {
  //     disabled: true,
  //   },
  // },
  // {
  //   field: 'contactPhone',
  //   label: '仓库管理员',
  //   component: 'Input',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps: {
  //     disabled: true,
  //   },
  // },
  {
    field: 'applicant',
    label: '入库人员',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  // {
  //   field: 'deptNam11e',
  //   label: '所在部门',
  //   component: 'Input',
  //   required: true,
  //   colProps: {span: 12},
  //   componentProps: {
  //     disabled: true,
  //   },
  // },

  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    required: true,
    colProps: {span: 24},
    componentProps: {
      rows: 3,
      disabled: true,
      style: { width: '100%' },
    },
  },
  // {
  //   field: 'baseTitle2',
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
  //   field: 'tableSlot',
  //   label: '',
  //   component: 'Input',
  //   slot: 'tableSlot',
  //   colProps: { span: 24 },
  //
  // },

];
const [registerForm, {resetFields, setFieldsValue}] = useForm({
  labelWidth:150,
  labelCol: {span: 24},
  wrapperCol: {span: 24},
  schemas,
  showActionButtonGroup: false,
});

onMounted(() => {
  // 禁用字段
  // updateSchema([
  //   {field: 'parentId', componentProps: {disabled: true}},
  //   {field: 'orgCode', componentProps: {disabled: true}},
  // ]);
  // // data 变化，重填表单
  watch(
    () => props.data,
    async (newValue) => {
      let record = unref(newValue);
      if (typeof record !== 'object') {
        record = {};
      }
      const employeeTree = await getTreeListRenyuan();
      const employeeInfo = findEmployeeInfo(employeeTree, record?.applicant);
      let currentUser = null;
      let deptName = record?.deptName || record?.departName || record?.sysOrgCode_dictText || employeeInfo?.deptName || '';
      let applicantDisplayName = record?.applicantName || employeeInfo?.name || '';
      if (!deptName) {
        currentUser = await getUserData();
        if (currentUser?.result?.id && String(currentUser.result.id) === String(record?.applicant)) {
          const deptList = await queryTreeList({ ids: currentUser.result.departIds });
          deptName = deptList?.[0]?.departName || '';
          applicantDisplayName = applicantDisplayName || currentUser.result.username || '';
        }
      }
      const normalizedRecord = {
        ...record,
        applicantName: applicantDisplayName || record?.createBy || '',
        deptName,
        applicant: applicantDisplayName || record?.createBy || record?.applicant || '',
      };
      await resetFields();
      await setFieldsValue({ ...normalizedRecord });
    },
    {deep: true, immediate: true}
  );

});


</script>
<style lang="less">
// update-begin-author:liusq date:20230625 for: [issues/563]暗色主题部分失效

@prefix-cls: ~'@{namespace}-j-depart-form-content';
/*begin 兼容暗夜模式*/
.@{prefix-cls} {
  background: @component-background;
  border-top: 1px solid @border-color-base;
}

/*end 兼容暗夜模式*/
// update-end-author:liusq date:20230625 for: [issues/563]暗色主题部分失效
</style>
