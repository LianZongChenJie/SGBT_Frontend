import {ColumnShower} from './Bgsz'
/**
 * 显示字段 数据格式
 * field: key
 * show: bool
 */
export default class Xszd{

  // 字段显示配置
  showColumnList?: ColumnShower[];

  constructor(data) {
    this.showColumnList = data.showColumnList||[];
  }

}