
interface ColumnShower {
  // 这个field对应配置的key/model
  field: string,
  show: boolean;
  seq: number;
}
/**
 * 看板设置 数据格式
 */
export default class Kbsz{
  // 分组字段
  groupField: string;
  // 显示项-all/part/exist
  filterGroupType?: string;
  // 当显示项值为part的时候 需要选择哪些项为显示项
  filterGroupCondition?: string;
  
  // 摘要字段
  titleField?: string;
  // 其他显示字段
  cardColumnList?:ColumnShower[];
  // 显示字段label
  showLabel?: boolean;
  // 封面图字段
  coverField?: string;
  // 是否允许点击封面图查看
  coverView?:boolean;


  constructor(data) {
    this.groupField = data.groupField;
    this.filterGroupType = data.filterGroupType||'all';
    this.filterGroupCondition = data.filterGroupCondition||'';
    this.titleField = data.titleField||'';
    this.cardColumnList = data.cardColumnList||[];
    this.showLabel = data.showLabel||false;
    this.coverField = data.coverField||'';
    if(data.hasOwnProperty('coverView')){
      this.coverView = data.coverView
    }else{
      this.coverView = true;
    }
  }

}