
export interface QueryItem {
  //name不存数据库
  name?: string;
  field: string;
  seq: number;

  //查询方式-like/eq
  queryType:string;
  //控件类型 input/date
  type: string;
  
  
}
/**
 * 快速筛选 数据格式
 */
export default class Kssx{

  // 查询字段
  queryList?: QueryItem[];
  
  // 是否使用查询按钮
  queryButton?: boolean;
  
  // 是否在执行查询后再显示数据
  waitQuery?: boolean;

  constructor(data) {
    this.queryList = data.queryList||[];
    if(data.hasOwnProperty('queryButton')){
      this.queryButton = data.queryButton
    }else{
      this.queryButton = true;
    }
    if(data.hasOwnProperty('waitQuery')){
      this.waitQuery = data.waitQuery
    }else{
      this.waitQuery = false
    }
  }

}