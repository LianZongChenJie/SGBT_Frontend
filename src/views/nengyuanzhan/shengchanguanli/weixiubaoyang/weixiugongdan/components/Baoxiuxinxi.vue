<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" class="mr3" />
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
      label: '基础信息',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'orderNo',
      label: '报修单号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'theme',
      label: '报修主题',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'createBy',
      label: '报修人',
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
      required: true,
      colProps: { span: 12 },
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
    {
      field: 'contactPhone',
      label: '联系方式',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'createTime',
      label: '报修时间',
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
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      required: true,
      colProps: { span: 24 },
      componentProps: {
        rows: 3,
        disabled: true,
        style: { width: '100%' },
      },
    },
    // {
    //   field: 'baseTitle2',
    //   component: 'Divider',
    //   label: '设备信息',
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
    //   field: 'planName333',
    //   label: '设备名称',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },
    // {
    //   field: 'planName2222',
    //   label: '设备编号',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },
    // {
    //   field: 'planName434',
    //   label: '设备类型',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },
    // {
    //   field: 'planName233223',
    //   label: '规格型号',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },
    // {
    //   field: 'planName1232',
    //   label: '存放位置',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },
    // {
    //   field: 'planName123',
    //   label: '使用部门',
    //   component: 'Input',
    //   required: true,
    //   colProps: {span: 12},
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },

    {
      field: 'baseTitle3',
      component: 'Divider',
      label: '故障信息',
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
      field: 'faultTime',
      label: '故障时间',
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
      field: 'faultLevel',
      label: '故障等级',
      component: 'Select',
      required: true,
      // defaultValue: 1,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        options: [
          { label: '紧急', value: '1' },
          { label: '高', value: '2' },
          { label: '中', value: '3' },
          { label: '低', value: '4' },
        ],
      },
    },
    {
      field: 'faultCategory',
      label: '故障类别',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    // {
    //   field: 'faultCategory',
    //   label: '故障类别',
    //   component: 'ApiTreeSelect',
    //   colProps: {span: 12},
    //   required: true,
    //   componentProps: {
    //     style: { width: '100%' },
    //     disabled: true,
    //   },
    // },
    {
      field: 'isDowntime',
      label: '是否停机',
      component: 'Switch',
      required: false,
      colProps: { span: 12 },
      defaultValue: 0,
      componentProps: {
        checkedChildren: '是',
        unCheckedChildren: '否',
        checkedValue: 1,
        unCheckedValue: 0,
      },
    },
    {
      field: 'faultDesc',
      label: '故障描述',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        disabled: true,
        rows: 3,
        style: { width: '100%' },
      },
    },

    {
      field: 'baseTitle3323',
      component: 'Divider',
      label: '故障图片',
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
      field: 'images',
      label: '故障图片',
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
    },
    {
      title: '上传者',
      dataIndex: 'createBy',
      width: 130,
      resizable: true,
    },
    {
      title: '文档大小',
      dataIndex: 'fileSize',
      width: 130,
      resizable: true,
    },
    // {
    //     title: '存储地址',
    //     dataIndex: 'fileUrl',
    //     width: 130,
    //     resizable: true,
    //   },
  ];
  const [registerTable, { reload }] = useTable({
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
        let record = unref(newValue);
        if (typeof record !== 'object') {
          record = {};
        }
        record.groupName = record.groupName || record.useDept;
        model.value = record;
        await resetFields();
        await setFieldsValue({ ...record });
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
