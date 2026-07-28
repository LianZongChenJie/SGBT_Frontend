<template>
  <a-spin :spinning="loading">
    <BasicForm @register="registerForm" class="mr3"/>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template v-if="selectedRowKeys.length > 0" #tableTitle>

                <a-button  preIcon="ant-design:export-outlined" type="primary" @click="onDownloadGenerateCode">
                  批量下载
                </a-button>
<!--        <a-dropdown v-if="selectedRowKeys.length > 0">-->
<!--          <template #overlay>-->
<!--            <a-menu>-->
<!--              <a-menu-item v-if="hasPermission('operation:operation_inspection_point_plan:deleteBatch')" @click="batchHandleDelete">-->
<!--                <Icon icon="ant-design:delete-outlined" />-->
<!--                批量删除-->
<!--              </a-menu-item>-->
<!--            </a-menu>-->
<!--          </template>-->
<!--          <a-button>-->
<!--            批量操作-->
<!--            <Icon icon="ant-design:down-outlined" />-->
<!--          </a-button>-->
<!--        </a-dropdown>-->
      </template>
      <template #action="{ record }" >
        <TableAction :actions="getActions(record)"/>
      </template>
    </BasicTable>
  </a-spin>
</template>

<script lang="ts" setup>
import { useGlobSetting } from '@/hooks/setting';
import {useMessage} from '/@/hooks/web/useMessage';
const {createMessage: $message} = useMessage();

const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const prefix = import.meta.env.VITE_GLOB_API_URL_UPFILES;
import {watch, computed, inject, ref, unref, onMounted} from 'vue';
import {BasicForm, FormSchema, useForm} from '/@/components/Form/index';
import { getExportUrlFujian,getExportUrlFujianOne, saveOrUpdateDemo } from '../demo.api';
import { BasicColumn, BasicTable, TableAction, useTable } from '@/components/Table';
import { usePermission } from '/@/hooks/web/usePermission';
import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
import { getTreeListRenyuan } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/renyuanxinxi/demo.api';
import { useMethods } from '@/hooks/system/useMethods';
import { filterObj, getFileAccessHttpUrl } from '@/utils/common/compUtils';
import { useListPage } from '@/hooks/system/useListPage';
import { defHttp } from '@/utils/http/axios';
import { downloadByData } from '@/utils/file/download';
const { handleExportXls,handleExportZidingyi } = useMethods();

const { hasPermission } = usePermission();

const checkedKeys = ref<Array<string | number>>([]);
const emit = defineEmits(['success']);
const props = defineProps({
  data: {type: Object, default: () => ({})},
  rootTreeData: {type: Array, default: () => []},
});
const loading = ref<boolean>(false);
// 当前是否是更新模式
const isUpdate = ref<boolean>(true);
// 当前的弹窗数据
const model = ref<object>({});

//注册表单
const schemas: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'createBy',
    label: 'createBy',
    component: 'Input',
    show: false,
  },
  {
    field: 'createTime',
    label: 'createTime',
    component: 'Input',
    show: false,
  },
  {
    field: 'baseTitle',
    component: 'Divider',
    label: '基础信息',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    field: 'planCode',
    label: '计划编号',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'planName',
    label: '计划名称',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'startTime',
    label: '计划开始时间',
    component: 'DatePicker',
    required: true,
    colProps: {span: 12},
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm',
      format: 'YYYY-MM-DD HH:mm',
      disabled: true,
    },
  },
  {
    field: 'endTime',
    label: '计划结束时间',
    component: 'DatePicker',
    required: true,
    colProps: {span: 12},
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm',
      format: 'YYYY-MM-DD HH:mm',
      disabled: true,
    },
  },
  {
    field: 'planType',
    label: '计划类型',
    component: 'Select',
    required: true,
    defaultValue: 1,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      options: [
        { label: '小时计划', value: 1 },
        { label: '日计划', value: 2 },
        { label: '周计划', value: 3 },
        { label: '月计划', value: 4 },
        { label: '季计划', value: 5 },
        { label: '年计划', value: 6 },
      ],
    },
  },
  {
    field: 'ruleName',
    label: '执行周期规则',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'ruleDescription',
    label: '执行规则描述',
    component: 'Input',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    required: false,
    colProps: {span: 24},
    componentProps: {
      rows:3,
      disabled: true,
    },
  },

  {
    field: 'baseTitle1',
    component: 'Divider',
    label: '点检人员',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },
  {
    field: 'teamId',
    label: '点检班组',
    required: true,
    colProps: {span: 12},
    component: 'TreeSelect',
    componentProps: {
      disabled: true,
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'groupName',
        value: 'groupCode',
        children: 'children',
      },
    },
  },
  {
    field: 'chargerId',
    label: '点检人',
    component: 'TreeSelect',
    required: true,
    colProps: {span: 12},
    componentProps: {
      disabled: true,
      // treeCheckable: true,
      // title: '下拉树',
      treeData: [], // 先给空
      fieldNames: {
        label: 'label',
        value: 'id',
        children: 'children',
      },
    },
  },

  {
    field: 'baseTitle2',
    component: 'Divider',
    label: '附件',
    componentProps: {
      orientation: 'left',
      plain: true,
    },
  },


];
const [registerForm, {resetFields, setFieldsValue, validate, updateSchema}] = useForm({
  labelWidth:150,
  labelCol: {span: 24},
  wrapperCol: {span: 24},
  schemas,
  showActionButtonGroup: false,
});
const columnsTable: BasicColumn[] = [
  {
    title: '文件名',
    dataIndex: 'fileName',
    width: 130,
    resizable: true,
  },
  {
    title: '上传时间',
    dataIndex: 'createTime',
    width: 130,
    resizable: true,
  },
  {
    title: '上传者',
    dataIndex: 'createBy',
    width: 130,
    resizable: true,
  },
  {
    title: '文档大小',
    dataIndex: 'fileSize',
    width: 130,
    resizable: true,
  },
// {
//     title: '存储地址',
//     dataIndex: 'fileUrl',
//     width: 130,
//     resizable: true,
//   },



];

