
export interface CalendarColumn {
  beginDateField: string;
  endDateField: string;
  tag: string;
  showTag: boolean;
  seq?: number
  type?: string
}

/**
 * 日历设置 数据格式
 */
export default class Rlsz{
  
  // 日历的tag字段
  calendarColumnList?: CalendarColumn[];
  // 日程颜色->单选字段，具体功能不明
  colorField?:string;
  // 标题字段
  titleField?:string;
  //默认视图
  calendarDefault?:string;
  //每周的第一天
  firstDay?:number;
  //只显示工作日-自定义显示周
  weekStatus?:boolean;
  //一周7天-存储隐藏的天索引0-6
  weekDayList?:string[];
  //显示农历
  lunarStatus?:boolean;
  // 24小时制
  hourStatus?:boolean;
  //显示所有日程
  calendarAll?:boolean;
  
  constructor(data) {
    this.calendarColumnList = data.calendarColumnList||[];
    this.colorField = data.colorField||'';
    this.calendarDefault = data.calendarDefault||'dayGridMonth';
    this.firstDay = data.firstDay||'1';
    this.weekStatus = data.weekStatus||false;
    this.weekDayList = data.weekDayList||[];
    this.lunarStatus = data.lunarStatus||false;
    this.hourStatus = data.hourStatus||false;
    this.calendarAll = data.calendarAll||false;
    this.titleField = data.titleField||"";
  }

}