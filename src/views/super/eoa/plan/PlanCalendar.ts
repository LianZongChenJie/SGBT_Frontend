import { nextTick, ref, unref } from 'vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { formatToDate } from '/@/utils/dateUtil';
import dayjs from 'dayjs';

/**
 * 日历视图渲染
 * @param getCalendarEvent
 * @param calendar
 */
export function useCalendar(getCalendarEvent, calendar?) {
  const currentEvents = ref([]);
  /**
   * 日历默认配置属性
   */
  const defaultSettings = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    //头部工具栏
    headerToolbar: false,
    locale: 'zh-cn',
    //初始化视图
    initialView: 'timeGridDay',
    // 设置每周开始日期为周一
    firstDay: 1,
    //可编辑
    editable: true,
    //可选择
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    allDayText: '全天',
    dayHeaders: false,
  };

  const dayText = ref<string>('');
  const dateTime = ref<string>('');

  /**
   * 获取今天是周几
   * @param time
   */
  function getWeekDate(time = new Date()) {
    let weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    let date = new Date(time);
    let day = date.getDay();
    return weeks[day];
  }

  /**
   * 获取今天是今年的第几周
   * @param time
   */
  function getWeekByYear(time = new Date()) {
    let day: any = new Date(time);
    // 设置成最近的周四
    day.setDate(day.getDate() + 4 - (day.getDay() || 7));
    // 找出今年第一天的时间
    const yearFirstDay: any = new Date(day.getFullYear(), 0, 1);
    // 算出今天离今年第一天过去多长时间了
    // 算出过了多少天，然后算出过了多少周
    const weekNum = Math.ceil((day - yearFirstDay) / 86400000 / 7);
    return weekNum;
  }

  /**
   * 渲染日历
   */
  async function renderCalendar(params: any = {}) {
    nextTick(async () => {
      let assign = Object.assign({}, params);
      let res = await getCalendarEvent(assign);
      if (res.success) {
        let calendarApi = calendar.value.getApi();
        dayText.value = calendarApi.view.title;
        //如果参数中当前选中有值，那么就不更新标题
        if(!params.activeKey){
          dateTime.value = getWeekDate();
        }
        currentEvents.value = res.result.map((item) => {
          let { id, title, startTime: start, endTime: end, allDay, planColor } = item;
          let event = {
            id,
            title,
            //解决月份不跨行展示
            start: new Date(start).getTime(),
            end: new Date(end).getTime(),
            allDay: allDay === '1',
            color: planColor,
          };
          // 解决月视图下跨天少显示一天的问题
          if (event.allDay) {
            //解决月份不跨行展示
            event.end = dayjs(event.end).format('YYYY-MM-DD') + ' 24:00:00';
          }
          return event;
        });
      }
    });
  }
  return [
    { defaultSettings, currentEvents, dayText, dateTime },
    { renderCalendar, getWeekDate, getWeekByYear },
  ];
}
