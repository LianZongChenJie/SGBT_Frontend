<template>
  <BasicModal
    title="任务审批详情"
    @register="registerModal"
    keyboard
    :canFullscreen="false"
    :width="280"
    :mask="false"
    :footer="null"
    :centered="true"
    @close="handleClose"
    wrapClassName="jeecg-bpm-node-detail"
    :bodyStyle="{ padding: '0' }"
  >
    <div style="height: 300px; padding-bottom: 5px; overflow: hidden; overflow-y: auto; overflow-x: auto">
      <a-descriptions title="" size="small" :column="1" bordered v-for="item in nodeInfoList" style="margin-bottom: 5px">
        <a-descriptions-item v-for="(schema, index) in nodeSchema" :key="index" :label="schema.label" :labelMinWidth="70">{{
          item[schema.field]
        }}</a-descriptions-item>
      </a-descriptions>
    </div>
  </BasicModal>
</template>

<script>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, nextTick } from 'vue';

  export default {
    name: 'BpmNodeInfoModal',
    components: {
      BasicModal,
    },
    emits: ['register', 'notify'],
    setup(_p, { emit }) {
      //useModalInner
      const [registerModal, { closeModal }] = useModalInner((data) => {
        const { dataList, taskId } = data;
        getNodeInfo(dataList, taskId);
      });

      const nodeSchema = [
        {
          field: 'taskName',
          label: '任务名称',
          labelMinWidth: 60,
        },
        {
          field: 'taskAssigneeId',
          label: '执行人',
        },
        {
          field: 'taskBeginTime',
          label: '开始时间',
        },
        {
          field: 'taskEndTime',
          label: '结束时间',
        },
        {
          field: 'durationStr',
          label: '耗时',
        },
        {
          field: 'remarks',
          label: '意见',
          /*style="word-break: break-all;"*/
        },
      ];

      const nodeInfoList = ref([]);
      function getNodeInfo(dataList, taskId) {
        let arr = [];
        for (let item of dataList) {
          if (item.taskId == taskId) {
            arr.push(item);
          }
        }
        nodeInfoList.value = arr;
        toggleModalEvent(true);
      }

      function handleClose() {
        closeModal();
        nodeInfoList.value = [];
        toggleModalEvent(false);
      }

      function notifyClose() {
        emit('notify', false);
      }
      function notifyVisible() {
        emit('notify', true);
      }
      // 鼠标进入/离开modal，都会通知父组件
      function toggleModalEvent(flag) {
        nextTick(() => {
          const arr = document.getElementsByClassName('jeecg-bpm-node-detail');
          let modal = arr[0];
          if (modal) {
            if (flag == true) {
              modal.addEventListener('mouseenter', notifyVisible);
              modal.addEventListener('mouseleave', notifyClose);
            } else {
              modal.removeEventListener('mouseenter', notifyVisible);
              modal.removeEventListener('mouseleave', notifyClose);
            }
          }
        });
      }

      return {
        registerModal,
        nodeInfoList,
        nodeSchema,
        handleClose,
      };
    },
  };
</script>

<style lang="less">
  .jeecg-bpm-node-detail {
    pointer-events: none;
    .ant-modal-header {
      padding-top: 10px;
      padding-bottom: 10px;
    }
    .ant-modal-close-x {
      height: 46px;
    }
    .ant-descriptions-item-label {
      padding: 8px !important;
      width: 80px !important;
    }
  }
</style>
