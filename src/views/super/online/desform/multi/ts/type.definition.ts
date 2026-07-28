
export interface SelectOption {
  label: string,
  value: string
}

export const systemFields = [
  {name:'创建时间', field: 'create_time', type:'datetime', seq: 100, timestamp: true},
  {name:'创建人', field: 'create_by', type:'select-user', seq: 101},
  {name:'修改时间', field: 'update_time', type:'datetime', seq: 102, timestamp: true},
  {name:'修改人', field: 'update_by', type:'select-user', seq: 103},
  {name:'流程状态', field: 'bpm_status', type:'select', seq: 104, dictCode: 'bpm_status'},
];

/**
 * 查询字段
 */
export interface QueryItem {
  field: string;
  type: string;
  seq: number;
  name?: string;
}

/**
 * 数据过滤字段
 */
export interface FilterItem {
  field: string;
  rule: string;
  val: string | number | any[] | Recordable;
  type?: string;
  name?: string;
  valText?: string
  timestamp?: boolean;
  // 是否多选
  multiple?: boolean;
  // 是否重载组件（用于刷新某些不会自己刷新props的组件）
  reloading?: boolean;
}

/**
 * 数据过滤字段匹配类型
 */
export type MatchType = 'and' | 'or';

/**
 * 数据过滤字段分组
 */
export interface FilterItemGroup {
  matchType: MatchType;
  queryItems: FilterItem[];
}

export interface FilterInfoType {
  conditionsGroup: FilterItemGroup[],
  conditionType: MatchType,
}

/**
 * 筛选组
 */
export interface FilterQueryGroup {
  matchType: string;
  queryItems: FilterItem[];
}

/**
 * 排序字段
 */
export interface OrderItem {
  field: string;
  type: string;
  name?: string;
}

export type ViewType = "base" | "card" | "calendar";

export interface ViewItem {
  id: string;
  code: string;
  name: string;
  type: ViewType;
  seq: number;
  
  conditions?: string;
  conditionType?: string;
  timestamp?: number;
  searchTime?: number;
  keyword?: string;
}

export interface ViewColumn {
  key: string;
  name: string;
  model: string;
  type: string;
  dictCode?:string;
  dictTable?:string;
  dictText?:string;
}

/**
 * 视图配置
 */
export interface ShituPz {
  // 数据请求地址
  dataUrl: string;
}

/**
 * 卡片列表分类
 */
export interface CardColumnType {
  // 数据请求地址
  title?: string;
  value?: string;
  color?: string;
  count?: number;
  data?: any[];
  paging: {
    current: number,
    size: number,
    isEnd: boolean,
    isChange: boolean,
  }
}

/**
 * 字段标题和字段名称
 */
export interface CardFieldDict {
  name: string;
  label?: string;
  compType?: string;
}


/**
 * 字段标题和字段名称
 */
export interface ButtonInfo {
  id?: string
  label: string,
  showStatus: string,
  clickThen: string,
  flowStatus: boolean,
  icon: string,
  color: string,
  note: string,
  processId?: string
  
}

/**
 * QQYUN-3250【视图 筛选】他表字段 查询不出数据可不显示 明道云也没有
 * 查询条件不需要显示的字段类型
 */
export const dontShowTypes = ['link-field', 'daterange', 'datetimerange', 'capital-money']
