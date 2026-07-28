<template>
  <BasicModal :minHeight="100" :bodyStyle="{ height: bodyHeight + 'px' }" @register="registerModal" :width="modalWidth" destroyOnClose canFullscreen>
    <!-- 弹窗头部 -->
    <template #title>
      <div>
        <span style="font-size: 17px; font-weight: 500; margin-left: 5px"> 回收站（{{ desformName }}） </span>
        <span style="margin-left: 6px; color: rgb(158, 158, 158); font-size: 13px"> 记录60天后将被自动删除 </span>
        <span style="margin-left: 6px; font-size: 14px">
          <a-button v-if="hasAdminAuth" type="text" @click="clearRecycle">立即清空</a-button>
        </span>
      </div>
    </template>
    <div :class="[prefixCls, 'p-2']" :style="tableStyle">
      <!-- 操作按钮 -->
      <div class="ant-alert-info" style="display: flex; align-items: center; padding: 3px 20px; height: 40px">
        <div style="margin-right: 5px">
          <Icon icon="ant-design:info-circle-outlined" class="ant-alert-icon" :size="16" />
        </div>
        <div style="display: flex; align-items: center" v-if="selectedRowKeys.length > 0">
          <div> 已选择 {{ selectedRowKeys.length }} 条记录 </div>
          <div style="margin-left: 10px">
            <a-button type="text" style="padding: 0 10px" @click="restoreData">
              <Icon icon="ant-design:rollback-outlined" />
              <span style="margin-left: 4px">恢复</span>
            </a-button>
          </div>
          <div style="margin-left: 10px">
            <a-button type="text" style="padding: 0 10px" @click="deleteData">
              <Icon icon="ant-design:delete-outlined" />
              <span style="margin-left: 4px">彻底删除</span>
            </a-button>
          </div>

          <div style="margin-left: 10px">
            <a-button type="text" style="padding: 0 10px" @click="clearSelect">
              <Icon icon="ant-design:close-square-outlined" />
              <span style="margin-left: 4px">取消选中</span>
            </a-button>
          </div>
        </div>
        <div v-else> 未选中任何数据 </div>
        <div style="flex: 1"></div>
        <div>
          <a-input placeholder="请输入关键字搜索" class="my-input" v-model:value="keyword" @change="onSearchByKeyword">
            <template #prefix>
              <SearchOutlined style="color: #c0c0c0" />
            </template>
          </a-input>
        </div>
      </div>

      <!-- 列表数据 -->
      <BasicTable @register="registerTable" :rowSelection="rowSelection">
        <template #view-sub-table="{ text }">
          <sub-table-tag :text="text" />
        </template>

        <template #view-picture="{ text }">
          <div v-if="Array.isArray(text) && text.length > 0" class="j-table-slot-view">
            <TableImage :text="text" />
          </div>
        </template>

        <template #view-file="{ text }">
          <div v-if="Array.isArray(text) && text.length > 0" class="j-table-slot-view">
            <a-button type="primary" preIcon="ant-design:download" size="small" ghost @click="downloadRowFile(text)">下载</a-button>
          </div>
        </template>

        <template #view-color="{ text }">
          <a-tooltip v-if="text" placement="top" :title="text" :getPopupContainer="(node) => node?.parentNode">
            <div class="j-table-slot-view-color" :style="{ backgroundColor: text }"></div>
          </a-tooltip>
        </template>
        
        <template #action="{ record }">
          <TableAction :actions="getTableAction(record)" />
        </template>
      </BasicTable>
    </div>
  </BasicModal>
</template>

