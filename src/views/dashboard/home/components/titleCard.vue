<template>
  <a-card :loading="loading">
    <a-row>
      <a-col :span="12">
        <div class="titleBox">
          <div class="titleLeft"
            ><a-avatar :size="64">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div>
              <h3>史婷</h3>
              <p>金安桥科幻广场项目部 项目经理</p>
            </div>
          </div>
          <div class="titleRight">
            <div>
              <h4>工单数</h4>
              <p>120</p>
            </div>
            <div>
              <h4>未处理工单</h4>
              <p>100</p>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="titleSelect">
          项目：<a-select ref="select" :value="projectName" style="width: 300px">
            <a-select-option value="1">金安桥</a-select-option>
          </a-select>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { UserOutlined } from '@ant-design/icons-vue';
  const props = defineProps({
    loading: {
      type: Boolean,
    },
  });
  const projectName = ref('1');
</script>
<style lang="less" scoped>
  .titleBox {
    display: flex;
    justify-content: space-between;
    padding-left: 20px;

    .titleLeft {
      display: flex;
      align-items: center;
      > div {
        margin-left: 20px;
        h3 {
          font-weight: 900;
          margin: 0;
        }
        p {
          margin: 0;
          color: #888;
        }
      }
    }
    .titleRight {
      display: flex;
      align-items: center;
      > div {
        margin-left: 30px;
        text-align: center;
        padding-right: 30px;
        border-right: 1px solid #ccc;
        h4 {
          margin: 0;
          color: #888;
        }
        p {
          margin: 0;
          color: #555;
          font-size: 20px;
          font-weight: 700;
        }
      }
    }
  }
  .titleSelect {
    display: flex;
    align-items: center;
    justify-content: end;
    height: 100%;
  }
</style>
