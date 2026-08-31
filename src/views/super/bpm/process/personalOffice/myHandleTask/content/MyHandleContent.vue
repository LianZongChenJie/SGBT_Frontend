<template>
  <a-card style="margin-top: 10px">
    <template #title> <audit-outlined /><span style="margin-left: 10px">我的审批</span> </template>
    <a-spin :spinning="loading">
      <a-list itemLayout="vertical">
        <a-list-item>
          <div style="width: 100%">
            <div style="margin-bottom: 5px">
              处理意见：
              <a-select
                style="width: 300px"
                placeholder="常用审批语"
                :getPopupContainer="(target) => target.parentNode"
                @change="changeReasonSelection"
              >
                <a-select-option v-for="(item, key) in remarksDictOptions" :key="key" :value="item.value">{{ item.text }}</a-select-option>
              </a-select>
            </div>
            <a-textarea :rows="3" v-model:value="model.reason" />
          </div>
        </a-list-item>

        <a-list-item>
          <j-upload text="添加文件" bizPath="bpm" :returnUrl="false" v-model:value="model.fileList"></j-upload>
        </a-list-item>

        <!-- 选择分支 -->
        <a-list-item>
          <div style="width: 100%">
            <a-radio-group v-model:value="model.processModel">
              <a-radio :checked="true" :value="1">单分支模式</a-radio>
              <a-radio :value="2">多分支模式</a-radio>
              <a-radio :value="3" v-if="historyCount > 0">驳回</a-radio>
            </a-radio-group>

            <span v-show="model.processModel == 2">
              <span style="color: red">多分支模式默认执行所有分支：</span>
              <template v-for="(item, index) in branchList">
                <a-checkbox :checked="true" :value="item.nextnode">{{ item.Transition }}</a-checkbox>
              </template>
            </span>

            <span v-show="model.processModel == 3" v-if="historyCount > 0">
              <a-select v-model:value="model.rejectModelNode" :getPopupContainer="(target) => target?.parentNode" style="width: 150px">
                <template v-for="(item, index) in historyList">
                  <a-select-option v-if="item.NAME_ != currentTaskName" :value="item.TASK_DEF_KEY_">{{ item.NAME_ }}</a-select-option>
                </template>
              </a-select>
            </span>
          </div>
        </a-list-item>

        <!-- 下一步操作人 -->
        <a-list-item class="flex-center" v-if="buttonStatus.selnextUserStatus || buttonStatus.ccStatus || allowAddSign || allowCounterSignAddUser">
          <a-checkbox v-if="buttonStatus.selnextUserStatus" :checked="checkedNext" @change="handleCheckedNext">指定下一步操作人（指定下一步会签人员）</a-checkbox>
          <a-checkbox v-if="buttonStatus.ccStatus" :checked="checkedCc" @change="handleCheckedCc">是否抄送</a-checkbox>
          <a-dropdown v-if="allowAddSign || allowCounterSignAddUser" :trigger="['click']" :overlayStyle="{ width: '120px' }" placement="bottomRight">
            <div class="dot-more" title="更多操作"> <div></div><div></div><div></div> </div>
            <template #overlay>
              <a-menu @click="onMoreAction">
                <a-menu-item key="add-sign" v-if="allowAddSign">
                  <div class="flex-center">
                    <Icon icon="ant-design:sisternode-outlined" size="22" />
                    <span style="margin-left: 10px">动态加签</span>
                  </div>
                </a-menu-item>
                <a-menu-item key="add-user" v-if="allowCounterSignAddUser">
                  <div class="flex-center">
                    <Icon icon="ant-design:usergroup-add-outlined" size="22" />
                    <span style="margin-left: 10px">追加审批人</span>
                  </div>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-list-item>

        <a-list-item style="line-height: 32px" v-show="checkedNext">
          <span>指定下一步操作人（指定下一步会签人员）：</span>
          <bpm-select-user style="display: inline-block" placeholder="请选择下一步操作人" @change="handleSelectNextUser"></bpm-select-user>
        </a-list-item>

        <!-- 抄送 -->
        <a-list-item style="line-height: 32px" v-show="checkedCc">
          <span>抄送给：</span>
          <bpm-select-user style="display: inline-block" placeholder="请选择抄送人" @change="handleSelectCcUser"></bpm-select-user>
        </a-list-item>
      </a-list>

      <!-- 流转按钮 -->
      <div style="margin-top: 20px; text-align: center">
        <template v-if="model.processModel == 1">
          <template v-for="(item, index) in branchList">
            <a-button type="primary" @click="handleProcessComplete(item.nextnode)">{{ item.Transition }}</a-button>
          </template>
        </template>
        <template v-else>
          <a-button type="primary" @click="handleManyProcessComplete()">确认提交</a-button>
        </template>
      </div>
      <br />
    </a-spin>
  </a-card>
  <!-- 加签节点弹窗 -->
  <add-sign-task-modal @register="registerAddSignTaskModal" @selected="selectedAddSignTask" />
  <!-- 审批人选择人员 -->
  <user-select-modal :multi="multiSelectUser" @register="registerUserModal" @selected="onSelectedUserOk" />
