<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm">
      <!--      tableSlot-->
      <template #tableSlot>
        <BasicTable @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <a-button
              v-if="hasPermission('operation:operation_base_repair_order:exportXls')"
              preIcon="ant-design:export-outlined"
              type="primary"
              @click="handleExportXls('单表示例', getExportUrl, exportParams)"
            >
              导出
            </a-button>
          </template>
          <template v-if="checkedKeys.length > 0" #tableTitle>
            <a-button
              v-if="hasPermission('operation:operation_base_repair_order:exportXls')"
              preIcon="ant-design:export-outlined"
              type="primary"
              @click="handleExportXls('单表示例', getExportUrl, exportParams)"
            >
              批量下载
            </a-button>
            <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('operation:operation_base_repair_order:edit')">
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="hasPermission('operation:operation_base_repair_order:edit')" @click="batchHandleDelete">
                    <Icon icon="ant-design:delete-outlined" />
                    批量删除
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>
                批量操作
                <Icon icon="ant-design:down-outlined" />
              </a-button>
            </a-dropdown>
          </template>
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
        </BasicTable>
      </template>
    </BasicForm>
  </a-spin>
</template>

<script lang="ts" setup>
  import { watch, computed, inject, ref, unref, onMounted } from 'vue';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { getDemoList, saveOrUpdateDemo } from '../demo.api';
  import { useBasicFormSchema } from '../demo.data';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicColumn, BasicTable, TableAction, useTable } from '@/components/Table';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
  import { getExportUrl } from '@/views/nengyuanzhan/shengchanguanli/shebeiguanli/shebeitaizhang/demo.api';
  const { hasPermission } = usePermission();

  const { prefixCls } = useDesign('j-depart-form-content');
  const selectedRowKeys = ref<Array<string | number>>([]);
  const checkedKeys = ref<Array<string | number>>([]);
  const emit = defineEmits(['success']);
  const props = defineProps({
    data: { type: Object, default: () => ({}) },
    rootTreeData: { type: Array, default: () => [] },
  });
  const loading = ref<boolean>(false);
  // 当前是否是更新模式
  const isUpdate = ref<boolean>(true);
  // 当前的弹窗数据
  const model = ref<object>({});

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
    {
      field: 'createTime',
      label: 'createTime',
      component: 'Input',
      show: false,
    },
    {
      field: 'baseTitle',
      component: 'Divider',
      label: '更换备件',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'applyNo',
      label: '领用单号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'theme',
      label: '领用主题',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'applyTime',
      label: '申请时间',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    // {
    //   field: 'warehouseName',
    //   label: '仓库名称',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     disabled: true,
    //   },
    // },
    {
      field: 'applicantName',
      label: '领用申请人',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'deptName',
      label: '所在部门',
      component: 'JSelectDept',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        showButton: false,
        style: {
          width: '100%',
        },
        labelKey: 'departName',
        rowKey: 'orgCode',
      },
    },
    {
      field: 'applyReason',
      label: '领用原因',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      required: true,
      colProps: { span: 24 },
      componentProps: {
        rows: 3,
        disabled: true,
      },
    },

    {
      field: 'baseTitle3',
      component: 'Divider',
      label: '备件信息',
      componentProps: {
        //是否虚线
        dashed: false,
        //分割线标题的位置（left | right | center）
        orientation: 'left',
        //文字是否显示为普通正文样式
        plain: true,
        //水平还是垂直类型（horizontal | vertical）
        type: 'horizontal',
      },
    },
    {
      field: 'tableSlot',
      label: '',
      component: 'Input',
      slot: 'tableSlot',
      colProps: { span: 24 },
    },
  ];
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 150,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
    schemas,
    showActionButtonGroup: false,
  });
  const columnsTable: BasicColumn[] = [
    {
      title: '备件编码',
      dataIndex: 'partCode',
      width: 130,
      resizable: true,
    },
    {
      title: '备件名称',
      dataIndex: 'partName',
      width: 130,
      resizable: true,
    },
    {
      title: '规格型号',
      dataIndex: 'specModel',
      width: 130,
      resizable: true,
    },
    {
      title: '备件类型',
      dataIndex: 'partType',
      width: 130,
      resizable: true,
    },
    // {
    //     title: '品牌',
    //     dataIndex: 'brand',
    //     width: 130,
    //     resizable: true,
    //   },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 130,
      resizable: true,
    },
    {
      title: '领用数量',
      dataIndex: 'applyQty',
      width: 130,
      resizable: true,
    },
    // {
    //     title: '存放位置',
    //     dataIndex: 'storageLocation',
    //     width: 130,
    //     resizable: true,
    //   },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 130,
      resizable: true,
    },
  ];
  const [registerTable, { setTableData, reload }] = useTable({
    // api: getXunjianjihuafujianList,
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
    tableSetting: { fullScreen: true },
    // beforeFetch: (params) => {
    //   return Object.assign({column: 'createTime', order: 'desc'}, params);
    // },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  function getActions(record) {
    return [
      {
        label: '下载',
        onClick: handleDownLoad.bind(null, record),
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
      //     confirm: handleDelete.bind(null, record),
      //   },
      //   auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
      //
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
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    console.log('checkedKeys------>', checkedKeys);
    checkedKeys.value = selectedRowKeys;
  }
  function handleDownLoad(record) {
    // props.isDisabled = false;
  }
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
        const treeDataRenyuan = await getTreeListRenyuan();
        const treeData = await getTreeListBanzu();
        updateSchema([
          {
            field: 'teamId',
            componentProps: {
              treeData,
            },
          },
          {
            field: 'chargerId',
            componentProps: {
              treeData: treeDataRenyuan,
            },
          },
        ]);
        let record = unref(newValue.requisition);
        if (typeof record !== 'object') {
          record = {};
        }
        model.value = record;
        await resetFields();
        await setFieldsValue({ ...record });
        await setTableData(newValue.details || []);
      },
      { deep: true, immediate: true }
    );
  });

  // 提交事件
  async function onSubmit() {
    try {
      loading.value = true;
      let values = await validate();
      values = Object.assign({}, model.value, values);
      //提交表单
      await saveOrUpdateDemo(values, isUpdate.value);
      //刷新列表
      emit('success');
      Object.assign(model.value, values);
    } finally {
      loading.value = false;
    }
  }
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