const {prefixCls, tableContext, onImportXls, onExportXls} = useListPage({
  // designScope: 'role-template',
  tableProps: {
    title: '',
    // api: list,
    columns: columnsTable,
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
      slots: {customRender: 'action'},
      fixed: 'right',
    },
    //自定义默认排序
    striped: true,
    useSearchForm: false,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    tableSetting: {fullScreen: true},
  },
  // exportConfig: {
  //   name: '附件',
  //   url: getExportUrlFujian,
  //   params: (record) => {
  //     console.log(record,'1111');
  //     return {
  //       // bizType: bizType.value,
  //       fileUrl: record.value,
  //     };
  //   },
  // },
  // importConfig: {
  //   url: getImportUrl,
  // },
});
const [registerTable, {reload,setTableData}, {rowSelection, selectedRowKeys,selectedRows}] = tableContext;

function getActions(record) {
  return [
    {
      label: '下载',
      onClick: handleDownLoad.bind(null, record),
      // onClick: onExportXls,
      // onClick: handleExportXls('单表示例', getExportUrlFujianOne, exportParams),
      // auth: 'operation:operation_inspection_point_plan:edit', //通过权限指令控制显示（有权限显示/无权限不显示）

    },
    // {
    //   label: '预览',
    //   onClick: handleDetail.bind(null, record),
    // },
    // {
    //   label: '删除',
    //   popConfirm: {
    //     title: '是否确认删除',
    //     confirm: handleDelete.bind(null, record),
    //   },
    //   auth: 'operation:operation_inspection_point_plan:delete', //通过权限指令控制显示（有权限显示/无权限不显示）
    //
    // },
  ];
}


function handleDownLoad(record) {
  console.log(record,'11111');
  // handleExportXls('附件',getExportUrlFujianOne, {fileUrl:getFileAccessHttpUrl(record.fileUrl)},'.png')
  handleExportZidingyi('附件',getExportUrlFujianOne, {fileUrl:getFileAccessHttpUrl(record.fileUrl)},`${record.extension}`)
}


function onDownloadGenerateCode() {
  console.log(selectedRows.value,'33343');
  let urls = []
  selectedRows.value.forEach(item => {
    urls.push(`${baseUploadUrl}${prefix}${item.fileUrl}`);
  })
  //update-begin-author:taoyan date:2022-6-27 for:  VUEN-1433【vue3】一对多代码生成，点击下载失败
  let codeFileList = selectedRows.value;
  if (!codeFileList || codeFileList.length == 0) {
    $message.warning('无代码！');
    return;
  }
  let temp = codeFileList.join(',');
  //console.log(temp);
  //update-end-author:taoyan date:2022-6-27 for:  VUEN-1433【vue3】一对多代码生成，点击下载失败
  return defHttp
    .post(
      {
        url: getExportUrlFujian,
        params: {
          fileUrls: encodeURI(temp),
          // pathKey: pathKey.value
        },
        responseType: 'blob',
      },
      {isTransformResponse: false}
    )
    .then((data) => {
      if (!data || data.size == 0) {
        $message.warning('导出代码失败！');
        return;
      }
      let fileName = '导出附件_' + new Date().getTime() + '.zip';
      downloadByData(data, fileName, 'application/zip');
    });
}
const exportParams = computed(() => {
  let paramsForm = {};
  if (checkedKeys.value && checkedKeys.value.length > 0) {
    paramsForm['selections'] = checkedKeys.value.join(',');
  }
  return filterObj(paramsForm);
});
onMounted(() => {
  // 禁用字段
  // updateSchema([
  //   {field: 'parentId', componentProps: {disabled: true}},
  //   {field: 'orgCode', componentProps: {disabled: true}},
  // ]);
  // // data 变化，重填表单
  watch(
    () => props.data,
    async (newValue) => {
      const treeDataRenyuan = await getTreeListRenyuan();
      const treeData = await getTreeListBanzu();
      updateSchema([
        {
          field: 'teamId',
          componentProps: {
            treeData,
          },
        },
        {
          field: 'chargerId',
          componentProps: {
            treeData:treeDataRenyuan,
          },
        },
      ]);
      let record = unref(newValue);
      if (typeof record !== 'object') {
        record = {};
      }
      model.value = record;
      setTableData(record.planAttachments || [])
      await resetFields();
      await setFieldsValue({
        ...record,
        ruleName: record.ruleName ?? record.cycleRule,
      });
    },
    {deep: true, immediate: true}
  );

});




// 提交事件
async function onSubmit() {
  try {
    loading.value = true;
    let values = await validate();
    values = Object.assign({}, model.value, values);
    //提交表单
    await saveOrUpdateDemo(values, isUpdate.value);
    //刷新列表
    emit('success');
    Object.assign(model.value, values);
  } finally {
    loading.value = false;
  }
}
</script>
<style lang="less">
// update-begin-author:liusq date:20230625 for: [issues/563]暗色主题部分失效

@prefix-cls: ~'@{namespace}-j-depart-form-content';
/*begin 兼容暗夜模式*/
.@{prefix-cls} {
  background: @component-background;
  border-top: 1px solid @border-color-base;
}

/*end 兼容暗夜模式*/
// update-end-author:liusq date:20230625 for: [issues/563]暗色主题部分失效
</style>
