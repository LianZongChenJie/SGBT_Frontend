<template>
  <!--流程任务历史-->
  <div>
    <!-- 步骤条 -->
    <a-spin :spinning="loading">
      <a-card>
        <a-steps progressDot :current="stepIndex" style="padding: 10px" size="default">
          <template v-if="resultObj.bpmLogListCount > 3">
            <a-step>
              <template #title>
                <div class="task-title">...</div>
              </template>
            </a-step>
          </template>
          <template v-for="(item, index) in resultObj.bpmLogStepList">
            <a-step>
              <template #title>
                <div class="task-title">{{ item.taskName }}</div>
              </template>
              <template #description>
                <div class="descriptionDiv">
                  <span>
                    <a-avatar shape="square" style="background-color: #40a9ff">
                      <template #icon><UserOutlined /></template>
                    </a-avatar>
                  </span>
                  <span style="margin-left: 5px">
                    <div class="task-date" style="text-align: left">
                      <a-tooltip placement="top">
                        <template #title
                          ><span>{{ item.opTime }}</span></template
                        >
                        <span> {{ item.opTime ? item.opTime.substr(0, 10) : item.opTime }}</span>
                      </a-tooltip>
                    </div>
                    <div class="task-user" style="text-align: left"
                      ><span> {{ item.opUserName }}</span></div
                    >
                  </span>
                </div>
              </template>
            </a-step>
          </template>
          <template v-if="resultObj.currTaskName && resultObj.currTaskName != ''">
            <a-step>
              <template #title>
                <div class="task-title">{{ resultObj.currTaskName }}</div>
              </template>
              <template #description>
                <div class="descriptionDiv">
                  <a-avatar style="background-color: #faad14eb">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <span style="margin-left: 5px">
                    <div class="task-date" style="text-align: left">
                      <a-tooltip placement="top">
                        <template #title
                          ><span>{{ resultObj.currTaskNameStartTime }}</span></template
                        >
                        <span style="color: #ff6d75">
                          {{
                            resultObj.currTaskNameStartTime ? resultObj.currTaskNameStartTime.substr(0, 10) : resultObj.currTaskNameStartTime
                          }}</span
                        >
                      </a-tooltip>
                    </div>
                    <div class="task-user" style="text-align: left"
                      ><span> {{ resultObj.currTaskNameAssignee }}</span></div
                    >
                  </span>
                </div>
              </template>
            </a-step>
            <a-step>
              <template #title>
                <div class="task-title">...</div>
              </template>
            </a-step>
          </template>
        </a-steps>
      </a-card>
      <!-- 意见 -->
      <a-card title="意见信息" :bodyStyle="{ padding: '0 20px' }" size="default" style="margin-top: 20px">
        <a-list itemLayout="vertical">
          <template v-for="(item, index) in resultObj.bpmLogList">
            <a-list-item>
              <a-list-item-meta :description="item.remarks||'无意见信息'">
                <template #title>
                  <a
                    ><p>{{ item.opUserName }}</p
                    ><span style="color: #ff6d75">[{{ item.taskName }}]</span> {{ item.opTime }}</a
                  >
                </template>
                <template #avatar>
                  <a-avatar :size="36" style="background-color: #51cbff">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                </template>
              </a-list-item-meta>
              <template v-for="(file, index) in item.bpmFiles" :key="index">
                <div class="ant-upload-list ant-upload-list-text">
                  <div class="ant-upload-list-item ant-upload-list-item-done">
                    <div class="ant-upload-list-item-info">
                      <span>
                        <PaperClipOutlined />
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          :title="file.fileName"
                          :href="getFileAccessHttpUrl(file.filePath)"
                          class="ant-upload-list-item-name"
                          >{{ file.fileName }}</a
                        >
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref, onMounted, computed } from 'vue';
  import JEllipsis from '/@/components/Form/src/jeecg/components/JEllipsis.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { getHisProcessTaskTransInfo } from './bpm.api';
  import { UserOutlined, PaperClipOutlined } from '@ant-design/icons-vue';

  //组件接受传参
  const props = defineProps({
    formData: { type: Object },
  });
  //组件接受传参
  const resultObj = ref({});
  const loading = ref(false);
  //步骤点
  const stepIndex = computed(() => {
    if (unref(resultObj).bpmLogListCount > 3) {
      return unref(resultObj).bpmLogStepListCount + 1;
    }
    return unref(resultObj).bpmLogStepListCount;
  });

  /**
   * 加载数据
   * @param formData
   */
  async function loadData(formData) {
    var params = { procInstId: formData.procInsId }; //查询条件
    loading.value = true;
    const res = await getHisProcessTaskTransInfo(params);
    loading.value = false;
    if (res.success) {
      resultObj.value = res.result;
    }
  }

  onMounted(() => {
    loadData(props.formData);
  });
</script>

<style scoped>
  .task-info {
    margin: 20px 0;
  }

  .task-title {
    font-weight: bold;
  }

  .task-date {
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-steps-item-description {
    max-width: 200px !important;
  }

  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px;
  }
  /** 标题和描述对齐 */
  :deep(.ant-steps-item-content) {
    text-align: left;
    margin-left: 50px;
  }
  /** 描述的样式 */
  .descriptionDiv {
    display: flex;
    justify-content: left;
    align-items: center;
    margin-top: 5px;
  }
</style>