</template>

<script>
  import { ref, reactive, computed, toRaw, unref, watchEffect } from 'vue';
  import { initDictOptions } from '/@/utils/dict';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { taskComplaint, taskComplete, beforeAddSignTask, afterAddSignTask, addMultiInstance} from "../task.handle.api";
  import { useModal } from '/@/components/Modal';
  import { JSelectUserByDept } from '/@/components/Form';
  import { AuditOutlined } from '@ant-design/icons-vue';
  import { JUpload } from '/@/components/Form/src/jeecg/components/JUpload';
  import BpmSelectUser from '/@/views/super/bpm/process/components/bpmSelectUser/index.vue';
  import AddSignTaskModal from '/@/views/super/bpm/process/personalOffice/myHandleTask/modal/AddSignTaskModal.vue';
  import UserSelectModal from '/@/components/Form/src/jeecg/components/userSelect/UserSelectModal.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { isString } from '/@/utils/is';

  export default {
    name: 'MyHandleContent',
    components: {
      UserSelectModal,
      AddSignTaskModal,
      JSelectUserByDept,
      JUpload,
      AuditOutlined,
      BpmSelectUser,
    },
    props: {
      historyList: {
        type: Array,
        default: () => [],
      },
      branchList: {
        type: Array,
        default: () => [],
      },
      currentTaskName: {
        type: String,
        default: '',
      },
      taskId: {
        type: String,
        default: '',
      },
      ccStatus:{
        type: Boolean,
        default: true,
      },
      allowAddSign:{
        type: Boolean,
        default: false,
      },
      allowCounterSignAddUser: {
        type: Boolean,
        default: false,
      },
      turnbackTaskId: {
        type: String,
        default: '',
      },
      selnextUserStatus:{
        type: Boolean,
        default: true,
      }
    },
    emits: ['success'],
    setup(props, { emit }) {
      console.log('进入MyHandleContent');
      const loading = ref(false);
      const { createMessage: $message, createConfirm: $confirm } = useMessage();
      const userStore = useUserStore();
      // 转办
      const [registerAddSignTaskModal, { openModal: openAddSignTaskModal }] = useModal();
      // 选择用户
      const [registerUserModal, { openModal: openUserModal, closeModal: closeUserModal }] = useModal();
      /**
       * 转审(change-user)和添加审批人(add-user) 都需要选择用户，此处记录不同的类型
       */
      const selectUserType = ref('');
      const remarksDictOptions = ref([]);
      const historyCount = computed(() => {
        return props.historyList.length;
      });

      const buttonStatus = computed(()=>{
        return {
          ccStatus: props.ccStatus,
          selnextUserStatus: props.selnextUserStatus
        }
      })
      const model = reactive({
        taskId: '',
        nextnode: '',
        nextCodeCount: '',
        reason: '',
        processModel: 1,
        rejectModelNode: '',
        nextUserName: '',
        nextUserId: '',
        ccUserIds: '',
        ccUserRealNames: '',
        fileList: '',
      });
      //审批人用户是否多选
      const multiSelectUser = computed(() => {
        return unref(selectUserType) == 'change-user' ? false : true;
      });
      //监听返回节点变化
      watchEffect(() => {
        props.turnbackTaskId && (model.rejectModelNode = props.turnbackTaskId);
      });
      // 选择下一步操作人
      const checkedNext = ref(false);
      const nextPersonList = ref([]);
      function handleCheckedNext(e) {
        checkedNext.value = e.target.checked;
        nextPersonList.value = [];
      }

      // 选择抄送人
      const checkedCc = ref(false);
      const ccPersonList = ref([]);
      function handleCheckedCc(e) {
        checkedCc.value = e.target.checked;
        ccPersonList.value = [];
      }

      function changeReasonSelection(value) {
        model.reason = value;
      }

      function handleProcessComplete(nextnode) {
        if (!model.reason || model.reason.length == 0) {
          //update-begin-author:taoyan date:2022-9-5 for: VUEN-2157  2. 意见允许为空
          //$message.warning('请填写处理意见');
          //return;
          //update-end-author:taoyan date:2022-9-5 for: VUEN-2157  2. 意见允许为空
        }
        if (nextnode) {
          model.nextnode = nextnode;
        }
        //设置下个节点的数量
        if (props.branchList) {
          model.nextCodeCount = props.branchList.length;
        }
        
        $confirm({
          title: '提示',
          content: '确认提交审批吗?',
          onOk: commitTaskHandleInfo,
        });
      }

      function handleManyProcessComplete() {
        if (model.processModel == 3) {
          if (!model.rejectModelNode || model.rejectModelNode.length == 0) {
            $message.warning('请选择驳回节点');
            return;
          }
        }
        handleProcessComplete();
      }

      // 加签——弹出选择界面
      function handleAddSignTask() {
        openAddSignTaskModal(true, {
          taskId:  props.taskId
        });
      }

      // 加签——回调处理
      async function selectedAddSignTask(params,addSignType) {
        console.log('加签', params);
        console.log('加签', addSignType);
        if(addSignType=='after'){
          await afterAddSignTask(params);
        }
        if(addSignType=='before'){
          await beforeAddSignTask(params);
        }

        //加签完，关闭办理弹窗
        emit('success');
      }

      //================[20230707会签节点增加审批人]begin=============================
      /**
       * 更多操作
       */
      function onMoreAction(e) {
        selectUserType.value = 'add-user';
        if ('add-user' == e.key) {
          //多实例加签(支持串行和并行会签）
          onAddHandlePerson();
        } else if ('add-sign' == e.key) {
          //加签
          handleAddSignTask();
        }
      }
      /**
       * 添加审批人 事件
       */
      function onAddHandlePerson() {
        let id = userStore.getUserInfo.id;
        selectUserType.value = 'add-user';
        openUserModal(true, {
          list: [],
          excludeUserIdList: [id],
        });
      }
      /**
       * 人员选中事件
       * @param data
       */
      async function onSelectedUserOk(data) {
        console.log('onSelectedUserOk', data);
        if (data && data.length > 0) {
          if (!props.taskId) {
            console.error('节点信息不存在');
            return;
          }
          if (selectUserType.value === 'change-user') {
            //await doChangeHandlePerson(node.taskId, data)
          } else if (selectUserType.value === 'add-user') {
            await doAddHandlePerson(props.taskId, data);
          } else {
            console.error('不识别的类型', selectUserType.value);
          }
        }
      }
      /**
       * 添加审批人 请求
       */
      async function doAddHandlePerson(taskId, userList) {
        let usernameList = userList.map((item) => item.username);
        let params = {
          taskId: taskId,
          assignees: usernameList,
          //简流模式，串行会签专用变量值
          assigneeListKey: 'loopAssigneeCollection',
        };
        const result = await addMultiInstance(params);
        if (result.success) {
          closeUserModal();
          emit('success');
          $message.success('操作成功！');
        } else {
          $message.warning(result.message);
        }
      }
      //================[20230707会签节点增加审批人]end=============================
      /**
       * 流程处理提交
       * @returns {Promise<void>}
       */
      async function commitTaskHandleInfo() {
        loading.value = true;
        const params = toRaw(model);
        params.taskId = props.taskId;
        if (params.fileList) {
          params.fileList = isString(params.fileList) ? params.fileList : JSON.stringify(params.fileList);
        }
        try {
          console.log('流程提交->params', params);
          let json = await taskComplete(params);
          console.log('流程提交-result', json);
          loading.value = false;
          emit('success');
        } catch (e) {
          console.error('流程处理失败', e);
          loading.value = false;
        }
      }

      async function initDict() {
        const dictData = await initDictOptions('approval_remarks');
        console.log('dic', dictData);
        remarksDictOptions.value = dictData;
      }

      function handleSelectNextUser(arr) {
        let { usernames, realnames } = getInfo(arr);
        model.nextUserId = usernames.join(',');
        model.nextUserName = realnames.join(',');
      }

      function handleSelectCcUser(arr) {
        let { usernames, realnames } = getInfo(arr);
        model.ccUserIds = usernames.join(',');
        model.ccUserRealNames = realnames.join(',');
      }

      function getInfo(arr) {
        let usernames = [];
        let realnames = [];
        if (arr && arr.length > 0) {
          for (let item of arr) {
            usernames.push(item.username);
            realnames.push(item.realname);
          }
        }
        return {
          usernames,
          realnames,
        };
      }
      initDict();
      return {
        handleSelectNextUser,
        handleSelectCcUser,
        model,
        remarksDictOptions,
        changeReasonSelection,
        historyCount,

        checkedNext,
        nextPersonList,
        handleCheckedNext,

        checkedCc,
        ccPersonList,
        handleCheckedCc,

        loading,
        handleManyProcessComplete,
        handleProcessComplete,
        buttonStatus,
        registerAddSignTaskModal,
        selectedAddSignTask,
        handleAddSignTask,

        onMoreAction,
        openUserModal,
        closeUserModal,
        registerUserModal,
        onSelectedUserOk,
        multiSelectUser
      };
    },
  };
</script>

<style lang="less" scoped>
  :deep(.ant-card-head-title) {
    padding: 10px 0;
  }
  :deep(.ant-collapse-header) {
    font-size: 16px !important;
  }
  :deep(.ant-card-head) {
    padding-left: 12px;
  }
  html[data-theme='light'] {
    background-color: #fafafa;
  }
  :deep(.ant-card-body) {
    padding-top: 6px;
  }
  //会签节点增加审批人下拉显示更多样式begin
  .flex-center {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .dot-more {
    display: flex;
    flex-direction: row;
    height: 30px;
    width: 30px;
    padding: 0 4px;
    border-radius: 2px;
    cursor: pointer;
    align-items: center;
    justify-content: space-between;
    margin-left: 8px;
    & > div {
      width: 4px;
      height: 4px;
      background-color: #9e9e9e;
      margin: 0 1px;
      border-radius: 3px;
    }
    &:hover {
      background-color: #f7f7f7;
      & > div {
        background-color: #0a9fe5;
      }
    }
  }
  //会签节点增加审批人下拉显示更多样式end
</style>
