import type {Ref} from 'vue';
import {inject, provide, ref, toRaw, watch} from 'vue';
import type {FilterItemGroup, MatchType} from "./type.definition";
import {defHttp} from '/@/utils/http/axios';
import { ActionItem } from '/@/components/Table';
import { useComponentCondition } from './useFilterField';
import {useMessage} from "/@/hooks/web/useMessage";
import { useUserStore } from '/@/store/modules/user';
import { useLowAppAuthStore } from "/@/store/modules/lowAppAuth";

const url = {
  save: '/desform/button/save',
  update: '/desform/button/update',
  remove: '/desform/button/remove',
  list: '/desform/button/list',
  checkOnly: '/desform/button/checkOnly',
  queryById: '/desform/button/queryById',
  resetSequence: '/desform/button/resetSequence',
  removeRelation: '/desform/button/removeRelation',
  addRelation: '/desform/button/addRelation',
  addLinkRecordRelationData: '/desform/button/addLinkRecordRelationData',
  checkAddable: '/desform/button/checkAddable',
  translateCondition: '/desform/button/translateCondition',
  processInfo: '/act/designer/miniDesFlow/api/getProcess',
  buttonStartProcess: '/act/designer/miniDesFlow/api/buttonStartProcess'
};

const designButtonKey = 'globalButtonList';
/**
 * 表单设计器 自定义按钮
 * @param props
 */