<script lang="ts">
  /**
   * 回收站弹窗
   */
  import { ref, defineComponent, reactive, watch, computed, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  import { BasicTable, TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { pageApi } from '../auto.desform.api';
  import { useColumns } from '../hooks/useColumns';
  import { useRoute } from 'vue-router';

  import TableImage from '../../auto/components/TableImage.vue';
  import SubTableTag from '../../auto/components/SubTableTag.vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { useDebounceFn } from '@vueuse/core';
  import { defHttp } from '/@/utils/http/axios';
  import { useMessage } from '/@/hooks/web/useMessage';
  import dayjs from 'dayjs';
  import {useLowAppAuthStore} from "/@/store/modules/lowAppAuth";
  import {useUserStore} from "/@/store/modules/user";
  export const systemFields = [
    {name:'创建时间', field: 'create_time', type:'datetime', seq: 100},
    {name:'创建人', field: 'create_by', type:'select-user', seq: 101},
    {name:'删除时间', field: 'delete_time', type:'datetime', seq: 102},
    {name:'删除人', field: 'delete_by', type:'select-user', seq: 103},
  ];

  export default defineComponent({
    name: 'RecycleDataListModal',
    components: {
      BasicModal,
      BasicTable,
      TableAction,
      TableImage,
      SubTableTag,
      SearchOutlined,
    },
    emits: ['success', 'register'],
    setup(_p, { emit }) {
      const bodyHeight = ref(0);
      bodyHeight.value = window.innerHeight - 300;
      
      const authStore = useLowAppAuthStore();
      const userStore = useUserStore();
      const { createWarningModal } = useMessage();
      // 非管理员可恢复自己删除的记录。仅管理员可彻底删除记录
      const hasAdminAuth = ref(false);
      // 设计器编码
      const designFormCode = ref('');
      const superQueryParams = ref({});
      const keyword = ref('');
      const route = useRoute();
      // 后台翻译结果
      const translData = ref({});
      // 远程选项
      const remoteOptionsMap = ref({});

      const buttonsAuth = ref({});
      const desformCode = ref('');
      const desformName = ref('');
      let useColumnProps = {
        buttonsAuth,
        desformCode,
        desformName,
        translData,
        remoteOptionsMap,
      };
      const loading = ref(false);

      const pageContext = useListPage({
        designScope: 'recycle-data-list-modal',
        tableProps: {
          immediate: false,
          api: getList,
          useSearchForm: false,

          showActionColumn: true,
          actionColumn:{
            title: '操作',
            fixed: 'right',
          },
          showIndexColumn: true,
          indexColumnProps: { title: '#', fixed: 'left', width: 50 },
          rowSelection: { columnWidth: 50 },
          showTableSetting: false,
          tableSetting: { setting: false },
          beforeFetch(params) {
            console.error('beforeFetch', params);
            params['del_flag'] = 1;
          },
        },
      });
      const { prefixCls, tableContext, createMessage: $message } = pageContext;
      // 注册table数据
      const [registerTable, tableAction, { rowSelection, selectedRowKeys }] = tableContext;

      // 加载列配置
      const { allColumns, loadColumnsInfo, linkRecordDataMap } = useColumns(
        useColumnProps,
        { loadData, openLinkRecord, tableAction },
      );
      watch(
        allColumns,
        () => {
          initTableColumns();
        },
        { deep: true, immediate: true }
      );

      function systemFieldconfig2Column(config){
        let item = config;
        let temp:any = {
          key: item.field,
          title: item.name,
          align: 'center',
          sorter: true,
          width: 150,
          dataIndex: item.field
        }
        if(temp.key.indexOf('time')>=0){
          temp.customRender = ({ text })=>{
            if(!text){
              return ''
            }
            return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
          }
        }else{
          temp.customRender = ({ text, record })=>{
            if(!text){
              return ''
            }
            return record[temp.dataIndex+"_dictText"]
          }
        }
        return temp;
      }

      function initTableColumns() {
        let cols = allColumns.value;
        if (cols && cols.length > 0) {
          // 添加系统字段
          let tbColumns:any[] = []
       
          for(let col of cols){
            tbColumns.push({
              ...col
            });
          }
          for(let item of systemFields){
            let temp = systemFieldconfig2Column(item)
            tbColumns.push(temp)
          }
          
          let maxWidth = window.innerWidth * 0.8 - 100;
          let totalWith = 0;
          for (let item of tbColumns) {
            totalWith += item.width;
          }
          if (totalWith > maxWidth) {
            tableAction.setProps({ scroll: { x: 1000 } });
           // delete tbColumns[tbColumns.length - 1].width;
          }
          tableAction.setColumns(tbColumns);
        }
      }

      
      async function getList(params) {
        // 清空关联记录数据，重新查询数据
        linkRecordDataMap.value = {};
        const queryPageParam = {
          ...params,
          desformCode: designFormCode.value,
          superQuery: JSON.stringify(superQueryParams.value),
          listViewId: '',
          global_keyword: keyword.value,
          appId: route.params.appId,
        }
        // 判断是不是管理员 如果不是 只查询自己删除的数据
        let adminAuth:any = authStore.getLowAppAdminAuth();
        if(adminAuth===true){
        }else{
          queryPageParam['delete_by'] = userStore.getUserInfo.username
        }
        let res = await pageApi.list(queryPageParam);
        let dataSource: any[] = [];
        res.result.records.forEach((item) => {
          let desformData = {
            ...JSON.parse(item.desformDataJson),
            id: item.id,
            _record: item,
          };
          dataSource.push(desformData);
        });
        // 取出后台返回的翻译结果
        if (res.result.translData) {
          translData.value = res.result.translData;
        }
        if (res.message !== '查询成功') {
          $message.warn(res.message);
        }
        res.result.records = dataSource;
        return res.result;
      }

      // 进入回收站
      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        console.info('进入回收站');
        let adminAuth:any = authStore.getLowAppAdminAuth();
        hasAdminAuth.value = adminAuth;
        designFormCode.value = data.code;
        await loadColumnsInfo(data.code);
      });

      function loadData() {
        tableAction.reload();
      }

      function openLinkRecord() {
        console.error('回收站不支持此功能');
      }

      function setLoading(flag) {
        loading.value = true;
        tableAction.setLoading(flag);
      }

      function downloadRowFile(fileList) {
        setLoading(true);
        let count = 0;
        for (let file of fileList) {
          let url = getFileAccessHttpUrl(file.url);
          count++;
          try {
            downloadFile(url);
          } finally {
            if (--count === 0) {
              setLoading(false);
            }
          }
        }
      }

      const tableStyle = {};
      const modalWidth = computed(() => {
        // let list = allColumns.value;
        let width = window.innerWidth * 0.8;
        /*    if(list && list.length>0){
          let temp = list.length*120;
          if(temp<width){
            return temp;
          }
        }*/
        return width;
      });

      function getIds() {
        let list = selectedRowKeys.value;
        if (list && list.length > 0) {
          return toRaw(list).join(',');
        }
        return '';
      }

      /**
       * 恢复
       */
      async function restoreData() {
        const url = `/desform/data/${designFormCode.value}/restoreData`;
        let ids = getIds();
        if (!ids) {
          $message.warning('未选中数据');
          return;
        }
        await defHttp.get({ url, params: { ids } });
        await tableAction.reload();
        clearSelect();
        emit('success');
      }

      /**
       * 删除
       */
      function deleteData() {
        createWarningModal({
          title: '彻底删除记录',
          content: '记录删除后无法恢复，请确认您和工作表成员都不再需要这些记录再行删除。',
          okCancel: true,
          okText: '删除',
          cancelText: '取消',
          onOk: () => {
            doDelete();
          },
        });
      }

      async function doDelete() {
        const url = `/desform/data/${designFormCode.value}/deleteBatchFromDb`;
        let ids = getIds();
        if (!ids) {
          $message.warning('未选中数据');
          return;
        }
        await defHttp.delete({ url, params: { ids } }, { joinParamsToUrl: true });
        await tableAction.reload();
        clearSelect();
      }

      /**
       * 清空
       */
      function clearRecycle() {
        createWarningModal({
          title: '是否清空回收站',
          content: '记录删除后无法恢复，请确认您和工作表成员都不再需要这些记录再行删除',
          okCancel: true,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            doClear();
          },
        });
      }

      async function doClear() {
        const url = `/desform/data/${designFormCode.value}/clearRecycle`;
        await defHttp.delete({ url });
        await tableAction.reload();
        clearSelect();
      }

      function clearSelect() {
        tableAction.clearSelectedRowKeys();
        selectedRowKeys.value = [];
      }

      function onSearchByKeyword() {
        tableAction.reload();
      }
      
      function getTableAction(record) {
        return [
          {
            label: '恢复',
            onClick: () => restoreOne(record.id)
          },
        ];
      }

      async function restoreOne(ids) {
        const url = `/desform/data/${designFormCode.value}/restoreData`;
        await defHttp.get({ url, params: { ids } });
        await tableAction.reload();
        emit('success');
      }

      return {
        downloadRowFile,
        deleteData,
        getTableAction,
        restoreData,
        clearRecycle,
        prefixCls,
        bodyHeight,
        registerModal,
        closeModal,
        registerTable,
        rowSelection,
        tableStyle,
        desformName,
        modalWidth,
        selectedRowKeys,
        keyword,
        clearSelect,
        hasAdminAuth,
        onSearchByKeyword: useDebounceFn(onSearchByKeyword, 500),
      };
    },
  });
</script>

<style scoped lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-auto-desform-data-list';

  .@{prefix-cls} {
      &.p-2{
          padding-left: 0;
          padding-top: 0;
      }
      .error-tip {
          text-align: center;
          padding: 30px;
          font-size: 18px;
          background: white;
      }

      :deep(.@{namespace}-basic-table-header){
          &__toolbar {
              width: 160px;
          }
      }

      .j-table-slot-view {
          font-size: 12px;
          font-style: italic;
          position: relative;

          img {
              max-height: 24px;
              display: inline;
          }
      }

      .j-table-slot-view-color {
          width: 25px;
          height: 25px;
          margin: 0 auto;
      }

      :deep(.@{namespace}-basic-table-form-container){
          .ant-form{
              margin-bottom: 0;
          }
      }
  }

  :deep(.base-list-top-tip){
      position: absolute !important;
  }
</style>
