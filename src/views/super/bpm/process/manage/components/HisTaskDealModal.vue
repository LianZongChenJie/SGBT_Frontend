<template>
  <!-- 历史流程任务处理弹出框 -->
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
          <span>附加单据</span>
        </template>
        <div class="component_div">
          <template v-if="isComp">
            <DynamicLink v-if="path" :path="path" :formData="formData"></DynamicLink>
            <div v-else>表单地址不存在</div>
          </template>
          <template v-else>
            <iframe :src="data.iframeUrl" frameborder="0" width="100%" :height="data.height" scrolling="auto"></iframe>
          </template>
        </div>
      </a-tab-pane>

      <a-tab-pane key="2">
        <template #tab>
          <Icon icon="ant-design:user-outlined" />
          <span>任务处理</span>
        </template>
        <HisTaskModule :formData="formData"></HisTaskModule>
      </a-tab-pane>

      <a-tab-pane key="3">
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
  import { computed, reactive } from 'vue';
  import { getBpmFormUrl, isUrl} from '/@/utils/is';
  import { getToken } from '/@/utils/auth';
  import { useGlobSetting } from '/@/hooks/setting';
  import DynamicLink from './DynamicLink.vue';
  import ProcessDiagram from './ProcessDiagram.vue';
  import HisTaskModule from './HisTaskModule.vue';

  const globSetting = useGlobSetting();
  //组件接受传参
  const props = defineProps({
    path: { type: String },
    formData: { type: Object },
  });
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
  function handleModalCancel() {
    data.visible = false;
  }

  /**
   * 打开弹窗前处理
   * @param record
   */
  function deal(record) {
    data.visible = true;
  }

  defineExpose({
    deal,
    data,
  });
</script>

<style lang="less" scoped>
  .component_div {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  :deep(.ant-modal) {
    top: 0;
    padding: 0;
  }
</style>