export function useCustomButton(props, dataModal, routeCode, lowAppId?) {
  // button-id
  const buttonIdList = ref<string[]>([]);
  //获取全局的按钮
  let designButtonList: Ref<any[]> | undefined = inject(designButtonKey, undefined);
  // 全局字段
  let currentColumnList: Ref<any[]> | undefined = inject("globalColumnList", undefined);

  const { ifTrue, ifGroupTrue } = useComponentCondition();

  const authStore = useLowAppAuthStore();

  watch(
    () => props.dynamicConfig,
    () => {
      console.log('----------useCustomButton 视图切换------------');
      let config = props.dynamicConfig;
      //获取当前视图的按钮id
      let idList: string[] = config?.buttonList || [];
      buttonIdList.value = idList;
    },
    { immediate: true, deep: true }
  );


  // 判断自定义按钮是否授权
  function isValidButton(hasAdminAuth, operationAuth, buttonId) {
    if(hasAdminAuth===true){
      return true;
    }
    if(Object.keys(operationAuth).indexOf(buttonId)<0){
      return true;
    }
    return operationAuth[buttonId];
  }
  
  /**
   *
   * @param record
   * @param designButtonList 表单按钮列表
   */
  function getCustomButtons(record, designButtonList): ActionItem[] {
    if (!designButtonList || !designButtonList.value) {
      return [];
    }
    // 筛选出全局按钮
    let allViewButton: Recordable[] = designButtonList.value.filter((btn) => btn.allView === true);
    let idList: string[] = buttonIdList.value;
    idList = idList.concat(allViewButton.map((btn) => btn.id));
    if (idList.length == 0) {
      return [];
    }
    let dbList: any[] = designButtonList.value;
    if (dbList.length == 0) {
      return [];
    }
    let rawList = toRaw(dbList);
    //添加按钮是 unshit操作 这里需要倒序
    rawList.sort(function (a, b) {
      return b.seq - a.seq;
    });
    let buttons: ActionItem[] = [];

    let hasAdminAuth = authStore.getLowAppAdminAuth();
    let operationAuth = authStore.getCustomButtonAuth(routeCode.value);
    
    for (let item of rawList) {
      if (idList.indexOf(item.id) >= 0) {
        if(isValidButton(hasAdminAuth, operationAuth, item.id) === false){
          continue;
        }
        //找当前视图下的按钮
        let desformData = record?.desformData ? record.desformData : record;
        let show: boolean = showButton(item, desformData);
        if (show) {
          const button: ActionItem = {
            label: item.label,
            icon: item.icon,
            tooltip: item.note,
            iconColor: item.color,
          };

          if (item.clickThen === 'confirm') {
            // 需要确认
            const { tip, ok, cancel } = item.confirmText;
            button.popConfirm = {
              title: tip,
              okText: ok,
              cancelText: cancel,
              confirm: () => {
                console.log('点击了自定义按钮-> confirm do');
                executeFlow(record, item.processId)
              },
            };
          } else if (item.clickThen === 'form') {
            // 点击弹窗修改表单
            let buttonFormConfig = item.buttonFormConfig;
            if(buttonFormConfig.formTable==='current' && buttonFormConfig.formType === 'create'){
              // 如果在当前表中创建关联记录
              button.onClick = () => {
                createFormInCurrentTable(record, buttonFormConfig, item.label, item.id, item)
              };
            }else if(buttonFormConfig.formTable==='link-record' && buttonFormConfig.formType === 'create'){
              // 如果在关联记录表中创建关联记录
              button.onClick = () => {
                createFormInLinkRecordTable(record, buttonFormConfig, item.label, item.id, item)
              };
            } else {
              button.onClick = () => {
                createFormAndFilterField(record, buttonFormConfig, item.label, item.id, item)
              };
            }
          } else {
            // 未知-工作流
            button.onClick = () => {
              console.log('点击了自定义按钮!');
              executeFlow(record, item.processId)
            };
          }
          buttons.push(button);
        }
      }
    }
    return buttons;
  }

  function showButton(config, record): boolean {
    if (config.showStatus === 'condition') {
      const {conditionList, conditionsGroup, conditionType} = config;
      // 【QQYUN-6168】自定义按钮筛选支持设置分组
      if (Array.isArray(conditionList) && conditionList.length > 0) {
        // 如果有老的单分组条件，则走老判断逻辑
        return ifTrue(conditionList, conditionType, record);
      } else {
        // 否则走新的多分组条件
        return ifGroupTrue(conditionsGroup, conditionType, record);
      }
    }
    return true;
  }

  const { createErrorModal, createMessage } = useMessage();
  const userStore = useUserStore();
  
  /* ---------------------------------按钮点击事件---------------------------------------*/

  /**
   * 点击自定义按钮 触发流程
   * @param record
   * @param processId
   * @param noTip 成功发起流程不需要提示
   */
  async function executeFlow(record, processId, noTip?) {
    if(processId){
      let desformCode = routeCode.value;
      let params = {
        processId,
        dataId: record.id,
        formKey: desformCode,
        applyUserId: userStore.getUserInfo.username
      }
      const data = await defHttp.post({ url: url.buttonStartProcess, params }, {joinParamsToUrl: true, isTransformResponse: false });
      console.log('触发流程>', data);
      if(data.success){
        if(noTip===true){
        }else{
          createMessage.success("操作成功！");
        }
      }else{
        createMessage.warn(data.message);
      }
    }else{
      createMessage.warn('未配置流程！')
    }
  }
  /**
   * 点击自定义按钮 编辑字段
   * @param record
   * @param buttonFormConfig
   * @param label
   * @param buttonId
   */
  function createFormAndFilterField(record, buttonFormConfig, label, buttonId, item) {
    let isLinkRecordForm = false;
    let desformCode = routeCode.value;
    let dataId = record.id;
    if(buttonFormConfig.formTable==='link-record'){
      isLinkRecordForm = true;
      if(currentColumnList) {
        let list = currentColumnList.value;
        let arr = list.filter(item => item.key === buttonFormConfig.linkRecordField);
        if (arr && arr.length > 0) {
          let {model, name} = arr[0];
          let linkRecordId = record[model];
          // 关联记录需要判断 有没有值，没有值的情况下不能编辑
          if (linkRecordId && linkRecordId.length>0) {
            desformCode = buttonFormConfig.linkRecordTable;
            dataId = toRaw(linkRecordId)[0]
          }else{
            createErrorModal({ title: `无法执行按钮“${label}”`, content: `“${name}”为空，请关联操作后再执行按钮操作`, okButtonProps:{danger: true} });
            return;
          }
        }
      }
    }
    dataModal.openModal(true, {
      mode: 'edit',
      desformCode,
      dataId,
      isOnline: false,
      isLinkRecordForm,
      customButtonId: buttonId,
      currentRecordId: record.id,
      viewId: props.viewId,
      lowAppId: lowAppId?.value,
      flowStatus: item.flowStatus,
      processId: item.processId,
      // 自定义按钮打开的弹窗 隐藏自定义按钮
      hideCustomButton: true
    });
  }

  /**
   * 创建当前记录中的 关联记录字段
   * @param record
   * @param buttonFormConfig
   * @param label
   * @param buttonId
   */
  function createFormInCurrentTable(record, buttonFormConfig, label, buttonId, item) {
    // 校验是否可以添加，单选需要校验
    if(currentColumnList){
      let list = currentColumnList.value;
      let arr = list.filter(item=>item.key === buttonFormConfig.createFormField)
      if(arr && arr.length>0){
        let {model, multi, name} = arr[0];
        if(multi === false){
          // 如果是单选 且已经存在记录 不可再增
          if(record[model]){
            createErrorModal({ title: `无法执行按钮“${label}”`, content: `“${name}”已有关联记录，无法重复添加`, okButtonProps:{danger: true} });
            return;
          }else{
            openModal(buttonFormConfig.createFormCode, buttonId, record.id, item)
          }
        }else{
          openModal(buttonFormConfig.createFormCode, buttonId, record.id, item)
        }
      }
    }
  }

  /**
   * 创建关联记录中的 关联记录字段
   * @param record
   * @param buttonFormConfig
   * @param label
   * @param buttonId
   */
  async function createFormInLinkRecordTable(record, buttonFormConfig, label, buttonId, item) {
    // 校验是否可以添加，单选需要校验, 这里只能后台校验了
    if(currentColumnList){
      let list = currentColumnList.value;
      let arr = list.filter(item=>item.key === buttonFormConfig.linkRecordField)
      if(arr && arr.length>0){
        let {model, name} = arr[0];
        let linkRecordId = record[model];
        if(linkRecordId){
          if(linkRecordId && linkRecordId.length>0){
            let id = toRaw(linkRecordId)[0]
            let flag = await checkAddable(buttonId, id);
            if(!flag){
              createErrorModal({ title: `无法执行按钮“${label}”`, content: `“${name}”已有关联记录，无法重复添加`, okButtonProps:{danger: true} });
            }else{
              openModal(buttonFormConfig.createFormCode, buttonId, record.id, item, id)
            }
          }
        }else{
          createErrorModal({ title: `无法执行按钮“${label}”`, content: `“${name}”为空，请关联操作后再执行按钮操作`, okButtonProps:{danger: true} });
        }
      }
    }
  }

  /**
   * 添加关联记录数据至当前表单
   */
  async function addLinkRecordData(currentRecordId, linkRecordDataId, buttonId) {
      let params = {
        currentRecordId,
        linkRecordDataId,
        buttonId,
        designFormCode: routeCode.value
      };
      const data = await defHttp.post({ url: url.addLinkRecordRelationData, params }, { isTransformResponse: false });
      if(!data.success){
        createMessage.warn(data.message);
      }
  }

  /**
   * 校验是否可以添加数据
   */
  async function checkAddable(buttonId, linkRecordId) {
    let params = {
      buttonId,
      linkRecordId,
    };
    const data = await defHttp.get({ url: url.checkAddable, params }, { isTransformResponse: false });
    return data.result;
  }

  /**
   * 打开弹窗-创建关联记录
   * @param code
   * @param buttonId
   * @param currentRecordId
   */
  function openModal(code, buttonId, currentRecordId, item, linkRecordId?) {
    dataModal.openModal(true, {
      mode:'add',
      desformCode: code,
      dataId: null,
      isOnline: false,
      isLinkRecordForm: true,
      customButtonId: buttonId,
      currentRecordId: currentRecordId,
      flowStatus: item.flowStatus,
      processId: item.processId,
      linkRecordId: linkRecordId||''
    });
  }

  /**
   * 获取批量操作的自定义按钮
   * @param list
   */
  function getBatchRowCustomButtons(list:any[]) {
    let result:any[] = [];
    let hasAdminAuth = authStore.getLowAppAdminAuth();
    let operationAuth = authStore.getCustomButtonAuth(props.designFormCode);
    
    // 筛选出全局按钮
    let allViewButtons: Recordable[] = list.filter((btn) => btn.allView === true);
    if(allViewButtons && allViewButtons.length>0){
      for(let button of allViewButtons){
        if (isValidButton(hasAdminAuth, operationAuth, button.id) === false) {
          continue;
        }
        result.push({
          ...button
        })
      }
    }
    let idList: string[] = buttonIdList.value;
    if(idList.length==0){
      return [];
    }
    
    for (let item of list) {
      if (idList.indexOf(item.id) >= 0) {
        if (isValidButton(hasAdminAuth, operationAuth, item.id) === false) {
          continue;
        }
        result.push({
          ...item
        })
      }
    }
    result.sort(function (a, b) {
      return b.seq - a.seq;
    });
    return result;
  }
  
  
  return {
    designButtonList,
    getCustomButtons,
    addLinkRecordData,
    getBatchRowCustomButtons,
    executeFlow
  };
}

