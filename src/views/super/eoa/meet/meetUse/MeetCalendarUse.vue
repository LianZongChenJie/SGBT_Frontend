<template>
  <div>
    <!-- 使用情况日历  -->
    <div style="margin: 0 auto" class="calendar-div">
      <FullCalendar ref="baseCalendar" :options="calendarOptions" @select="select"></FullCalendar>
      <a-empty v-if="_data.resources.length == 0" style="margin-top: 10px" />
    </div>
    <!--回显气泡-->
    <div v-if="_data.showBox">
      <div class="show-parent" :style="{ left: _data.tranLeft, top: _data.tranTop }">
        <a-tooltip v-model:open="_data.visible" placement="top">
          <template #title>
            {{ _data.item.title }}<br />
            {{ formatToDateTime(_data.item.start) }}<br />
            {{ formatToDateTime(_data.item.end) }}
          </template>
        </a-tooltip>
      </div>
    </div>
    <ManageModal @register="registerModal" @success="reload"></ManageModal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, nextTick, reactive, computed, watch } from 'vue';
  import FullCalendar from '@fullcalendar/vue3';
  import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
  import interactionPlugin from '@fullcalendar/interaction';
  import ManageModal from '/@/views/super/eoa/meet/manage/components/ManageModal.vue';
  import { useModal } from '/@/components/Modal';
  import { queryMettingRoom } from '/@/views/super/eoa/meet/meetingRoom/room.api.ts';
  import { queryMetting } from '/@/views/super/eoa/meet/manage/manage.api.ts';
  import { formatToDateTime } from '/@/utils/dateUtil';

  // Emits声明
  const emit = defineEmits(['change','reloadTable']);
  const props = defineProps({
    adleEdit: { type: Boolean, default: true },
  });
  const [registerModal, { openModal }] = useModal();

  const calendarPlugins = ref([resourceTimelinePlugin, interactionPlugin]);
  /**
   * 日历属性
   */
  const calendarOptions = computed(() => {
    return {
      resourceAreaHeaderContent: '会议室',
      resourceAreaWidth: '20%',
      height: 'auto',
      contentHeight: '50',
      locale: 'zh-cn',
      selectable: true,
      plugins: calendarPlugins.value,
      weekNumberCalculation: 'ISO',
      selectAllow: _data.handlerSelectAllow,
      firstDay: 0,
      schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
      aspectRatio: 1.65,
      headerToolbar: {
        left: 'prev,next,today',
        center: 'title',
        right: 'resourceTimelineMonth,resourceTimelineWeek,resourceTimelineDay',
      },
      initialView: 'resourceTimelineMonth',
      buttonText: {
        today: '今天',
        resourceTimelineMonth: '月',
        resourceTimelineWeek: '周',
        resourceTimelineDay: '日',
      },
      resources: _data.resources,
      events: _data.calendarEventsNew,
      eventClick: handleEventClick,
      eventMouseEnter: eventEnter,
      eventMouseLeave: eventLeave,
      slotEventOverlap: false,
    };
  });
  //数据信息
  const _data = reactive({
    visible: true,
    showBox: false,
    tranLeft: 0,
    tranTop: 0,
    eventDataSource: [],
    eventMaps: {},
    item: {},
    //点击今天日列表图
    eventLimitClick: 'resourceTimelineDay',
    handlerSelectAllow: (info) => {
      const currentDate = new Date();
      const start = info.start;
      const end = info.end;
      const viewAllow = _data.currentView == 'resourceTimelineDay' ? true : false;
      return start <= end && start >= currentDate && viewAllow && props.adleEdit;
    },
    resources: [],
    calendarEventsNew: [],
  });

  watch(
    () => _data.resources,
    (val) => {
      emit('change', val);
    }
  );

  /**
   * 加载会议室
   * @param departId
   * @param nullFlag
   */
  async function loadRoom(departId?, nullFlag?) {
    let res = await queryMettingRoom({ departId: departId, nullFlag: nullFlag });
    if (res.success) {
      let resources = [];
      if (res.result != null) {
        for (let item of res.result) {
          let obj = { id: item.id, title: item.name };
          resources.push(obj);
        }
      }
      _data.resources = resources;
      loadMetting();
    }
  }

  /**
   * 加载会议
   */
  async function loadMetting() {
    let res = await queryMetting();
    if (res.success) {
      let eventMaps = {};
      _data.eventDataSource = res.result;
      res.result.forEach((item) => (eventMaps[item.id] = item));
      _data.eventMaps = eventMaps;
      renderCalendar();
    }
  }

  /**
   * 重新加载数据
   */
  async function reload() {
    await loadMetting();
    emit('reloadTable');
  }
  /**
   * 渲染日历
   * @param currentView
   */
  function renderCalendar(currentView?) {
    //TODO 判断修改重复的event
    _data.calendarEventsNew = _data.eventDataSource.map((item) => {
      let { id, name: title, beginTime: start, endTime: end, location } = item;
      let event = {
        id,
        title,
        resourceId: location,
        start: start,
        end: end,
        backgroundColor: '#6f66f6', //TODO 增加颜色，从后台获取
      };
      return event;
    });
  }
  function datesRender(info) {
    _data.currentView = info.view.type;
  }
  function resourceRender(info) {
    console.log('resourceRender触发。', info);
  }

  /**
   * 事件点击
   * @param info
   */
  function handleEventClick(info) {
    console.log('handleEventClick', info);
    if (props.adleEdit) {
      openModal(true, { isUpdate: true, id: info.event.id });
    }
  }

  /**
   * 事件选择
   * NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
   * @param info
   */
  function select(info) {
    if (props.adleEdit) {
      //this.$refs.mettingModal.eventAdd(info)
    }
  }

  /**
   * 移入事件
   * @param info
   */
  function eventEnter(info) {
    setTimeout(() => {
      nextTick(() => {
        _data.visible = true;
        _data.tranLeft = info.jsEvent.pageX - 490 + 'px';
        _data.tranTop = info.jsEvent.pageY - 155 + 'px';
        _data.item = info.event;
        console.log('_data.item', _data.item);
        // 点击的时候显示模态框
        _data.showBox = true;
      });
    }, 500);
  }

  /**
   * 移除事件
   * @param info
   */
  function eventLeave(info) {
    _data.showBox = false;
  }

  defineExpose({
    loadRoom,
  });
</script>
<style scoped>
  .show-parent {
    position: absolute;
    width: 300px;
    background-color: #fff;
    box-shadow: 0 0 2px #8c939d;
    z-index: 1;
  }

  /* update-begin-author:taoyan date:2022-10-20 for: VUEN-2367【vue3优化】我的计划和会议的日历效果参考最新要求 */
  :deep(.calendar-div a){
    color: rgba(0, 0, 0, 0.85) !important;
  }
/*  :deep(.fc-button-primary) {
    background-color: #1890ff !important;
    border-color: #1890ff !important;
  }*/
  /* update-end-author:taoyan date:2022-10-20 for: VUEN-2367【vue3优化】我的计划和会议的日历效果参考最新要求 */
</style>
