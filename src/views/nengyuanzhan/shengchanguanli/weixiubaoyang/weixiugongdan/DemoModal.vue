<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled" class="mr3">
      <template #faultDesc="{ model, field }">
        <div style="display: flex; align-items: flex-start; width: 100%">
          <a-textarea v-model:value="model[field]" :rows="3" style="flex: 1" placeholder="请输入故障描述" />
          <a-button type="link" @click="openGuzhangku">故障库</a-button>
        </div>
      </template>
    </BasicForm>

    <DemoModalSheBei :isDisabled="isDisabled" @register="registerModalShebei" @success="getShebeiID"></DemoModalSheBei>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useRoute, useRouter } from 'vue-router';

  const router = useRouter();
  const [registerModalShebei, { openModal: openModalShebei }] = useModal();
  const { hasPermission } = usePermission();
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { saveOrUpdateDemo, getDemoById, getBanzufuzeren } from './demo.api';

  import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
  import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';

  import DemoModalSheBei from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/guzhangbaoxiu/DemoModalShebei.vue';
  import { getTreeListGuzhangleibie } from '@/views/nengyuanzhan/shengchanguanli/weixiubaoyang/guzhangleibie/demo.api';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

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
        style: { width: '100%' },
      },
    },
    {
      field: 'orderType',
      label: '工单类型',
      component: 'Select',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        options: [
          { label: '报修工单', value: '报修工单' },
          { label: '快速工单', value: '快速工单' },
        ],
        style: { width: '100%' },
      },
    },
    {
      field: 'repairTeamId',
      label: '维修班组',
      component: 'ApiSelect',
      colProps: { span: 12 },
      required: true,
      componentProps: {
        api: getTreeListBanzu,
        labelField: 'groupName', // 下拉显示文字
        valueField: 'id', // 实际提交值
        immediate: true, // 页面加载立即请求
        onChange: (value, option) => {
          setFieldsValue({
            leaderId: normalizeNumberId(option?.leader),
            leaderName: option?.leaderName,
            repairTeamName: getOptionLabel(option, 'groupName'),
          });
        },
      },
    },
    {
      field: 'repairTeamName',
      label: '维修班组(label)',
      component: 'Input',
      show: false,
    },

    {
      field: 'assignerName',
      label: '负责人',
      component: 'Input',
      colProps: { span: 12 },
      required: false,
      componentProps: {
        disabled: true,
        // api: getTreeListRenyuan,
        // labelField: 'label', // 下拉显示文字
        // valueField: 'id', // 实际提交值
        // immediate: true, //
        // onChange: (value, option) => {
        //   setFieldsValue({
        //     leaderName: getOptionLabel(option),
        //   });
        // },
      },
    },
    {
      field: 'otherWorkerIds',
      label: '其他维修人',
      component: 'ApiSelect',
      required: false,
      colProps: { span: 12 },
      componentProps: {
        mode: 'multiple',
        api: getTreeListRenyuan,
        labelField: 'label', // 下拉显示文字
        valueField: 'id', // 实际提交值
        immediate: true, // 页面加载立即请求
        onChange: (value, option) => {
          let arr = Array.isArray(option) ? option.map((item) => getOptionLabel(item)).filter(Boolean) : [];
          setFieldsValue({
            otherWorkerNames: `${arr}`,
          });
        },
      },
    },
    {
      field: 'otherWorkerNames',
      label: '其他维修人(label)',
      component: 'Input',
      required: false,
      colProps: { span: 12 },
      show: false,
    },
    {
      field: 'remark',
      label: '备注',
      component: 'InputTextArea',
      required: false,
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
      label: '设备信息',
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
      label: '设备Id',
      field: 'deviceId',
      component: 'Input',
      colProps: { span: 12 },
      show: false,
      componentProps: {
        // placeholder:'请选择设备',
        disabled: false,
        // readonly: true,
        // //搜索之后触发事件
        // onSearch: (value: any) => {
        //   //搜索之后的逻辑处理
        //   console.log(value);
        //   handleShezhi();
        // },
      },
    },
    {
      label: '设备名称',
      field: 'deviceName',
      component: 'InputSearch',
      colProps: { span: 12 },
      required: true,
      // show: false,
      componentProps: {
        placeholder: '请选择设备',
        disabled: false,
        readonly: true,
        //搜索之后触发事件
        onSearch: () => {
          handleShezhi();
        },
      },
    },
    {
      label: '设备编号',
      field: 'deviceCode',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: {
        // placeholder:'请选择设备',
        disabled: true,
        // readonly: true,
        // //搜索之后触发事件
        // onSearch: (value: any) => {
        //   //搜索之后的逻辑处理
        //   console.log(value);
        //   handleShezhi();
        // },
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
        style: { width: '100%' },
      },
    },
    {
      field: 'specModel',
      label: '规格型号',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    {
      field: 'storageLocation',
      label: '存放位置',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },
    // {
    //   field: 'useDept',
    //   label: '使用部门',
    //   component: 'Input',
    //   required: true,
    //   colProps: { span: 12 },
    //   componentProps: {
    //     disabled: true,
    //     style: { width: '100%' },
    //   },
    // },
    {
      field: 'groupName',
      label: '部门名称',
      component: 'Input',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: true,
        style: { width: '100%' },
      },
    },

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
        options: [
          { label: '紧急', value: '1' },
          { label: '高', value: '2' },
          { label: '中', value: '3' },
          { label: '低', value: '4' },
        ],
      },
    },
    {
      field: 'categoryId',
      label: '故障类别',
      component: 'TreeSelect',
      required: true,
      colProps: { span: 12 },
      componentProps: {
        disabled: false,
        // treeCheckable: true,
        // title: '下拉树',
        treeData: [], // 先给空
        fieldNames: {
          label: 'categoryName',
          value: 'id',
          children: 'children',
        },
      },
    },
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
      required: false,
      slot: 'faultDesc',
      // componentProps: {
      //   // suffix:'故障库',
      //   rows: 3,
      //   style: { width: '100%' },
      // },
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
        disabled: false,
        //最大上传数量
        fileMax: 10,
      },
    },
  ];
  //表单配置
  const [registerForm, { resetFields, clearValidate, setFieldsValue, validate, updateSchema }] = useForm({
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
    const treeDataRenyuan = await getTreeListRenyuan();
    // const treeDataBanzu = await getTreeListBanzu();
    const treeDataGuzhang = await getTreeListGuzhangleibie();

    updateSchema([
      // {
      //   field: 'repairTeamId',
      //   componentProps: {
      //     treeData:treeDataBanzu,
      //   },
      // },
      {
        field: 'chargerId',
        componentProps: {
          treeData: treeDataRenyuan,
        },
      },
      {
        field: 'categoryId',
        componentProps: {
          treeData: treeDataGuzhang,
        },
      },
    ]);
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      //获取详情
      data.record = await getDemoById({ id: data.record.id });
      data.record.groupName =
        data.record.groupName || data.record.useDept || data.record.useDeptName || data.record.sysOrgCode_dictText || data.record.sysOrgCode;
      //表单赋值
      await setFieldsValue({
        ...data.record,
        categoryId: data.record.categoryId ? Number(data.record.categoryId) : undefined,
        deviceId: data.record.deviceId ? Number(data.record.deviceId) : undefined,
        otherWorkerIds: normalizeIdList(data.record.otherWorkerIds),
        leaderId: normalizeNumberId(data.record.leaderId),
      });
      await clearValidate();
    }
  });

  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '创建工单' : '编辑工单'));

  function handleShezhi() {
    openModalShebei(true, {
      record: {},
      isUpdate: false,
    });
  }

  function getShebeiID(record) {
    let deviceObj = {
      deviceId: Number(record.id),
      deviceCode: record.deviceCode,
      deviceName: record.deviceName,
      specModel: record.deviceModule || record.specModel,
      deviceType: record.deviceTypeName || record.deviceType || record.deviceModule,
      storageLocation: record.spaceName || record.storageLocation || record.spaceId,
      groupName: record.groupName || record.useDept || record.useDeptName || record.sysOrgCode_dictText || record.sysOrgCode,
    };
    setFieldsValue({
      ...deviceObj,
    });
  }

  /**
   * 新增事件
   */
  const isDisabled = ref(false);

  function openGuzhangku() {
    router.push({ path: '/shebeiguzhangku' });
  }

  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdateDemo(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  function normalizeIdList(value) {
    if (value === undefined || value === null || value === '') {
      return [];
    }
    return String(value)
      .split(',')
      .filter(Boolean)
      .map((item) => Number(item));
  }

  function normalizeNumberId(value) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? undefined : numberValue;
  }

  function getOptionLabel(option, fallbackField = 'label') {
    if (!option) {
      return '';
    }
    return option[fallbackField] ?? option.label ?? option.groupName ?? option.leaderName ?? '';
  }
</script>
