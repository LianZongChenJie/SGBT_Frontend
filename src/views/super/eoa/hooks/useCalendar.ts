import { ref } from 'vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { formatToDate } from '/@/utils/dateUtil';

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
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    locale: 'zh-cn',
    //按钮翻译
    buttonText: {
      today: '今天',
      dayGridMonth: '月',
      timeGridWeek: '周',
      timeGridDay: '日',
    },
    //初始化视图
    initialView: 'dayGridMonth',
    // 设置每周开始日期为周一
    firstDay: 1,
    //可编辑
    editable: true,
    //可选择
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
  };

  /**
   * 渲染日历
   */
  async function renderCalendar() {
    let res = await getCalendarEvent();
    if (res.success) {
      currentEvents.value = res.result.map((item) => {
        let { id, title, startTime: start, endTime: end, allDay, planColor } = item;
        let event = {
          id,
          title,
          start: start,
          end: end,
          allDay: allDay === '1',
          color: planColor,
        };
        // 解决月视图下跨天少显示一天的问题 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
        if (event.allDay) {
          event.end = formatToDate(event.end) + '24:00:00';
        }
        /*let calendarApi = calendar.value.getApi();
                let currentView = calendarApi.view.type;*/
        return event;
      });
      console.log('currentEvents', currentEvents);
    }
  }
  return [{ defaultSettings, currentEvents }, { renderCalendar }];
}
