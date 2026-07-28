<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :showCancelBtn="false" :showOkBtn="false" title="详情" @ok="handleSubmit" width="80%">
    <div v-if="hasDetailData" class="pl-5 pr-5">
      <Description
        @register="registerDescription"
        title="设备属性"
        :collapseOptions="{ canExpand: true, helpMessage: '' }"
        :column="3"
        :data="detailData"
        :schema="schema"
      />
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="维修记录">
          <a-table :dataSource="dataSource" :columns="columns" />
        </a-tab-pane>
        <a-tab-pane key="2" tab="维保记录">
          <a-table :dataSource="dataSource2" :columns="columns2" />
        </a-tab-pane>
        <a-tab-pane key="3" tab="质保记录">
          <a-table :dataSource="dataSource3" :columns="columns3" />
        </a-tab-pane>
      </a-tabs>
    </div>
    <DetailEmptyState v-else class="m5" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, defineProps } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import DetailEmptyState from '@/views/nengyuanzhan/components/DetailEmptyState.vue';
  import { hasMeaningfulData } from '@/views/nengyuanzhan/components/detailUtils';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  import { Description, DescItem, useDescription } from '@/components/Description/index';

  const props = defineProps({
    //是否禁用页面
    isDisabled: {
      type: Boolean,
      default: false,
    },
  });

  const detailData = ref<Recordable>({});
  const hasDetailData = computed(() => hasMeaningfulData(detailData.value));
  const schema: DescItem[] = [
    {
      field: 'deviceName',
      label: '设备名称',
    },
    {
      field: 'deviceCode',
      label: '设备编号',
    },
    {
      field: 'deviceTypeName',
      label: '设备类型',
    },
    {
      field: 'specModel',
      label: '规格型号',
    },
    {
      field: 'storageLocation',
      label: '存放位置',
    },
    {
      field: 'useDept',
      label: '使用部门',
    },
  ];
  const [registerModal] = useModalInner(async (data) => {
    activeKey.value = '1';
    detailData.value = data?.record || {};
    dataSource.value = data?.record?.repairRecordList || data?.record?.repairRecords || [];
    dataSource2.value = data?.record?.maintainRecordList || data?.record?.maintenanceRecords || [];
    dataSource3.value = data?.record?.warrantyRecordList || data?.record?.warrantyRecords || [];
  });
  const [registerDescription] = useDescription({
    title: '设备属性',
    data: detailData,
    schema: schema,
  });
  const activeKey = ref('1');
  const dataSource = ref<any[]>([]);
  const columns = ref([
    {
      title: '序号',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '任务ID',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '优先级',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '保修时间',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '问题描述',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '工单状态',
      dataIndex: 'address',
      key: 'address',
    },
  ]);

  const dataSource2 = ref<any[]>([]);
  const columns2 = ref([
    {
      title: '序号',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '任务ID',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '维保计划名称',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '执行部门',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '是否发现问题',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '计划开始时间',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '计划完成时间',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '状态',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '执行人',
      dataIndex: 'address',
      key: 'address',
    },
  ]);

  const dataSource3 = ref<any[]>([]);
  const columns3 = ref([
    {
      title: '序号',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '负责部门',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '责任人',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '质保期（月）',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '质保到期时间',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '续保时间',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '续保维护人',
      dataIndex: 'address',
      key: 'address',
    },
  ]);

  //表单提交事件
  async function handleSubmit() {}
</script>
