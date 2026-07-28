<template>
  <div class="device-table">
    <a-tabs v-model:activeKey="activeKey" centered @change="handleTabsChange">
      <a-tab-pane key="1" tab="修正操作">
        <BasicTable @register="registerTable">
          <template #form-spaceId="{ model, field }">
            <a-tree-select
              v-model:value="model[field]"
              :tree-data="spaceTreeData"
              placeholder="请选择空间位置"
              :fieldNames="treeSelect"
              @change="selectSpaceId"
              tree-checkable
              show-search
              allowClear
            />
          </template>
          <!-- 表格顶部按钮 -->
          <template #tableTitle>
            <!-- <a-button
          v-if="hasPermission('bems:device_data:amend')"
          type="primary"
          :icon="h(EditOutlined)"
          @click="editFunc"
        > 编辑 </a-button> -->
            <!-- <a-button
          v-if="hasPermission('bems:device_data:amend')"
          :icon="h(DeliveredProcedureOutlined)"
          style="margin-left: 8px"
          @click="saveFunc"
        >
          保存
        </a-button> -->
            <a-button
              v-if="hasPermissions('bems:device_data:amend')"
              type="primary"
              :icon="h(DeliveredProcedureOutlined)"
              style="margin-left: 8px"
              @click="recalculate"
            >
              重新计算
            </a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'value' && isSave">
              <!-- 自动算法 -->
              <a-input v-model:value="record.value"></a-input>
            </template>
            <template v-else-if="column.key === 'value' && !isSave">
              {{ record.value }}
            </template>
            <template v-if="column.key === 'automaticAlgorithm'">
              <!-- 自动算法 -->
              <a-switch
                :checked="record.automaticAlgorithm == '1'"
                :disabled="false"
                @change="(checked) => handleAutomaticAlgorithmChange(record, checked)"
              />
            </template>
            <template v-else-if="column.key === 'active'">
              <a @click="updateModal(record)">编辑</a>
            </template>
          </template>
        </BasicTable>
      </a-tab-pane>
      <a-tab-pane key="2" tab="修正日志" force-render>
        <div class="records-form-box">
          <a-form :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" autocomplete="off" @finish="onFinish">
            <a-row>
              <a-col :span="7">
                <a-form-item :label-col="{ span: 8 }" label="设备名称/设备编号" name="spaceId">
                  <a-input v-model:value="formState.deviceName" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="设备位置" name="spaceId">
                  <a-tree-select
                    v-model:value="formState.spaceId"
                    :tree-data="spaceTreeData"
                    tree-checkable
                    placeholder="请选择空间位置"
                    :fieldNames="treeSelect"
                    show-search
                    allowClear
                    @change="selectSpaceId"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="7">
                <a-form-item label="修正类型" name="spaceId">
                  <a-select placeholder="请选择修正类型" v-model:value="formState.amendType" :options="options"> </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="2">
                <a-form-item>
                  <a-button type="primary" html-type="submit">查询</a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div class="records-table-box">
          <a-table
            ref="tableContainer"
            class="custom-hover-table"
            :dataSource="dataSource"
            :columns="columns2"
            :pagination="pagination2"
            size="middle"
            bordered
            center
            :scroll="tableScroll"
            @change="handleTableChange"
          >
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>
    <DataCorrectionModal ref="dataCorrectionModalRef" :reload="reload" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch, computed } from 'vue';
  import { selectDevice, updateAutomaticAlgorithm, editDataValue, recalculateApi, dataAmendLogApi, getSpaceTree } from './Device.api';
  import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { h } from 'vue';
  import { EditOutlined, DeliveredProcedureOutlined } from '@ant-design/icons-vue';
  import { usePermissionStore } from '/@/store/modules/permission';
  import DataCorrectionModal from './components/DataCorrectionModal.vue';
  import { operationSearchFormSchema } from '../../monitor/log/log.data';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { message } from 'ant-design-vue';
  const { hasPermission } = usePermission();

  const props = defineProps<{
    categoryKeys?: string[]; // 类别树节点
    spaceKeys?: string[]; // 空间树节点
    categoryTreeData: any[];
    spaceTreeData: any[];
  }>();

  const activeKey = ref('1');

  const dataCorrectionModalRef = ref();

  const emit = defineEmits(['edit', 'delete', 'refresh', 'detail']);

  // 搜索参数
  const searchParams = ref({
    deviceName: '',
  });

  // 是否修改
  const isSave = ref<boolean>(false);

  // 获取当前用户权限列表
  const store = usePermissionStore();
  const permissionList = computed(() => store.$state.permCodeList || []);

  /**
   * 检查是否有权限
   * @param {string|Array} permission 权限标识
   * @returns {boolean}
   */
  const hasPermissions = (permission) => {
    if (!permission) return true;

    const currentPermissions = permissionList.value;

    if (Array.isArray(permission)) {
      return permission.some((perm) => currentPermissions.includes(perm));
    }

    return currentPermissions.includes(permission);
  };

  // 查找树节点的标题
  const findTreeNodeTitle = (treeData: any[], key: string | number): string => {
    if (!treeData || !Array.isArray(treeData)) {
      return '';
    }

    const find = (nodes: any[]): string => {
      for (const node of nodes) {
        if (String(node.key) === String(key)) {
          return node.value;
        }
        if (node.children && Array.isArray(node.children)) {
          const title = find(node.children);
          if (title) return title;
        }
      }
      return '';
    };
    return find(treeData);
  };

  const selectSpaceId = (value, item, val) => {
    let { setFieldsValue } = getForm();
    if (val && val.triggerNode && val.triggerNode.props && val.triggerNode.props.disableCheckbox) {
      message.warn('无该节点权限，不可选！');
      setFieldsValue({
        spaceId: null,
      });
      formState.spaceId = null;
      return;
    }
  };

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
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    // {
    //   title: '计量单位',
    //   dataIndex: 'unitName',
    //   key: 'unitName',
    // },
    {
      title: '起始值',
      dataIndex: 'startValue',
      key: 'startValue',
      width: '100px',
    },
    {
      title: '结束值',
      dataIndex: 'endValue',
      key: 'endValue',
      width: '100px',
    },
    {
      title: '计量值',
      dataIndex: 'computeValue',
      key: 'computeValue',
      width: '100px',
    },
    {
      title: '修正值',
      key: 'updValueStr',
      dataIndex: 'updValueStr',
      width: '100px',
    },
    {
      title: '最终值',
      dataIndex: 'value',
      key: 'value',
      width: '100px',
    },
    {
      title: '修正人',
      dataIndex: 'updateBy',
      key: 'updateBy',
    },
    // {
    //   title: '自动修正',
    //   dataIndex: 'automaticAlgorithm',
    //   key: 'automaticAlgorithm',
    // },
    {
      title: '编辑',
      dataIndex: 'active',
      key: 'active',
    },
  ];

  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      field: 'date',
      label: '时间',
      component: 'DatePicker',
      defaultValue: new Date(new Date().getTime() - 1000 * 60 * 60),
      componentProps: {
        showTime: {
          format: 'HH',
          hourStep: 1,
        },
        format: 'YYYY-MM-DD HH',
        placeholder: '选择具体小时',
      },
    },
    {
      label: '设备名称/设备编号', //显示label
      field: 'deviceName', //查询字段
      component: 'JInput', //渲染的组件
      // slot: 'name', //设置默认值
    },
    {
      label: '设备位置',
      field: 'spaceId',
      component: 'JDictSelectTag',
      slot: 'spaceId',
    },
    {
      label: '数据类型',
      field: 'abnormalType',
      component: 'Select',
      defaultValue: '负值异常',
      componentProps: {
        options: [
          { label: '负值异常', value: '负值异常' },
          { label: '空值异常', value: '空值异常' },
          { label: '全量数据', value: '全量数据' },
        ],
      },
    },
  ];

  // 表格数据
  const pagination = ref({
    pageNo: 1,
    pageSize: 10,
  });

  // 自动算法切换
  const handleAutomaticAlgorithmChange = (record: any, checked: boolean) => {
    try {
      const params = {
        id: record.id,
        automaticAlgorithm: checked ? '1' : '0',
      };
      updateAutomaticAlgorithm(params);
      record.automaticAlgorithm = checked ? '1' : '0';
    } catch (error) {
      record.automaticAlgorithm = checked ? '0' : '1';
      console.error('自动算法切换失败:', error);
    }
  };

  // 加载数据
  const loadData = async (pageParams) => {
    const { pageNo, pageSize } = pageParams;
    let { getFieldsValue } = getForm();
    const searchData = getFieldsValue();
    try {
      const params = {
        pageNo: pageNo,
        pageSize: pageSize,
        spaceIds: searchData.spaceId ? searchData.spaceId : undefined,
        abnormalType: searchData.abnormalType ? searchData.abnormalType : undefined,
        deviceName: searchData.deviceName ? searchData.deviceName.split('*')[1] : undefined,
        deviceCode: searchData.deviceName ? searchData.deviceName.split('*')[1] : undefined,
        categoryIds: props.categoryKeys ? props.categoryKeys.join(',') : undefined,
        dateTime: searchData.date ? searchData.date : undefined,
      };
      console.log('request params:', params); // 调试日志
      const res = await selectDevice(params);
      return {
        records: res.records, // 当前页数据
        total: res.total, // 总记录数
      };
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  async function customResetFunc() {
    searchParams.value.deviceName = '';
  }

  const { tableContext } = useListPage({
    designScope: 'basic-table-demo',
    tableProps: {
      api: loadData,
      columns: columns,
      showActionColumn: false,
      size: 'middle',
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
      },
      showTableSetting: false,
      formConfig: {
        schemas: searchFormSchema,
        submitOnReset: true,
        showAdvancedButton: false,
        //重置按钮的自定义事件
        resetFunc: customResetFunc,
        //默认row行配置,当 layout 为 horizontal 生效
        rowProps: { gutter: 24, justify: 'start', align: 'middle' },
        //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
        baseColProps: { span: 6 },
        //row行的样式
        baseRowStyle: { width: '100%' },
        labelCol: { style: { width: 'auto' } },
      },
    },
  });

  // BasicTable绑定注册
  const [registerTable, { reload, getForm, getPaginationRef, getDataSource }] = tableContext;

  // 监听选中节点变化
  watch(
    () => props.categoryKeys,
    (newVal, oldVal) => {
      reload();
    }
  );
  watch(
    () => props.spaceKeys,
    (newVal, oldVal) => {
      reload();
    }
  );

  // 初始加载
  onMounted(async () => {
    const spaceRes = await getSpaceTree();
    spaceTreeData.value = spaceRes;
    if (!hasPermission('bems:data_correction:correctionOperation') && hasPermission('bems:data_correction:revisionLog')) {
      activeKey.value = '2';
    }
  });

  // 操作方法
  const editFunc = (record: any) => {
    isSave.value = true;
  };

  const saveFunc = async (record: any) => {
    let params = currentPageData.value.map((item) => {
      return {
        id: item.id,
        value: item.value + '',
      };
    });
    let res = await editDataValue(params);
    isSave.value = false;
  };

  // 获取当前页数据
  const currentPageData = computed(() => {
    const pagination = getPaginationRef();
    const dataSource = getDataSource();

    if (!pagination || !dataSource) return [];

    const { current = 1, pageSize = 10 } = pagination;
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return dataSource.slice(startIndex, endIndex);
  });

  // 重新计算
  const recalculate = async () => {
    let { getFieldsValue } = getForm();
    const searchData = getFieldsValue();
    await recalculateApi({ hour: searchData.date ? searchData.date : undefined });
  };

  const updateModal = (record) => {
    if (!hasPermission('bems:data_correction:update')) {
      message.error('无编辑权限，请联系管理员分配权限！');
      return;
    }
    dataCorrectionModalRef.value.showModal(record);
  };

  const spaceTreeData = ref([]);

  const formState = ref({
    spaceId: [],
    deviceName: '',
    amendType: '',
  });

  const options = [
    {
      label: '系统修正',
      value: '系统修正',
    },
    {
      label: '人工修正',
      value: '人工修正',
    },
  ];

  const treeSelect = { children: 'children', label: 'title', value: 'key', key: 'key' };

  const columns2 = [
    {
      title: '序号',
      dataIndex: 'idex',
      key: 'idex',
      width: '60px',
      align: 'center',
      customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      align: 'center',
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      align: 'center',
    },
    {
      title: '计量时间段',
      dataIndex: 'timePeriod',
      key: 'timePeriod',
      align: 'center',
    },
    {
      title: '起始值',
      dataIndex: 'startValue',
      key: 'startValue',
      align: 'center',
    },
    {
      title: '终止值',
      dataIndex: 'endValue',
      key: 'endValue',
      align: 'center',
    },
    {
      title: '计量值',
      dataIndex: 'computeValue',
      key: 'computeValue',
      align: 'center',
    },
    {
      title: '修正值',
      dataIndex: 'value',
      key: 'value',
      align: 'center',
    },
    {
      title: '修正人',
      dataIndex: 'updateBy',
      key: 'updateBy',
      align: 'center',
    },
    {
      title: '修正时间',
      dataIndex: 'updateTime',
      key: 'spaceId',
      align: 'center',
    },
  ];

  let dataSource = ref<any>([]);

  const pagination2 = ref({
    pageNo: 1,
    pageSize: 10,
    total: 10,
  });

  const onFinish = async () => {
    await dataAmendLog();
  };

  const dataAmendLog = async () => {
    let res = await dataAmendLogApi({
      spaceIds: formState.value.spaceId.join(','),
      pageNo: pagination2.value.pageNo,
      pageSize: pagination2.value.pageSize,
      deviceName: formState.value.deviceName ? formState.value.deviceName : undefined,
      deviceCode: formState.value.deviceName ? formState.value.deviceName : undefined,
      amendType: formState.value.amendType ? formState.value.amendType : undefined,
    });
    dataSource.value = [...res.records];
    dataSource.value.forEach((item, index) => {
      item.timePeriod = item.startTime + ' 至 ' + item.endTime;
    });
    pagination2.value.total = res.total;
  };

  const handleTableChange = async (pag, filters, sorter) => {
    pagination2.value.pageNo = pag.current;
    pagination2.value.pageSize = pag.pageSize;
    await dataAmendLog();
  };

  const handleTabsChange = async (key) => {
    if (key === '1') {
      reload();
    } else {
      updateTableMaxHeight();
      await dataAmendLog();
    }
  };

  const tableContainer = ref(null); // 用于引用包裹表格的容器

  const tableScroll = ref({});

  const updateTableMaxHeight = () => {
    if (tableContainer.value) {
      // 获取父容器的高度
      const containerHeight = tableContainer.value.clientHeight;
      // 如果表格有其他相邻元素（如标题、分页器等），需要减去它们的高度
      // const otherElementsHeight = ...;
      // const tableBodyHeight = containerHeight - otherElementsHeight;

      // 设置表格体的最大滚动高度
      tableScroll.value = { y: containerHeight };
    }
  };

  // 暴露 reload 方法给父组件
  defineExpose({
    reload: () => {
      pagination.value.pageNo = 1;
      loadData();
    },
  });
</script>

<style lang="less" scoped>
  .records-form-box {
    padding-top: 8px;
    background-color: #fff;
    margin-bottom: 8px;
  }
  .records-table-box {
    padding: 12px;
    height: 82vh;
    background-color: #fff;
  }
</style>
