<template>
  <div class="p-4">
    <!--定义表格-->
    <BasicTable @register="registerTable">
      <!-- 搜索区域插槽自定义查询 -->
      <template #form-warehouseName="{ model, field }">
        <a-select v-model:value="model[field]" placeholder="请选择仓库名称">
          <a-select-option :value="item.name" v-for="(item, index) in options" :key="index">{{ item.name }} </a-select-option>
        </a-select>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" name="basic-table-demo" setup>
  import { onMounted, ref } from 'vue';
  import { ActionItem, BasicColumn, BasicTable, FormSchema, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { getAllWarehouseList } from '@/views/inventory/InventoryManage/api';
  import { defHttp } from '/@/utils/http/axios';

  //定义表格列
  const columns: BasicColumn[] = [
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
      align: 'center',
    },
    {
      title: '物料分类',
      dataIndex: 'typeName',
      align: 'center',
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      align: 'center',
    },
    {
      title: '规格',
      dataIndex: 'specification',
      align: 'center',
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      align: 'center',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      align: 'center',
    },
    {
      title: '数量',
      dataIndex: 'num',
      align: 'center',
    },
  ];

  //表单搜索字段
  const searchFormSchema: FormSchema[] = [
    {
      label: '仓库名称',
      field: 'warehouseName',
      component: 'JDictSelectTag',
      slot: 'warehouseName',
      defaultValue: '', // 这里是原有的默认值设置，会被下面的代码覆盖
    },
    {
      label: '物料名称',
      field: 'materialName',
      component: 'JInput',
    },
    {
      label: '物料分类',
      field: 'typeName',
      component: 'JInput',
    },
  ];

  //ajax请求api接口
  const demoListApi = (params) => {
    return defHttp.get({ url: '/jeecg-demo/admin/inventory/list', params });
  };

  // 列表页面公共参数、方法
  const { tableContext } = useListPage({
    designScope: 'basic-table-demo-filter',
    tableProps: {
      title: '表单搜索',
      api: demoListApi,
      columns: columns,
      formConfig: {
        schemas: searchFormSchema,
        showAdvancedButton: true,
      },
    },
  });

  //BasicTable绑定注册
  const [registerTable, { getForm, reload }] = tableContext;

  /**
   * 操作栏
   */
  function getTableAction(record): ActionItem[] {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
      },
    ];
  }

  function handleEdit(record) {
    let { getFieldsValue } = getForm();
    console.log('查询form的数据', getFieldsValue());
    console.log(record);
  }
  const options = ref([]);
  const defaultWarehouseName = ref(''); // 存储默认仓库名称
  // 获取仓库列表并设置默认值
  const fetchWarehouseList = async () => {
    try {
      const res = await getAllWarehouseList();
      options.value = res;
      if (res.length > 0) {
        // 设置默认仓库名称为第一个仓库
        defaultWarehouseName.value = res[0].name;
        // 获取表单实例并设置默认值
        const { setFieldsValue } = getForm();
        setFieldsValue({ warehouseName: defaultWarehouseName.value });
        // 重新加载表格数据
        reload();
      }
    } catch (error) {
      console.error('获取仓库列表失败', error);
    }
  };

  // 组件挂载后获取仓库列表并设置默认值
  onMounted(() => {
    fetchWarehouseList();
  });
</script>
