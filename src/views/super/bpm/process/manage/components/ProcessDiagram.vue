<template>
  <div>
    <div class="graphic">
      <!--流程图 -->
      <BpmGraphic :instanceId="formData.procInsId" @task="getTaskList"></BpmGraphic>
    </div>
    <a-card title="流程历史跟踪">
      <a-table rowKey="taskId" :loading="loading" :dataSource="dataSource" :columns="columns" size="small">
        <!-- 字符串超长截取省略号显示-->
        <template #remarks="{ record }">
          <JEllipsis :value="getNodeInfo(record)" :length="25" />
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref, onMounted } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import JEllipsis from '/@/components/Form/src/jeecg/components/JEllipsis.vue';
  import BpmGraphic from '/@/views/super/bpm/process/components/BpmGraphic.vue';
  import { getProcessHistoryList } from './bpm.api';
  //组件接受传参
  const props = defineProps({
    formData: { type: Object },
  });
  //提示
  const { createMessage } = useMessage();
  const loading = ref(false);
  //列表数据
  const dataSource = ref([]);
  const taskList = ref([]);

  // 查询数据
  async function loadData() {
    loading.value = true;
    let params = { processInstanceId: props.formData.procInsId };
    const res = await getProcessHistoryList(params);
    loading.value = false;
    if (res.success) {
      dataSource.value = res.result.records;
    } else {
      createMessage.warning('加载失败');
    }
  }

  function getTaskList(result) {
    taskList.value = result;
  }

  /**
   * 获取节点备注信息
   * @param record
   */
  function getNodeInfo(record) {
    let arr = taskList.value;
    if (arr && arr.length > 0) {
      for (let item of arr) {
        if (item.id == record.id) {
          return item.remarks;
        }
      }
    }
    return '';
  }

  onMounted(() => {
    taskList.value = [];
    loadData();
  });
  //定义列
  const columns = [
    {
      title: '#',
      dataIndex: '#',
      width: 40,
      customRender: ({ text, index }) => {
        return parseInt(index) + 1;
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      customRender: ({ text }) => {
        if (text == 'start1') {
          return '开始';
        } else if (text == 'end') {
          return '结束';
        } else {
          return text;
        }
      },
    },
    {
      title: '流程实例ID',
      dataIndex: 'processInstanceId',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
    },
    {
      title: '负责人',
      dataIndex: 'assigneeName',
    },
    {
      title: '处理结果',
      dataIndex: 'deleteReason',
    },
    {
      title: '处理意见',
      fixed: 'right',
      width: 350,
      dataIndex: 'remarks',
      slots: { customRender: 'remarks' },
    },
  ];
</script>

<style lang="less" scoped>
  .graphic {
    margin-bottom: 20px;
    height: 400px;
    overflow: hidden;
    overflow-y: auto;
    overflow-x: auto;
  }
</style>
