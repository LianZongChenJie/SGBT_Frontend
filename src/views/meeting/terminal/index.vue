<template>
  <div class="terminal-management-main-box">
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
    <TerminalModal
      ref="terminalModalRef"
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
import TerminalModal from './components/TerminalModal.vue';
import { getTerminalListApi, deleteTerminalApi } from './Terminal.api';

const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '终端名称',
    dataIndex: 'terminalName',
    key: 'terminalName',
    width: 150,
  },
  {
    title: 'IP地址',
    dataIndex: 'terminalIp',
    key: 'terminalIp',
    width: 130,
  },
  {
    title: 'MAC地址',
    dataIndex: 'macAddress',
    key: 'macAddress',
    width: 150,
  },
  {
    title: '设备状态',
    dataIndex: 'deviceStatus',
    key: 'deviceStatus',
    width: 100,
    customRender: ({ text }) => {
      return text === '1' ? '在线' : '离线';
    },
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
    label: '终端名称',
    field: 'terminalName',
    component: 'JInput',
  },
  {
    label: 'IP地址',
    field: 'terminalIp',
    component: 'JInput',
  },
];

const getTerminalList = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  let { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  let params = {
    pageNo: pageNo,
    pageSize: pageSize,
    terminalName: searchData.terminalName || undefined,
    terminalIp: searchData.terminalIp || undefined,
  };
  let res = await getTerminalListApi(params);
  return {
    records: res.records || res,
    total: res.total || (res.records ? res.records.length : res.length),
  };
};

const { tableContext } = useListPage({
  designScope: 'terminal-table',
  tableProps: {
    api: getTerminalList,
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

const terminalModalRef = ref();

const handleAdd = () => {
  terminalModalRef.value.showModal();
};

const handleEdit = (record) => {
  terminalModalRef.value.showModal(record);
};

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除终端 "${record.terminalName}" 吗？`,
    onOk: async () => {
      await deleteTerminalApi({ id: record.id });
      message.success('删除成功');
      reload();
    },
  });
};
</script>

<style lang="less" scoped>
.terminal-management-main-box {
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
