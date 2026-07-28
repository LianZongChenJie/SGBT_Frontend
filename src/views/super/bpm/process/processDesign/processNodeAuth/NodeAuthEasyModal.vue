<template>
  <BasicModal wrapClassName="process-auth" v-bind="$attrs" @register="registerModal" :closable="false" :height="550" :width="700" destroyOnClose>
    <template #title>
      <div v-if="formTypeArray.length == 1">
        <a-select style="width: 180px" v-if="myFormList.length > 1" v-model:value="activeTableName">
          <a-select-option v-for="(item, key) in myFormList" :key="key" :value="item.formTableName">{{ item.formTableName }}</a-select-option>
        </a-select>
        <div v-else> {{getTableDescribe()}}：{{ activeTableName }} </div>
      </div>
      <div v-else>
        <a-select style="width: 135px" v-model:value="activeFormType" @change="handleChangeFormType">
          <a-select-option v-for="(item,index) in myFormTypeOptions" :key="index" :value="item.value">{{item.title}}</a-select-option>
        </a-select>

        <a-select style="width: 180px; margin-left: 10px" v-model:value="activeTableName">
          <a-select-option v-for="(item, key) in myFormList" :key="key" :value="item.formTableName">{{ item.formTableName }}</a-select-option>
        </a-select>
      </div>
    </template>
    <a-spin :spinning="spinningLoading">
      <div class="tab-header">
        <div @click="activeKey = '1'" :class="{ active: activeKey == '1' }">基础属性</div>
        <div @click="activeKey = '2'" :class="{ active: activeKey == '2' }">更多属性</div>
      </div>
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" :forceRender="true">
          <template #tab>
            <span></span>
          </template>

          <NodeAuthEasyForSelect
                  v-if="activeFormType=='1' || activeFormType=='2'"
                  ref="selectTableRef"
                  :activeTableName="activeTableName"
                  :activeFormType="activeFormType"
                  :dbAuthDataList="authDataList"
                  :processId="processInfo.processId"
                  :processNodeCode="processInfo.processNodeCode">
          </NodeAuthEasyForSelect>
          
          <NodeAuthEasyForInput
                v-if="activeFormType=='3'"
                ref="customerTableRef"
                :activeTableName="activeTableName"
                :activeFormType="activeFormType"
                :dbAuthDataList="authDataList"
                :processId="processInfo.processId"
                :processNodeCode="processInfo.processNodeCode">
          </NodeAuthEasyForInput>
          
        </a-tab-pane>

        <a-tab-pane key="2" :forceRender="true">
          <template #tab>
            <span></span>
          </template>

          <div class="search">
            <span class="content">节点操作</span>
          </div>

          <div class="button-chunk">
            <span class="button-text">表单可编辑</span>
            <span>
              <a-switch v-model:checked="buttonStatus.formEditStatus" @change="handleChangeFormEditStatus" checkedValue="1" unCheckedValue="0" checked-children="开启" un-checked-children="关闭" />
            </span>
          </div>

          <div class="button-chunk">
            <span class="button-text">选择下一步处理人</span>
            <span>
              <a-switch v-model:checked="buttonStatus.selnextUserStatus" checkedValue="1" unCheckedValue="0" checked-children="开启" un-checked-children="关闭" />
            </span>
          </div>

          <div class="button-chunk">
            <span class="button-text">选择抄送人</span>
            <span>
              <a-switch v-model:checked="buttonStatus.ccStatus" checkedValue="1" unCheckedValue="0" checked-children="开启" un-checked-children="关闭" />
            </span>
          </div>

          <div class="button-chunk">
            <span class="button-text">消息通知</span>
            <span>
              <a-switch v-model:checked="buttonStatus.msgStatus" checkedValue="1" unCheckedValue="0" checked-children="开启" un-checked-children="关闭" />
            </span>
          </div>

          <div class="button-chunk">
            <span class="button-text">是否允许动态加签</span>
            <span>
              <a-switch v-model:checked="buttonStatus.addSignStatus" checkedValue="1" unCheckedValue="0" checked-children="开启" un-checked-children="关闭" />
            </span>
          </div>

          <div class="button-chunk">
            <span class="button-text">是否允许会签加人</span>
            <span>
              <a-switch
                v-model:checked="buttonStatus.allowCounterSignAddUser"
                checkedValue="1"
                unCheckedValue="0"
                checked-children="开启"
                un-checked-children="关闭"
              />
            </span>
          </div>

  <!--        <div class="button-chunk">
            <span class="button-text">是否允许转办?</span>
            <span>
              <a-switch
                v-model:checked="buttonStatus.transferStatus"
                checkedValue="1"
                unCheckedValue="0"
                checked-children="开启"
                un-checked-children="关闭"
              />
            </span>
          </div>

          <div class="button-chunk">
            <span class="button-text">是否允许驳回?</span>
            <span>
              <a-switch
                v-model:checked="buttonStatus.rejectStatus"
                checkedValue="1"
                unCheckedValue="0"
                checked-children="开启"
                un-checked-children="关闭"
              />
            </span>
          </div>-->
        </a-tab-pane>
      </a-tabs>
    </a-spin>

    <template #footer>
      <a-button size="default" key="back" @click="closeModal">关闭</a-button>
      <a-button size="default" key="submit" type="primary" :loading="spinningLoading" @click="handleOk">保存</a-button>
      <!---->
    </template>
  </BasicModal>
