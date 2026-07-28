<template>
  <!-- 历史流程任务处理弹出框 -->
  <a-modal
    width="80%"
    style="top: 20px"
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
          <template v-if="data.compType == 'comp'">
            <DynamicLink :path="path" :formData="formData"></DynamicLink>
          </template>
          <template v-else-if="data.compType == 'iframe'">
            <iframe :src="data.iframeUrl" frameborder="0" width="100%" :height="data.height" scrolling="auto"></iframe>
          </template>
        </div>
      </a-tab-pane>

      <a-tab-pane key="2">
        <template #tab>
          <Icon icon="ant-design:file-text-outlined" />
          <span>审批记录</span>
        </template>
        <HisTaskModule :formData="formData"></HisTaskModule>
      </a-tab-pane>

      <a-tab-pane key="3">
        <template #tab>
          <Icon icon="ant-design:sliders-outlined" />
          <span>流程跟踪</span>
        </template>
        <ProcessDiagram :formData="formData"></ProcessDiagram>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, unref, reactive } from 'vue';
  import {getBpmFormUrl, isUrl} from '/@/utils/is';
  import { getToken } from '/@/utils/auth';
  import { useGlobSetting } from '/@/hooks/setting';
  import DynamicLink from './DynamicLink.vue';
  import ProcessDiagram from './ProcessDiagram.vue';
  import HisTaskModule from './HisTaskModule.vue';
  import { getBizHisProcessNodeInfo } from './bpm.api';
  const { domainUrl } = useGlobSetting();
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
    compType: '',
  });

  const formData = ref({});
  const path = ref('');
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
  async function handleTrack(params) {
    let res = await getBizHisProcessNodeInfo(params);
    if (res.success) {
      console.log('获取流程节点信息', res);
      formData.value = {
        dataId: res.result.dataId,
        procInsId: res.result.procInsId,
        tableName: res.result.tableName,
        vars: res.result.records,
      };
      console.log('------获取流程节点信息', unref(formData));
      path.value = res.result.formUrl;
      console.log('获取流程节点信息', path);
      let TOKEN = getToken();
      let DOMAIN_URL = domainUrl;
      let TASKID = unref(formData).taskDefKey;
      
      //let URL = (unref(path) || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)); // URL支持{{ window.xxx }}占位符变量
      //获取流程审批url
      let URL = getBpmFormUrl(unref(path), TOKEN, DOMAIN_URL, TASKID);
      if (isUrl(URL)) {
        data.iframeUrl = URL;
        data.compType = 'iframe';
      } else {
        data.compType = 'comp';
      }
      data.visible = true;
    }
  }

  defineExpose({
    handleTrack,
    data,
  });
</script>

<style lang="less" scoped>
  .ant-tabs-left-content {
    padding-top: 10px !important;
  }
</style>
