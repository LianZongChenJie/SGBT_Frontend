import {FilterItem} from '../ts/type.definition'
/**
 * 数据过滤 数据格式
 */
export default class Sjgl{
  
  // 条件
  conditions?: FilterItem[];
  // 条件拼接类型-and/or
  conditionType?: string;
  // 条件组拼接类型-and/or
  matchType?: string;

  
  constructor(data) {
    this.conditions = data.conditions||[];
    this.conditionType = data.conditionType||'and';
    this.matchType = data.matchType || 'and';
  }

}