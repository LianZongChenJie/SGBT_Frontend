<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" class="mr3">
      <template #tableSlot>
        <BasicTable @register="registerTable" :rowSelection="rowSelection">
          <template #tableTitle>
            <!--          <a-button preIcon="ant-design:plus-outlined" type="primary" >添加</a-button>-->

            <a-button preIcon="ant-design:export-outlined" type="primary" @click="handleExportXls('单表示例', getExportUrl, exportParams)"
              >导出
            </a-button>
          </template>
          <!--          <template v-if="checkedKeys.length > 0" #tableTitle>-->
          <!--            <a-dropdown v-if="checkedKeys.length > 0">-->
          <!--              <template #overlay>-->
          <!--                <a-menu>-->
          <!--                  <a-menu-item v-if="!hasPermission('operation:operation_inspection_point_plan:deleteBatch')" @click="batchHandleDelete">-->
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
          <!--          </template>-->
          <!--          <template #action="{ record }">-->
          <!--            <TableAction :actions="getActions(record)" />-->
          <!--          </template>-->

          <!--          <template #tableSlot></template>-->
        </BasicTable>
      </template>
    </BasicForm>
  </a-spin>
</template>

<script lang="ts" setup>
  import { defHttp } from '/@/utils/http/axios';

  import { watch, ref, unref, onMounted } from 'vue';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { batchDeleteDemo, deleteDemo, getImportUrlFujian, getRepairWorkloadList, saveOrUpdateDemo } from '../demo.api';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicColumn, BasicTable, TableAction, useTable } from '@/components/Table';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
  import { useListPage } from '@/hooks/system/useListPage';
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
  const activeKey = ref(1);

  const panes = ref([
    {
      title: '寇惜雪',
      key: 1,
    },
    {
      title: '李华',
      key: 2,
    },
    {
      title: '张敏',
      key: 3,
    },
  ]);
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
      label: '基础信息',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'orderNo',
      label: '工单单号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'theme',
      label: '工单主题',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'orderType',
      label: '工单类型',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'createTime',
      label: '制单时间',
      component: 'DatePicker',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm',
        format: 'YYYY-MM-DD HH:mm',
        disabled: true,
      },
    },
    {
      field: 'assignerName',
      label: '派单人员',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'groupName',
      label: '部门名称',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'repairTeamName',
      label: '维修班组',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'leaderName',
      label: '负责人',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },

    // {
    //   field: 'planGroupId',
    //   label: '维修班组',
    //   component: 'ApiSelect',
    //   required: false,
    //   componentProps: {
    //     api:() => defHttp.get({
    //       url: '/operation/energyPlanGroup/ddl',
    //     }),
    //     labelField: 'groupName', // 下拉显示文字
    //     valueField: 'groupCode', // 实际提交值
    //     immediate: true, // 页面加载立即请求
    //   },
    // },
    // {
    //   field: 'plan332Name',
    //   label: '负责人',
    //   component: 'ApiSelect',
    //   required: false,
    //   componentProps: {
    //     api: getTreeListRenyuan,
    //     labelField: 'groupName', // 下拉显示文字
    //     valueField: 'groupCode', // 实际提交值
    //     immediate: true, // 页面加载立即请求
    //   },
    // },
    // {
    //   field: 'otherWorkerIds',
    //   label: '其他维修人',
    //   component: 'ApiSelect',
    //   required:false,
    //   colProps: {span: 12},
    //   componentProps: {
    //     mode: 'multiple',
    //     api: getTreeListRenyuan,
    //     labelField: 'label', // 下拉显示文字
    //     valueField: 'id',        // 实际提交值
    //     immediate: true,         // 页面加载立即请求
    //     // onChange: (value,option) => {
    //     //   console.log('选中的值', value);
    //     //   console.log('选中的项', option);
    //     //   setFieldsValue({
    //     //     otherWorkerIds:`${value}`,
    //     //   })
    //     // }
    //   },
    // },
    {
      field: 'otherWorkerNames',
      label: '其他维修人',
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
        disabled: true,
      },
    },

    {
      field: 'baseTitle33',
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
        disabled: true,
      },
    },
    {
      field: 'deviceCode',
      label: '设备编号', //对应维修等级
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'deviceType',
      label: '设备类型',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'specModel',
      label: '规格型号',
      component: 'Input',
      required: true,
      // defaultValue: 1,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    // {
    //   field: 'storageLocation',
    //   label: '存放位置',
    //   component: 'Input',
    //   required: true,
    //   // defaultValue: 1,
    //   colProps: { span: 12 },
    //   componentProps: {
    //     disabled: true,
    //   },
    // },
    // {
    //   field: 'useDept',
    //   label: '使用部门',
    //   component: 'Input',
    //   required: true,
    //   // defaultValue: 1,
    //   colProps: { span: 12 },
    //   componentProps: {
    //     disabled: true,
    //   },
    // },

    {
      field: 'baseTitle13',
      component: 'Divider',
      label: '工作量',
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
      field: 'baseTitle1',
      component: 'Divider',
      label: '图片',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'images',
      label: '',
      required: false,
      // helpMessage: '最多上传10张图片',
      component: 'JImageUpload',
      componentProps: {
        //按钮显示文字
        text: '上传图片',
        //支持两种基本样式picture和picture-card
        // listType:'picture-card',
        //用于控制文件上传的业务路径,默认temp
        // bizPath:'temp',
        //是否禁用
        disabled: true,
        //最大上传数量
        fileMax: 10,
      },
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
      title: '姓名',
      dataIndex: 'workerName',
      width: 100,
      resizable: true,
    },
    {
      title: '类型',
      dataIndex: 'workerType',
      width: 130,
      resizable: true,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 130,
      resizable: true,
    },
    {
      title: '完成时间',
      dataIndex: 'endTime',
      width: 130,
      resizable: true,
    },
    {
      title: '维修用时(小时)',
      dataIndex: 'durationHour',
      width: 130,
      resizable: true,
    },
    {
      title: '暂停原因',
      dataIndex: 'pauseReason',
      width: 130,
      resizable: true,
    },
    {
      title: '维修内容',
      dataIndex: 'workContent',
      width: 130,
      resizable: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 130,
      resizable: true,
    },
  ];
  const searchFormSchema: FormSchema[] = [
    {
      label: '姓名',
      field: 'deviceName',
      component: 'Input',
      colProps: { span: 8 },
    },
  ];
  const { tableContext } = useListPage({
    tableProps: {
      title: '',
      // api: getXunjianjihuafujianList,
      rowKey: 'id',
      columns: columnsTable,
      formConfig: {
        schemas: searchFormSchema,
        // fieldMapToTime: [['birthday', ['birthday_begin', 'birthday_end'], 'YYYY-MM-DD']],
        // fieldMapToNumber: [['age', ['age_begin', 'age_end']]],
        autoAdvancedCol: 2,
      },
      useSearchForm: false,
      striped: true,
      bordered: true,
      showIndexColumn: true,
      // rowSelection: { type: 'checkbox' }, //默认是 checkbox 多选，可以设置成 radio 单选
      actionColumn: {
        width: 180,
        title: '操作',
        dataIndex: 'action',
        slots: { customRender: 'action' },
        fixed: 'right',
        ifShow: false,
      },
    },
    exportConfig: {
      name: '下载模版',
      url: getExportUrl,
    },
    importConfig: {
      url: getImportUrlFujian,
    },
  });
  const [registerTable, { setTableData, reload }] = tableContext;

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
        label: '删除',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
        // auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
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
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    console.log('checkedKeys------>', checkedKeys);
    checkedKeys.value = selectedRowKeys;
  }

  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, reload);
  }
  async function batchHandleDelete() {
    await batchDeleteDemo({ ids: checkedKeys.value }, () => {
      checkedKeys.value = [];
      reload();
    });
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
        console.log(newValue, '传过来的对象');
        const treeData = await getTreeListBanzu();
        updateSchema([
          {
            field: 'teamId',
            componentProps: {
              treeData,
            },
          },
        ]);
        let record = unref(newValue);
        if (typeof record !== 'object') {
          record = {};
        }
        model.value = record;
        await resetFields();
        await setFieldsValue({ ...record });
        await setTableData(await resolveWorkloadList(record));
      },
      { deep: true, immediate: true }
    );
  });

  async function resolveWorkloadList(record) {
    if (Array.isArray(record?.workloadList) && record.workloadList.length > 0) {
      return record.workloadList;
    }
    if (!record?.id) {
      return [];
    }
    const res = await getRepairWorkloadList({ orderId: record.id, pageNo: 1, pageSize: 999 });
    if (Array.isArray(res)) {
      return res;
    }
    return res?.records || res?.result?.records || [];
  }

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
