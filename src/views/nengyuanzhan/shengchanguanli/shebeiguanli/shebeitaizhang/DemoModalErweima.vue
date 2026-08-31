<template>
  <BasicModal :title="title" v-bind="$attrs" width="40%" @ok="handleSubmit" @register="registerModal">
    <a-button @click="onPrint" type="primary" class="ml3">打印</a-button>
    <div id="erweima">
      <QrCode :value="qrCodeUrl" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { QrCode, QrCodeActionType } from '/@/components/Qrcode/index';
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { printJS } from '@/hooks/web/usePrintJS';

  const qrCodeUrl = ref('https://www.vvbin.cn');
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

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false, showOkBtn: !props.isDisabled });
    isUpdate.value = !!data?.isUpdate;

    if (unref(isUpdate)) {
      //等待后端传逻辑请求二维码接口给当前url赋值
      // data.record = await getDemoById({ id: data.record.id });
      // qrCodeUrl.value = data.record.url
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '打印二维码' : '打印二维码'));

  function onPrint() {
    printJS({
      printable: '#erweima',
      type: 'html',
    });
  }

  //表单提交事件
  async function handleSubmit() {
    try {
      // let values = await validate();
      // setModalProps({ confirmLoading: true });
      // //提交表单
      // await saveOrUpdateDemo(values, isUpdate.value);
      // //关闭弹窗
      // closeModal();
      // //刷新列表
      // emit('success', values);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
