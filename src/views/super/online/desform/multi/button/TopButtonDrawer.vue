<template>
  <a-drawer
    :width="500"
    placement="top"
    :getContainer="getContainer"
    :open="topTipVisible"
    :root-style="{ position: 'absolute' }"
    :contentWrapperStyle="{ overflow: 'hidden' }"
    :bodyStyle="{ padding: 0 }"
    :headerStyle="{ padding: 0, overflow: 'hidden' }"
    :height="drawerHeight"
    :closable="false"
    :mask="false"
    destroyOnClose
    @close="topTipVisible = false"
    :keyboard="false"
  >
    <template #title>
      <div style="height: 0"></div>
    </template>
    <div :class="['top-drawer-body', {'hide-button': !showFooterButton}]">
      <div style="display: flex">
        <div style="height: 42px; line-height: 40px; color: #333; font-size: 17px; font-weight: 700; margin-left: 12px">
          已选择 {{ selectedRowKeys.length }} 条记录
        </div>
        <div style="margin-left: 10px;height: 42px; line-height: 40px;">
          <a-button type="text" ghost style="padding: 0 10px" @click="onClearSelect">
            <Icon icon="ant-design:close-square-outlined"/>
            <span style="margin-left: 4px;">取消选中</span>
          </a-button>
        </div>
      </div>
     
      <div v-if="isLowApp" class="top-drawer-footer-buttons">
        <div v-if="hasBatchEdit && operationAuth.update">
          <a-button type="text" style="padding: 0 10px" @click="onUpdate">
            <Icon icon="ant-design:edit-outlined" />
            <span style="margin-left: 4px">编辑</span>
          </a-button>
        </div>
        <div v-if="hasBatchEdit && operationAuth.copy" style="margin-left: 5px">
          <a-button type="text" style="padding: 0 10px" @click="onBatchCopy">
            <Icon icon="ant-design:copy-outlined" />
            <span style="margin-left: 4px">复制</span>
          </a-button>
        </div>

<!-- update-begin-author:sunjianlei date:20230420 for: 【QQYUN-4617】屏蔽打印功能 ---
        <div style="margin-left: 5px" v-if="hasBatchPrint && operationAuth.print">
          <a-dropdown :overlayStyle="{ width: '120px' }">
            <template #overlay>
              <a-menu>
                <a-menu-item key="1">打印二维码</a-menu-item>
                <a-menu-item key="2">打印条形码</a-menu-item>
              </a-menu>
            </template>
            <a-button type="text" style="padding: 0 10px">
              <Icon icon="ant-design:printer-outlined" />
              <span style="margin-left: 4px">打印</span>
              <Icon style="margin-left: 2px" icon="ant-design:down-outlined" :size="14" />
            </a-button>
          </a-dropdown>
        </div>
