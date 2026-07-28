<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled"> </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { getFileAccessHttpUrl } from '/src/utils/common/compUtils';

  const { hasPermission } = usePermission();
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { saveDetailImage, getImageByDetailId } from './demo.api';

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
const detailId = ref(0)
const taskId = ref(0)
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
      field: 'devicePic',
      label: '巡检图片',
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
  const [registerForm, { resetFields, validate, updateSchema, setFieldsValue }] = useForm({
    labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();

    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;

    // = await getXunjianmingxiList;
    // if (data.createBy) {
    //   await setFieldsValue({createBy: data.createBy})
    // }
    // if (data.createTime) {
    //   await setFieldsValue({createTime: data.createTime})
    // }
    if (unref(isUpdate)) {
      console.log(data.record, '传过来的当前对象');
      //获取详情
      let img = await getImageByDetailId({detailId: data.record.id});
      //表单赋值
      detailId.value = data.record.detailId
      taskId.value = data.record.taskId
      data.record.devicePic = getFileAccessHttpUrl(img);
      await setFieldsValue({
        ...data.record,
      });
    }
  });

  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '上传图片' : '查看图片'));

  /**
   * 新增事件
   */
  const isDisabled = ref(false);

  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      // console.log(values,'aaaaaaaaaaa');
        const obj ={
          detailId:detailId.value,
          taskId:taskId.value,
          images:values.devicePic
        }

      setModalProps({ confirmLoading: true });
      //提交表单
      await saveDetailImage(obj);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
