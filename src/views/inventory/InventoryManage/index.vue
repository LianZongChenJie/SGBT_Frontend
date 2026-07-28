<template>
  <div>
    <!--自定义查询区域-->
    <div class="jeecg-basic-table jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" class="jeecg-basic-form--compact" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :lg="8">
            <a-form-item label="仓库名称">
              <a-select v-model:value="queryParam.warehouseName" @change="handleChange">
                <a-select-option :value="item.name" v-for="(item, index) in options" :key="index">{{ item.name }} </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-form-item label="物料名称">
              <a-input placeholder="请输入物料名称" v-model:value="queryParam.materialName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :lg="8">
            <a-form-item label="物料分类">
              <a-input placeholder="请输入物料分类" v-model:value="queryParam.typeName"></a-input>
            </a-form-item>
          </a-col>
          <span style="float: left; overflow: hidden; width: 100%" class="table-page-search-submitButtons">
            <a-col :lg="12">
              <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
              <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction :actions="getActions(record)"></TableAction>
      </template>
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">入库 </a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="downloadTemplate"> 下载模板 </a-button>
        <!-- <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">导入清单</j-upload-button> -->
        <a-upload :showUploadList="false" name="file" :data="fileData" :multiple="true" :customRequest="onImportXls" :headers="headers">
          <a-button preIcon="ant-design:import-outlined" type="primary"> 导入清单 </a-button>
        </a-upload>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls" :loading="exportLoading"> 导出</a-button>
      </template>
    </BasicTable>
    <StoreModal @register="registerModal" @success="reload" />
    <DetailModal @register="registerModal2" />
  </div>
</template>
<script setup lang="ts">
  import TableAction from '@/components/Table/src/components/TableAction.vue';
  import { useListPage } from '@/hooks/system/useListPage';
  import { listApi, getLimitWarehouseList, uploadMyFile, getExportUrl } from '@/views/inventory/InventoryManage/api';
  import BasicTable from '@/components/Table/src/BasicTable.vue';
  import { useModal } from '@/components/Modal';
  import StoreModal from '@/views/inventory/InventoryManage/storeModal.vue';
  import DetailModal from '@/views/inventory/InventoryManage/detailModal.vue';
  import { columns } from './data';
  import { getToken } from '/@/utils/auth';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref, reactive, toRaw } from 'vue';
  import excelFile from '@/assets/file/inventoryList.xlsx?url';

  const [registerModal, { openModal: openModal }] = useModal();
  const [registerModal2, { openModal: openModal2 }] = useModal();
  const { createMessage } = useMessage();
  const exportLoading = ref(false);
  const warehouseId = ref('');
  const headers = ref({ authorization: '' });
  const options = ref<Recordable[]>([]);
  const fileData = ref({ warehouseId: '', warehouseName: '' });
  const queryParam = reactive({
    warehouseName: '',
    materialName: '',
    typeName: '',
  });
  headers.value.authorization = getToken();
  getLimitWarehouseList().then((res) => {
    options.value = res;
    queryParam.warehouseName = res[0].name;
    warehouseId.value = res[0].id;
    console.log(warehouseId.value);
    fileData.value.warehouseId = warehouseId.value;
    fileData.value.warehouseName = queryParam.warehouseName;
    setProps({ searchInfo: toRaw(queryParam) });
    reload();
  });
  const { tableContext } = useListPage({
    designScope: 'material-type-template',
    tableProps: {
      title: '库存管理',
      api: listApi,
      columns: columns,
      // formConfig: {
      //   schemas: searchFormSchema,
      // },
      actionColumn: {
        width: 110,
        fixed: 'right',
      },
      showIndexColumn: true,
    },
  });

  //console.log(getProps(searchInfo))
  //-----自定义查询----begin--------
  //const formElRef = ref();

  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 5 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 19 },
  });

  //const customSearch = ref(false);

  // watch(customSearch, () => {
  //   setProps({ useSearchForm: !unref(customSearch) });
  // });

  function searchQuery() {
    setProps({ searchInfo: toRaw(queryParam) });
    reload();
  }

  function searchReset() {
    Object.assign(queryParam, { warehouseName: options.value[0].name, materialName: '', typeName: '' });
    reload();
  }

  function onImportXls(d: any) {
    const formData = new FormData();
    formData.append('file', d.file);
    formData.append('warehouseId', d.data.warehouseId);
    formData.append('warehouseName', d.data.warehouseName);
    uploadMyFile(formData).then((res: any) => {
      console.log('uploadMyFile', res);
      if (res.data.code == 200) {
        let message = '导入成功';
        if (res.data.result.errorLog.size > 0) {
        }
        message = res.data.result.errorLog.join('\n');
        createMessage.warning(message);
        reload();
      } else {
        createMessage.warning({
          content: res.data.message,
          duration: 1, // 显示关闭按钮
        });
      }
    });
  }
  async function onExportXls() {
    exportLoading.value = true;
    await getExportUrl({ wareHouseName: queryParam.warehouseName }, '库存管理.xlsx', '/jeecg-demo/admin/inventory/exportData');
    exportLoading.value = false;
  }
  function handleChange(value: any) {
    console.log(value);
    options.value.forEach((item) => {
      if (item.name == value) {
        warehouseId.value = item.id;
      }
    });
    fileData.value.warehouseId = warehouseId.value;
    fileData.value.warehouseName = queryParam.warehouseName;
    // actionPath.value = importUrl + '?warehouseId=' + warehouseId.value + '&warehouseName=' + queryParam.warehouseName;
  }

  //自定义查询----end---------
  const [registerTable, { reload, setProps }] = tableContext;
  const getActions = (record) => {
    return [
      {
        label: '详情',
        onClick: doAction.bind(null, record),
      },
    ];
  };
  const handleAdd = () => {
    openModal(true, {
      isUpdate: false,
    });
  };

  function doAction(record: any) {
    openModal2(true, {
      isUpdate: true,
      record,
    });
  }

  function downloadTemplate() {
    const link = document.createElement('a');
    link.href = excelFile; // 相对于public目录的路径
    link.download = '入库清单.xlsx'; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>