</template>

<script>
  import { ref, computed, reactive, watch, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { queryFormTypeByProcessId, queryFormBizCodeByProcessid, getOnlineFields, getDesignFields, list } from '../processNodeAuth/node.auth.api';
  import { useMessage } from '/@/hooks/web/useMessage';

  import { useAuthField, useAuthButton } from './useNodeAuthEasyModal';
  import { saveOrUpdate, batchSavePermission } from '../processNode/process.node.api';
  import NodeAuthEasyForSelect from './NodeAuthEasyForSelect.vue'
  import NodeAuthEasyForInput from './NodeAuthEasyForInput.vue'
  import { defHttp } from '/@/utils/http/axios';

  const allFormTypeOptions = [
    {title:'Online表单', value:'1'},
    {title:'设计器表单', value:'2'},
    {title:'自定义开发表单', value:'3'},
  ]
  
  /**
   * 流程节点权限配置 简易版
   */
  export default {
    name: 'NodeAuthEasyModal',
    components: {
      BasicModal,
      QuestionCircleOutlined,
      NodeAuthEasyForSelect,
      NodeAuthEasyForInput,
      
    },
    emits: ['success', 'register'],
    setup(_props, { emit }) {
      const { createMessage } = useMessage();
      const activeKey = ref('1');
      const spinningLoading = ref(false);
      const processInfo = reactive({
        processId: '',
        processNodeCode: '',
      });
      const myFormTypeOptions = computed(()=>{
        let arr = formTypeArray.value;
        return allFormTypeOptions.filter(item=>arr.indexOf(item.value)>=0)
      });

      const { formTypeArray, activeFormType, activeTableName, myFormList, handleChangeFormType, queryBizFormType, queryLastAuthData, authDataList } = useAuthField(spinningLoading, processInfo);

      const { buttonStatus, initButtonStatus, handleChangeFormEditStatus } = useAuthButton(activeFormType, activeTableName);
      
      //useModalInner
      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        console.log('data1', data);
        spinningLoading.value = false;
        const { formType, processId, processNodeCode } = data;
        processInfo.processId = processId;
        processInfo.processNodeCode = processNodeCode;
        activeTableName.value = '';
        /**--------------按钮----------------*/
        initButtonStatus(data);

        /**--------------字段----------------*/
        //1.查询已经存在的权限数据  ruleName ruleCode formType ruleType status
        await queryLastAuthData();
        //2.查询业务表单
        await queryBizFormType(processId);
      
        //3.根据activeFormType找业务表
        await handleChangeFormType(activeFormType.value);

        // QQYUN-4129 【online】规则设置样式问题 重置activeKey即可
        //activeKey.value = '1';
        console.log(1345, formTypeArray.value)
        //4.根据业务表 找字段集合
        // 走 watch 事件
        // bizName: null flowStatusCol: "bpm_status" formDealStyle: "default" formTableName: "aac_flow_test2" formType: "1"   processId: "1533692855428096002"  relationCode: "onl_aac_flow_test2"
      });

      // 提交事件
      const selectTableRef = ref();
      const customerTableRef = ref()
      async function handleOk() {
        spinningLoading.value = true;
        //节点按钮操作
        let node = toRaw(buttonStatus);
        console.log('node-button', node);
      //  await saveOrUpdate(node, true);
        
        let allIsOk = true;
        const nodeUpdateResult = await defHttp.put({ url: '/act/process/extActProcessNode/edit', params: node }, { isTransformResponse: false });
        spinningLoading.value = false;
       // console.log('nodeUpdateResult', nodeUpdateResult)
        if(nodeUpdateResult.success){
          //保存成功
          emit('success');
        }else{
          allIsOk = false;
          createMessage.warning(nodeUpdateResult.message);
        }
        
        //节点字段
        let data = [];
        if (activeFormType.value === '3') {
          //update-begin-author:liusq---date:2024-06-17--for: TV360X-990 代码生成的权限设置的小问题
          data = await customerTableRef.value.getData();
          if (!data) {
            return;
          }
          //update-end-author:liusq---date:2024-06-17--for: TV360X-990 代码生成的权限设置的小问题
        } else {
          data = selectTableRef.value.getData();
        }
        //由于后台接口特殊 需要在此获取删除或修改的数据
        data = getDeleteAndUpdateData(data)
        if (!data || data.length == 0) {
          //createMessage.info('无保存信息!');
        }else{
          console.log('权限提交数据', data);
          //await batchSavePermission(data);
          let params = data;
          const authUpdateResult = await defHttp.post({ url: '/act/process/extActProcessNodePermission/saveOrUpdateBatch', params }, { isTransformResponse: false });
         // console.log('authUpdateResult', authUpdateResult);
          if(!authUpdateResult.success){
            allIsOk = false;
            createMessage.warning(authUpdateResult.message);
          }
        }
        if(allIsOk==true){
          createMessage.success('操作成功!');
        }
        closeModal();
      }
      
      function getTableDescribe(){
        let formTypeValue = activeFormType.value
        if(formTypeValue=='1'){
          return 'Online表名'
        }else if(formTypeValue=='2'){
          return '设计器表单编码'
        }else if(formTypeValue=='3'){
          return '自定义开发表名'
        }
        return ''
      }
      
      function getDeleteAndUpdateData(data){
        //获取历史数据
        let dbList = authDataList.value;
        if(data && data.length>0){
          let usedList = [];
          //遍历配置数据 设置ID
          for(let d of data){
            if(dbList && dbList.length>0){
              const {processId, processNodeCode, ruleType, ruleCode} = d;
              for(let i=0;i<dbList.length;i++){
                let dbObj = dbList[i];
                if(processId==dbObj.processId && processNodeCode==dbObj.processNodeCode && ruleType==dbObj.ruleType && ruleCode==dbObj.ruleCode){
                  //如果以上都一样，则是一条数据
                  d.id = dbObj.id;
                  usedList.push(dbObj.id);
                  break;
                }
              }
            }else{
              //如果没有历史数据 那么都是新增数据
            }
          }
          //找删除ID
          let deleteList = []
          if(dbList && dbList.length>0){
            for(let i=0;i<dbList.length;i++){
              let id = dbList[i].id;
              if(usedList.indexOf(id)<0){
                deleteList.push({
                  id: id,
                  delFlag: 1
                })
              }
            }
          }
         for(let item of deleteList){
           data.push(item)
         }
          return data;
        }else{
          if(dbList && dbList.length>0){
            //没有data 那么所有的dbList 需要被删除
            let deleteList = []
            for(let item of dbList){
              deleteList.push({
                id: item.id,
                delFlag: 1
              })
            }
            return deleteList;
          }else{
            //没有data 没有dbList 
            return []
          }
        }
      }

      return {
        registerModal,
        activeKey,
        buttonStatus,
        authDataList,

        spinningLoading,
        formTypeArray,
        activeFormType,
        handleChangeFormType,
        myFormList,
        activeTableName,
        processInfo,
        selectTableRef,
        customerTableRef,
        handleOk,
        closeModal,
        handleChangeFormEditStatus,
        myFormTypeOptions,
        getTableDescribe
      };
    },
  };
