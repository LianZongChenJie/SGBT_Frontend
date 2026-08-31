<template>
  <div :style="{position: 'relative', height: outerHeight+'px', overflow: rootElemOverflow, padding: `${isLowApp ? '0': '10px'}`}" :id="routeCode" :class="[isLowApp ? '' : 'dataList-root']">
    <a-card v-show="!isShareRecordView" class="multi-view-list">
      <a-skeleton v-show="pageLoading" active />
      <a-tabs v-show="!pageLoading" v-model:activeKey="activeKey" class="abc" @change="onChangeTab">
        <!-- 左侧添加视图 -->
        <template #leftExtra>
        <span v-if="isLowApp" class="drawer-icon" style="margin-left: 10px">
          <a-tooltip placement="bottom" title="全部视图">
            <a class="ant-dropdown-link" style="padding: 5px" @click="openLeftViewDrawer">
            <MenuOutlined style="font-size: 16px" />
          </a>
          </a-tooltip>
        </span>

          <a-dropdown v-if="hasViewConfigAuth()" :trigger="['click']" :overlayStyle="{ width: '120px' }">
            <a class="ant-dropdown-link" style="padding: 5px;margin-right:7px;" @click.prevent>
              <plus-outlined style="font-size: 16px" />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="0" @click="(e) => addView(e, 'base')">
                  <table-outlined style="color: #ffa515; font-size: 13px; margin-right: 10px" /> 表格
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="2" @click="(e) => openSelectModal(e, 'card')">
                  <sliders-outlined style="color: #4caf50; font-size: 13px; margin-right: 10px" /> 看板
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="1" @click="(e) => openCalendarSelectModal(e, 'calendar')">
                  <calendar-outlined style="color: #f54081; font-size: 13px; margin-right: 10px" /> 日历
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>

        <!-- 右侧视图操作/筛选/新增/导出 -->
        <template #rightExtra>
          <div class="tab-right-operations">
            <div class="global-search-div" v-if="showSearchInput">
              <a-input
                      ref="searchInputRef"
                      placeholder="搜索"
                      class="my-input"
                      :enterButton="false"
                      allowClear
                      v-model:value="globalKeyword"
                      @keyup.enter="onSearch"
                      @blur="onSearchInputBlur"
                      @change="onSearchValueChange"
              >
                <template #prefix>
                  <search-outlined style="color: #c0c0c0" />
                </template>
              </a-input>
            </div>
            <div class="item" v-else>
              <a-tooltip placement="bottom" title="搜索">
                <SearchOutlined @click.prevent="onSearchInputFocus" />
              </a-tooltip>
            </div>

            <div class="item" v-if="buttonsAuth.superQuery">
              <FilterSelect :routeCode="routeCode" :columnList="columnList" @filter="onExecuteSuperQuery" />
            </div>

            <div class="item" v-if="isLowApp">
              <chart-config :isLowApp="isLowApp" :routeCode="routeCode" :desformName="desformName" />
            </div>

            <div class="item">
              <a-tooltip placement="bottom" title="刷新">
                <ReloadOutlined @click="onReload" />
              </a-tooltip>
            </div>

            <div class="item">
              <!-- <a-tooltip placement="bottom" title="添加数据">
                <PlusOutlined @click="onAdd"/>
              </a-tooltip>-->
              <a-button v-if="showCreateBtn && hasAuth('add') && buttonsAuth.add" type="primary" @click="onAdd" shape="round" class="my-add-button"> <PlusOutlined @click="onAdd" />
                {{ addButtonLabel }}
              </a-button>
            </div>
          </div>
        </template>

        <!-- 视图列表 -->
        <template v-for="(item, index) in viewConfigList">
          <!-- 基础表格 -->
          <a-tab-pane :key="item.id" v-if="item.type == 'base'">
            <template #tab>
              <!-- update-begin--author:liaozhiyang---date:20240407---for：【QQYUN-8742】低代码下改成按钮 -->
              <template v-if="isLowApp">
                <span>{{ item.name }}</span>
                <view-icon
                  v-if="isActiveTab(item.id)"
                  :operationAuth="operationAuth"
                  :buttonsAuth="buttonsAuth"
                  :showDelete="isShowDeleteAction(item)"
                  :hasAdminAuth="hasAdminAuth"
                  @config="(flag) => handleRightClick(flag, item)"
                />
              </template>
              <template v-else>
                <div class="settingBtn">
                  <MenuOutlined />
                  <view-icon
                    v-if="isActiveTab(item.id)"
                    :operationAuth="operationAuth"
                    :buttonsAuth="buttonsAuth"
                    :showDelete="isShowDeleteAction(item)"
                    :hasAdminAuth="hasAdminAuth"
                    @config="(flag) => handleRightClick(flag, item)"
                  />
                </div>
              </template>
              <!-- update-end--author:liaozhiyang---date:20240407---for：【QQYUN-8742】低代码下改成按钮 -->
            </template>
            <base-list
                    :ref="multiViewRefMap[item.id]"
                    :dynamicConfig="item"
                    :timestamp="item.timestamp"
                    :keyword="item.keyword"
                    :searchTime="item.searchTime"
                    :superQuery="mySuperQuery"
                    :code="routeCode"
                    :customButtonsAuth="customButtonsAuth"
                    @actionClick="handleThrowEvent"
                    :viewId="item.id"
                    :isLowApp="isLowApp"
                    @left-select="setFormData"
                    @buttons-auth-change="onButtonsAuthChange"
                    @export="onBaseListExport"
            ></base-list>
          </a-tab-pane>
        </template>
      </a-tabs>

      <!-- 右键配置 -->
      <base-config-drawer :isLowApp="isLowApp" :db-config="activeConfig" @register="registerBaseConfigDrawer" @reload="loadView" />
      
      <!-- 表单弹窗-用于新增 -->
      <!-- <AutoDesformDataFullScreen @register="registerDataModal" @success="onSuccess" :defaultFormData="defaultFormData"/>-->
      <DesformViewModal
        :showComment="showComment"
        :showFiles="showFiles"
        :showDataLog="showDataLog"
        :defaultFormData="defaultFormData"
        :dynamicConfig="currentDynamicConfig"
        @register="registerDataModal"
        @success="onSuccess"
      />

    </a-card>
    <!-- 分享单数据页面 -->
    <AutoDesformShareView
      v-if="isShareRecordView"
      :currentViewId="activeKey"
      :viewConfigList="viewConfigList"
    />

    <!-- 视图左侧显示drawer，用于排序调整 -->
    <ViewLeftDrawer
      ref="viewLeftDrawerRef" 
      :routeCode="routeCode" 
      :viewConfigList="viewConfigList"
      @close="onCloseLeftView"
      @active="onChangeLeftView"
      @ok="loadView"
      @copy="copyView" 
      @delete="removeView"/>

    <!-- 导出modal -->
    <ExportModal @register="registerExportModal"/>

    <!-- 导入modal -->
    <ImportStepPage ref="importRef" @success="onImportOk"/>

    <!-- 数据回收站 -->
    <RecycleDataListModal @register="registerRecycleModal" @success="onImportOk"/>
  </div>
