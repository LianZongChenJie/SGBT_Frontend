<template>
  <div class="p-4">
    <!--左侧分类日程-->
    <div class="left-calendar" style="width: 250px">
      <div style="height: 100%" class="calendar-type flex">
        <div class="calendar-type-title">
          <span class="font-color">分类日程</span>
        </div>
      </div>
      <div class="calendar-type-List">
        <ul>
          <li v-for="item in eoaPlanTypeList">
            <a-checkbox v-model:checked="item.checked" v-model:value="item.value" @change="checkChange">{{ item.text }}</a-checkbox>
          </li>
          <li>
            <a-checkbox v-model:checked="taskCheck" />
            <a-select v-model:value="tasks" style="width: 100px" @change="tasksHandleChange" size="small" class="task-select">
              <a-select-option value="myJoin"><span class="font-size-13">参与的任务</span></a-select-option>
              <a-select-option value="myCharge"><span class="font-size-13">负责的任务</span></a-select-option>
            </a-select>
          </li>
        </ul>
      </div>
    </div>
    <!--头部标题展示-->
    <div style="width: calc(100% - 250px); float: left">
      <div class="right-left-header">
        <a-button class="today" v-if="!showList" @click="todayHandleClick">今天</a-button>
        <div style="float: left; margin-left: 0.75em">
          <a-button class="prev-next" v-if="!showList" preIcon="ant-design:left-outlined" @click="prevHandleClick" />
          <a-button class="prev-next" v-if="!showList" preIcon="ant-design:right-outlined" @click="nextHandleClick" />
          <h2 v-if="!showList"
            >{{ showText }}
            <span>{{ showDateTime }}</span>
          </h2>
        </div>
        <div class="right-center-header">
          <div class="fc-button-group">
            <button class="common-button" :class="activeKey === 'timeGridDay' ? 'border-color' : ''" @click="monthHandleClick('timeGridDay')"
              >日</button
            >
            <button class="common-button" :class="activeKey === 'timeGridWeek' ? 'border-color' : ''" @click="monthHandleClick('timeGridWeek')"
              >周</button
            >
            <button class="common-button" :class="activeKey === 'dayGridMonth' ? 'border-color' : ''" @click="monthHandleClick('dayGridMonth')"
              >月</button
            >
            <button class="common-button" :class="activeKey === 'list' ? 'border-color' : ''" @click="listHandleClick">列表</button>
          </div>
        </div>
        <div class="right-right-header">
          <a-button class="right-button" preIcon="ant-design:plus-outlined" @click="createPlanHandleClick">新日程</a-button>
        </div>
      </div>

      <div style="margin-top: 48px; padding: 10px 10px 0" :class="activeKey === 'timeGridDay' ? 'day-full-calendar' : 'mouth-full-calendar'">
        <!--日历-->
        <template v-if="!showList">
          <a-card :border="false" class="full-calendar">
            <FullCalendar ref="calendar" :options="calendarOptions" />
          </a-card>
        </template>
        <!--列表-->
        <template v-else>
          <a-list size="small" bordered :data-source="datasource" class="calendar-list">
            <template #header>
              <div class="list-header">
                <div class="list-type">分类</div>
                <div class="list-date">开始时间</div>
                <div class="list-time">结束时间</div>
                <div class="list-add-day">是否全天</div>
                <div class="list-name">事件名称</div>
                <div class="list-status">状态</div>
                <div style="float: right">
                  <a-range-picker size="small" format="YYYY-MM-DD" @change="pickerHandleChange" />
                </div>
              </div>
            </template>
            <template #renderItem="{ item }">
              <a-list-item style="cursor: pointer" class="list-item" @click="handleListClick(item)">
                <div class="list-type">{{ item.type_dictText }}</div>
                <div class="list-date">{{ item.startTime }}</div>
                <div class="list-time">{{ item.endTime }}</div>
                <div class="list-add-day">{{ item.allDay_dictText }}</div>
                <div class="list-name">{{ item.title }}</div>
                <div class="list-status">{{ item.status_dictText }}</div>
              </a-list-item>
            </template>
            <template #footer>
              <a-pagination
                v-if="datasource.length > 0"
                :current="pageNo"
                :page-size="pageSize"
                :page-size-options="pageSizeOptions"
                :total="total"
                :showQuickJumper="true"
                :showSizeChanger="true"
                :show-total="showTotal"
                @change="handlePageChange"
                class="list-footer"
                size="small"
              />
            </template>
          </a-list>
        </template>
      </div>
    </div>
  </div>
  <!--计划编辑弹窗-->
  <PlanModal ref="planRef" @success="loadPlanData" />
