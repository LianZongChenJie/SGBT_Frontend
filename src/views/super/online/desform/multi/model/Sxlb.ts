/**
 * 筛选列表 数据格式
 */
export default class Sxlb{

  // 左侧查询字段
  leftFilterField?: string;
  // all, part, exist
  leftFilterData?: string;
  // 如果是part需要设置几个固定值 
  leftFilterCondition?: string;
  // 排序
  leftFilterOrder?: string;
  // 创建表单时是否将选中的左侧值作为默认值
  addFormDefaultStatus?: boolean;

  constructor(data) {
    this.leftFilterField = data.leftFilterField||'';
    this.leftFilterData = data.leftFilterData||'all';
    this.leftFilterCondition = data.leftFilterCondition||'';
    this.leftFilterOrder = data.leftFilterOrder||'desc';
    if(data.hasOwnProperty('addFormDefaultStatus')){
      this.addFormDefaultStatus = data.addFormDefaultStatus
    }else{
      this.addFormDefaultStatus = true
    }
  }
}