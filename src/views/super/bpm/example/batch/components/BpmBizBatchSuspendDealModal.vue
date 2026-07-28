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
        <a-divider orientation="left">挂起</a-divider>
        <a-row>
          <a-col :span="24">
            <div style="text-align: center">
              <a-button type="primary" :disabled="disabledButton" @click="handleBatchSuspend">确认挂起</a-button>
            </div>
          </a-col>
        </a-row>
      </div>
      <!--反馈结果-->
      <div style="width: 60%; margin: 0 auto" v-show="dealStatus">
        <a-divider orientation="left">处理结果</a-divider>
        <a-table
          ref="table2"
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
  import { getBizProcessNodeInfo, suspend } from '/src/views/super/bpm/process/manage/components/bpm.api';
  import { useMessage } from '/src/hooks/web/useMessage';
  export default defineComponent({
    props: ['formData'],
    emits: ['ok'],
    setup(_, { emit }) {
      const { createMessage, createConfirm } = useMessage();

      // 关闭模态框
      function handleModalCancel() {
        data.visible = false;
      }
      function deal(processData) {
        data.dealStatus = false;
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
            processData[i].procInstId = currTask.procInstId;
            processData[i].taskName = taskName;
            processData[i].taskId = taskId;
            processData[i].status = '-1'; //待处理
            continue;
          }
          processData[i].status = '0';
        }
        data.loading = false;
        data.dataSource = processData;
        console.log('------数据初始化--------', data.dataSource);
      }
      function handleBatchSuspend() {
        createConfirm({
          title: '确认挂起',
          centered: false,
          content: '是否挂起选中数据?',
          onOk: () => {
            batchSuspend();
          },
        });
      }

      async function batchSuspend() {
        data.confirmLoading = true;
        data.disabledButton = true;
        for (var i = 0; i < data.dataSource.length; i++) {
          if (data.dataSource[i].taskClaimFlag) {
            //未签收，不做处理
            data.dataSource[i].msg = '未签收不能进行挂起处理';
            data.dataSource[i].status = '0';
            continue;
          }
          if (data.dataSource[i].status == '-1') {
            let param = { processInstanceId: data.dataSource[i].procInstId };
            console.log('挂起：', param);
            let res = await suspend(param);
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
        ],
        dealStatus: false,
        disabledButton: false,
      });
      return {
        deal,
        handleModalCancel,
        handleBatchSuspend,
        ...toRefs(data),
      };
    },
  });
</script>
