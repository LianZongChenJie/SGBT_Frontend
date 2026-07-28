<template>
  <!--流程办理的任务处理弹窗-->
  <div style="background: #fff; margin-right: 10px">
    <!-- 步骤条 -->
    <a-spin :spinning="loading">
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        当前任务办理环节：
        <a-select style="width: 300px" v-model:value="currTask.id">
          <a-select-option :value="currTask.id">{{ currTask.taskName }}</a-select-option>
        </a-select>
      </div>
      <a-card>
        <a-steps progressDot :current="stepIndex" style="padding: 10px" size="default">
          <template v-if="resultObj.bpmLogListCount > 3">
            <a-step>
              <template #title>
                <div class="task-title">...</div>
              </template>
            </a-step>
          </template>
          <template v-for="(item, index) in resultObj.bpmLogStepList" :key="index">
            <a-step>
              <template #title>
                <div class="task-title">{{ item.taskName }}</div>
              </template>
              <template #description>
                <div class="task-date">
                  <span><JEllipsis :value="'处理时间：' + item.opTime"></JEllipsis></span>
                </div>
                <div class="task-user">操作人：{{ item.opUserName }}</div>
              </template>
            </a-step>
          </template>
          <a-step v-if="resultObj.taskName && resultObj.taskName != ''">
            <template #title>
              <div class="task-title">{{ resultObj.taskName }}</div>
            </template>
            <template #description>
              <div class="task-date">
                <span style="color: #ff6d75"><JEllipsis :value="'处理时间：' + resultObj.taskNameStartTime"></JEllipsis></span
              ></div>
              <div class="task-user">操作人：{{ resultObj.taskAssigneeName }}</div>
            </template>
          </a-step>
          <a-step>
            <template #title>
              <div class="task-title">...</div>
            </template>
          </a-step>
        </a-steps>
      </a-card>
      <!-- 意见 -->
      <a-card title="意见信息" :bodyStyle="{ padding: '0 20px' }" size="default" style="margin-top: 20px">
        <a-list itemLayout="vertical">
          <template v-for="(item, index) in resultObj.bpmLogList" :key="index">
            <a-list-item>
              <a-list-item-meta :description="item.remarks || '无意见信息'">
                <template #title>
                  <a
                    ><p>{{ item.opUserName }}</p
                    ><span style="color: #ff6d75">[{{ item.taskName }}]</span> {{ item.opTime }}</a
                  >
                </template>
                <template #avatar>
                  <a-avatar :size="36" style="background-color: #51cbff">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                </template>
              </a-list-item-meta>
              <template v-for="(file, index) in item.bpmFiles" :key="index">
                <div class="ant-upload-list ant-upload-list-text">
                  <div class="ant-upload-list-item ant-upload-list-item-done">
                    <div class="ant-upload-list-item-info">
                      <span>
                        <PaperClipOutlined />
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          :title="file.fileName"
                          :href="getFileAccessHttpUrl(file.filePath)"
                          class="ant-upload-list-item-name"
                          >{{ file.fileName }}</a
                        >
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </a-list-item>
          </template>
          <a-list-item>
            <div style="width: 100%">
              <div style="margin-bottom: 5px">
                处理意见：
                <a-select style="width: 300px" placeholder="常用审批语" @change="handleChangeSelect">
                  <template #suffixIcon>
                    <Icon icon="ant-design:smile-outlined" />
                  </template>
                  <a-select-option v-for="(item, key) in remarksDictOptions" :key="key" :value="item.value">{{ item.text }}</a-select-option>
                </a-select>
              </div>
              <a-textarea rows="3" v-model:value="model.reason" />
            </div>
          </a-list-item>
          <a-list-item>
            <JUpload v-model:value="fileList" :returnUrl="false" :maxCount="10"></JUpload>
          </a-list-item>
          <a-list-item v-show="false">
            <a-row>
              <a-col :span="24">
                <a-radio-group v-model:value="model.processModel">
                  <a-radio :checked="true" :value="1">单分支模式</a-radio>
                  <a-radio :value="2">多分支模式</a-radio>
                  <a-radio :value="3" v-if="resultObj.histListSize > 0">驳回</a-radio>
                </a-radio-group>
                <span :hidden="model.processModel !== 2">
                  <span style="color: red">多分支模式默认执行所有分支：</span>
                  <template v-for="(item, index) in resultObj.transitionList" :key="index">
                    <a-checkbox :checked="true" :value="item.nextnode">{{ item.Transition }}</a-checkbox>
                  </template>
                </span>
                <!-- 选择要驳回的节点 -->
                <span :hidden="model.processModel !== 3" v-if="resultObj.histListSize > 0">
                  <a-select v-model:value="model.rejectModelNode" style="width: 150px">
                    <template v-for="(item, index) in resultObj.histListNode" :key="index">
                      <a-select-option :value="item.TASK_DEF_KEY_">{{ item.NAME_ }}</a-select-option>
                    </template>
                  </a-select>
                </span>
              </a-col>
            </a-row>
          </a-list-item>
          <!--选择下一步处理/抄送人-->
          <a-list-item>
            <a-checkbox :checked="checkedNext" @change="handleCheckedNextChange">指定下一步操作人（指定下一步会签人员）</a-checkbox>
            <a-checkbox :checked="checkedCc" @change="handleCheckedCcChange">是否抄送</a-checkbox>
          </a-list-item>
          <a-list-item style="line-height: 32px" :hidden="!checkedNext">
            <span>指定下一步操作人（指定下一步会签人员）：</span>
            <a-select style="width: 300px" mode="multiple" placeholder="点击选择按钮" :value="hqUserList"></a-select>
            <a-button type="primary" @click="handleHqUserSelect" preIcon="ant-design:search-outlined" style="margin-left: 8px">选择</a-button>
            <a-button type="primary" @click="hqUserSelectReset" preIcon="ant-design:reload-outlined" style="margin-left: 8px">清空</a-button>
            <span>（如果不指定则按照系统默认）</span>
          </a-list-item>
          <a-list-item style="line-height: 32px" :hidden="!checkedCc">
            <span>抄送给：</span>
            <a-select style="width: 300px" mode="multiple" placeholder="点击选择按钮" :value="ccUserList"></a-select>
            <a-button type="primary" @click="handleCcUserSelect" preIcon="ant-design:search-outlined" style="margin-left: 8px">选择</a-button>
            <a-button type="primary" @click="ccUserSelectReset" preIcon="ant-design:reload-outlined" style="margin-left: 8px">清空</a-button>
          </a-list-item>
        </a-list>
        <!-- 流转按钮 -->
        <div style="margin-top: 20px; text-align: center">
          <template v-if="model.processModel == 1">
            <template v-for="(item, index) in resultObj.transitionList">
              <a-button type="primary" @click="handleProcessComplete(item.nextnode)">{{ item.Transition }}</a-button>
            </template>
          </template>
          <template v-else>
            <a-button type="primary" @click="handleManyProcessComplete()">确认提交</a-button>
          </template>
        </div>
        <br />
      </a-card>
      <BizSelectUserModal ref="selectHqUserModal" @selectFinished="selectHqUserOK"></BizSelectUserModal>
      <BizSelectUserModal ref="selectCcUserModal" @selectFinished="selectCcUserOK"></BizSelectUserModal>
    </a-spin>
  </div>
