<template>
  <div class="p-4 kanban">
    <a-row type="flex" justify="start" :gutter="[20, 10]" class="equal-height-row">
      <a-col :span="24">
        <div class="chaxunBtn">
          <div>项目：</div>
          <a-select v-model:value="name" placeholder="请选择项目名称" class="search-select" @change="getSelected">
            <a-select-option :value="item.value" v-for="(item, index) in options" :key="index">{{ item.title }} </a-select-option>
          </a-select>
          <div>时间：</div>
          <a-range-picker v-model:value="searchRangeDate" :format="dateFormat" @change="handleChangeSearchDate" />
          <a-button type="primary" @click="reload">查询</a-button>
        </div>
      </a-col>
      <a-col :span="16" class="left-col">
        <a-card size="small" style="margin-bottom: 10px">
          <div class="cards">
            <div class="card-wrap" v-for="(card, index) in cardList" :key="index" :style="`background-image: url(${cardImgs[index % 4]})`">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-num">{{ card.num }}</div>
              <div class="card-compare" v-if="card.compareTit">
                <span class="compare-tit">{{ card.compareTit }}</span>
                <span
                  class="compare-num"
                  :class="{
                    'text-increase': card.compareNum > 0,
                    'text-decrease': card.compareNum < 0,
                  }"
                >
                  {{ card.compareNum > 0 ? '+' : '' }}{{ card.compareNum }}
                </span>
              </div>
            </div>
          </div>
        </a-card>
        <a-card size="small" class="flex-card">
          <event-stastics @success="getTimeValue"></event-stastics>
        </a-card>
      </a-col>
      <a-col :span="8" class="right-col">
        <a-card size="small" class="flex-card">
          <div class="part-title">工单状态分析</div>
          <chart-pie></chart-pie>
        </a-card>
        <a-card size="small" style="margin-top: 10px" class="flex-card">
          <div class="part-title">超时事件和工单</div>
          <time-out></time-out>
        </a-card>
        <a-card size="small" style="margin-top: 10px" class="flex-card">
          <div class="part-title">满意度占比</div>
          <chart-star></chart-star>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref, watch, provide } from 'vue';
  import { getList, getSysDepart } from './api.ts';
  import dayjs, { Dayjs } from 'dayjs';
  import EventStastics from '@/views/home/components/eventStastics.vue';
  import timeOut from './components/timeOut.vue';
  import chartPie from './components/chartPie.vue';
  import chartStar from './components/chartStar.vue';
  import card1 from '/@/assets/images/card1.png';
  import card2 from '/@/assets/images/card2.png';
  import card3 from '/@/assets/images/card3.png';
  import card4 from '/@/assets/images/card4.png';

  const cardImgs = [card1, card2, card3, card4];
  const name = ref('');
  const searchRangeDate = ref<[Dayjs, Dayjs]>([]);
  const options = ref([]);
  const todayObj = ref({});
  const cardList = ref([]);
  const searchParams = ref({
    project: '',
    startDate: '',
    endDate: '',
    chartType: 'today',
  });
  const chartData = ref({});
  const timeoutValue = ref({
    transfer: 0,
    receive: 0,
    assign: 0,
    check: 0,
  });
  const pieValue = ref([]);
  const starValue = ref({});
  provide('CHARDATA', chartData);
  provide('TIMEOUTVALUE', timeoutValue);
  provide('PIEVALUE', pieValue);
  provide('STARVALUE', starValue);

  const handleChangeSearchDate = (dateValue: [Dayjs, Dayjs], dateStringArray: string[]) => {
    if (dateStringArray && dateStringArray.length === 2) {
      searchParams.value.startDate = dateStringArray[0];
      searchParams.value.endDate = dateStringArray[1];
      searchRangeDate.value = dateValue;
    }
  };
  const getSelected = async (selectedId) => {
    try {
      const selectedItem = options.value.find((item) => item.id === selectedId);
      searchParams.value.project = selectedItem.title === '所有项目' ? '' : selectedItem.title;
    } catch (error) {}
  };
  const dateFormat = 'YYYY-MM-DD';
  const getTimeValue = (val) => {
    searchParams.value.chartType = val;
    reload();
  };

  const reload = async () => {
    const departList = await getSysDepart();
    options.value = [{ id: '', title: '所有项目', value: '' }, ...departList];
    cardList.value = [];

    const res = await getList(searchParams.value);
    todayObj.value = res?.todaySummary || {};
    cardList.value = [
      { title: '今日工单量', num: todayObj.value.todayOrderCount || 0, compareTit: '较昨日', compareNum: todayObj.value.todayOrderRatio || 0 },
      { title: '今日超时工单', num: todayObj.value.timeout || 0 },
      { title: '今日工单完成量', num: todayObj.value.finishRate || 0, compareTit: '较昨日', compareNum: todayObj.value.finishRateRatio || 0 },
      { title: '今日待处理', num: todayObj.value.pendingCount || 0 },
    ];
    chartData.value = res?.chart || {};
    timeoutValue.value = { ...timeoutValue.value, ...res?.timeoutSummary };
    pieValue.value = Array.isArray(res?.statusPie) ? res.statusPie : [];
    starValue.value = res?.satisfaction || {};
  };

  onMounted(async () => {
    try {
      const monthFirstDay = dayjs().startOf('month').format(dateFormat);
      const monthLastDay = dayjs().endOf('month').format(dateFormat);
      searchParams.value.startDate = monthFirstDay;
      searchParams.value.endDate = monthLastDay;
      searchRangeDate.value = [dayjs(monthFirstDay, dateFormat), dayjs(monthLastDay, dateFormat)];
      searchParams.value.chartType = 'today';
      await reload();
    } catch (error) {
      console.error('初始化获取项目部失败：', error);
    }
  });
</script>

<style lang="less">
  .kanban {
    .ant-card {
      border-radius: 10px;
    }
  }
</style>

<style lang="less" scoped>
  .equal-height-row {
    display: flex;
    align-items: stretch;
  }

  .left-col,
  .right-col {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .flex-card {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.ant-card-body) {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }
  .chaxunBtn {
    width: 100%;
    padding: 12px;
    background: #fff;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border-radius: 10px;
  }
  .cards {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
  .card-wrap {
    width: 180px;
    height: 110px;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    border-radius: 5px;
    padding: 15px;
    box-sizing: border-box;
    color: #fff;
  }
  .card-title {
    font-size: 15px;
  }
  .card-num {
    font-size: 30px;
    width: 50%;
    text-align: center;
  }
  .card-compare {
    font-size: 12px;
  }
  .compare-tit {
    margin-right: 10px;
  }
  .search-select {
    width: 200px;
    margin-right: 10px;
  }
  .chaxunBtn button {
    margin-left: 10px;
  }
  .part-title {
    font-size: 18px;
    font-weight: bold;
  }
</style>
