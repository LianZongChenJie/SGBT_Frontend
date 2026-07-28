<script setup lang="ts"></script>
<template>
  <div class="cards timeout">
    <div class="card-wrap" v-for="(card, index) in cardList" :key="index" :style="`background-image: url(${cardImgs[index % 4]})`">
      <div class="card-title">{{ card.title }}</div>
      <div class="card-num">{{ card.num }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch, inject } from 'vue';
  import card1 from '/@/assets/images/card01.png';
  import card2 from '/@/assets/images/card02.png';
  import card3 from '/@/assets/images/card03.png';
  import card4 from '/@/assets/images/card04.png';

  const cardImgs = [card1, card2, card3, card4];
  const sumObj = ref({
    transfer: 0,
    receive: 0,
    assign: 0,
    check: 0,
  });
  const cardList = ref([]);
  const injectValue = inject('TIMEOUTVALUE', ref({}));
  sumObj.value = injectValue.value;
  // console.log('******* sumObj.value', sumObj.value);
  watch(
    () => injectValue.value,
    (newVal) => {
      if (newVal) {
        sumObj.value = {
          transfer: newVal.transfer || 0,
          receive: newVal.receive || 0,
          assign: newVal.assign || 0,
          check: newVal.check || 0,
        };
        // 数据变化时更新卡片列表
        cardList.value = [
          {
            title: '转工单超时',
            num: sumObj.value.transfer,
          },
          {
            title: '指派超时',
            num: sumObj.value.receive,
          },
          {
            title: '接单超时',
            num: sumObj.value.assign,
          },
          {
            title: '验收超时',
            num: sumObj.value.check,
          },
        ];
      }
    },
    { immediate: true, deep: true }
  );
</script>

<style lang="less" scoped>
  .cards {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    height: 100%;
    flex: 1;
  }
  .timeout {
    gap: 10px !important;
    height: 100%;
  }
  .card-wrap {
    width: calc(50% - 8px);
    min-height: 65px;
    height: auto;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;
    border-radius: 5px;
    box-sizing: border-box;
    color: #fff;
    display: flex;
    padding: 10px 15px;
    justify-content: space-between;
    align-items: end;
    //line-height: 1.2;
    position: relative;
    overflow: hidden;
  }
  .card-title {
    font-size: 16px;
    flex: 1;
    text-align: center;
    padding-left: 42px;
    white-space: nowrap;
  }
  .card-num {
    font-size: 28px;
    text-align: right;
    min-width: 50px;
    font-weight: bold;
    padding-right: 5px;
    flex-shrink: 0;
    line-height: 1;
  }

  @media (max-width: 768px) {
    .card-wrap {
      width: 100%;
      min-height: 70px;
    }
    .card-title {
      padding-left: 32px;
      font-size: 15px;
    }
    .card-num {
      font-size: 24px;
    }
  }
</style>