</template>
<script lang="ts" name="plan-view" setup>
  import { ref, unref, computed } from 'vue';
  import { onMountedOrActivated } from '/@/hooks/core/onMountedOrActivated';
  import '@fullcalendar/core/vdom';
  import FullCalendar, { CalendarOptions, EventApi, EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/vue3';
  import { useCalendar } from './PlanCalendar';
  import { useUserStore } from '/@/store/modules/user';
  import PlanModal from './components/PlanModal.vue';
  import { getPlanList, getPlanListByPage } from './plan.api';
  import { initDictOptions } from '/@/utils/dict';
  import dayjs from 'dayjs';
  import { Pagination } from 'ant-design-vue';

  const userStore = useUserStore();
  const planRef = ref();
  const calendar = ref();
  const [{ defaultSettings, currentEvents, dayText, dateTime }, { renderCalendar, getWeekDate, getWeekByYear }] = useCalendar(getPlanList, calendar);
  const taskCheck = ref<boolean>(true);
  const tasks = ref<string>('myJoin');
  const eoaPlanTypeList = ref<any>([]);
  const type = ref<any>([]);
  const showList = ref<boolean>(false);
  const showText = dayText;
  const activeKey = ref<string>('dayGridMonth');
  const showDateTime = dateTime;
  const datasource = ref<any>([]);
  const pageNo = ref<number>(1);
  const pageSize = ref<number>(10);
  const pageSizeOptions = ref<any>(['10', '20', '30']);
  const total = ref<number>(0);
  const APagination = Pagination;

  /**
   * 日历属性
   */
  const calendarOptions = computed(() => {
    return {
      ...defaultSettings,
      initialView: 'dayGridMonth',
      events: unref(currentEvents),
      editable: false,
      select: handleDateSelect,
      eventClick: handleEventClick,
      eventsSet: handleEvents,
      eventDrop: handleEventDrop,
    } as CalendarOptions;
  });

  /**
   * 时间选择事件
   * @param selectInfo
   */
  function handleDateSelect(selectInfo: DateSelectArg) {
    planRef.value.show({
      isUpdate: false,
      joinPerson: userStore.getUserInfo.username,
      ...selectInfo,
    });
  }
  /**
   * 事件点击
   * @param selectInfo
   */
  function handleEventClick(clickInfo: EventClickArg) {
    planRef.value.show({
      isUpdate: true,
      record: { id: clickInfo.event._def.publicId },
    });
  }

  function handleEvents(events: EventApi[]) {
    console.log('events===》', events);
  }

  /**
   * 拖拽后的事件
   * @param events
   */
  function handleEventDrop(events) {
    //拖拽移动日期后，同步修改计划日期
    if (events.event) {
      planRef.value.show({
        isUpdate: true,
        record: { id: events.event.id, startTime: events.event.start, endTime: events.event.end },
      });
    }
  }
  //update-begin---author:wangshuai ---date:20221020  for：[VUEN-2394]我的日程功能改造------------

  /**
   * 今天点击事件
   */
  function todayHandleClick() {
    unref(calendar).getApi().today();
    getDateTimeText();
  }

  /**
   * 日历下一页
   */
  function nextHandleClick() {
    unref(calendar).getApi().next();
    showText.value = unref(calendar).getApi().view.title;
    getDateTimeText();
  }

  /**
   * 日历上一页
   */
  function prevHandleClick() {
    unref(calendar).getApi().prev();
    showText.value = unref(calendar).getApi().view.title;
    getDateTimeText();
  }

  /**
   * 年月日点击事件
   * @param type
   */
  function monthHandleClick(type) {
    showList.value = false;
    setTimeout(() => {
      activeKey.value = type;
      let api = unref(calendar).getApi();
      api.changeView(type);
      showText.value = api.view.title;
      getDateTimeText();
    }, 100);
  }

  /**
   * 列表点击事件
   */
  function listHandleClick() {
    pageNo.value = 1;
    getPlanPageList();
    showList.value = true;
    activeKey.value = 'list';
  }

  /**
   * 获取计划列表分页
   */
  function getPlanPageList(date = {}) {
    let params = {
      pageNo: unref(pageNo),
      pageSize: unref(pageSize),
      type: unref(type).join(','),
      planType: unref(tasks),
      startTime: '',
      endTime: '',
    };
    if (date.startTime) {
      params.startTime = date.startTime;
      params.endTime = date.endTime;
    }
    getPlanListByPage(params).then((res) => {
      if (res.success) {
        datasource.value = res.result.records;
        total.value = res.result.total;
      }
    });
  }

  /**
   * 加载日程计划数据
   */
  function loadPlanData() {
    //update-begin---author:wangshuai ---date:20221028  for：[VUEN-2563]列表新增完数据后，未刷新------------
    if(unref(activeKey) === 'list'){
      pageNo.value = 1
      pageSize.value = 10
      getPlanPageList();
    }else{
      renderCalendar!({ type: unref(type).join(','), planType: unref(tasks) });
    }
    //update-end---author:wangshuai ---date:20221028  for：[VUEN-2563]列表新增完数据后，未刷新--------------
  }

  /**
   * 复选框选中事件
   * @param e
   */
  function checkChange(e) {
    if (e.target.checked) {
      type.value.push(e.target.value);
    } else {
      type.value = type.value.filter((item) => item !== e.target.value);
    }
    if (unref(activeKey) === 'list') {
      getPlanPageList();
    } else {
      renderCalendar!({ type: unref(type).join(','), planType: unref(tasks) });
    }
  }

  /**
   * 参与任务下拉选中事件
   * @param value
   */
  function tasksHandleChange(value) {
    if (unref(activeKey) === 'list') {
      getPlanPageList();
    } else {
      renderCalendar!({ type: unref(type).join(','), planType: unref(tasks) });
    }
  }

  /**
   * 获取时间文本
   */
  function getDateTimeText() {
    let api = unref(calendar).getApi();
    let date = api.getDate();
    //如果是点击天
    if (unref(activeKey) === 'timeGridDay') {
      showDateTime.value = getWeekDate!(date);
      api.setOption('dayHeaders', false);
    } else if (unref(activeKey) === 'timeGridWeek') {
      //如果是点击周
      showDateTime.value = '第' + getWeekByYear!(date) + '周';
      api.setOption('dayHeaders', true);
    } else {
      //如果是点击月和列表
      showDateTime.value = '';
      api.setOption('dayHeaders', true);
    }
    //根据当前年月日查询列表信息
    let getCurrentData = api.getCurrentData();
    let activeRange = getCurrentData.dateProfile.activeRange;
    let startTime = dayjs(activeRange.start).format('YYYY-MM-DD HH:mm:ss');
    let endTime = dayjs(activeRange.end).format('YYYY-MM-DD HH:mm:ss');
    //update-begin---author:wangshuai ---date:20221104  for：[VUEN-2646]周、月有数据的情况下，点击日 没有数据显示------------
    let params = { type: unref(type).join(','), planType: unref(tasks), endTime: endTime,activeKey:unref(activeKey) }
    //如果不是日，那么再加上开始时间
    if(unref(activeKey) !== 'timeGridDay'){
      params['startTime'] = startTime;
    }
    renderCalendar!(params);
    //update-end---author:wangshuai ---date:20221104  for：[VUEN-2646]周、月有数据的情况下，点击日 没有数据显示--------------
  }

  /**
   * 初始化字典
   */
  initDictConfig();

  /**
   * 获取会议类型
   */
  async function initDictConfig() {
    let eoaPlanType = await initDictOptions('eoa_plan_type');
    let planType: any = [];
    eoaPlanType.forEach((item) => {
      item.checked = true;
      planType.push(item.value);
    });
    type.value = planType;
    eoaPlanTypeList.value = eoaPlanType;
    let startTime = dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss');
    let endTime = dayjs().endOf('month').format('YYYY-MM-DD HH:mm:ss');
    renderCalendar!({ type: unref(type).join(','), planType: unref(tasks), startTime: startTime, endTime: endTime });
  }

  /**
   * 创建日程
   */
  function createPlanHandleClick() {
    planRef.value.show({
      isUpdate: false,
      allDay: '1',
      start: new Date(),
      end: new Date(),
    });
  }

  /**
   * 分页数发生改变
   */
  function handlePageChange(page, current) {
    pageNo.value = page;
    pageSize.value = current;
    getPlanPageList();
  }

  /**
   * 显示条数
   * @param total
   * @param range
   */
  function showTotal(total, range) {
    return range[0] + '-' + range[1] + ' 共' + total + '条';
  }

  /**
   * 日期选择
   * @param date
   */
  function pickerHandleChange(date: any) {
    let dateParam = {};
    if (date) {
      let startTime = dayjs(date[0]).format('YYYY-MM-DD HH:mm:ss');
      let endTime = dayjs(date[1]).format('YYYY-MM-DD HH:mm:ss');
      dateParam['startTime'] = startTime;
      dateParam['endTime'] = endTime;
    }
    getPlanPageList(dateParam);
  }

  /**
   * list列表点击事件
   * @param record
   */
  function handleListClick(record) {
    planRef.value.show({
      record,
      isUpdate: true,
    });
  }

  //update-end---author:wangshuai ---date:20221020  for：[VUEN-2394]我的日程功能改造--------------
</script>

<style lang="less" scoped>
  .calendar-type {
    overflow-x: hidden;
    overflow-y: auto;
  }
  .flex {
    display: flex;
  }
  .calendar-type-title {
    width: 100%;
  }
  .font-color {
    color: rgba(0, 0, 0, 0.54);
    font-size: 13px;
  }
  .calendar-type-List {
    width: 100%;
  }
  .calendar-type-List > ul {
    font-size: 13px;
    padding: 10px 10px 0;
    width: 100%;
    border-color: rgba(0, 0, 0, 0.15);
  }
  .calendar-type-List li {
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    cursor: move;
    font-size: 12px;
    overflow: hidden;
    height: 40px;
    line-height: 40px;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
  .calendar-type-List :deep(.ant-checkbox-wrapper) {
    font-size: 13px !important;
  }
  .font-size-13 {
    font-size: 13px;
    color: #000000;
  }
  .task-select :deep(.ant-select-selector) {
    border: none !important;
    box-shadow: none !important;
  }
  .task-select :deep(.ant-select-selection__rendered) {
    border: none !important;
  }
  .task-select :deep(.ant-checkbox-inner) {
    width: 14px;
    height: 14px;
  }
  .left-calendar {
    width: 15%;
    float: left;
    height: 100%;
    background-color: white;
    border-bottom: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.24);
    padding: 10px 10px;
  }
  .right-left-header {
    background: hsla(0, 0%, 100%, 0.9);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
    height: 45px;
    padding: 0 28px;
    user-select: none;
    width: 100%;
    float: left;
    z-index: 8;
  }
  .right-left-header h2 {
    display: inline-block;
    font-size: 16px;
    font-weight: 400;
    margin-left: 20px;
    line-height: 45px;
  }
  .today {
    float: left;
    color: #333;
    height: 30px;
    line-height: 30px;
    margin-top: 8px;
    padding: 0;
    text-align: center;
    width: 46px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  .today:hover {
    color: white;
    background-color: #1e88e5 !important;
  }
  .prev-next:hover {
    color: white;
    background-color: #1e88e5 !important;
  }
  .prev-next {
    float: left;
    color: #333;
    height: 30px;
    line-height: 30px;
    margin-top: 8px;
    padding: 0;
    text-align: center;
    width: 30px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  .right-center-header {
    position: absolute;
    left: 50%;
    font-size: 1em;
    width: 220px;
    float: left;
  }
  .fc-button-group {
    height: 45px;
    line-height: 45px;
    box-shadow: none;
    display: inline-block;
    box-sizing: border-box;
    .common-button {
      border: 0;
      border-bottom: 3px solid transparent;
      border-radius: 0;
      box-shadow: none;
      box-sizing: border-box;
      height: 45px;
      line-height: 48px;
      margin: 0 10px;
      padding: 0;
      transition: border-color 0.3s ease-in-out;
      width: 34px;
      //update-begin---author:wangshuai ---date:20230828  for：【QQYUN-6370】升级后日历样式问题------------
      background-color: transparent;
      cursor: pointer;
      //update-end---author:wangshuai ---date:20230828  for：【QQYUN-6370】升级后日历样式问题------------
    }
    .border-color {
      border-color: #1e88e5;
      color: #1e88e5;
    }
  }
  .right-right-header {
    float: right;
    height: 32px;
    line-height: 32px;
    margin-top: 7px;
    .right-button {
      border-radius: 18px;
      color: #fff;
      background-color: #1e88e5;
    }
  }
  .mouth-full-calendar :deep(.fc-day-today) {
    background-color: rgb(255, 240, 240);
  }
  .day-full-calendar :deep(.fc-day-today) {
    background-color: #ffffff;
  }
  .list-header {
    font-weight: 700;
    height: 46px;
    line-height: 46px;
    padding: 0 16px;
  }
  .calendar-list {
    background-color: white;
    :deep(.ant-list-item) {
      justify-content: normal;
    }
  }
  .calendar-list :deep(.ant-list-header) {
    padding: 0 !important;
  }
  .list-type {
    width: 10%;
    float: left;
  }
  .list-date {
    width: 15%;
    float: left;
  }
  .list-time {
    width: 15%;
    float: left;
  }
  .list-add-day {
    width: 8%;
    float: left;
  }
  .list-name {
    width: 12%;
    float: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .list-status {
    width: 10%;
    float: left;
  }
  .list-footer {
    text-align: end;
  }
  .list-item:hover {
    background: #f5f5f5;
  }
  .full-calendar :deep(a){
    color: black;
  }
</style>