/**
 * 将按钮配置获取到全局注入
 */
export function useCustomButtonConfig() {
  const buttonList = ref<any[]>([]);

  provide(designButtonKey, buttonList);

  function initButtonList(dbList) {
    if (!dbList || dbList.length == 0) {
      buttonList.value = [];
    } else {
      let arr: any[] = [];
      for (let item of dbList) {
        arr.push({ ...item });
      }
      buttonList.value = arr;
    }
  }

  return {
    initButtonList,
  };
}

/**
 * 数据库操作
 * @param props
 */
export function useButtonCurd(props?) {
  async function saveButton(data) {
    let params = {
      ...data,
      designFormCode: props.code,
      viewId: props.viewId,
    };
    return await defHttp.post({ url: url.save, params }, { isTransformResponse: false });
  }

  async function updateButton(data) {
    let params = {
      ...data,
      designFormCode: props.code,
      viewId: props.viewId,
    };
    await defHttp.post({ url: url.update, params }, { isTransformResponse: false });
  }

  /**
   * 删除按钮
   * @param id
   */
  async function removeButton(id) {
    let params = {
      buttonId: id,
      designFormCode: props.code,
    };
    await defHttp.delete({ url: url.remove, data: params }, { joinParamsToUrl: true });
  }

  /**
   * 解除按钮和视图的绑定关系
   * @param id
   */
  async function removeRelation(id) {
    let params = {
      buttonId: id,
      viewId: props.viewId,
    };
    await defHttp.delete({ url: url.removeRelation, data: params }, { joinParamsToUrl: true });
  }

  /**
   * 添加视图和按钮的绑定关系
   * @param id
   */
  async function addRelation(id) {
    let params = {
      id,
      viewId: props.viewId,
    };
    await defHttp.post({ url: url.addRelation, params }, { isTransformResponse: false });
  }

  async function queryDesignButtonList() {
    let params = {
      designFormCode: props.code,
    };
    const data = await defHttp.get({ url: url.list, params }, { isTransformResponse: false });
    if (data.success) {
      return data.result;
    }
    return [];
  }

  async function queryViewButtonList() {
    let params = {
      designFormCode: props.code,
      viewId: props.viewId,
    };
    const data = await defHttp.get({ url: url.list, params }, { isTransformResponse: false });
    if (data.success) {
      return data.result;
    }
    return [];
  }

  async function checkOnlyButtonLabel(id, label) {
    let params = {
      id,
      label,
      designFormCode: props.code,
      viewId: props.viewId,
    };
    const data = await defHttp.get({ url: url.checkOnly, params }, { isTransformResponse: false });
    if (data.success) {
      return data.result;
    }
    return false;
  }

  async function resetSequence(list) {
    await defHttp.post({ url: url.resetSequence, params: { list } }, { isTransformResponse: false });
  }
  
  async function translateCondition(list) {
    let params = {
      list,
      code: props.code,
    };
    const data = await defHttp.post({ url: url.translateCondition, params }, { isTransformResponse: false });
    if (data.success) {
      return data.result;
    }
    return []
  }
  
  async function getProcessInfo(processId) {
    const data = await defHttp.get({ url: url.processInfo, params:{ processId } }, { isTransformResponse: false });
    console.log('查询流程信息', processId, data)
    if (data.success) {
      return data.result;
    }
    return {}
  }

  return {
    queryDesignButtonList,
    queryViewButtonList,
    removeButton,
    saveButton,
    updateButton,
    resetSequence,
    checkOnlyButtonLabel,
    removeRelation,
    addRelation,
    translateCondition,
    getProcessInfo
  };
}

/**
 * 升级旧的单分组条件
 * 1. 将旧的单分组条件转换为多分组条件
 */
export function updateConditionsList(conditions: any[], type?: MatchType): FilterItemGroup[] {
  if (!Array.isArray(conditions) || conditions.length == 0) {
    return [];
  }
  // 1. 判断当前条件是否是旧的单分组条件
  let isSingleGroup = conditions[0].matchType == null;
  if (isSingleGroup) {
    // 2. 如果是旧的单分组条件，将其转换为新的多分组条件（默认matchType为and）
    let result: FilterItemGroup[] = [];
    result.push({
      matchType: type ?? 'and',
      queryItems: [...conditions],
    })
    return result;
  } else {
    // 3. 如果是新的多分组条件，直接返回
    return conditions;
  }
}
