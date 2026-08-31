<template>
    <div style="display:flex;">
        <left-filter-list v-if="showLeft" :status="expandStatus" :dynamicConfig="extendConfig" @load="onSelectLeftItem" @expand="onExpandChange" :isLowApp="isLowApp"></left-filter-list>

        <div :class="[prefixCls, 'p-2']" :style="tableStyle">
            <!-- 骨架屏 -->
            <a-skeleton v-if="pageLoading" active />
            <!-- 错误提示 -->
            <template v-else-if="errorTips.notDesignForm">
                <p class="error-tip">你还没有设计任何表单项，不能查看表单数据！</p>
            </template>
            <BasicTable v-show="showTable" @register="registerTable" :rowSelection="myRowSelection">

                <template #tableTop>
                    <div style="height: 0;"></div>
                </template>
                
                <template #view-sub-table="{ text }">
                    <sub-table-tag :text="text"/>
                </template>

                <template #view-picture="{ text, index }">
                    <div v-if="Array.isArray(text) && text.length > 0" class="j-table-slot-view">
                        <TableImage :text="text"/>
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

                <!--操作栏-->
                <template #action="{ record, index }">
                    <TableAction :actions="getTableAction(record, index)" :dropDownActions="getDropDownAction(record, index)" />
                </template>

                <template #summary>
                    <table-summary ref="summaryRef" :show="showSummary" :dataList="initSummaryList" :tableColumns="tableColumns" :dynamicConfig="dynamicConfig" @load="putParams"/>
                </template>
                
            </BasicTable>
            <!-- <AutoDesformDataFullScreen @register="registerDataModal" @success="onSuccess" />-->
            <DesformViewModal
              :index="currentIndex"
              :total="dataPageTotal"
              :showComment="showComment"
              :showFiles="showFiles"
              :showDataLog="showDataLog"
              :showRecordCopy="showCreateBtn"
              :showRecordShare="showRecordShare"
              :showRecordSysPrint="showRecordSysPrint"
              :showDesignFormBtn="showDesignFormBtn"
              :dynamicConfig="dynamicConfig"
              @register="registerDataModal"
              @reload="onReload"
              @success="onSuccess"
              @goto-record="onGoToRecord"
            />
        </div>
    </div>

    <TopButtonDrawer 
        :selectedRowKeys="selectedRowKeys" 
        :selectedRows="selectedRows" 
        :viewId="viewId" 
        :designFormCode="routeCode"
        :tableColumns="tableColumns"
        :designButtonList="designButtonList"
        :dynamicConfig="dynamicConfig"
        :buttonsAuth="buttonsAuth"
        @delete="onDeleteBatch"
        @success="onUpdateSuccess"
        @export="onSelectExport"
        @clear="onClearSelected"
        @reload="onDataHandleSuccess"
    />
  
  <!-- 流程图查看modal -->
  <BpmGraphicModal @register="registerBpmModal"></BpmGraphicModal>
</template>

