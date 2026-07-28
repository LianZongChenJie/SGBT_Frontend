<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" class="mr3"/>
  </a-spin>
</template>

<script lang="ts" setup>
import {watch, ref, unref, onMounted} from 'vue';
import {BasicForm, FormSchema, useForm} from '/@/components/Form/index';
import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';


const emit = defineEmits(['success']);
const props = defineProps({
  data: {type: Object, default: () => ({})},
  rootTreeData: {type: Array, default: () => []},
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
  // {
  //   field: 'createTime',
  //   label: 'createTime',
  //   component: 'Input',
  //   show: false,
  // },
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
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'theme',
    label: '报修主题',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'reporterName',
    label: '报修人',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'deptName',
    label: '所属部门',
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
  {
    field: 'contactPhone',
    label: '联系方式',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'createTime',
    label: '报修时间',
    component: 'DatePicker',
    required: true,
    colProps: {span: 12},
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
    colProps: {span: 24},
    componentProps: {
      rows: 3,
      disabled: true,
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
      plain:true,
      //水平还是垂直类型（horizontal | vertical）
      type:'horizontal',
    },
  },
  {
    field: 'deviceName',
    label: '设备名称',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'deviceCode',
    label: '设备编号',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'deviceType',
    label: '设备类型',
    component: 'Input',
    required: true,
    colProps: {span: 12},
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
    colProps: {span: 12},
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
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      style: { width: '100%' },
    },
  },
  {
    field: 'groupName',
    label: '使用部门',
    component: 'Input',
    required: true,
    colProps: {span: 12},
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
      plain:true,
      //水平还是垂直类型（horizontal | vertical）
      type:'horizontal',
    },
  },

  {
    field: 'faultTime',
    label: '故障时间',
    component: 'DatePicker',
    required: true,
    colProps: {span: 12},
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
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      options: [
        { label: '紧急', value: 4 },
        { label: '高', value: 3 },
        { label: '中', value: 2 },
        { label: '低', value: 1 },
      ],
    },
  },
  {
    field: 'faultCategory',
    label: '故障类别',
    component: 'ApiTreeSelect',
    colProps: {span: 12},
    required: true,
    componentProps: {
      style: { width: '100%' },
      disabled: true,
    },
  },
  {
    field: 'isDowntime',
    label: '是否停机',
    component: 'Switch',
    required: true,
    colProps: { span: 12 },
    defaultValue:0,
    componentProps: {
      disabled: true,
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
      plain:true,
      //水平还是垂直类型（horizontal | vertical）
      type:'horizontal',
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
const [registerForm, {resetFields, setFieldsValue, updateSchema}] = useForm({
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
            treeData:treeDataRenyuan,
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
      await setFieldsValue({...record});
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
