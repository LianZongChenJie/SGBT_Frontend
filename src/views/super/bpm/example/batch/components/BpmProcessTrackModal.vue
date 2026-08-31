<template>
  <!-- 审批进度弹出框 -->
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
          <span>审批记录</span>
        </template>
        <HisTaskModule :formData="formData"></HisTaskModule>
      </a-tab-pane>

      <a-tab-pane key="2">
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
  import ProcessDiagram from '/src/views/super/bpm/process/manage/components/ProcessDiagram.vue';
  import HisTaskModule from '/src/views/super/bpm/process/manage/components/HisTaskModule.vue';
  import { getBizHisProcessNodeInfo } from '/src/views/super/bpm/process/manage/components/bpm.api';
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
      path.value = res.result.formUrl;
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