<script lang="ts">
  import type { ActionItem } from '/@/components/Table';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { computed, defineComponent, nextTick, reactive, ref, unref, watch } from 'vue';
  import { router } from '/@/router';
  import { useModal } from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useColumns } from '../auto/hooks/useColumns';
  import { pageApi } from '../auto/auto.desform.api';
  import AutoDesformDataFullScreen from '../auto/AutoDesformDataFullScreen.vue';
  import AutoColumnSettings from '../auto/components/AutoColumnSettings.vue';
  import { useCopyModal } from '/@/hooks/web/useCopyModal';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { onMountedOrActivated } from '/@/hooks/core/onMountedOrActivated';
  import { downloadFile } from '/@/utils/common/renderUtils';
  import { sleep } from '/@/utils';
  import {useBaseList, useSearchForm } from '/@/views/super/online/desform/multi/ts/useBaseList'
  import LeftFilterList from './LeftFilterList.vue'
  import TableImage from '../auto/components/TableImage.vue'
  import TableSummary from "./TableSummary.vue";
  import {useCustomButton} from './ts/useCustomButton'
  import SubTableTag from '../auto/components/SubTableTag.vue'
  import TopButtonDrawer from './button/TopButtonDrawer.vue'
  import { useRoute } from 'vue-router';
  import { useActionAuth, useAuthStore } from '../auto/hooks/useAuth'
  import { useViewCommon } from "./ts/useViewCommon";
  import { useProcessListButton } from '../auto/hooks/useDesformListProcess'
  import { getSuperQueryGroup } from "./ts/useSuperQueryCurd";

  export default defineComponent({
    name: 'BaseList',
    components: {
      BasicTable,
      TableAction,
      AutoColumnSettings,
      AutoDesformDataFullScreen,
      LeftFilterList,
      TableImage,
      TableSummary,
      SubTableTag,
      TopButtonDrawer,
    },
    props: {
      // 查询desformCode，如果传了该参数，就强制查询传的code的表单
      // 目前仅【工单查询】页面用到
      queryDesformCode: String,
      // 自定义按钮权限，如果传了该参数，就强制应用该按钮权限
      // 目前仅【工单查询】页面用到
      customButtonsAuth: Object,

      timestamp: {
        type: Number,
        default: 0
      },
      //全局搜索
      keyword:{
        type: String,
        default: ''
      },
      // 查询时间戳
      searchTime: {
        type: Number,
        default: 0
      },
      // 高级查询搜索
      superQuery:{
        type: Object,
        default: ()=>{}
      },
      //新增配置 
      dynamicConfig: {
        type: Object,
        default: ()=>{}
      },
      viewId:{
        type: String,
        default: ''
      },
      code: {
        type: String,
        default: ''
      },
      isLowApp: {
        type: Boolean,
        default: false,
      }
    },
    emits:['left-select', 'action-click', 'buttons-auth-change', 'export'],
    setup(props, { emit }) {
      const { createCopyModal } = useCopyModal();
      // 加载流程操作按钮
      const { registerBpmModal, startDesformListProcess, handleViewGraphic } = useProcessListButton(reload);
      const route = useRoute();
      
      const loading = ref(false);
      // 当前页面的表单code
      const routeCode = ref<string>();
      const pageLoading = ref(true);
      const desformName = ref<string>();
      const desformCode = ref<string>();
      // 后台翻译结果
      const translData = ref({});
      // 是否有高级查询条件或数据权限
      const hasSuperQuery = ref(false);
      // 高级查询条件
      const superQueryParams = ref({});
      // 远程选项
      const remoteOptionsMap = ref({});
      // 左侧列表筛选选中的数据
      const leftSelectValue = ref('')
      // 下方统计数据
      const initSummaryList = ref([])
      const pageContext = useListPage({
        designScope: 'auto-desform-data-list',
        tableProps: {
          immediate: false,
          api: getList,
          useSearchForm: false,
          actionColumn: {
            width: 150,
            fixed: 'right',
          },
          scroll: { x: 'max-content' },
          showIndexColumn: true,
          showTableSetting: false,
          indexColumnProps: { title: '#', fixed: 'left' },
          tableSetting: { setting: false },
          maxColumnWidth: 300,
          beforeFetch(params) {
            if(props.dynamicConfig && props.dynamicConfig.leftFilterField){
              params[props.dynamicConfig.leftFilterField] = leftSelectValue.value;
            }
          },
          formConfig: {
            labelWidth: 120,
            schemas: [],
            autoAdvancedCol: 3,
            actionColOptions: {
              style: { textAlign: 'left' },
            },
          },
        },
        exportConfig: {
          name: () => desformName.value ?? '',
          url: () => `/desform/data/exportXls/${desformCode.value}`,
        },
        importConfig: {
          url: () => `/desform/data/importXls/${desformCode.value}`,
        },
      });
      const { prefixCls, tableContext, doDeleteRecord, doRequest, createMessage: $message, onExportXls, onImportXls } = pageContext;
      // 注册table数据
      const [registerTable, tableAction, { rowSelection, selectedRowKeys, selectedRows }] = tableContext;
      // 注册编辑弹窗
      const [registerDataModal, dataModal] = useModal();
      // 视图公共参数
      const {appId, showComment, showFiles, showDataLog, showCreateBtn, showRecordShare, showRecordSysPrint, showDesignFormBtn, dataPageTotal, currentIndex} = useViewCommon();
      // 自定义按钮
      const { designButtonList, getCustomButtons, addLinkRecordData, executeFlow } = useCustomButton(props, dataModal, routeCode, appId);

      // 按钮权限
      const innerButtonsAuth = ref<Recordable>({
        add: false,
        import: false,
        export: false,
        superQuery: false,
        batchAction: false,
        customColumn: false,
        detail: false,
        edit: false,
        delete: false,
        getUrl: false,
        startProcess: false,
      });
      // 最终按钮权限
      const buttonsAuth = computed({
        get() {
          if (props.customButtonsAuth) {
            return props.customButtonsAuth;
          }
          return innerButtonsAuth.value;
        },
        set(val: Recordable) {
          innerButtonsAuth.value = val;
        },
      });
      // 加载列配置
      const { allColumns, allColumnKeys, superQueryFields, loadColumnsInfo, linkRecordDataMap, extendConfig, errorTips } = useColumns(
        {
          buttonsAuth,
          desformCode,
          desformName,
          translData,
          remoteOptionsMap,
          dynamicConfig: props.dynamicConfig
        },
        {
          loadData,
          openLinkRecord,
          tableAction
        }
      );

      // 是否允许显示表格
      const showTable = computed(() => {
        if (pageLoading.value) {
          return false;
        }
        if (errorTips.notDesignForm) {
          return false;
        }
        return true;
      });
      
      watch(()=>props.code, (val)=>{
        if(val){
          routeCode.value = props.code;
          reload();
        }
      }, {immediate: true});

      watch(()=>props.timestamp, (val)=>{
        //不要立即触发，等下次修改配置后再触发
        if(val){
          let isSearch = false
          if (props.searchTime != null) {
            isSearch = (val - props.searchTime) <= 50
          }
          console.log('重新刷新数据:', {isSearch})
          reload(isSearch);
        }
      }, {immediate: false});
      
      watch(()=>props.superQuery, (data)=>{
        if(data){
          superQueryParams.value = {
            matchType: data.matchType,
            superQueryParams: data.superQueryParams,
          };
        }
        tableAction.reload();
      },{immediate: false, deep: true})

      // 监听 buttonsAuth 变化，触发事件
      watch(buttonsAuth, (val) => emit('buttons-auth-change', val))

      /** 重新加载数据 */
      async function reload(isSearch = false) {
        if (!routeCode.value) {
          return;
        }
        errorTips.notDesignForm = false;
        try {
          //setLoading(true);
          await loadColumnsInfo(routeCode.value, null, isSearch);
        } finally {
          //setLoading(false);
          pageLoading.value = false;
        }
      }

      const showSummary = ref(true)
      async function getList(params) {
        // 清空关联记录数据，重新查询数据
        linkRecordDataMap.value = {};
        let res = await pageApi.list({
          ...params,
          desformCode: routeCode.value,
          superQuery: getSuperQueryGroup(superQueryParams.value),
          listViewId: props.dynamicConfig?props.dynamicConfig.id:'',
          global_keyword: props.keyword,
          appId: route.params.appId
        });
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
        // 取出后台是否有数据权限flag
        if (res.result.hasSuperQuery != null) {
          hasSuperQuery.value = res.result.hasSuperQuery;
        }
        if (res.message !== '查询成功') {
          $message.warn(res.message);
        }
        res.result.records = dataSource;
        dataPageTotal.value = dataSource.length;
        showSummary.value = dataSource.length>0;
        initSummaryList.value = res.result.summaryList || [];
        return res.result;
      }

      function loadData() {
        tableAction.reload();
      }

      function setLoading(flag) {
        loading.value = true;
        tableAction.setLoading(flag);
      }

      function openModal(mode = 'add', dataId = null) {
        dataModal.openModal(true, {
          mode,
          desformCode: routeCode.value,
          parentCode: routeCode.value !== desformCode.value ? desformCode.value : '',
          dataId: dataId,
          isOnline: false,
          viewId: props.viewId,
          lowAppId: appId.value,
        });
      }

      async function openLinkRecord(desformCode, dataId) {
        const lowAppId = unref(appId)
        await getFormAuthOnce(lowAppId, desformCode);
        dataModal.openModal(true, {
          mode: 'edit',
          desformCode: desformCode,
          dataId: dataId,
          isOnline: false,
          viewId: props.viewId,
          lowAppId: lowAppId,
          setMode({ record }) {
            // 判断这条数据是否有编辑权限
            let desformData = record?.desformData ? record.desformData : record;
            let status = hasUpdateAuth(desformCode, props.viewId, [desformData]);
            return status ? 'edit' : 'detail';
          },
        });
      }

      /** 列配置变化 */
      function onColumnsChange(data) {
        console.log('onColumnsChange', data)
        tableAction.setColumns(data.columns);
        tableAction.setProps({
          showIndexColumn: data.showIndex,
          showActionColumn: data.showAction,
        });
      }

      function onAddRecord() {
        openModal();
      }

      /** 删除单个表单*/
      async function onDelete(record) {
        //update-begin---author:wangshuai---date:2024-06-11---for:【TV360X-627】选中一条后，然后删除该条记录，选中的提示关不了了---
        doDeleteRecord(() => pageApi.delete(desformCode.value, record.id, onClearSelected));
        //update-end---author:wangshuai---date:2024-06-11---for:【TV360X-627】选中一条后，然后删除该条记录，选中的提示关不了了---
      }

      /** 批量删除 */
      function onDeleteBatch() {
        doRequest(() => pageApi.batchDelete(desformCode.value, selectedRowKeys.value), {confirm: false});
      }
      
      async function onUpdateSuccess(){
        await tableAction.clearSelectedRowKeys();
        await onDataHandleSuccess();
      }

      function onReload() {
        onDataHandleSuccess()
      }

      async function onSuccess(data) {
        if(data.isLinkRecordForm === true){
          // 默认情况下，追加关联记录到当前表单，取的id也是当前表单ID
          let linkId = data.currentRecordId;
          if(data.linkRecordId){
            // 特殊情况： 添加关联记录中的关联记录，追加关联记录关系时用的id是，当前表单的关联记录的id
            linkId = data.linkRecordId;
          }
         await addLinkRecordData(linkId, data.dataId, data.customButtonId);
        }

        // QQYUN-4721【应用】自定义按钮选择填写指定内容执行工作流不起作用
        if(data.flowStatus === true){
          await executeFlow({ id: data.currentRecordId }, data.processId, true);
        }
        
        await onDataHandleSuccess();
      }

      // 跳转数据（上一条、下一条）
      async function onGoToRecord({ id, index, mode }) {
        if (index == null) {
          return
        }
        let raw = tableAction.getRawDataSource();
        let records = raw?.records ?? [];
        // 通过id查找index
        if (id) {
          let recordIdx = records.findIndex((item) => item.id === id);
          if (recordIdx == -1) {
            await tableAction.reload();
            await nextTick();
            records = tableAction.getRawDataSource()?.records ?? [];
            dataPageTotal.value = records.length;
            recordIdx = records.findIndex((item) => item.id === id);
            if (recordIdx == -1) {
              $message.error("数据不存在");
              return;
            }
          }
          currentIndex.value = recordIdx;
          openModal(mode, id);
          return;
        }

        currentIndex.value = index;

        if (!records || !records[index]) {
          $message.error("数据不存在");
          return;
        }
        openModal(mode, records[index].id);
      }

      async function onDataHandleSuccess() {
        if (hasSuperQuery.value) {
          // 如果有高级查询条件或数据权限，则延迟1秒加载数据
          // 因为涉及到更改 es 索引，所以可能会出现数据不同步的情况
          setLoading(true);
          await sleep(1000);
        }
        loadData();
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

      const { getFormAuthOnce } = useAuthStore();
      const { hasUpdateAuth, hasDeleteAuth, hasBatchAuth } = useActionAuth();
      const myRowSelection = computed(()=>{
        let code = routeCode.value;
        let flag = buttonsAuth.value.batchAction && hasBatchAuth(code);
        if(flag === true){
          return rowSelection
        }
        return null
      });
      
      /**
       * 操作栏
       */
      function getTableAction(record, index): ActionItem[] {
      // 允许编辑的情况--> bpm有值且值为1，bpm没有值,
      //update-begin-author:liusq date:2023-2-6 for:  TV360X-1062 已经发起流程了，不能再删除和编辑数据 参考：QQYUN-4135【online】审批完成的流程和取回作废的流程，可以编辑
      let bpmStatusValue = record._record.bpmStatus;
      let canEdit = (bpmStatusValue && (bpmStatusValue=='1' || bpmStatusValue=='3' || bpmStatusValue=='4')) || !bpmStatusValue;
      //update-end-author:taoyan date:2023-2-6 for:  TV360X-1062 已经发起流程了，不能再删除和编辑数据 参考：QQYUN-4135【online】审批完成的流程和取回作废的流程，可以编辑
        let arr = [{
          label: '查看',
          onClick: () => {
            currentIndex.value = index;
            openModal('detail', record.id)
          },
          ifShow: () => buttonsAuth.value.detail,
        }];
        let status = hasUpdateAuth(routeCode.value, props.viewId, [record]);
        if(status===true){
          arr.push({
            label: '编辑',
            onClick: () => {
              currentIndex.value = index;
              openModal('edit', record.id)
            },
            //update-begin-author:liusq---date:2024-06-11--for: TV360X-1062 已经发起流程了，不能再删除和编辑数据
            ifShow: () => buttonsAuth.value.edit && canEdit,
            //update-end-author:liusq---date:2024-06-11--for: TV360X-1062 已经发起流程了，不能再删除和编辑数据
          })
        }
        return arr;
      }

      // 点击自定义按钮触发的事件
      async function onClickCustomButton(clickFn, ...args) {
        if (typeof clickFn === 'function'){
          await clickFn(...args);
        }
        // 执行完毕后刷新列表
        setLoading(true);
        await sleep(500)
        await onDataHandleSuccess()
      }

      /**
       * 下拉操作栏
       */
      function getDropDownAction(record): ActionItem[] {
        let columnsHasBpm = tableColumns.value.some((column) => column.key == 'bpm_status');
        let bpmStatusValue = record._record.bpmStatus;
        let canEdit = (bpmStatusValue && (bpmStatusValue=='1' || bpmStatusValue=='3' || bpmStatusValue=='4')) || !bpmStatusValue;
        let arr: ActionItem[]  = [
          //update-begin---author:scott ---date:2022-12-24  for：陶炎新版低代码不需要通过列表发起流程，采用工作表触发即可-----
          {
            label: '发起流程',
            class: ['low-app-hide'],
            popConfirm: {
              title: '确定要发起流程吗？',
              placement: 'left',
              confirm: () => startDesformListProcess(record),
            },
            ifShow: () => columnsHasBpm && (record._record.bpmStatus == null || record._record.bpmStatus == 1)
          },
          {
            label: '审批进度',
            class: ['low-app-hide'],
            onClick: handleViewGraphic.bind(null, record),
            ifShow: () => record._record.bpmStatus != null && record._record.bpmStatus != 1
          },
          //update-end---author:scott ---date:2022-12-24  for：陶炎新版低代码不需要通过列表发起流程，采用工作表触发即可-----
          /*{
            label: '编辑地址',
            onClick: () => {
              let text = `/online/desform/view/${desformCode.value}?did=${record.id}`;
              createCopyModal({ title: '编辑地址', content: text, copyText: text });
            },
            ifShow: () => !getIsLowAppEnv() && buttonsAuth.value.getUrl,
          }*/
        ];
        let status = hasDeleteAuth(routeCode.value, props.viewId, [record]);
        if(status===true){
          arr.push({
            label: '删除',
            popConfirm: {
              title: '确定要删除吗？',
              placement: 'left',
              confirm: () => onDelete(record),
            },
            //update-begin-author:liusq---date:2024-06-11--for: TV360X-1062 已经发起流程了，不能再删除和编辑数据
            ifShow: () => buttonsAuth.value.delete && canEdit,
            //update-end-author:liusq---date:2024-06-11--for: TV360X-1062 已经发起流程了，不能再删除和编辑数据
          })
        }
        let list: ActionItem[] = getCustomButtons(record, designButtonList);
        if(list && list.length>0){
          for (let button of list){
            if (button?.popConfirm?.confirm) {
              let confirm =  button.popConfirm.confirm
              button.popConfirm.confirm = onClickCustomButton.bind(null, confirm)
            } else if (button.onClick) {
              let onClick = button.onClick
              button.onClick = onClickCustomButton.bind(null, onClick)
            }
            arr.unshift(button)
          }
        }
        return arr;
      }

      // 高级查询点击确定，刷新数据
      function onSuperQuery(data) {
        superQueryParams.value = {
          matchType: data.superQueryMatchType,
          superQueryParams: data.superQueryParams,
        };
        reload();
      }

      const {tableColumns} = useBaseList(props, tableAction, allColumns);
      useSearchForm(tableAction);

      const expandStatus = ref(true);
      function onExpandChange(flag){
        expandStatus.value = flag;
      }

      const showLeft = computed(()=>{
        if(props.dynamicConfig && props.dynamicConfig.leftFilterField){
          return true
        }
        return false;
      });
      
      const tableStyle = computed(()=>{
        if(showLeft.value===false){
          return {
            width: '100%'
          }
        }
        if(expandStatus.value == true){
          return {
            width: 'calc(100% - 220px)'
          }
        }else{
          return {
            width: 'calc(100% - 30px)'
          }
        }
      });
      function onSelectLeftItem(id){
        leftSelectValue.value = id;
        loadData();
        // QQYUN-3258【视图】配置 筛选列表 选中新增默认，新增时，没有默认
        if(props.dynamicConfig && props.dynamicConfig.addFormDefaultStatus === true && props.dynamicConfig.leftFilterField){
          let formValue = {
            [props.dynamicConfig.leftFilterField]: leftSelectValue.value
          };
          emit('left-select', formValue)
        }
      }
      
      
      const summaryRef = ref();
      async function putParams({type, field}) {
        let searchFormValues = await tableAction.getForm().getFieldsValue();
        let params = {
          ...searchFormValues,
          summaryType: type,
          summaryField: field,
          code: routeCode.value,
          superQuery: JSON.stringify(superQueryParams.value),
          listViewId: props.dynamicConfig?props.dynamicConfig.id:'',
          global_keyword: props.keyword
        }
        summaryRef.value.loadFieldSummary(params)
      }

      /**
       * 获取列的信息及查询条件
       */
      async function getTableColumns() {
        //1.获取查询条件
        let searchFormValues = await tableAction.getForm().getFieldsValue();
        console.log('searchFormValues>>>', searchFormValues)
        //2.获取高级查询条件
        let params = {
          ...searchFormValues,
          code: routeCode.value,
          superQuery: JSON.stringify(superQueryParams.value),
          listViewId: props.dynamicConfig?props.dynamicConfig.id:'',
          global_keyword: props.keyword
        }
        console.log('params>>>', params)
        //3.获取选中的行-内部导出用
        //名称
        let viewName = props.dynamicConfig.name
        return {
          columns: tableColumns.value,
          queryParams:params,
          viewName
        }
      }
      
      async function onSelectExport() {
        let params = await getTableColumns();
        //let name = desformName.value+'_'+
        let info = {
          ...params,
          designFormViewName: props.dynamicConfig.name,
          designFormCode: props.code,
          idList: selectedRowKeys.value
        }
        emit('export', info)
      }
      
      // QQYUN-4269【表单设计器】批量操作，加一个取消选中
      function onClearSelected() {
        tableAction.clearSelectedRowKeys();
      }

      return {
        prefixCls,
        showTable,
        pageLoading,
        desformCode,
        rowSelection,
        selectedRowKeys,
        buttonsAuth,
        currentIndex,
        dataPageTotal,
        getTableColumns,

        allColumns,
        allColumnKeys,
        superQueryFields,
        errorTips,
        loadData,
        getTableAction,
        getDropDownAction,
        getFileAccessHttpUrl,
        downloadRowFile,
        onAddRecord,
        onExportXls,
        onImportXls,
        onDeleteBatch,
        onReload,
        onSuccess,
        onGoToRecord,
        onColumnsChange,
        onSuperQuery,

        registerTable,
        registerDataModal,

        expandStatus,
        tableStyle,
        onExpandChange,
        extendConfig,
        onSelectLeftItem,
        showLeft,

        tableColumns,
        summaryRef,
        initSummaryList,
        putParams,
        showSummary,
        selectedRows,
        routeCode,
        onUpdateSuccess,
        registerBpmModal,
        showComment,
        showFiles,
        showDataLog,
        showCreateBtn,
        showRecordShare,
        showRecordSysPrint,
        showDesignFormBtn,
        onSelectExport,
        onClearSelected,
        designButtonList,
        myRowSelection,
        onDataHandleSuccess,
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
