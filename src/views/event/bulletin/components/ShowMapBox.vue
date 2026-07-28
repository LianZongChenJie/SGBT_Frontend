<template>
  <div class="show-map-box">
    <div class="title-box">按照地图事件分布</div>
    <div class="map-box">
      <!-- <Modal :visible="visible" title="三高炉及秀池展示" @ok="handleOk" :mask="false" width="200px" :style="{top: '15vh', left: '17%'}">
        <template #footer>
          <div class="custom-footer">
            <a-button type="primary" @click="handleOk">查看详情</a-button>
          </div>
        </template>
        <div class="modal-box" style="padding: 0 20px;">
          <div>报警事件：<span>112</span></div>
          <div>未处理事件：<span>15</span></div>
          <div>已取消事件：<span>10</span></div>
        </div>
      </Modal> -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Modal } from 'ant-design-vue';

  const visible = ref(true);

  const showModal = () => {
    visible.value = true;
  };

  const handleOk = () => {
    console.log('点击了确定');
    visible.value = false;
  };
</script>

<style lang="less" scoped>
  .show-map-box {
    height: 100%;
    width: 100%;

    .title-box {
      height: 30px;
      width: 90%;
      font-weight: 600;
      font-size: 18px;
      line-height: 20px;
      margin-left: 5%;
      border-bottom: 1px solid rgb(194, 191, 191);
    }
    .map-box {
      height: calc(100% - 46px);
      margin-top: 8px;
      background-image: url('../../../../../public/resource/img/event_bj.jpg');
      background-size: cover;
      /* 或 contain */
      background-position: center;
      background-repeat: no-repeat;
    }
  }
</style>
