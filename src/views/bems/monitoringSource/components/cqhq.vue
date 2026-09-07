<template>
  <div>
    <BasicTable v-if="!showForm" @register="registerTable">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'pid'">
          <a @click.stop="handleview(record)">{{ record.pid }}</a>
        </template>
        <template v-if="column.key === 'name'">
          {{ record.name }}
        </template>
        <template v-if="column.key === 'desc'">
          {{ record.desc }}
        </template>
        <template v-if="column.key === 'pv'">
          {{ record.pv }}
        </template>
        <template v-if="column.key === 'tm'">
          <a @click.stop="handleview(record)">{{ record.tm }}</a>
        </template>
        <template v-if="column.key === 'qy'">
          <a @click.stop="handleview(record)">{{ record.qy }}</a>
        </template>
      </template>
    </BasicTable>
    <div class="info-box" v-else>
      <linkage-control-strategy-list ref="linkageFormRef" :closeStrategy="closeStrategy" :type="type" :editItem="editItem" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onBeforeUnmount } from 'vue';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { h } from 'vue';
  import { usePermissionStore } from '/@/store/modules/permission';
  import LinkageControlStrategyList from '../../standardizedManagement/components/LinkageControlStrategyList.vue';
  import { queryCqhqData} from './Api.js';
  // import { getLinkageControlListApi} from '../../standardizedManagement/Standardized.api';
  import { message } from 'ant-design-vue';

  const props = defineProps({
    checkControlRecords: {
      type: Function,
      default: () => {},
    },
  });

  const showForm = ref<boolean>(false);

  const linkageFormRef = ref();

  // 打开类型
  const type = ref('');
  const editItem = ref<any>();

  const pagination = ref({
    pageNo: 1,
    pageSize: 10,
  });

  // 表格列配置
  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '80px',
      customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
    },
    {
      title: '长名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
    },
    {
      title: '值',
      dataIndex: 'pv',
      key: 'pv',
    },
    {
      title: '时间',
      dataIndex: 'tm',
      key: 'tm',
    },
    {
      title: '质量戳',
      dataIndex: 'qy',
      key: 'qy',
    },
  ];

  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '策略名称', //显示label
      field: 'strategyName', //查询字段
      component: 'JInput', //渲染的组件
      // slot: 'name', //设置默认值
    },
    {
      label: '前置设置',
      field: 'frontDevice',
      component: 'JInput',
    },
    {
      label: '联动设备',
      field: 'rearDevice',
      component: 'JInput',
    },
  ];

  // 获取表格数据
  const getCqhqDataList = async (pageParams) => {
    let params = {
      pageNo: 1,
      pageSize: 1000,
    };
    console.log(1);
    let res = await queryCqhqData(params);
    console.log(res);
    return {
      records: res.values, // 当前页数据
      total: res.count, // 总记录数
    };
  };

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      // dataSource: dataSource.value,
      api: getCqhqDataList,
      columns: columns,
      showTableSetting: false,
      showActionColumn: false,
      size: 'middle',
      expandRowByClick: true,
      rowKey: 'pid',
      pagination: {
        pageSize: 10,
        showSizeChanger: false,
      },
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload, getForm, getPaginationRef, getDataSource }] = tableContext;

  /**
   * 检查是否有权限
   * @param {string|Array} permission 权限标识
   * @returns {boolean}
   */
  const store = usePermissionStore();
  const permissionList = computed(() => store.$state.permCodeList || []);
  const hasPermission = (permission: string) => {
    if (!permission) return true;

    const currentPermissions = permissionList.value;

    if (Array.isArray(permission)) {
      return permission.some((perm) => currentPermissions.includes(perm));
    }

    return currentPermissions.includes(permission);
  };

  // 新增
  const addStrategy = () => {
    showForm.value = true;
    type.value = 'create';
  };

  // 关闭form表单
  const closeStrategy = () => {
    showForm.value = false;
  };

  // 启用
  const handleEnable = async (record) => {
    await enableLinkageControlApi({ id: record.id });
    message.success('启用成功！');
    reload();
  };

  // 禁用
  const handleDisable = async (record) => {
    await disableLinkageControlApi({ id: record.id });
    message.success('禁用成功！');
    reload();
  };

  // 编辑
  const handleEdit = (record) => {
    editItem.value = record;
    type.value = 'edit';
    showForm.value = true;
  };

  // 查看
  const checkDetail = (record) => {
    editItem.value = record;
    type.value = 'check';
    showForm.value = true;
  };

  // 跳转到控制记录
  const handleview = (record) => {
    props.checkControlRecords(record);
  };

  // 删除
  const handleDelete = async (record) => {
    await deleteLinkageControlApi({ id: record.id });
    message.success('删除成功！');
    // 刷新表格
    reload();
  };

  // 表单数据
  const formState = reactive({
    name: '',
    age: undefined,
    email: '',
    phone: '',
    address: '',
  });

  // 提交表单
  const onFinish = (values) => {
    console.log('Received values:', values);
  };

  onBeforeUnmount(() => {
    showForm.value = false;
  });
</script>

<style scoped lang="less">
  .expand-box {
    margin-left: 10px;
    font-size: 16px;
  }
  .info-box {
    .info-title {
      height: 40px;
      display: flex;
      align-items: center;
      padding-left: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      background-color: #374352;
      border-radius: 5px 5px 0 0;
    }
    .info-list {
      padding: 16px;
      .list-title {
        width: 100%;
        height: 40px;
        padding-left: 10px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #d4d0d0;
      }
      .list-form {
        width: 100%;
        margin-top: 16px;
      }
    }
  }
</style>

