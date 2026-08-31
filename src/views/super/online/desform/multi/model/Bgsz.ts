
export interface ColumnShower {
  // 这个field对应配置的key/model
  field: string,
  show: boolean;
  seq?: number;
}
/**
 * 表格设置 数据格式
 */
export default class Bgsz{
  // 行高
  lineHeight?: string;
  // 自动刷新 单位(秒)
  autoRefresh?: number;
  // 是否有表格统计
  hasSummary?: boolean;
  // 自定义列显示 默认default--diy
  showColumn?: string;
  // 系统字段配置 showColumn为default时，可能有系统字段的显示配置
  systemColumnList?: ColumnShower[];
  // 字段配置 showColumn为diy时
  columnList?: ColumnShower[];
  // 字段显示配置
  showColumnList?: ColumnShower[];
  
  constructor(data) {
    this.lineHeight = data.lineHeight||'middle';
    this.autoRefresh = data.autoRefresh||0;
    this.showColumn = data.showColumn||'default';
    this.systemColumnList = data.systemColumnList||[];
    this.columnList = data.columnList||[];
    this.showColumnList = data.showColumnList||[];
    this.hasSummary = data.hasSummary||false;
  }

}