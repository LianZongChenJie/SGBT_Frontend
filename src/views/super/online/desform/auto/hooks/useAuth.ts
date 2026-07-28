import { ref, reactive, inject } from 'vue';
import {defHttp} from "/@/utils/http/axios";
import { useLowAppAuthStore } from "/@/store/modules/lowAppAuth";
import { useUserStore } from "/@/store/modules/user";
import {getIsLowAppEnv} from "/@/utils/super/low/lowAppUtils";
import type { Ref } from 'vue';

/**
 * 查询权限信息并存储
 */
export function useAuthStore() {

  const authStore = useLowAppAuthStore();
  const hasAdminAuth = ref(false);
  const operationAuth = reactive<any>({});
  const excludeViewIds = ref<any[]>([]);

  // 查询权限信息。在页面刷新之前多次调用，只会查询一次
  async function getFormAuthOnce(appId, formCode) {
    if(!appId || !formCode){
      return;
    }
    let cacheKey = JSON.stringify({ appId, formCode })
    if (authStore.hasAuthByOnce(cacheKey)) {
      return;
    }
    return await getFormAuth(appId, formCode);
  }

  async function getFormAuth(appId, formCode){
    if(!appId || !formCode){
      if(!getIsLowAppEnv()){
        hasAdminAuth.value = true;
      }
      return;
    }
    const url = '/online/lowAppAuth/getMyAuth';
    let params = { appId, formCode }
    console.log('>>>>>>>>>权限信息加载 参数--->', params)
    let data = await defHttp.get({ url, params } );
    console.log('>>>>>>>>>权限信息加载 结果', data);
    if(data.hasAdmin===true){
      excludeViewIds.value = []
    }else{
      Object.keys(data.formOperations).map(k=>{
        operationAuth[k] = data.formOperations[k]
      });
      authStore.setOperationAuth(formCode, data.formOperations);
      authStore.setRecordAuth(formCode, data.recordAuth);
      authStore.setViewAuth(formCode, data.viewAuthMap);
      authStore.setEasyViewAuth(formCode, data.easyViewAuthMap);
      authStore.setCustomButtonAuth(formCode, data.customButtonAuth);
      authStore.setExcludeFields(formCode, data.excludeFields);
      authStore.setExcludeUpdateFields(formCode, data.excludeUpdateFields);
      authStore.setSubordinates(data.subordinateList || []);
      initExcludeViewIds(data);
    }
    hasAdminAuth.value = data.hasAdmin;
    let cacheKey = JSON.stringify({ appId, formCode })
    authStore.setAuthByOnce(cacheKey, true);

   // authStore.setLowAppAdminAuth(appId, data.hasAdmin);
  }
  
  function initExcludeViewIds(data) {
    let viewAuthMap = data.viewAuthMap;
    let easyViewAuthMap = data.easyViewAuthMap;
    if(easyViewAuthMap.read===true){
      excludeViewIds.value = []
    }else{
      let arr:any[] = []
      Object.keys(viewAuthMap).map(viewId=>{
        if(viewAuthMap[viewId].read===false){
          arr.push(viewId)
        }
      });
      excludeViewIds.value = arr;
    }
  }
  
  function hasAuth(key) {
    if(hasAdminAuth.value === true){
      return true
    }
    return operationAuth[key] || false
  }
  
  return {
    hasAdminAuth,
    getFormAuth,
    getFormAuthOnce,
    operationAuth,
    hasAuth,
    excludeViewIds
  }
}

/**
 * 判断 编辑删除权限
 */
