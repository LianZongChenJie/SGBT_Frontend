<template>
  <!-- 流程任务处理弹出框 -->
  <a-modal
    width="100%"
    style="top: 0"
    wrapClassName="full-modal"
    destroyOnClose
    :title="data.title"
    v-model:open="data.visible"
    :bodyStyle="data.bodyStyle"
    :footer="null"
    @cancel="handleModalCancel"
  >
    <a-tabs defaultActiveKey="1" tabPosition="left">
      <a-tab-pane key="1">
        <template #tab>
          <Icon icon="ant-design:file-text-outlined" />
          <span>任务处理</span>
        </template>
        <template v-if="data.opt == 'submit'">
          <BizTaskModal :formData="formData" @complete="completeProcess"></BizTaskModal>
        </template>
        <template v-else-if="data.opt == 'reject'">
          <BizTaskRejectModal :formData="formData" @complete="completeProcess"></BizTaskRejectModal>
        </template>
      </a-tab-pane>

      <a-tab-pane key="2">
        <template #tab>
          <Icon icon="ant-design:sliders-outlined" />
          <span>流程图</span>
        </template>
        <ProcessDiagram :formData="formData"></ProcessDiagram>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, reactive, toRef } from 'vue';
  import {getBpmFormUrl, isUrl} from '/src/utils/is';
  import { getToken } from '/src/utils/auth';
  import { useGlobSetting } from '/src/hooks/setting';
  import BizTaskModal from './BizTaskModal.vue';
  import BizTaskRejectModal from './BizTaskRejectModal.vue';
  import ProcessDiagram from '/src/views/super/bpm/process/manage/components/ProcessDiagram.vue';

  const globSetting = useGlobSetting();
  //声明props
  const props = defineProps({
    path: { type: String },
    formData: { type: Object },
  });
  // 声明Emits
  const emit = defineEmits(['success']);

  //数据
  const data = reactive({
    loading: false,
    title: '流程',
    visible: false,
    bodyStyle: {
      padding: '0',
      height: window.innerHeight - 80 + 'px',
      'overflow-y': 'auto',
    },
    height: window.innerHeight - 120 + 'px',
    iframeUrl: '',
    opt: '',
  });

  let TOKEN = getToken();
  let DOMAIN_URL = globSetting.domainUrl;
  let TASKID = props.formData.taskDefKey;
  //是否组件
  const isComp = computed(() => {
    //获取流程审批url
    //let URL = (props.path || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)); // URL支持{{ window.xxx }}占位符变量
    let URL = getBpmFormUrl(props.path, TOKEN, DOMAIN_URL, TASKID);
    
    if (isUrl(URL)) {
      data.iframeUrl = URL;
      return false;
    }
    return true;
  });
  /**
   * 关闭弹窗
   */
  function completeProcess() {
    data.visible = false;
    emit('success');
  }
  /**
   * 关闭弹窗
   */
  function handleModalCancel() {
    data.visible = false;
  }

  /**
   * 打开弹窗前处理
   * @param record
   */
  function deal(opt) {
    data.opt = opt;
    data.visible = true;
  }

  defineExpose({
    deal,
    data,
  });
</script>

<style lang="less" scoped></style>
