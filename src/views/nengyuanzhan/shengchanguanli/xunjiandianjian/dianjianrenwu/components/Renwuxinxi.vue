<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm"/>
  </a-spin>
</template>

<script lang="ts" setup>
import {watch,ref, unref, onMounted} from 'vue';
import {BasicForm, FormSchema, useForm} from '/@/components/Form/index';
const emit = defineEmits(['success']);
const props = defineProps({
  data: {type: Object, default: () => ({})},
  rootTreeData: {type: Array, default: () => []},
});
const loading = ref<boolean>(false);
// 当前是否是更新模式
const isUpdate = ref<boolean>(true);
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
    field: 'taskCode',
    label: '任务编号',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'taskName',
    label: '任务名称',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'planName',
    label: '计划名称',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'planSeq',
    label: '任务计划序号',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'planStartTime',
    label: '任务计划开始时间',
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
    field: 'planEndTime',
    label: '任务计划结束时间',
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
    required: false,
    colProps: {span: 12},
    componentProps: {
      rows:3,
      disabled: true,
    },
  },
  {
    field: 'baseTitle1',
    component: 'Divider',
    label: '点检人员',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    field: 'teamName',
    label: '点检班组',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'chargerName',
    label: '点检人',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'baseTitle2',
    component: 'Divider',
    label: '点检时间',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    field: 'actualStartTime',
    label: '开始时间',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'actualEndTime',
    label: '结束时间',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'durationMinutes',
    label: '点检用时',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      suffix:'分钟',
      disabled: true,
    },
  },
  {
    field: 'baseTitle3',
    component: 'Divider',
    label: '点检图片',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    field: 'images',
    label: '点检图片',
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
const [registerForm, {resetFields, setFieldsValue, validate, updateSchema,}] = useForm({
  labelWidth:150,
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
      async (newVal) => {
        // console.log(newVal,'aaaaaaaaa');
        let record = unref(props.data);
        if (typeof record !== 'object') {
          record = {};
        }
        // model.value = record;
        await resetFields();
        await setFieldsValue({...newVal});
      },
      {deep: true, immediate: true}
  );

});

// 提交事件
async function onSubmit() {
  // try {
  //   loading.value = true;
  //   let values = await validate();
  //   values = Object.assign({}, model.value, values);
  //   //提交表单
  //   await saveOrUpdateDemo(values, isUpdate.value);
  //   //刷新列表
  //   emit('success');
  //   Object.assign(model.value, values);
  // } finally {
  //   loading.value = false;
  // }
}
</script>
<!--<style lang="less">-->
<!--// update-begin-author:liusq date:20230625 for: [issues/563]暗色主题部分失效-->

<!--@prefix-cls: ~'@{namespace}-j-depart-form-content';-->
<!--/*begin 兼容暗夜模式*/-->
<!--.@{prefix-cls} {-->
<!--  background: @component-background;-->
<!--  border-top: 1px solid @border-color-base;-->
<!--}-->

<!--/*end 兼容暗夜模式*/-->
<!--// update-end-author:liusq date:20230625 for: [issues/563]暗色主题部分失效-->
<!--</style>-->
