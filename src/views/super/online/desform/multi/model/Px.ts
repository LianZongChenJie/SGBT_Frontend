import {OrderItem} from '../ts/type.definition'
/**
 * 排序 数据格式
 */
export default class Px{
  
  // 排序字段
  orders?: OrderItem[];
  
  constructor(data) {
    this.orders = data.orders||[];
  }

}