--- update-end-author:sunjianlei date:20230420 for: 【QQYUN-4617】屏蔽打印功能 --->

        <div style="margin-left: 5px" v-if="hasBatchExport && operationAuth.export">
          <a-button type="text" style="padding: 0 10px" @click="onExport">
            <Icon icon="ant-design:download-outlined" />
            <span style="margin-left: 4px">导出</span>
          </a-button>
        </div>
        <div style="margin-left: 5px" v-if="hasBatchRemove && operationAuth.delete">
          <a-button type="text" style="padding: 0 10px" @click="onDelete">
            <Icon icon="ant-design:delete-outlined" color="#ff6d6c" />
            <span style="margin-left: 4px; color: #ff6d6c">删除</span>
          </a-button>
        </div>

        <template v-if="hasBatchCustomButton" v-for="button in customButtonList">
          <div style="margin-left: 5px" v-if="operationAuth[button.id]">
            <a-button type="text" style="padding: 0 10px" @click="onCustomButtonBatch(button)">
              <Icon :icon="button.icon" :color="button.color"/>
              <span style="margin-left: 4px;">
                {{ button.label }}
              </span>
            </a-button>
          </div>
        </template>

      </div>
     <!-- vue3  -->
      <div v-else class="top-drawer-footer-buttons">
        <div v-if="hasBatchEdit && operationAuth.update && buttonsAuth?.edit">
          <a-button type="text" style="padding: 0 10px" @click="onUpdate">
            <Icon icon="ant-design:edit-outlined" />
            <span style="margin-left: 4px">编辑</span>
          </a-button>
        </div>
        <div v-if="hasBatchEdit && operationAuth.copy  && buttonsAuth?.add" style="margin-left: 5px">
          <a-button type="text" style="padding: 0 10px" @click="onBatchCopy">
            <Icon icon="ant-design:copy-outlined" />
            <span style="margin-left: 4px">复制</span>
          </a-button>
        </div>
        <div style="margin-left: 5px" v-if="hasBatchExport && operationAuth.export && buttonsAuth?.export">
          <a-button type="text" style="padding: 0 10px" @click="onExport">
            <Icon icon="ant-design:download-outlined" />
            <span style="margin-left: 4px">导出</span>
          </a-button>
        </div>
        <div style="margin-left: 5px" v-if="hasBatchRemove && operationAuth.delete && buttonsAuth?.delete">
          <a-button type="text" style="padding: 0 10px" @click="onDelete">
            <Icon icon="ant-design:delete-outlined" color="#ff6d6c" />
            <span style="margin-left: 4px; color: #ff6d6c">删除</span>
          </a-button>
        </div>

        <template v-if="hasBatchCustomButton" v-for="button in customButtonList">
          <div style="margin-left: 5px" v-if="operationAuth[button.id]">
            <a-button type="text" style="padding: 0 10px" @click="onCustomButtonBatch(button)">
              <Icon :icon="button.icon" :color="button.color"/>
              <span style="margin-left: 4px;">
                {{ button.label }}
              </span>
            </a-button>
          </div>
        </template>

      </div>
      <div class="top-drawer-footer-icons">
        <a-tooltip title="刷新视图">
          <Icon icon="ant-design:reload-outlined" class="top-drawer-reload-icon" :size="18"  @click="onReload"/>
        </a-tooltip>
      </div>
    </div>
  </a-drawer>
  
  <BatchUpdateModal @ok="doUpdate" :tableColumns="tableColumns" :designFormCode="designFormCode"  @register="registerModal"/>
</template>