export function useActionAuth() {
  const authStore = useLowAppAuthStore();
  const userStore = useUserStore();
  const owner_field_name = 'create_by';
  // 全局字段
  let currentColumnList: Ref<any[]> | undefined = inject('globalColumnList', undefined);
  
  function hasUpdateAuth(designFormCode, viewId, rows) {
    return hasAuth(designFormCode, viewId, 'update', rows)
  }

  function hasDeleteAuth(designFormCode, viewId, rows) {
    return hasAuth(designFormCode, viewId, 'delete', rows)
  }
  
  function hasButtonAuth(designFormCode, buttonCode) {
    let hasAdmin = authStore.getLowAppAdminAuth();
    if(hasAdmin===true){
      return true;
    }
    let operations = authStore.getOperationAuth(designFormCode) || {};
    return operations[buttonCode]||false
  }

  /**
   * 判断批量的权限
   * @param designFormCode
   */
  function hasBatchAuth(designFormCode) {
    return hasButtonAuth(designFormCode, 'batch_table');
  }
  
  function hasCreateAuth(designFormCode) {
    return hasButtonAuth(designFormCode, 'add');
  }
  
  function hasAuth(designFormCode, viewId, key, rows) {
    let hasAdmin = authStore.getLowAppAdminAuth();
    //console.log('管理员权限', hasAdmin)
    if(hasAdmin===true){
      return true;
    }
    let viewAuthMap = authStore.getViewAuth(designFormCode);
    let viewAuthData = viewAuthMap[viewId] || {};

    let easyViewAuthMap = authStore.getEasyViewAuth(designFormCode);
    let subordinateList: any[] = authStore.getSubordinates;
    let currentUserName = userStore.getUserInfo.username;

    let status1 = viewAuthData[key] || false;
    let status2 = easyViewAuthMap[key] || false;
    let status = status1 || status2;
    if (status === true) {

      // 如果配置了权限 还需要根据数据判断实际
      let recordAuth = authStore.getRecordAuth(designFormCode);
      let updateOrDeleteAuth = recordAuth[key];
      if(!updateOrDeleteAuth){
        return false;
      }
      let { scope, subStatus } = updateOrDeleteAuth;
      if (scope == 'readonly') {
        status = false;
      } else if (scope == 'own') {
        let flag = false;
        //先判断是不是自己的数据
        for (let row of rows) {
          if (currentUserName == row[owner_field_name]) {
            flag = true;
            break;
          }
          if(hasOwnerAuth(row) === true){
            flag = true;
            break;
          }
        }
        // 再判断是不是下属的数据
        if (flag === false) {
          if (subStatus === true) {
            for (let row of rows) {
              let temp = row[owner_field_name];
              if (subordinateList.indexOf(temp) >= 0) {
                flag = true;
                break;
              }
            }
          }
        }

        if (flag === false) {
          status = false;
        }
      }
    }
    return status;
  }

  /**
   * 判断字段上的拥有者权限
   * @param row
   */
  function hasOwnerAuth(row) {
    let flag = false;
    if(currentColumnList){
      let cList = currentColumnList.value;
      let currentRoleList = authStore.getRoles;
      let currentDepartList = authStore.getDeparts;
      let currentUsername = userStore.getUserInfo.username;
      for(let col of cList){
        if(flag === true){
          break;
        }
        if(col.dataAuthType === 'owner'){
          let model = col.model;
          let val = row[model];
          if(val){
            if(col.type === 'org-role'){
              //console.log('org-role', val)
              for(let i of val){
                if(currentRoleList && currentRoleList.length>0){
                  if(currentRoleList.indexOf(i)>=0){
                    flag = true;
                    break;
                  }
                }
              }
            }else if(col.type==='select-depart'){
              //console.log('org-depart', val);
              for(let i of val){
                if(currentDepartList && currentDepartList.length>0){
                  if(currentDepartList.indexOf(i)>=0){
                    flag = true;
                    break;
                  }
                }
              }
            }else if(col.type==='select-user'){
              //console.log('org-user', val);
              for(let i of val){
                if(currentUsername){
                  if(currentUsername===i){
                    flag = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    return flag;
  }
  
  return {
    hasUpdateAuth,
    hasDeleteAuth,
    hasCreateAuth,
    hasBatchAuth
  }
}
