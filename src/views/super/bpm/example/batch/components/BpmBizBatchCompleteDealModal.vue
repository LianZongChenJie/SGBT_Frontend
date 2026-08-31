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
              <a-button type="primary" :disabled="disabledButton" @click="handleBatchComplete">确认提交</a-button>
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
      function deal(param) {
        data.dealStatus = false;
        data.model.reason = '';
        data.dataSource = [];
        data.dataSource2 = [];
        data.disabledButton = false;
        data.visible = true;
        initFlowData(param);
      }
      //加载流程信息
      async function initFlowData(param) {
        data.loading = true;
        for (let i = 0; i < param.length; i++) {
          let params = { flowCode: param[i].flowCode, dataId: param[i].dataId }; //查询条件
          let res = await getBizProcessNodeInfo(params);
          if (res.success) {
            let currTask = res.result.bizTaskList[0];
            let taskId = currTask.id;
            let taskName = currTask.taskName;
            param[i].taskClaimFlag = currTask.taskClaimFlag;
            param[i].taskName = taskName;
            param[i].taskId = taskId;
            let res2 = await getProcessTaskTransInfo({ taskId });
            if (res2.success) {
              if (res2.result.nextCodeCount == 1) {
                param[i].status = '-1'; //待处理
                param[i].nextnode = res2.result.transitionList[0].nextnode;
                continue;
              } else if (res2.result.nextCodeCount > 1) {
                param[i].msg = '多流转分支不能进行提交处理';
              }
            }
          }
          param[i].status = '0';
        }
        data.loading = false;
        data.dataSource = param;
      }
      //批量处理
      function handleBatchComplete() {
        if (!data.model.reason || data.model.reason.length == 0) {
          //update-begin-author:taoyan date:2022-9-5 for: VUEN-2157  2. 意见允许为空
          //createMessage.warning('请填写处理意见');
          //return;
          //update-end-author:taoyan date:2022-9-5 for: VUEN-2157  2. 意见允许为空
        }
        createConfirm({
          title: '确认提交',
          centered: false,
          content: '是否提交选中数据?',
          onOk: () => {
            handleProcessComplete();
          },
        });
      }
      //批量完成
      async function handleProcessComplete() {
        data.confirmLoading = true;
        data.disabledButton = true;
        for (var i = 0; i < data.dataSource.length; i++) {
          if (data.dataSource[i].taskClaimFlag) {
            //未签收，不做处理
            data.dataSource[i].msg = '未签收不能进行提交处理';
            data.dataSource[i].status = '0';
            continue;
          }
          if (data.dataSource[i].status == '-1') {
            let param = {
              taskId: data.dataSource[i].taskId,
              nextnode: data.dataSource[i].nextnode,
              nextCodeCount: '1',
              reason: data.model.reason,
              processModel: 1,
              rejectModelNode: '',
              nextUserName: '',
              nextUserId: '',
              ccUserIds: '',
              ccUserRealNames: '',
              fileList: '',
            };
            console.log('流程办理数据：', param);
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
      //初始化字典
      initDictConfig();
      //初始化数据
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
            dataIndex: 'taskName',
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
          processModel: 1,
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
        handleBatchComplete,
        ...toRefs(data),
      };
    },
  });
</script>