<script lang="ts">
  import { defineComponent, h, ref, watch, reactive, computed, PropType } from 'vue';
  import { useLowAppAuthStore } from '/@/store/modules/lowAppAuth';
  import { useActionAuth } from '../../auto/hooks/useAuth'
  import {useMessage} from "/@/hooks/web/useMessage";
  import BatchUpdateModal from '../actionModal/BatchUpdateModal.vue'
  import { useModal } from '/@/components/Modal';
  import { defHttp } from '/@/utils/http/axios';
  import { useRoute } from 'vue-router';
  import { useFuncSwitch } from "/@/hooks/jeecg/desform/useFuncSwitch";
  import {useComponentCondition} from "../ts/useFilterField";
  import {frozenBatch} from "/@/views/system/user/user.api";
  import {useUserStore} from "/@/store/modules/user";
  import { getIsLowAppEnv } from '/@/utils/super/low/lowAppUtils';
  //按钮权限类型
  type ButtonAuthProps = { add?: boolean; export?: boolean; batchAction?: boolean; edit?: boolean; delete?: boolean };
  export default defineComponent({
    name: 'TopButtonDrawer',
    props: {
      selectedRowKeys: {
        type: Array,
        default: () => [],
      },
      selectedRows: {
        type: Array,
        default: () => [],
      },
      designButtonList:{
        type: Array,
        default: () => [],
      },
      designFormCode: {
        type: String,
        default: '',
      },
      viewId: {
        type: String,
        default: '',
      },
      tableColumns: {
        type: Array,
        default: () => [],
      },
      dynamicConfig: {
        type: Object,
        default: ()=>{}
      },
      buttonsAuth: {
        type: Object as PropType<ButtonAuthProps>,
        default: () => {},
      },
    },
    components:{
      BatchUpdateModal
    },
    emits:['delete', 'success', 'export', 'clear', 'reload'],
    setup(props, {emit}) {
      const route = useRoute();
      const userStore = useUserStore();
      const startProcessUrl = '/act/designer/miniDesFlow/api/buttonStartProcess';
      const { createInfoModal, createMessage, createConfirm, createConfirmSync } = useMessage();
      const buttonIdList = ref<string[]>([]);
      const customButtonList = ref<any[]>([]);
      const { ifTrue, ifGroupTrue } = useComponentCondition();
      const authStore = useLowAppAuthStore();
      const hasAdminAuth = ref(false);
      hasAdminAuth.value = authStore.getLowAppAdminAuth();
      const operationAuth = reactive<any>({
        update: true,
        copy: true,
        print: true,
        export: true,
        delete: true,
      });
      const { hasUpdateAuth, hasDeleteAuth } = useActionAuth();
      // 使用功能开关
      const {getHasFunc} = useFuncSwitch()
      const hasBatchEdit = getHasFunc('BATCH_EDIT')
      const hasBatchPrint = getHasFunc('BATCH_SYS_PRINT')
      const hasBatchExport = getHasFunc('BATCH_EXPORT')
      const hasBatchRemove = getHasFunc('BATCH_REMOVE')
      const hasBatchCustomButton = getHasFunc('BATCH_CUSTOM_BUTTON')

      // 是否显示底部按钮，包括编辑、打印和自定义按钮等
      const showFooterButton = computed(() => {
        if (hasBatchEdit.value && operationAuth.update) {
          return true;
        }
        if (hasBatchEdit.value && operationAuth.copy) {
          return true;
        }

/* update-begin-author:sunjianlei date:20230420 for: 【QQYUN-4617】屏蔽打印功能
        if (hasBatchPrint.value && operationAuth.print) {
          return true;
        }
   update-end-author:sunjianlei date:20230420 for: 【QQYUN-4617】屏蔽打印功能 */

        if (hasBatchExport.value && operationAuth.export) {
          return true;
        }
        if (hasBatchRemove.value && operationAuth.delete) {
          return true;
        }
        // noinspection RedundantIfStatementJS
        if( hasBatchCustomButton.value && customButtonList.value.length > 0) {
          return true;
        }
        return false;
      });

      // 动态调整抽屉高度
      const drawerHeight = computed(() => {
        return showFooterButton.value ? 91 : 54;
      });
      // 是否低代码
      const isLowApp = computed(() => {
        return getIsLowAppEnv();
      });

      const topTipVisible = ref(false);
      watch(
        () => props.selectedRowKeys,
        (keys) => {
          if (keys && keys.length > 0) {
            topTipVisible.value = true;
            let hasAdmin = authStore.getLowAppAdminAuth();
            if (hasAdmin == true) {
              Object.keys(operationAuth).map((k) => {
                operationAuth[k] = true;
              });
            } else {
              let formCode = props.designFormCode;
              let operations = authStore.getOperationAuth(formCode);
              operationAuth.print = operations['print_record'];
              operationAuth.export = operations['export_table'];
              operationAuth.update = hasUpdateAuth(formCode, props.viewId, props.selectedRows);
              operationAuth.delete = hasDeleteAuth(formCode, props.viewId, props.selectedRows);
              operationAuth.copy = operationAuth.update;
            }
            rowChangeInitCustomButtons();
          } else {
            topTipVisible.value = false;
          }
        },
        { deep: true, immediate: true }
      );

      /**
       * 选中数据改变-自定义按钮显示也跟着变
       */
      function rowChangeInitCustomButtons() {
        let list = getBatchRowCustomButtons();
        if(list && list.length){
          for(let item of list){
            operationAuth[item.id] = showButton(item, props.selectedRows);
          }
        }
        customButtonList.value = list;
      }

      /**
       * 根据选中的记录 判断自定义按钮（带筛选条件的按钮）显示状态
       * @param config
       * @param records
       */
      function showButton(config, records): boolean {
        if (config.showStatus === 'condition') {
          let flag = false;
          for(let record of records){
            const { conditionList, conditionsGroup, conditionType } = config;
            // 【QQYUN-6168】自定义按钮筛选支持设置分组
            if (Array.isArray(conditionList) && conditionList.length > 0) {
              // 如果有老的单分组条件，则走老判断逻辑
              flag = ifTrue(conditionList, conditionType, record);
            } else {
              // 否则走新的多分组条件
              flag = ifGroupTrue(conditionsGroup, conditionType, record);
            }
            if (flag === true) {
              break;
            }
          }
          return flag;
        }
        return true;
      }

      function getContainer() {
        let isLowApp = route.meta.lowApp;
        if(isLowApp === true){
          return document.getElementById('low_app_page_content');
        }else{
          return document.querySelector('.jeecg-default-layout-main')
        }
      }

      function hasAuth(key) {
        let adminAuth = authStore.getLowAppAdminAuth();
        if (adminAuth === true) {
          return true;
        }
        return operationAuth[key];
      }
      
      function onDelete() {
        createInfoModal({
          title: ()=>{
            return h('span', {
              style: {
                'color': 'rgb(244, 67, 54)',
                'font-size': '17px'
              }
            }, '批量删除记录')
          },
          content: '60天内可在 回收站 内找回已删除记录, 无删除权限的数据无法删除',
          width: 480,
          okText: '确定',
          icon: ' ',
          okButtonProps:{ danger: true },
          cancelText: '取消',
          okCancel: true,
          onOk: function () {
            doDelete();
          },
          onCancel:function () {
          }
        });
      }

      // 注册编辑弹窗
      const [registerModal, { openModal, closeModal }] = useModal();

      function onUpdate() {
        openModal(true, {})
      }
      
      async function doUpdate(info) {
        console.log('doupdate', info);
        let ids = props.selectedRowKeys;
        const url = '/desform/data/batchUpdate';
        // 原系统后端操作没有appId 默认传-1
        let appId = route.params.appId || '-1' 
        let params = {
          ...info,
          idList: ids,
          appId: appId,
          designFormCode: props.designFormCode,
          authType: 'update'
        };

        const data = await defHttp.put({ url, params}, { isTransformResponse: false });
        console.log('批量编辑结果', data)
        if(data.success){
          createMessage.success(data.message);
          emit('success')
        }else{
          createMessage.error(data.message);
        }
        closeModal();
      }
      
      async function doDelete() {
        const url = '/desform/data/batchDelete';
        let ids = props.selectedRowKeys;
        // 原系统后端操作没有appId 默认传-1
        let appId = route.params.appId || '-1';
        let params = {
          idList: ids,
          appId: appId,
          designFormCode: props.designFormCode,
          authType: 'delete'
        };
        const data = await defHttp.put({ url, params}, { isTransformResponse: false });
        console.log('批量删除结果', data)
        if(data.success){
          createMessage.success(data.message);
          emit('success')
        }else{
          createMessage.error(data.message);
        }
        closeModal();
      }
      
      // 导出事件
      function onExport() {
        emit('export')
      }
      
      // 清空选中
      function onClearSelect() {
        emit('clear')
      }

      // 批量复制
      async function onBatchCopy() {
        const { designFormCode, selectedRowKeys } = props;
        if (!selectedRowKeys || selectedRowKeys.length === 0) {
          createMessage.warning('请先选择要复制的数据');
          return;
        }
        const url = `/desform/data/${designFormCode}/copyRecords`;
        try {
          const flag = await createConfirmSync({
            title: '复制',
            content: `确定要复制这${selectedRowKeys.length}条数据吗？`,
          });
          if (!flag) {
            return;
          }
          await defHttp.put(
            {
              url: url,
              params: {
                ids: selectedRowKeys,
              },
            },
            { joinParamsToUrl: true }
          );
          emit('success')
        } catch (e) {
          console.error(e);
        }
      }

      //---------------------------------自定义按钮批量--------------------------------
      watch(
      () => props.dynamicConfig,
      () => {
        let config = props.dynamicConfig;
        //获取当前视图的按钮id
        let idList: string[] = config.buttonList || [];
        buttonIdList.value = idList;
      },
      { immediate: true, deep: true }
    );
      
      /**
       * 判断自定义按钮是否授权
       */ 
      function isValidButton(hasAdminAuth, operationAuth, buttonId) {
        if(hasAdminAuth===true){
          return true;
        }
        if(Object.keys(operationAuth).indexOf(buttonId)<0){
          return true;
        }
        return operationAuth[buttonId];
      }

      /**
       * 获取自定义按钮集合
       */
      function getBatchRowCustomButtons() {
        let list:any[] = props.designButtonList;
        let result:any[] = [];
        let hasAdminAuth = authStore.getLowAppAdminAuth();
        let operationAuth = authStore.getCustomButtonAuth(props.designFormCode);

        // 当前视图的按钮id
        let idList: string[] = buttonIdList.value;
        // 筛选出全局按钮
        let allViewButtons: Recordable[] = list.filter((btn) => btn.allView === true);
        // 如果没有全局按钮也没有当前视图的按钮，直接返回空数组
        if(idList.length === 0 && allViewButtons.length === 0) {
          return [];
        }
        if(allViewButtons && allViewButtons.length>0){
          for(let button of allViewButtons){
            if (button.clickThen === 'form'){
              // 批量的按钮 不支持填写操作
              continue;
            }
            if (isValidButton(hasAdminAuth, operationAuth, button.id) === false) {
              continue;
            }
            result.push({
              ...button
            })
          }
        }

        for (let button of list) {
          if (idList.indexOf(button.id) >= 0) {
            if (button.clickThen === 'form'){
              // 批量的按钮 不支持填写操作
              continue;
            }
            if (isValidButton(hasAdminAuth, operationAuth, button.id) === false) {
              continue;
            }
            result.push({
              ...button
            })
          }
        }
        result.sort(function (a, b) {
          return b.seq - a.seq;
        });
        return result;
      }

     
      
      /**
       * 点击自定义按钮执行
       */
      function onCustomButtonBatch(item) {
        if (item.clickThen === 'confirm') {
          // 需要确认
          const { tip, ok, cancel } = item.confirmText;
          createConfirm({
            iconType: 'warning',
            title: tip,
            okText: ok,
            cancelText: cancel,
            onOk: async () => {
              batchExecuteFlow(item)
            },
          });
        }else if (item.clickThen === 'form') {
          console.error('自定义按钮暂不支持批量编辑表单')
        }else{
          batchExecuteFlow(item)
        }
      }

      /**
       * 点击自定义按钮 批量触发流程
       * @param record
       * @param processId
       */
      async function batchExecuteFlow(buttonConfig) {
        let processId = buttonConfig.processId
        if(processId){
          let ids = getExecuteDataIds(buttonConfig);
          console.error('执行流程的数据ID', ids)
          let errors:any[] = [];
          if(ids && ids.length>0){
            for(let i=0;i<ids.length;i++){
              const error = await executeFlow(processId, ids[i]);
              if(error){
                errors.push(error)
              }
            }
          }
          if(errors.length>0){
            createMessage.error(errors.join(";"));
          }else{
            createMessage.success("操作成功！");
            emit('success')
          }
        }else{
          createMessage.warn('未配置流程！')
        }
        // 操作后无论如何都刷新一遍列表
        emit('reload')
      }


      /**
       * 获取可以提交流程的数据ID
       * @param config
       */
      function getExecuteDataIds(config){
        let records:any[] = props.selectedRows;
        let ids:any[] = []
        if (config.showStatus === 'condition') {
          for(let record of records){
            const { conditionList, conditionsGroup, conditionType } = config;
            let flag = false
            // 【QQYUN-6168】自定义按钮筛选支持设置分组
            if (Array.isArray(conditionList) && conditionList.length > 0) {
              // 如果有老的单分组条件，则走老判断逻辑
              flag = ifTrue(conditionList, conditionType, record);
            } else {
              // 否则走新的多分组条件
              flag = ifGroupTrue(conditionsGroup, conditionType, record);
            }
            if (flag === true) {
              ids.push(record.id)
            }else{
              // 该记录无操作权限
            }
          }
        }else{
          ids = records.map(item=>item.id)
        }
        return ids;
      }

      /**
       * 发起流程
       * @param processId
       * @param dataId
       */
      async function executeFlow(processId, dataId) {
        let params = {
          processId,
          dataId,
          formKey: props.designFormCode,
          applyUserId: userStore.getUserInfo.username
        }
        const data = await defHttp.post({ url: startProcessUrl, params }, {joinParamsToUrl: true, isTransformResponse: false });
        console.log('触发流程>', params, data);
        if(data.success){
          return ''
        }else{
          return data.message;
        }
      }

      /**
       * 批量弹窗右侧的刷新事件
       * @param e
       */
      function onReload(e){
        e.preventDefault();
        e.stopPropagation();
        emit('reload')
      }
      
      return {
        topTipVisible,
        getContainer,
        drawerHeight,

        hasBatchEdit,
        hasBatchPrint,
        hasBatchExport,
        hasBatchRemove,
        hasBatchCustomButton,
        showFooterButton,

        hasAuth,
        operationAuth,
        onDelete,
        registerModal,
        onUpdate,
        doUpdate,
        onExport,
        onBatchCopy,
        onClearSelect,
        customButtonList,
        onCustomButtonBatch,
        onReload,

        isLowApp
      };
    },
  });
</script>

<style scoped lang="less">
  .top-drawer-reload-icon {
    cursor: pointer;
    color: #9e9e9e;
    :hover {
      color: #1e88e5;
    }
  }

  .top-drawer-body {
    height: 90px;
    padding: 8px;
    display: flex;
    flex-direction: column;

    &.hide-button {
      height: 50px;

      .top-drawer-footer-buttons {
        display: none;
      }
    }

    .top-drawer-footer-buttons {
      height: 42px;
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-left: 10px;
    }

    .top-drawer-footer-icons {
      width: 50px;
      position: absolute;
      right: 0;
      bottom: 10px;
    }
  }

</style>
<style>
  /* 选中列表顶部弹出按钮 */
  .jeecg-default-layout-main{
    position: relative;
  }
</style>
