<template>
  <div class="tenant-reportinglist-box">
    <div class="title-box">租户报事列表</div>
    <div v-for="(item, index) in titles" :key="index" class="title-item">
      {{ item }}
    </div>
    <div v-for="(item, index) in items" :key="index" class="grid-item">
      {{ item }}
    </div>
  </div>
</template>
<script setup lang="ts">
const titles = ['租户名称', '事件数量(件)', '转工数量(件)',]
const items = [
  '京西一九一九', '8', '2',
  '香啤坊', '11', '0',
  '皮爷咖啡', '15', '5',
  '航天重工', '23', '12'
];
</script>

<style lang="less" scoped>
.tenant-reportinglist-box {
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;

  .title-box {
    height: 30px;
    width: 90%;
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
    margin-left: 5%;
    border-bottom: 1px solid rgb(194, 191, 191);
  }
  .title-item,.grid-item{
    width: 28%;
    height: 15%;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgb(194, 191, 191);
  }
  .title-item{
    font-size: 16px;
    font-weight: 600;
  }
  .grid-item{
    height: 10%;
  }
}
</style>