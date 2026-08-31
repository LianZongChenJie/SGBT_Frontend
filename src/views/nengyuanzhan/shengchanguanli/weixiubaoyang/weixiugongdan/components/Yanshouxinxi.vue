<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" class="mr3" />
  </a-spin>
</template>

<script lang="ts" setup>
  import { watch, ref, unref, onMounted } from 'vue';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();

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
      label: '验收信息',
      componentProps: {
        orientation: 'left',
        plain: true,
      },
    },
    {
      field: 'repairOrderNo',
      label: '工单单号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'acceptanceUserName',
      label: '验收人员',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'sysOrgCode',
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
      field: 'acceptanceResult',
      label: '验收结果',
      component: 'Select',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        options: [
          { label: '完成维修/通过', value: 1 },
          { label: '未完成维修', value: 2 },
          { label: '重新维修/驳回', value: 3 },
        ],
      },
    },
    {
      field: 'acceptanceScore',
      label: '维修评分',
      component: 'Rate',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
      },
    },
    {
      field: 'acceptanceTime',
      label: '验收时间',
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
      field: 'acceptanceRemark',
      label: '维修评价',
      component: 'InputTextArea',
      required: true,
      colProps: { span: 24 },
      componentProps: {
        rows: 3,
        disabled: true,
        style: { width: '100%' },
      },
    },
  ];
  const [registerForm, { resetFields, setFieldsValue, updateSchema }] = useForm({
    labelWidth: 150,
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
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
        // let dept = await queryTreeList({ids:userObj.result.departIds})
        // console.log(dept,'获取部门');
        // let obj = {
        //   reporterName:userObj.result.username,
        //   reporterId:userObj.result.id,
        //   deptName:dept[0].departName,
        //   deptId:dept[0].id,
        //   contactPhone:userObj.result.phone,
        // }
        // const treeDataRenyuan = await getTreeListRenyuan();
        // const treeData = await getTreeListBanzu();
        // updateSchema([
        //   {
        //     field: 'sysOrgCode',
        //     componentProps: {
        //       treeData,
        //     },
        //   },
        //   // {
        //   //   field: 'acceptanceBy',
        //   //   componentProps: {
        //   //     treeData:treeDataRenyuan,
        //   //   },
        //   // },
        // ]);
        let record = unref(newValue.acceptance);
        if (typeof record !== 'object') {
          record = {};
        }
        model.value = record;
        await resetFields();

        await setFieldsValue({
          ...record,
          sysOrgCode: record.sysOrgCode || record.deptId || newValue?.sysOrgCode,
          repairOrderNo: record.repairOrderNo || record.orderNo || newValue?.repairOrderNo || newValue?.orderNo,
        });
      },
      { deep: true, immediate: true }
    );
  });
</script>