</template>

<script lang="ts">

  /**
   * 多视图列表
   */
  import { defHttp } from '/@/utils/http/axios';
  import {ref, watch, defineComponent, reactive, provide, computed, inject} from 'vue';
  import AutoDesformDataFullScreen from './AutoDesformDataFullScreen.vue';
  import {
    PlusOutlined,
    CalendarOutlined,
    SlidersOutlined,
    TableOutlined,
    CaretDownOutlined,
    SettingOutlined,
    SwapOutlined,
    CopyOutlined,
    DeleteOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    MenuOutlined
  } from '@ant-design/icons-vue';
  import ViewIcon from '../multi/ViewIcon.vue';

  import BaseList from '../multi/BaseList.vue';
  import { onMountedOrActivated } from '/@/hooks/core/onMountedOrActivated';
  import { router } from '/@/router';
  import { useDrawer } from '/@/components/Drawer';
  import BaseConfigDrawer from '../multi/BaseConfigDrawer.vue';
  import { useModal } from '/@/components/Modal';
  import { useViewTabs } from '../multi/ts/useViewTabs';
  import FilterSelect from '../multi/select/FilterSelect.vue';
  import { useColumnConfig } from '../multi/ts/useFilterField';
  import {useCustomButtonConfig} from '../multi/ts/useCustomButton'
  import ViewLeftDrawer from '../multi/left/ViewLeftDrawer.vue'
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from './hooks/useAuth'
  import { useFuncSwitch } from "/@/hooks/jeecg/desform/useFuncSwitch";
  import ExportModal from '../multi/excel/ExportModal.vue'
  import ImportModal from '../multi/excel/ImportModal.vue'
  import ImportStepPage from '../multi/excel/ImportStepPage.vue'
  import RecycleDataListModal from './components/RecycleDataListModal.vue'
  import AutoDesformShareView from "./AutoDesformShareView.vue";
  import { isDesformViewById, queryDesformCodeById } from '/@/utils/super/desform/desformRouteUtils';

  export default defineComponent({
    name: 'AutoDesformDataList',
    components: {
      PlusOutlined,
      CalendarOutlined,
      SlidersOutlined,
      TableOutlined,
      CaretDownOutlined,
      SettingOutlined,
      SwapOutlined,
      CopyOutlined,
      DeleteOutlined,
      SearchOutlined,
      FilterOutlined,
      ReloadOutlined,
      ViewIcon,
      BaseList,
      BaseConfigDrawer,
      AutoDesformDataFullScreen,
      FilterSelect,
      MenuOutlined,
      ViewLeftDrawer,
      ExportModal,
      ImportModal,
      ImportStepPage,
      RecycleDataListModal,
      AutoDesformShareView,
    },
    props: {
      // 查询desformCode，如果传了该参数，就强制查询传的code的表单
      // 目前仅【工单查询】页面用到
      queryDesformCode: String,
      // 自定义按钮权限，如果传了该参数，就强制应用该按钮权限
      // 目前仅【工单查询】页面用到
      customButtonsAuth: Object,
      routeInfo: Object
    },
    emits: ['loadOk', 'action-click'],
    setup(props, { emit }) {
      const {
        routeCode,
        activeKey,
        viewConfigList,
        activeConfig,
        onReload,
        onAdd,
        registerDataModal,
        onSuccess,
        globalKeyword,
        onSearch,
        showSearchInput,
        onSearchInputBlur,
        onSearchInputFocus,
        searchInputRef,
        defaultFormData,
        setFormData,
        isLowApp,
        desformName,
        onSearchValueChange,
        designFormTitleField
      } = useViewTabs();

      const pageLoading = ref(true);
      const multiViewRefMap = {}
      
      // 获取列配置
      const { columnList, initColumnList } = useColumnConfig();
      provide('globalColumnList', columnList);
      const { initButtonList } = useCustomButtonConfig();
      // 按钮名称
      const addButtonLabel = ref<string>('记录');

      // 【VUEN-1554】缓存路由走Activated，没缓存的走Mounted，均只走一次
      const route = useRoute();
      const router = useRouter();
      let timeoutHandle:any = ''
      onMountedOrActivated(async () => {
        if (props.queryDesformCode) {
          routeCode.value = props.queryDesformCode;
        } else {
          // update-begin--author:sunjianlei---date:220230512---for： 【QQYUN-3874】【安全】加个新路由支持表单列表和表单填报页面采用表单ID来访问
          let isId = isDesformViewById(route.name);
          let code = route.params.code as string;
          if (isId || isShareRecordView.value) {
            // 通过id查询出code
            routeCode.value = '';
            routeCode.value = await queryDesformCodeById(code);
          } else {
            routeCode.value = code;
          }
          // update-end--author:sunjianlei---date:220230512---for： 【QQYUN-3874】【安全】加个新路由支持表单列表和表单填报页面采用表单ID来访问
        }
        initPageLoading();
      });

      const {hasAdminAuth, operationAuth, excludeViewIds, hasAuth, getFormAuth} = useAuthStore();

      // 功能开关
      const {getHasFunc} = useFuncSwitch()
      // 【功能开关】是否显示创建按钮
      const showCreateBtn = getHasFunc('SHOW_CREATE_BTN')
      // 【功能开关】是否开启评论
      const showComment = getHasFunc('RECORD_COMMENT');
      // 【功能开关】是否开启附件
      const showFiles = getHasFunc('FILES_DOWNLOAD');
      // 【功能开关】是否开启日志
      const showDataLog = getHasFunc('RECORD_LOGS');
      const rootElemOverflow = ref<string>('visible');
      // 是否是分享视图
      const isShareRecordView = inject('isShareRecordView', ref(false));

      // 当前页面的配置
      const currentDynamicConfig = computed(() => {
        if (viewConfigList.value) {
          return viewConfigList.value.find(item => item.id === activeKey.value)
        }
        return null
      })

      /**
       * 判断有没有视图操作的权限
       */ 
      function hasViewConfigAuth(){
        if(isLowApp.value===false){
          return false
        }
        return hasAdminAuth.value;
      }
      
      watch(routeCode, loadFirst, { immediate: true });

      // 第一次加载权限和视图信息
      async function loadFirst(){
        if(routeCode.value){
          // 支持传入视图ID 在第一次进入页面的时候直接跳转至特定的视图页面
          if(route.query.view){
            let viewId: string = route.query.view as string;
            activeKey.value = viewId;
          }
          await getFormAuth(route.params.appId, routeCode.value);
          await loadView();
        }
      }
      
      async function loadView(listViewId?) {
        pageLoading.value = true;
        if (!routeCode.value) {
          return;
        }
        const url = '/desform/view/list';
        let params = { code: routeCode.value };

        let res = await defHttp.get({ url, params }, {isTransformResponse: false});
        console.log('loadView', res);
        const { viewList, designForm, buttonList } = res.result;
        if(!designForm){
          if(timeoutHandle){
            clearTimeout(timeoutHandle)
          }
          emit('loadOk');
          return;
        }
        initViewList(viewList, listViewId);
        initColumnList(designForm);
        initButtonList(buttonList);
        desformName.value = designForm.desformName;
        initDesignFormTitleField(designForm);
        pageLoading.value = false;
        emit('loadOk');
      }
      
      /**
       * 获取标题字段
       */
      function initDesignFormTitleField(designForm) {
        let jsonStr = designForm.desformDesignJson;
        if (jsonStr) {
          let json = JSON.parse(jsonStr);
          if(json.config){
            if(json.config.titleField){
              designFormTitleField.value = json.config.titleField
            }
          }
        }
      }
      
      function initViewList(viewList, listViewId?) {
        let temp: any[] = [];
        let idList: any[] = [];
        //const refMap = {}
        let excludeViewIdList = excludeViewIds.value
        if (viewList) {
          for (let item of viewList) {
            // 视图查看权限判断
            if(excludeViewIdList && excludeViewIdList.indexOf(item.id)>=0){
              continue;
            }
            idList.push(item.id);
            let obj = {
              ...item,
            };
            if (listViewId) {
              if (item.id === listViewId) {
                obj['timestamp'] = new Date().getTime();
              }
            }
            temp.push(obj);
            multiViewRefMap[item.id] = ref(null);
          }
        }
        temp.sort(function (a, b) {
          return a.seq - b.seq;
        });
        let tempKey = activeKey.value;
        if (!tempKey || idList.indexOf(tempKey) < 0) {
          activeKey.value = temp[0].id;
        }
        if(isLowApp.value===false){
          viewConfigList.value = [temp[0]];
        }else{
          viewConfigList.value = temp;
        }
        //multiViewRefMap.value = refMap;
      }

      function isActiveTab(id) {
        if (activeKey.value == id) {
          return true;
        }
        return false;
      }

      function handleThrowEvent(record){
        emit('action-click', { ...record })
      }
      
      // 点击右侧图标触发
      function handleRightClick(flag, item) {
        console.log('handleRightClick', flag, item);
        if (flag == 1) {
          //打开配置
          openConfig(item);
        } else if (flag == 2) {
          //更改视图类型->表格
          updateViewType(item, 'base');
        } else if (flag == 3) {
          //更改视图类型->看板
          updateViewType2Card(item);
        } else if (flag == 4) {
          //更改视图类型->日历
          updateViewType2Calendar(item);
        } else if (flag == 5) {
          // 复制视图
          copyView(item);
        } else if (flag == 6) {
          // 删除视图
          removeView(item);
        } else if (flag == 8) {
          // 导出
          onExport(item);
        } else if (flag == 9) {
          // 导入
          onImportExcel();
        } else if (flag == 10) {
          // 查看回收站
          showRecycleData();
        }
      }
      
      function removeView(item) {
        // QQYUN-4319【应用】视图 全部 不可删除
        if(item.name === '全部'){
          return;
        }
        const url = '/desform/view/removeView';
        let params = { id: item.id };
        defHttp.get({ url, params }, { isTransformResponse: false }).then((res) => {
          if (res.success) {
            let arr = viewConfigList.value;
            if (arr.length > 0) {
              loadView(arr[0].id);
            }
          }
        });
      }

      function copyView(item) {
        const url = '/desform/view/copyView';
        let params = { id: item.id };
        defHttp.get({ url, params }, { isTransformResponse: false }).then((res) => {
          if (res.success) {
            loadView(res.result);
          }
        });
      }

      function updateViewType(item, type) {
        const url = '/desform/view/updateViewConfig';
        let params = {
          id: item.id,
          type,
        };
        defHttp.put({ url, params }, { isTransformResponse: false }).then((res) => {
          if (res.success) {
            loadView(item.id);
          }
        });
      }

      function updateViewType2Card(item) {
        openFieldSelectModal(true, {
          columnList: columnList.value,
          code: routeCode.value,
          id: item.id,
        });
      }

      function updateViewType2Calendar(item) {
        openDateSelectModal(true, {
          columnList: columnList.value,
          code: routeCode.value,
          id: item.id,
        });
      }

      function openConfig(item) {
        if (item.type == 'card') {
          openCardConfigDrawer(true, {
            myTitle: item.name,
            columnList: columnList.value,
            id: item.id,
            config: {
              ...item,
            },
          });
        } else if (item.type == 'calendar') {
          openCalendarConfigDrawer(true, {
            myTitle: item.name,
            columnList: columnList.value,
            id: item.id,
            config: {
              ...item,
            },
          });
        } else {
          openBaseConfigDrawer(true, {
            myTitle: item.name,
            columnList: columnList.value,
            id: item.id,
            config: {
              ...item,
            },
          });
        }
      }

      const [registerBaseConfigDrawer, { openDrawer: openBaseConfigDrawer, closeDrawer: closeBaseConfigDrawer }] = useDrawer();
      const [registerCardConfigDrawer, { openDrawer: openCardConfigDrawer, closeDrawer: closeCardConfigDrawer }] = useDrawer();
      const [registerCalendarConfigDrawer, { openDrawer: openCalendarConfigDrawer, closeDrawer: closeCalendarConfigDrawer }] = useDrawer();

      /**
       * 添加视图
       * @param e
       * @param type
       */
      async function addView(e, type) {
        prevent(e);
        const url = '/desform/view/addView';
        let params = {
          type,
          code: routeCode.value,
        };
        let res = await defHttp.post({ url, params }, { isTransformResponse: false });
        console.log('addView', res);
        if (res.success) {
          let id = res.result;
          await loadView(id);
          activeKey.value = id;
        } else {
          console.error(res.message);
        }
      }

      function prevent(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const [registerFieldSelectModal, { openModal: openFieldSelectModal }] = useModal();
      const [registerModal, { openModal: openDateSelectModal }] = useModal();
      function openSelectModal(e) {
        prevent(e);
        openFieldSelectModal(true, {
          columnList: columnList.value,
          code: routeCode.value,
        });
      }

      function openCalendarSelectModal(e) {
        prevent(e);
        openDateSelectModal(true, {
          columnList: columnList.value,
          code: routeCode.value,
        });
      }

      async function onAddCardView(id) {
        await loadView(id);
        activeKey.value = id;
      }
      async function onAddCalendarView(id) {
        await loadView(id);
        activeKey.value = id;
      }

      async function onChangeTab() {
        await closeBaseConfigDrawer();
        await closeCardConfigDrawer();
        await closeCalendarConfigDrawer();

        let arr = viewConfigList.value;
        for (let item of arr) {
          if (activeKey.value === item.id) {
            item.timestamp = new Date().getTime();
          }
        }
      }

      /**
       * 高级查询条件
       * @param data
       */
      const mySuperQuery = reactive({
        matchType: '',
        superQueryParams: '',
      });
      function onExecuteSuperQuery(data) {
        console.log('onExecuteSuperQuery', data);
        Object.keys(mySuperQuery).map((k) => {
          mySuperQuery[k] = data[k];
        });
      }
      
      const viewLeftDrawerRef = ref();
      function openLeftViewDrawer(e) {
        prevent(e);
        viewLeftDrawerRef.value.open(activeKey.value);
        // update-begin--author:liaozhiyang---date:20231218---for：【QQYUN-6366】升级到antd4.x
        rootElemOverflow.value = 'hidden';
        // update-end--author:liaozhiyang---date:20231218---for：【QQYUN-6366】升级到antd4.x
      }

      
      watch(()=>props.routeInfo, (info)=>{
        if(info){
          let buttonLabel:any = info.buttonLabel;
          if(buttonLabel){
            addButtonLabel.value = buttonLabel||'记录';
          }
          if(info.importFlag){
            // 开启上传
            console.log('上传走》》》')
            onImportExcel();
          }
          if(info.recycleFlag){
            console.log('回收站》》》')
            showRecycleData();
          }
        }
      }, {deep: true, immediate: true});

      function initPageLoading() {
        pageLoading.value = true;
        timeoutHandle = setTimeout(()=>{
          pageLoading.value = false
        }, 3000);
      }

      /**
       * 左侧视图列表点击可以切换实际的视图展示
       * @param viewId
       */
      function onChangeLeftView(viewId) {
        activeKey.value = viewId
        onChangeTab();
      }

       /**
       * 左侧视图列表关闭
       * @param viewId
       */
      function onCloseLeftView() {
        rootElemOverflow.value = 'visible';
      }

      const outerHeight = ref(100)
      // update-begin--author:liaozhiyang---date:20240531---for：【TV360X-672】当有筛选列表时小屏幕上会右侧出现滚动条
      outerHeight.value = window.innerHeight - (isLowApp && isLowApp.value ? 50 + 40 : 60 + 50);
      // update-end--author:liaozhiyang---date:20240531---for：【TV360X-672】当有筛选列表时小屏幕上会右侧出现滚动条

      
      
      
      // 注册 导出弹窗
      const [registerExportModal, { openModal: openExportModal }] = useModal();
      async function onExport(item) {
        //openExportModal
        console.log('onExport',item, )
        let inst = getViewInst(item.id);
        let info = await inst.getTableColumns();
       // info.name = desformName.value+'_'+info.viewName;
        info.designFormCode = routeCode.value;
        info.designFormViewName = info.viewName;
        openExportModal(true, {
          info
        })
      }
      // 注册 导入弹窗
      const importRef = ref()
      function onImportExcel() {
        let info = {
          columns: columnList.value,
          code: routeCode.value,
          desformName: desformName.value,
        }
        if(importRef.value){
          importRef.value.onImportExcel(info)
        }
      }
      function onImportOk() {
        onReload();
      }
      
      function getViewInst(viewId) {
        let refs = multiViewRefMap[viewId];
        if(refs.value){
          let instance = refs.value;
          if (instance instanceof Array) {
            instance = instance[0];
          }
          return instance;
        }else{
          if (refs instanceof Array) {
            return refs[0];
          }
        }
        return refs;
      }

      // 按钮权限
      const buttonsAuth = ref<Recordable>({
        add: true,
        superQuery: true,
        customColumn: true,
      });

      // 监听按钮权限变化
      function onButtonsAuthChange(auth) {
        // 添加按钮是否显示
        buttonsAuth.value = auth
      }

      /**
       * 基础列表选中导出
       * @param info
       */
      function onBaseListExport(info) {
        openExportModal(true, {
          info
        })
      }

      //回收站弹窗
      const [registerRecycleModal, { openModal: openRecycleModal }] = useModal();
      function showRecycleData() {
        openRecycleModal(true, {
          code: routeCode.value
        });
      }
      
      // QQYUN-4462【视图】全部不能删除，给个提示 全部视图不支持删除 或直接把删除删除视图不显示
      function isShowDeleteAction(item) {
        if(item.name == '全部'){
          return false
        }
        return true;
      }

      return {
        activeKey,
        onChangeTab,
        isActiveTab,
        handleRightClick,
        routeCode,
        viewConfigList,
        currentDynamicConfig,
        registerBaseConfigDrawer,
        columnList,
        loadView,
        activeConfig,
        addView,
        showCreateBtn,
        showComment,
        showFiles,
        showDataLog,
        buttonsAuth,
        isShareRecordView,

        openSelectModal,
        registerFieldSelectModal,
        onAddCardView,
        registerCardConfigDrawer,
        registerModal,
        onAddCalendarView,
        openCalendarSelectModal,
        registerCalendarConfigDrawer,

        onReload,
        onAdd,
        registerDataModal,
        onSuccess,
        globalKeyword,
        onSearch,
        showSearchInput,
        onSearchInputBlur,
        onSearchInputFocus,
        onButtonsAuthChange,
        searchInputRef,
        mySuperQuery,
        onExecuteSuperQuery,
        handleThrowEvent,
        defaultFormData,
        setFormData,
        desformName,
        isLowApp,
        pageLoading,
        addButtonLabel,
        viewLeftDrawerRef,
        openLeftViewDrawer,
        outerHeight,
        removeView,
        copyView,
        onChangeLeftView,
        hasAdminAuth,
        hasAuth,
        operationAuth,
        hasViewConfigAuth,
        onSearchValueChange,
        registerExportModal,
        multiViewRefMap,
        importRef,
        onImportOk,
        onBaseListExport,
        registerRecycleModal,
        isShowDeleteAction,
        rootElemOverflow,
        onCloseLeftView,
      };
    },
  });
</script>

<style lang="less">
  .abc .ant-tabs-nav > div .ant-tabs-tab:first-child {
    /*    margin-right: 0;
        padding-bottom: 0;
        font-size: 10px;*/
  }
  .abc .ant-tabs-nav {
    margin: 0;
    .ant-tabs-tab-active {
      /* padding-right: 6px !important;*/
      padding-left: 18px;
    }
    .ant-tabs-extra-content {
      line-height: 10px;
    }
    .ant-tabs-nav-list {
      .ant-tabs-tab {
        padding-top: 0;
        padding-bottom: 0;
        .ant-tabs-tab-btn {
          height: 36px;
          line-height: 36px;
        }
      }
    }
  }

  .multi-view-list .ant-card-body {
    padding: 10px;
  }

  .multi-view-list .ant-dropdown-menu-item,
  .ant-dropdown-menu-submenu-title {
    padding-top: 7px;
    padding-bottom: 7px;
  }

  .multi-view-list .drawer-icon{
    display: inline-block;
    padding: 3px;
    
    .ant-dropdown-link{
      &:hover{
        background: #f5f5f5;
        color: #0a8fe9;
      }
    }
  }

  .multi-view-list 
  /**tab右侧图标*/
  .tab-right-operations {
    display: flex;
    padding-right: 20px;
    .item {
      margin: 0px;
      font-size: 18px;
      cursor: pointer;
      color: #555;
      &:hover {
        color: #2196f3;
      }
      .anticon-search {
        font-size: 19px;
      }
      > span {
        padding: 10px;
      }

      .my-add-button {
        padding: 0 10px !important;
        margin-top: 2px;
        // update-begin--author:liaozhiyang---date:20231220---for：【QQYUN-7675】antd4兼容改造，点击记录图标会错乱
        display: flex;
        align-items: center;
        .anticon-plus {
          font-size: 18px;
          font-weight: bolder;
        }
        span {
          margin-inline-start:0;
        }
        // update-end--author:liaozhiyang---date:20231220---for：【QQYUN-7675】antd4兼容改造，点击记录图标会错乱
      }
    }
    .global-search-div {
      height: 39px;
      line-height: 39px;
      margin-right: 5px;
      .my-input {
        height: 28px;
        line-height: 28px;
        border-radius: 16px;
        padding: 0 10px;
        width: 180px;
        .ant-input-prefix {
          font-size: 16px;
          margin-right: 6px;
        }
        .anticon-close-circle {
          font-size: 16px;
        }
      }
    }
  }


  /*配置弹窗通用样式 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ== */
  .view-config-drawer{
    &.jeecg-basic-drawer{
      top: 100px !important;
      &.inner-low-app{
        top: 50px !important;
      }
      // update-begin--author:liaozhiyang---date:20240603---for：【TV360X-804】视图配置页面对齐敲敲云
      &.inner-vue3-app {
        top: 60px !important;
      }
      // update-end--author:liaozhiyang---date:20240603---for：【TV360X-804】视图配置页面对齐敲敲云
      .ant-drawer-body{
        .scrollbar__wrap{
          padding: 0 !important;
        }
      }
    }

    .ant-drawer-header{
      padding-right: 0 !important;
    }
    .ant-drawer-title{
      position: relative;
      .title-close-icon{
        color: #9e9e9e;
        position: absolute;
        right: 0px;
        top: -8px;
        font-size: 18px;
        font-weight: bolder;
        &:hover{
          color: #2196f3;
        }
        .anticon-close{
          padding: 15px 20px 15px 15px
        }
      }
    }
  }
</style>
<style lang="less" scoped>
  // update-begin--author:liaozhiyang---date:20240407---for：【QQYUN-8742】低代码下改成按钮
  .dataList-root {
    .ant-tabs {
      ::v-deep(.ant-tabs-ink-bar) {
        display: none;
      }
    }
  }
  .settingBtn {
    position: relative;
    font-size: 16px;
    color: @text-color-base;
    &:hover {
      color: @primary-color;
    }
    .design-view-right-icon {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      opacity: 0;
    }
  }
  // update-end--author:liaozhiyang---date:20240407---for：【QQYUN-8742】低代码下改成按钮
</style>
