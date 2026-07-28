<template>
  <div class="device-management-main-box">
    <div class="table-box">
      <BasicTable @register="registerTable">
        <template #tableTitle>
          <a-button
            type="primary"
            :icon="h(PlusOutlined)"
            @click="handleAdd"
          > 新增 </a-button>
        </template>
        <template #action="{ record }">
          <a-button type="link" @click="handleEdit(record)">编辑</a-button>
          <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
        </template>
      </BasicTable>
    </div>
    <DeviceModal
      ref="deviceModalRef"
      :reload="reload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { PlusOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import DeviceModal from './components/DeviceModal.vue';
import { getDeviceListApi, deleteDeviceApi } from './Device.api';

const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    key: 'deviceName',
    width: 150,
  },
  {
    title: '设备描述',
    dataIndex: 'deviceDesc',
    key: 'deviceDesc',
    width: 250,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 200,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 170,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
];

const searchFormSchema: FormSchema[] = [
  {
    label: '设备名称',
    field: 'deviceName',
    component: 'JInput',
  },
];

const getDeviceList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    deviceName: searchData.deviceName || undefined,
  };
  let res = await getDeviceListApi(params);
  return {
    records: res.records || res,
    total: res.total || (res.records ? res.records.length : res.length),
  };
};

const { tableContext } = useListPage({
  designScope: 'device-table',
  tableProps: {
    api: getDeviceList,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    rowKey: 'id',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
    },
    showTableSetting: false,
    formConfig: {
      schemas: searchFormSchema,
      showAdvancedButton: false,
      submitOnReset: true,
      rowProps: { gutter: 24, justify: 'start', align: 'middle' },
      baseColProps: { span: 6 },
      baseRowStyle: { width: '100%' },
      labelCol: { style: { width: 'auto' } },
    },
  },
});

const [registerTable, { reload, getForm }] = tableContext;

const deviceModalRef = ref();

const handleAdd = () => {
  deviceModalRef.value.showModal();
};

const handleEdit = (record) => {
  deviceModalRef.value.showModal(record);
};

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除设备 "${record.deviceName}" 吗？`,
    onOk: async () => {
      await deleteDeviceApi({ id: record.id });
      message.success('删除成功');
      reload();
    },
  });
};
</script>

<style lang="less" scoped>
.device-management-main-box {
  height: 100%;
  width: 100%;

  .table-box {
    height: 100%;
    width: 100%;
    padding: 10px 10px;
    background-color: #fff;
  }
}
</style>
