import {computed, ref} from "vue";
import {ViewItem} from "/@/views/super/online/desform/multi/ts/type.definition";
import {useModal} from "/@/components/Modal";
import { router } from '/@/router';

/**
 * 多视图页面
 * @param props
 */
export function useViewTabs() {
  
  const routeCode = ref('');
  const viewConfigList = ref<ViewItem[]>([]);
  const activeKey = ref('');
  const desformName = ref('');
  const designFormTitleField = ref('')
  
  let isLowApp = ref(false);
  let currentRoute = router.currentRoute.value;
  if(currentRoute && currentRoute.meta){
    let hasArg = currentRoute.meta.lowApp;
    if(hasArg){
      isLowApp.value = true;
    }else{
      isLowApp.value = false;
    }
  }
  const activeConfig = computed(() => {
    let arr = viewConfigList.value;
    if (!arr || arr.length == 0) {
      return {};
    }
    let temp = arr.filter((item) => item.id == activeKey.value);
    return {
      ...temp[0],
      isLowApp: isLowApp.value,
      desformName: desformName.value,
      designFormTitleField: designFormTitleField.value
    };
  });
  
  /**
   * 刷新当前tab的数据
   */
  function onReload(e?){
    e && prevent(e);
    const id = activeKey.value;
    let arr = viewConfigList.value;
    for(let item of arr){
      if(item.id==id){
        item.timestamp = new Date().getTime();
        break;
      }
    }
  }

  function prevent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 注册表单弹窗
  const [registerDataModal, {openModal}] = useModal();
  const defaultFormData = ref<any>({});
  function onAdd(e){
    prevent(e);
    openModal(true, {
      mode: 'add',
      desformCode: routeCode.value,
      dataId: '',
      isOnline: false,
      viewId: activeKey.value,
      lowAppId: currentRoute.params.appId,
    });
  }
  function setFormData(data) {
    defaultFormData.value = {...data}
  }
  
  function onSuccess(){
    onReload()
  }
  
  const globalKeyword = ref('');
  const showSearchInput = ref(false);
  const searchInputRef = ref();
  function onSearchInputBlur(){
    if(!globalKeyword.value){
      showSearchInput.value = false
    }
  }
  function onSearchInputFocus(e){
    e && prevent(e);
    showSearchInput.value = true;
    setTimeout(()=>{
      searchInputRef.value && searchInputRef.value.focus();
    }, 200)
  }
  
  // 搜索关键字改变事件
  function onSearchValueChange() {
    if(globalKeyword.value==''){
      onSearch();
    }
  }

  /**
   * 全局查询
   */
  function onSearch(){
    console.log('onSearch', globalKeyword.value);
    let temp = globalKeyword.value;
    let arr = viewConfigList.value;
    for(let item of arr){
      item.keyword = temp
      item.searchTime = new Date().getTime();
    }
    onReload();
  }
  
  return {
    routeCode,
    activeKey,
    viewConfigList,
    activeConfig,
    onReload,
    registerDataModal,
    onAdd,
    onSuccess,
    globalKeyword,
    onSearch,
    showSearchInput,
    onSearchInputBlur,
    searchInputRef,
    onSearchInputFocus,
    defaultFormData,
    setFormData,
    isLowApp,
    desformName,
    onSearchValueChange,
    designFormTitleField
  }
}

/**
 * 解决lowapp中 弹窗的top值和 原列表页面不一致的问题
 */
export function useDrawerTop(config) {

  const myHeight = ref(0);
  myHeight.value = window.innerHeight - 155;
  
  function getDrawerClass() {
    let str = 'view-config-drawer';
    if(config){
      if(config.isLowApp === true){
        str+=' jeecg-basic-drawer  inner-low-app';
        myHeight.value = window.innerHeight - 105;
      } else {
        // update-begin--author:liaozhiyang---date:20240603---for：【TV360X-804】视图配置页面对齐敲敲云
        str += ' jeecg-basic-drawer inner-vue3-app';
        myHeight.value = window.innerHeight - 115;
        // update-end--author:liaozhiyang---date:20240603---for：【TV360X-804】视图配置页面对齐敲敲云
      }
    }
    return str
  }
  return { myHeight, getDrawerClass }
}