</script>

<style lang="less">
  .process-auth {
    /*    .ant-modal-header{
              padding: 0 !important;
            }*/
    .vxe-cell--filter {
      display: none !important;
    }
    .search {
      padding-left: 5px;
      display: flex;
      margin-bottom: 10px;
      justify-content: space-between;
      .ant-input-search {
        width: 160px;
        border-radius: 20px;
      }
      .content {
        height: 32px;
        line-height: 32px;
        display: inline-block;
      }
    }
    .ant-modal-body {
      padding-bottom: 5px !important;
      padding-top: 5px !important;
      .ant-tabs-tab {
        padding: 0;
        margin: 0;
      }
    }
    .ant-tabs-nav-scroll {
      height: 10px;
    }
    .tab-header {
      width: 100%;
      display: flex;
      div {
        width: 50%;
        text-align: center;
        background-color: #eeeeee;
        font-size: 15px;
        cursor: pointer;
        line-height: 32px;
        height: 32px;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji,
          Segoe UI Symbol;
        &.active {
          background-color: #1890ff;
          color: #fff;
        }
      }
    }
    .button-chunk {
      padding: 0 10px;
      border-radius: 10px;
      display: flex;
      margin-bottom: 10px;
      justify-content: space-between;
      background-color: #eee;
      height: 48px;
      line-height: 48px;
      .button-text {
        font-size: 14px;
        color: #4b4a4a;
      }
    }
    .no-use-auth {
      background-color: #eee;
    }
  }
</style>
