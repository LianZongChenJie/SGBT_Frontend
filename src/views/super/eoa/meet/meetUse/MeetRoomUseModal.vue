<template>
  <a-modal title="会议使用情况" :width="1000" :open="visible" @cancel="handleCancel" :footer="null" cancelText="关闭">
    <a-card :bordered="false">
      <MeetCalendarUse ref="calendarUser" @change="resourceChange"></MeetCalendarUse>
      <a-table
        v-if="!tableData.resourceIsNull"
        ref="table"
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="tableData.dataSource"
        :pagination="tableData.ipagination"
        :loading="tableData.loading"
        :rowSelection="{ selectedRowKeys: tableData.selectedRowKeys, onChange: onSelectChange }"
      />
    </a-card>
  </a-modal>
</template>

<script lang="ts" setup>
  import { reactive, ref, nextTick } from 'vue';
  import MeetCalendarUse from './MeetCalendarUse.vue';
  import { getList } from '/@/views/super/eoa/meet/manage/manage.api.ts';
  import { useMessage } from '/@/hooks/web/useMessage';
  //提示弹窗
  const $message = useMessage();

  const columns = [
    {
      title: '会议名称',
      align: 'center',
      dataIndex: 'name',
    },
    {
      title: '召集人',
      align: 'center',
      dataIndex: 'originator_dictText',
    },
    {
      title: '位置',
      align: 'center',
      dataIndex: 'location_dictText',
    },
    {
      title: '开始时间',
      align: 'center',
      dataIndex: 'beginTime',
    },
    {
      title: '结束时间',
      align: 'center',
      dataIndex: 'endTime',
    },
    {
      title: '状态',
      align: 'center',
      dataIndex: 'status_dictText',
    },
  ];
  const visible = ref(false);
  const calendarUser = ref(null);
  const tableData = reactive({
    loading: false,
    resourceIsNull: true,
    dataSource: [],
    /* 分页参数 */
    ipagination: {
      current: 1,
      pageSize: 10,
      pageSizeOptions: ['10', '20', '30'],
      showTotal: (total, range) => {
        return range[0] + '-' + range[1] + ' 共' + total + '条';
      },
      showQuickJumper: true,
      showSizeChanger: true,
      total: 0,
    },
    /* table选中keys*/
    selectedRowKeys: [],
    /* table选中records*/
    selectionRows: [],
  });

  /**
   * 打开弹窗
   */
  async function show() {
    loadAllMetting();
    waitRef(calendarUser).then(($instance) => {
      $instance.value.loadRoom();
    });
    visible.value = true;
  }

  /**
   * 加载所有会议信息
   */
  async function loadAllMetting() {
    let params = {}; //查询条件
    params.pageNo = tableData.ipagination.current;
    params.pageSize = tableData.ipagination.pageSize;
    tableData.loading = true;
    let result = await getList(params);
    tableData.loading = false;
    if (result && result.records) {
      tableData.dataSource = result.records;
      tableData.ipagination.total = result.total;
    } else {
      $message.warning(res.message);
    }
  }

  /**
   * 取消选择
   */
  function handleCancel() {
    visible.value = false;
  }

  function onSelectChange(selectedRowKeys, selectionRows) {
    tableData.selectedRowKeys = selectedRowKeys;
    tableData.selectionRows = selectionRows;
  }

  function resourceChange(value) {
    if (value != null && value.length > 0) {
      tableData.resourceIsNull = false;
    } else {
      tableData.resourceIsNull = true;
    }
  }

  /**
   * 等待示例初始化完成
   * @param $ref
   */
  function waitRef($ref) {
    return new Promise<any>((resolve) => {
      (function next() {
        if ($ref.value) {
          resolve($ref);
        } else {
          nextTick(() => next());
        }
      })();
    });
  }
  defineExpose({
    show,
  });
</script>
<style scoped></style>
