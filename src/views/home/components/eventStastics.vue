<template>
  <div>
    <div class="statistics-title">
      <div class="part-title">工单统计</div>
      <div class="gongdan-radios">
        <a-radio-group v-model:value="dayParams" @change="getValue">
          <a-radio-button value="today">今日</a-radio-button>
          <a-radio-button value="week">本周</a-radio-button>
          <a-radio-button value="month">本月</a-radio-button>
          <a-radio-button value="year">本年</a-radio-button>
        </a-radio-group>
      </div>
    </div>
    <div>
      <chart-bar :option="{ title: { text: '', textStyle: { fontWeight: 'lighter' } } }"></chart-bar>
    </div>
    <div>
      <chart-line :option="{ title: { text: '', textStyle: { fontWeight: 'lighter' } } }"></chart-line>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import chartBar from './chartBar.vue';
  import chartLine from './chartLine.vue';
  const emit = defineEmits(['success', 'register']);
  const dayParams = ref('today');
  const barData = ref([]);
  const getValue = (val) => {
    dayParams.value = val.target.value;
    emit('success', dayParams.value);
  };
</script>
<style lang="less" scoped>
  .statistics-title {
    display: flex;
    justify-content: space-between;
  }
  .statistics-tit {
    font-size: 16px;
  }
  .ant-radio-button-wrapper {
    //background: #1890ff;
    //color:#fff;
  }
  .gongdan-radios {
    .ant-radio-button-wrapper {
      height: 26px;
      line-height: 25px;
      font-size: 12px;
      padding-inline: 11px;
      margin-bottom: 8px;
      background: #0a8fe9;
      color: #fff;
    }

    .ant-radio-button-wrapper:first-child {
      //border-inline-start: 1px solid #797979;
      //background: #797979;
      //color: #fff;
      border-start-start-radius: 10px;
      border-end-start-radius: 10px;
    }
    .ant-radio-button-wrapper:last-child {
      border-start-end-radius: 10px;
      border-end-end-radius: 10px;
    }

    .ant-radio-button-wrapper-checked {
      border: 1px solid #797979;
      background: #797979;
      color: #fff;
      height: 26px;
      line-height: 26px;
    }
    .ant-radio-button-wrapper:hover {
      color: #fff;
    }
  }
  .part-title{
    font-size: 18px;
    font-weight: bold;
  }
</style>
