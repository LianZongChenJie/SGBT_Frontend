<template>
  <a-card title="我的任务" :loading="loading">
    <template #extra><a href="#">打开</a></template>
    <div style="height: 300px" class="taskList">
      <a-row>
        <a-col :span="20"
          ><a-checkbox-group v-model:value="value" style="display: block">
            <a-row>
              <a-col :span="24"
                ><a-checkbox value="A">
                  <div class="checkList">待接单任务：<span>工单号“20250617112136240”</span></div>
                </a-checkbox></a-col
              >
            </a-row>
          </a-checkbox-group></a-col
        >
        <a-col :span="4" style="text-align: right">
          <span class="process">非常紧急</span>

          <span class="type">工程</span>
        </a-col>
      </a-row>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  const props = defineProps({
    loading: {
      type: Boolean,
    },
  });
  const taskList = ref([]);
</script>
<style scoped lang="less">
  .checkList {
    span {
      color: #1890ff;
    }
  }
  .process {
    color: #555;
    margin-right: 10px;
  }
  .type {
    color: #999;
  }
</style>
