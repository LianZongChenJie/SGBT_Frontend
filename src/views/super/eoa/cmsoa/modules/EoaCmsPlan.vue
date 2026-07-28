<template>
  <a-card v-bind="$attrs" :bordered="false" :style="{ marginTop: '12px', height: '513px' }">
    <template #title>
      <span><a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />我的计划</span>
    </template>
    <template #extra>
      <a @click="loadMore('plan')">更多</a>
    </template>
    <FullCalendar v-if="refresh" ref="calendar" :options="calendarOptions" />
    <!-- 弹窗区域 -->
    <PlanModal ref="planRef" @success="renderCalendar" />
  </a-card>
</template>

<script lang="ts" name="eoa-cms-plan" setup>
  import { ref, unref, computed, watch, nextTick } from 'vue';
  import { onMountedOrActivated } from '/@/hooks/core/onMountedOrActivated';
  import { router } from '/@/router';
  import '@fullcalendar/core/vdom';
  import FullCalendar, { CalendarOptions, EventApi, EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/vue3';
  import { useModal } from '/@/components/Modal';
  import { useCalendar } from '../../hooks/useCalendar';
  import { useUserStore } from '/@/store/modules/user';
  import { queryMyJoinPlan } from '/@/views/super/eoa/plan/plan.api';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

  const props = defineProps({
    config: {
      type: Object,
      default: () => ({}),
    },
    isDesign: {
      type: Boolean,
      required: false,
      default: false,
    },
    isView: {
      type: Boolean,
      required: false,
      default: false,
    },
    size: {
      type: [String, Object],
    },
  });
  const PlanModal = createAsyncComponent(() => import('../../plan/components/PlanModal.vue'));
  const userStore = useUserStore();
  const planRef = ref();
  const refresh = ref(true);
  const [{ defaultSettings, currentEvents }, { renderCalendar }] = useCalendar(queryMyJoinPlan);
  /**
   * 日历属性
   */
  const calendarOptions = computed(() => {
    return {
      ...defaultSettings,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridDay',
      },
      weekMode: 'fixed',
      weekNumberCalculation: 'ISO',
      eventLimit: 1,
      events: unref(currentEvents),
      select: handleDateSelect,
      eventClick: handleEventClick,
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

  async function loadMore(type) {
    await router.push({ path: '/plan/list' });
  }

  //监听配置修改
  watch(
    () => props.config,
    (val) => {
      if (val) {
        forceRefresh();
      }
    },
    { deep: true }
  );

  //监听页面内预览的修改
  watch(
    () => props.isView,
    () => {
      //重新加载数据
      renderCalendar();
    },
    { deep: true }
  );

  function forceRefresh() {
    refresh.value = false;
    nextTick(() => {
      refresh.value = true;
    });
  }
  onMountedOrActivated(() => {
    renderCalendar();
    nextTick(() => {
      setTimeout(() => {
        forceRefresh();
      }, 30);
    });
  });
</script>

<style scoped></style>
