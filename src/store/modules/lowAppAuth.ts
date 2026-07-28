/**
 * 用于 low app授权信息存储
 * @todo 需要删掉
 */
import { defineStore } from 'pinia';
import { getIsLowAppEnv } from '/@/utils/super/low/lowAppUtils';

interface LowAppAuth {
  appId: string;
  lowAppAdminAuthMap: object;
  operationAuthMap: object;
  recordAuthMap: object;
  viewAuthMap: object;
  easyViewAuthMap: object;
  customButtonAuthMap: object;
  subordinateList: Array<string>;
  excludeFieldsMap: object;
  excludeUpdateFieldsMap: object;
  roleCodeList: Array<string>;
  departIdList: Array<string>;
  taskCount: Number;
  onceAuthMap: Map<string, boolean>;
  izVip: Boolean
}

/**
 * 用于 low app授权信息存储
 */
export const useLowAppAuthStore = defineStore({
  id: 'low-app-auth',
  state: (): LowAppAuth => ({
    // 应用ID
    appId: '',
    // 当前用户是否拥有应用的admin权限信息
    lowAppAdminAuthMap: {},
    // 操作权限
    operationAuthMap: {},
    // 记录权限
    recordAuthMap: {},
    // 视图的编辑删除权限 结合 easyViewAuthMap 判断
    viewAuthMap: {},
    // 表单的编辑删除权限 结合 viewAuthMap 判断
    easyViewAuthMap: {},
    // 自定义按钮--------未使用 找operationAuthMap
    customButtonAuthMap: {},
    // 当前用户下属人员
    subordinateList:[],
    // 没有授权的字段集合-查看
    excludeFieldsMap: [],
    // 没有授权的字段集合-编辑
    excludeUpdateFieldsMap: [],
    // 当前用户的组织角色编码
    roleCodeList: [],
    // 当前用户的部门ID集合
    departIdList: [],
    // 当前用户的任务数量
    taskCount: 0,
    // 用于存储已经查询过的权限信息
    onceAuthMap: new Map<string, boolean>(),
    // 用于显示是否为vip
    izVip:true,
  }),
  getters: {
    getLowAppAdminAuth: (state) => {
      return () => {
        if(!getIsLowAppEnv()){
          return true
        }
        return state.lowAppAdminAuthMap[state.appId];
      }
    },
    getOperationAuth: (state) => {
      return (designFormCode) => state.operationAuthMap[designFormCode];
    },
    getRecordAuth: (state) => {
      return (designFormCode) => state.recordAuthMap[designFormCode];
    },
    getViewAuth: (state) => {
      return (designFormCode) => state.viewAuthMap[designFormCode];
    },
    getEasyViewAuth: (state) => {
      return (designFormCode) => state.easyViewAuthMap[designFormCode];
    },
    getCustomButtonAuth: (state) => {
      return (designFormCode) => state.customButtonAuthMap[designFormCode];
    },
    getSubordinates(): Array<string> {
      return this.subordinateList;
    },
    getExcludeFields: (state) => {
      return (designFormCode) => state.excludeFieldsMap[designFormCode];
    },
    getExcludeUpdateFields: (state) => {
      return (designFormCode) => state.excludeUpdateFieldsMap[designFormCode];
    },
    getDeparts(): Array<string> {
      return this.departIdList;
    },
    getRoles(): Array<string> {
      return this.roleCodeList;
    },
    getTaskCount(): Number {
      return this.taskCount;
    },
    hasAuthByOnce: (state) => {
      return (cacheKey: string): boolean => {
        return !!state.onceAuthMap.get(cacheKey);
      }
    },
    getIzVip(): Boolean {
      return this.izVip;
    }
  },
  actions: {
    setLowAppAdminAuth(appId, status) {
      this.appId = appId;
      this.lowAppAdminAuthMap[appId] = status;
    },
    setOperationAuth(designFormCode, authObject){
      this.operationAuthMap[designFormCode] = authObject;
    },
    setRecordAuth(designFormCode, authObject){
      this.recordAuthMap[designFormCode] = authObject;
    },
    setViewAuth(designFormCode, authObject){
      this.viewAuthMap[designFormCode] = authObject;
    },
    setEasyViewAuth(designFormCode, authObject){
      this.easyViewAuthMap[designFormCode] = authObject;
    },
    setCustomButtonAuth(designFormCode, authObject){
      this.customButtonAuthMap[designFormCode] = authObject;
    },
    setSubordinates(list){
      this.subordinateList = list;
    },
    setExcludeFields(designFormCode, list){
      this.excludeFieldsMap[designFormCode] = list;
    },
    setExcludeUpdateFields(designFormCode, list){
      this.excludeUpdateFieldsMap[designFormCode] = list;
    },
    setDeparts(list){
      this.departIdList = list;
    },
    setRoles(list){
      this.roleCodeList = list;
    },
    setTaskCount(count){
      this.taskCount = count;
    },
    setAuthByOnce(cacheKey: string, status: boolean) {
      this.onceAuthMap.set(cacheKey, status);
    },
    setIsVip(vip) {
      this.izVip = vip;
    }
  }
});