</template>

<script lang="ts">
  import { ref, toRefs, onMounted, computed, defineComponent, reactive } from 'vue';
  import JEllipsis from '/src/components/Form/src/jeecg/components/JEllipsis.vue';
  import BizSelectUserModal from './BizSelectUserModal.vue';
  import { JUpload } from '/src/components/Form/src/jeecg/components/JUpload';
  import { getFileAccessHttpUrl } from '/src/utils/common/compUtils';
  import { UserOutlined, PaperClipOutlined } from '@ant-design/icons-vue';
  import { initDictOptions } from '/src/utils/dict';
  import { getProcessTaskTransInfo, processComplete } from '/src/views/super/bpm/process/manage/components/bpm.api.ts';
  import { getToken } from '/src/utils/auth';
  import { useMessage } from '/src/hooks/web/useMessage';
  import { isString } from "@/utils/is";

  export default defineComponent({
    props: {
      formData: { type: Object },
    },
    components: { UserOutlined, PaperClipOutlined, JEllipsis, JUpload, BizSelectUserModal },
    emits: ['complete'],
    setup(props, { emit }) {
      const { createMessage, createConfirm } = useMessage();
      //选择用户弹窗dom
      const selectHqUserModal = ref(null);
      const selectCcUserModal = ref(null);
      //数据
      const _this = reactive({
        headers: {},
        resultObj: {},
        checkedNext: false,
        transition: [],
        hqUserSelectList: [],
        ccUserSelectList: [],
        remarksDictOptions: [],
        currTask: {},
        model: {
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
        },
        bodyStyle: {
          padding: '10px',
        },
        checkedCc: false,
        fileList: [],
        loading: false,
      });
      //步骤点
      const stepIndex = computed(() => {
        if (_this.resultObj.bpmLogListCount > 3) {
          return _this.resultObj.bpmLogStepListCount + 1;
        }
        return _this.resultObj.bpmLogStepListCount;
      });
      //下一步用户
      const hqUserList = computed(() => {
        let names = [];
        let ids = [];
        for (let a = 0; a < _this.hqUserSelectList.length; a++) {
          names.push(_this.hqUserSelectList[a].realname);
          ids.push(_this.hqUserSelectList[a].username);
        }
        _this.model.nextUserId = ids.join(',');
        _this.model.nextUserName = names.join(',');
        return names;
      });
      //抄送用户
      const ccUserList = computed(() => {
        let names = [];
        let ids = [];
        for (let a = 0; a < _this.ccUserSelectList.length; a++) {
          names.push(_this.ccUserSelectList[a].realname);
          ids.push(_this.ccUserSelectList[a].username);
        }
        _this.model.ccUserIds = ids.join(',');
        _this.model.ccUserRealNames = names.join(',');
        return names;
      });
      //下拉选择处理意见
      function handleChangeSelect(value) {
        _this.model.reason = value;
      }
      //初始化字典值
      async function initDictConfig() {
        let res = await initDictOptions('approval_remarks');
        _this.remarksDictOptions = res && res.length > 0 ? res : [];
      }
      //是否指定下一步操作人
      function handleCheckedNextChange(e) {
        _this.checkedNext = e.target.checked;
        hqUserSelectReset();
      }
      //是否指定抄送
      function handleCheckedCcChange(e) {
        _this.checkedCc = e.target.checked;
        ccUserSelectReset();
      }
      //办理流程
      function handleProcessComplete(nextnode?) {
        if (!_this.model.reason || _this.model.reason.length == 0) {
          //update-begin-author:taoyan date:2022-9-5 for: VUEN-2157  2. 意见允许为空
          //createMessage.warning('请填写处理意见');
          //return;
          //update-end-author:taoyan date:2022-9-5 for: VUEN-2157  2. 意见允许为空
        }
        if (nextnode) {
          _this.model.nextnode = nextnode;
        }
        console.log('流程办理数据：_this:------>', _this);
        createConfirm({
          title: '提示',
          content: '确认提交审批吗?',
          centered: false,
          onOk: async () => {
            _this.loading = true;
            console.log('_this.fileList------->>', _this.fileList);
            _this.model.fileList = isString(_this.fileList) ? _this.fileList : JSON.stringify(_this.fileList);
            let res = await processComplete(_this.model);
            _this.loading = false;
            if (res.success) {
              createMessage.success(res.message);
              emit('complete');
            } else {
              createMessage.warning(res.message);
            }
          },
        });
      }
      //发送流程
      function handleManyProcessComplete() {
        if (_this.model.processModel == 3) {
          if (!_this.model.rejectModelNode || _this.model.rejectModelNode.length == 0) {
            createMessage.warning('请选择驳回节点');
            return;
          }
        }
        handleProcessComplete();
      }
      //选择下一步操作人
      function handleHqUserSelect() {
        selectHqUserModal.value.add();
      }
      //选择下一步操作人回调
      function selectHqUserOK(data) {
        _this.hqUserSelectList = data;
      }
      //下一步操作人清除
      function hqUserSelectReset() {
        _this.hqUserSelectList = [];
      }
      //选择抄送人员
      function handleCcUserSelect() {
        selectCcUserModal.value.add();
      }
      //选择抄送人员回调
      function selectCcUserOK(data) {
        _this.ccUserSelectList = data;
      }
      //抄送人员清除
      function ccUserSelectReset() {
        _this.ccUserSelectList = [];
      }
      /**
       * 加载数据
       * @param formData
       */
      async function loadData(formData) {
        let params = { taskId: formData.taskId }; //查询条件
        _this.loading = true;
        const res = await getProcessTaskTransInfo(params);
        _this.loading = false;
        if (res.success) {
          _this.resultObj = res.result;
        }
      }

      onMounted(() => {
        const token = getToken();
        _this.headers = { 'X-Access-Token': token };
        console.log('任务办理组件数据：', props.formData);
        _this.currTask = props.formData.bizTaskList[0];
        _this.model.taskId = _this.currTask.id;
        loadData(props.formData);
        initDictConfig();
      });

      return {
        handleChangeSelect,
        handleCheckedNextChange,
        handleCheckedCcChange,
        handleProcessComplete,
        handleManyProcessComplete,
        getFileAccessHttpUrl,
        handleCcUserSelect,
        ccUserSelectReset,
        handleHqUserSelect,
        hqUserSelectReset,
        selectHqUserOK,
        selectCcUserOK,
        stepIndex,
        hqUserList,
        ccUserList,
        selectHqUserModal,
        selectCcUserModal,
        ...toRefs(_this),
      };
    },
  });
</script>

<style scoped>
  .task-info {
    margin: 20px 0;
  }

  .task-title {
    font-weight: bold;
  }

  .task-date {
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-steps-item-description {
    max-width: 200px !important;
  }

  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px;
  }
  /** 标题和描述对齐 */
  :deep(.ant-steps-item-content) {
    text-align: left;
    margin-left: 50px;
  }
  /** 描述的样式 */
  .descriptionDiv {
    display: flex;
    justify-content: left;
    align-items: center;
    margin-top: 5px;
  }
</style>
