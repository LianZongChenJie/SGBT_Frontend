import { useMessage } from '/@/hooks/web/useMessage';
import { queryFormTypeByProcessId, queryFormBizCodeByProcessid, list } from './node.auth.api';
import { ref,  reactive } from 'vue';

/**
 * 用于字段权限配置
 */
export function useAuthField(spinningLoading, processInfo) {
  const { createMessage } = useMessage();
  // 已经保存的字段权限信息
  const authDataList = ref([]);
  //表单类型
  const formTypeArray = ref([]);
  const activeFormType = ref();
  // 查询业务表单类型
  async function queryBizFormType(processId) {
    let arr = await queryFormTypeByProcessId(processId);
    if (arr && arr.length > 0) {
      let temp = arr.filter((type) => type == '1' || type == '2'|| type == '3');
      if (temp.length == 0) {
        spinningLoading.value = true;
        createMessage.info('当前业务表单不支持此配置!');
      } else {
        formTypeArray.value = temp;
        activeFormType.value = temp[0];
      }
    } else {
      createMessage.info('当前无业务表配置，请先配置业务关联!');
    }
  }

  //配置表单信息
  const myFormList = ref([]);
  
/*  const onlineFormList = ref([]);
  const designFormList = ref([]);*/
  const activeTableName = ref();
  // 表单类型改变-表单列表改变
  async function handleChangeFormType(formType) {
    console.log('activeFormType', activeFormType.value, formType);
    if (!formType) {
      return;
    }
    const formList = await queryFormBizCodeByProcessid(processInfo.processId, formType);
    console.log('handleChangeFormType-formList', formList);
    if(formList && formList.length>0){
      myFormList.value = formList;
      activeTableName.value = formList[0].formTableName;
    }else{
      myFormList.value = [];
      activeTableName.value = ''
    }

    
    /*if (formType == '1') {
      onlineFormList.value = formList;
      activeTableName.value = formList[0].formTableName;
    } else if (formType == '2') {
      designFormList.value = formList;
      activeTableName.value = formList[0].formTableName;
    }else if (formType == '3') {
      designFormList.value = formList;
      activeTableName.value = formList[0].formTableName;
    }*/
  }

  // 表单列表
/*  const myFormList = computed(() => {
    if (activeFormType.value == '1') {
      return onlineFormList.value;
    }
    if (activeFormType.value == '2') {
      return designFormList.value;
    }
    console.log('onlineFormList', onlineFormList);
    console.log('designFormList', designFormList);
    return [];
  });*/


  //100+150+150+100+100= 600

  // 查询上一次的权限信息
  async function queryLastAuthData() {
    const { processNodeCode, processId } = processInfo;
    const existAuthList = await list({ processNodeCode, processId, pageSize: 300 });
    authDataList.value = existAuthList.records || [];
    console.log('exsitAuthList', existAuthList);
  }

  return {
    formTypeArray,
    activeFormType,
    activeTableName,
    myFormList,
    handleChangeFormType,
    queryBizFormType,
    queryLastAuthData,
    authDataList
  };
}

/**
 * 用于按钮权限等其他配置
 */
export function useAuthButton(activeFormType, activeTableName) {
  const buttonStatus = reactive({
    id: '',
    formEditStatus: '0',
    ccStatus: '1',
    selnextUserStatus: '1',
    msgStatus: '1',
    //pc表单地址
    modelAndView: '',
    //app表单地址
    modelAndViewMobile: '',

    processId: '',
    processNodeCode: '',
    processNodeName: '',
    //允许动态加签
    addSignStatus:'1',
    //允许转审
    transferStatus:'1',
    //允许会签加人
    allowCounterSignAddUser:'0',
    //允许驳回
    rejectStatus:'1',

  });

  function initButtonStatus(record) {
    Object.keys(buttonStatus).map((k) => {
      console.log(record[k]);
      buttonStatus[k] = record[k];
    });
  }

  function handleChangeFormEditStatus(value) {
    console.log('value', value);
    let formType = activeFormType.value;
    if (value === '1') {
      //启用编辑
      if (formType == '1') {
        //online
        //update-begin-author:taoyan date:2022-8-24 for: VUEN-1698【节点配置】PC端地址配置自定义页面时，开启表单可编辑后，地址替换成了online的编辑地址
        if(!buttonStatus.modelAndView){
          //buttonStatus.modelAndView = 'modules/bpm/task/form/OnlineFormOpt';
          // QQYUN-4131 【online】对接流程，节点设置的url路径不对，目前是vue2的，应该区分vue3和vue2
          buttonStatus.modelAndView = 'super/bpm/process/components/OnlineFormOpt'
        }
        if(!buttonStatus.modelAndViewMobile){
          buttonStatus.modelAndViewMobile = 'check/onlineForm/flowedit'
        }
        //update-end-author:taoyan date:2022-8-24 for: VUEN-1698【节点配置】PC端地址配置自定义页面时，开启表单可编辑后，地址替换成了online的编辑地址
      } else if (formType == '2') {
        //设计器
        const designCode = activeTableName.value;
        buttonStatus.modelAndView = '{{DOMAIN_URL}}/desform/edit/' + designCode + '/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}';
        buttonStatus.modelAndViewMobile = '{{DOMAIN_URL}}/desform/edit/' + designCode + '/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}';
      } else if (formType == '3') {
        //自定义开发
        let temp = buttonStatus.modelAndView || '';
        if (temp && temp.indexOf('?edit=1') < 0) {
          buttonStatus.modelAndView = temp + '?edit=1';
        }
      }
    } else {
      //关闭编辑
      if (formType == '3') {
        //自定义开发
        let temp = buttonStatus.modelAndView || '';
        if (temp && temp.indexOf('?edit=1') > 0) {
          buttonStatus.modelAndView = temp.replace('?edit=1', '');
        }
      } else if(buttonStatus.modelAndView && buttonStatus.modelAndView.indexOf('?view=') < 0) {
        buttonStatus.modelAndView = '';
        buttonStatus.modelAndViewMobile = '';
      }
    }
  }

  return {
    buttonStatus,
    initButtonStatus,
    handleChangeFormEditStatus,
  };
}
