<template>
  <!-- 弹出框 -->
  <a-modal
    :open="visible"
    :title="title"
    width="80%"
    :bodyStyle="{ height: '80vh', overflow:'auto' }"
    style="top: 20px"
    :footer="null"
    destroyOnClose
    @cancel="handleModalCancel"
  >
    <a-spin :spinning="confirmLoading">
      <!--已选择单据-->
      <div style="width: 60%; margin: 0 auto">
        <a-divider orientation="left">已选择的单据</a-divider>
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="dataId"
          :pagination="false"
          :columns="columns"
          :dataSource="dataSource"
          :loading="loading"
        >
          <template #currTask="{ text, record, index }">
            <a-select style="width: 200px" :defaultValue="record.taskId">
              <a-select-option :value="record.taskId">{{ record.taskName }}</a-select-option>
            </a-select>
          </template>
          <template #rejectTask="{ text, record, index }">
            <a-select v-model:value="record.rejectModelNode" style="width: 200px" @change="handleRejectNodeChange">
              <template v-for="(item, index) in record.histListNode" :key="index">
                <a-select-option :value="item.TASK_DEF_KEY_">{{ item.NAME_ }}</a-select-option>
              </template>
            </a-select>
          </template>
        </a-table>
      </div>
      <!--处理意见-->
      <div style="width: 60%; margin: 0 auto">
        <a-divider orientation="left">处理意见</a-divider>
        <a-row>
          <a-col :span="24">
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
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <div style="text-align: center">
              <a-button type="primary" :disabled="disabledButton" @click="handleBatchReject">确认驳回</a-button>
            </div>
          </a-col>
        </a-row>
      </div>
      <!--反馈结果-->
      <div style="width: 60%; margin: 0 auto" v-show="dealStatus">
        <a-divider orientation="left">处理结果</a-divider>
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="dataId"
          :pagination="false"
          :columns="columns2"
          :dataSource="dataSource2"
          :loading="loading"
        >
        </a-table>
      </div>
    </a-spin>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, reactive, toRefs } from 'vue';
  import { initDictOptions } from '/src/utils/dict';
  import { getBizProcessNodeInfo, getProcessTaskTransInfo, processComplete } from '/src/views/super/bpm/process/manage/components/bpm.api';
  import { useMessage } from '/src/hooks/web/useMessage';
  export default defineComponent({
    props: ['paramData'],
    emits: ['ok'],
    setup(_, { emit }) {
      const { createMessage, createConfirm } = useMessage();

      async function initDictConfig() {
        //初始化字典
        let res = await initDictOptions('approval_remarks');
        data.remarksDictOptions = res && res.length > 0 ? res : [];
      }

      function handleChangeSelect(value) {
        data.model.reason = value;
      }

      // 关闭模态框
      function handleModalCancel() {
        data.visible = false;
      }
      function deal(processData) {
        data.dealStatus = false;
        data.model.reason = '';
        data.dataSource = [];
        data.dataSource2 = [];
        data.disabledButton = false;
        data.visible = true;
        initFlowData(processData);
      }

      async function initFlowData(processData) {
        data.loading = true;
        for (let i = 0; i < processData.length; i++) {
          let params = { flowCode: processData[i].flowCode, dataId: processData[i].dataId }; //查询条件
          let res = await getBizProcessNodeInfo(params);
          if (res.success) {
            let currTask = res.result.bizTaskList[0];
            let taskId = currTask.id;
            let taskName = currTask.taskName;
            processData[i].taskClaimFlag = currTask.taskClaimFlag;
            processData[i].taskName = taskName;
            processData[i].taskId = taskId;
            let res2 = await getProcessTaskTransInfo({ taskId });
            if (res2.success) {
              processData[i].histListNode = res2.result.histListNode;
              processData[i].rejectModelNode = getDefaultRejectNode(processData[i].histListNode, currTask);
              processData[i].status = '-1'; //待处理
              continue;
            }
          }
          processData[i].status = '0';
        }
        data.loading = false;
        data.dataSource = processData;
        console.log('processData------------->', processData);
      }
      function getDefaultRejectNode(histListNode, currTask) {
        let taskDefKey = '';
        for (let item of histListNode) {
          if (item.TASK_DEF_KEY_ == currTask.taskId) {
            break;
          }
          taskDefKey = item.TASK_DEF_KEY_;
        }
        return taskDefKey;
      }
      function handleBatchReject() {
        if (!data.model.reason || data.model.reason.length == 0) {
          createMessage.warning('请填写处理意见');
          return;
        }
        createConfirm({
          title: '确认驳回',
          centered: false,
          content: '是否驳回选中数据?',
          onOk: () => {
            handleProcessComplete();
          },
        });
      }

      async function handleProcessComplete() {
        data.confirmLoading = true;
        data.disabledButton = true;
        for (var i = 0; i < data.dataSource.length; i++) {
          if (data.dataSource[i].taskClaimFlag) {
            //未签收，不做处理
            data.dataSource[i].msg = '未签收不能进行驳回处理';
            data.dataSource[i].status = '0';
            continue;
          }
          if (data.dataSource[i].rejectModelNode == '') {
            data.dataSource[i].msg = '未选中驳回节点不能进行驳回处理';
            data.dataSource[i].status = '0';
            continue;
          }
          if (data.dataSource[i].status == '-1') {
            let param = {
              taskId: data.dataSource[i].taskId,
              nextnode: data.dataSource[i].nextnode,
              nextCodeCount: '1',
              reason: data.model.reason,
              processModel: 3,
              rejectModelNode: data.dataSource[i].rejectModelNode,
              nextUserName: '',
              nextUserId: '',
              ccUserIds: '',
              ccUserRealNames: '',
              fileList: '',
            };
            console.log('驳回办理数据：', param);
            let res = await processComplete(param);
            if (res.success) {
              data.dataSource[i].status = '1';
              continue;
            }
          }
          data.dataSource[i].status = '0';
        }
        data.dealStatus = true;
        data.dataSource2 = data.dataSource;
        data.confirmLoading = false;
        emit('ok');
      }
      function handleRejectNodeChange(value) {
        console.log('------handleRejectNodeChange--------', data.dataSource);
      }
      initDictConfig();
      const data = reactive({
        loading: false,
        title: '批量处理',
        visible: false,
        confirmLoading: false,
        currTask: {},
        dataSource: [],
        dataSource2: [],
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: ({ index }) => {
              return parseInt(index) + 1;
            },
          },
          {
            title: '标题',
            align: 'center',
            dataIndex: 'bizTitle',
          },
          {
            title: '流程编码',
            align: 'center',
            dataIndex: 'flowCode',
          },
          {
            title: '业务key',
            align: 'center',
            dataIndex: 'dataId',
          },
          {
            title: '当前环节',
            align: 'center',
            dataIndex: 'currTask',
            slots: { customRender: 'currTask' },
          },
          {
            title: '驳回到',
            align: 'center',
            dataIndex: 'rejectTask',
            slots: { customRender: 'rejectTask' },
          },
        ],
        columns2: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: ({ index }) => {
              return parseInt(index) + 1;
            },
          },
          {
            title: '标题',
            align: 'center',
            dataIndex: 'bizTitle',
          },
          {
            title: '流程编码',
            align: 'center',
            dataIndex: 'flowCode',
          },
          {
            title: '业务key',
            align: 'center',
            dataIndex: 'dataId',
          },
          {
            title: '当前环节',
            align: 'center',
            dataIndex: 'taskName',
          },
          {
            title: '处理状态',
            align: 'center',
            dataIndex: 'status',
            customRender: ({ text }) => {
              if (text == '1') {
                return '处理成功';
              } else if (text == '0') {
                return '处理失败';
              } else {
                return '待处理';
              }
            },
          },
          {
            title: '描述',
            align: 'center',
            dataIndex: 'msg',
          },
        ],
        remarksDictOptions: [],
        dealStatus: false,
        disabledButton: false,
        model: {
          taskId: '',
          nextnode: '',
          nextCodeCount: '',
          reason: '',
          processModel: 3,
          rejectModelNode: '',
          nextUserName: '',
          nextUserId: '',
          ccUserIds: '',
          ccUserRealNames: '',
          fileList: '',
        },
      });
      return {
        deal,
        handleModalCancel,
        handleChangeSelect,
        handleBatchReject,
        handleRejectNodeChange,
        ...toRefs(data),
      };
    },
  });
</script>
