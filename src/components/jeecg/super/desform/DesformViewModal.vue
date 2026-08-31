<template>
  <BasicModal
    ref="modalRef"
    :title="modalTitle"
    :width="modalWidth"
    :height="800"
    :enableComment="enableComment"
    :loading="loading"
    :style="{ top: 0, padding: 0 }"
    :bodyStyle="modalBodyStyle"
    :canFullscreen="canFullscreen"
    :mask="mask"
    :keyboard="keyboard"
    destroyOnClose
    :draggable="false"
    :maskClosable="false"
    :closeFunc="handleCloseFunc"
    :wrapClassName="`${prefixCls}-wrapper`"
    :defaultFullscreen="isFullscreen"
    v-bind="$attrs"
    @ok="onSubmit"
    @cancel="onCancel"
    @register="registerModal"
  >
    <template #title>
      <div :class="[`${prefixCls}-custom-header`]">
        <div class="left-content">
          <span v-if="isAdd" style="font-weight: normal">{{ modalTitle }}</span>
          <div v-if="!isAdd" class="header-icon-btns" style="margin-right: 20px">
            <a-tooltip v-if="showSwitchBtn" title="上一条记录" placement="left">
              <Icon icon="ant-design:up" :class="[{ disabled: disableUp }]" @click="onGotoUp" />
            </a-tooltip>
            <a-tooltip v-if="showSwitchBtn" title="下一条记录">
              <Icon icon="ant-design:down" :class="[{ disabled: disableDown }]" @click="onGotoDown" />
            </a-tooltip>
            <a-tooltip title="刷新记录">
              <Icon icon="ant-design:reload" @click="onGotoReload" />
            </a-tooltip>
          </div>
          <a-space v-if="isEditMode && !hideCustomButton" class="custom-button-box">
            <!-- begin 下面是根据配置渲染的按钮 -->
            <template v-for="button in customButtonList">
              <a-tooltip :title="button.tooltip">
                <a-button
                  :disabled="loading"
                  :style="{
                    'background-color': button.iconColor,
                    border: 'none',
                    outline: 'none',
                  }"
                  @click="(...args) => onCustomButtonClick(args, button)"
                >
                  <Icon :icon="button.icon" color="white" />
                  <span style="color: white">
                    {{ button.label }}
                  </span>
                </a-button>
              </a-tooltip>
            </template>
            <!-- end 上面是根据配置渲染的按钮 -->
          </a-space>
        </div>
        <div class="right-content">
          <a-space>
            <!-- 手工加按钮，可以加在这下面 -->
            <!-- <a-button
              :style="{
                'background-color': '#1890ff',
                border: 'none',
                outline: 'none',
              }"
              @click=""
            >
              <Icon icon="ant-design:swap" color="white" />
              <span style="color: white">转审?</span>
            </a-button>-->
          </a-space>
          <div class="header-icon-btns">
            <a-dropdown v-if="!isAdd" :trigger="['click']" placement="bottom" :overlayClassName="`${prefixCls}-header-more-dropdown`">
              <Icon icon="ep:more-filled" />
              <template #overlay>
                <a-menu @click="">
                  <a-menu-item v-if="showRecordShare && lowAppId && hasButtonAuth('share_record')" @click="onShare">
                    <Icon icon="ant-design:share-alt" />
                    <span>分享</span>
                  </a-menu-item>
                  <a-menu-item v-if="!inlineMode && isEditMode && showRecordCopy" @click="onCopy">
                    <Icon icon="ant-design:copy" />
                    <span>复制</span>
                  </a-menu-item>
                  <a-menu-item v-if="showPrinter && showRecordSysPrint && hasButtonAuth('print_record')" @click="onPrinter">
                    <Icon icon="ant-design:printer-filled" />
                    <span>打印</span>
                  </a-menu-item>
                  <a-menu-item v-if="lowAppId && !inlineMode" @click="onOpen">
                    <Icon icon="ic:round-launch" />
                    <span>新页签打开</span>
                  </a-menu-item>
                  <a-menu-item v-if="buttonAuth.delete && isEditMode" class="delete-item" @click="onDelete">
                    <Icon icon="ant-design:delete-filled" />
                    <span>删除</span>
                  </a-menu-item>
                  <a-menu-divider v-if="showDesignFormBtn && isLowApp" />
                  <a-menu-item v-if="showDesignFormBtn && isLowApp" @click="onDesignForm">
                    <Icon icon="ant-design:setting-filled" />
                    <span>编辑表单</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
    </template>

    <DesformView
      v-if="!reloading"
      ref="viewRef"
      class="desform-view"
      :mode="mode"
      :dataId="dataId"
      :viewId="viewId"
      :lowAppId="lowAppId"
      :isOnline="isOnline"
      :isLinkDialog="isLinkDialog"
      :desformCode="viewCode"
      :parentNode="parentNode"
      :defaultFormData="defaultFormData"
      :widgetConfig="widgetConfig"
      :customButtonId="customButtonId"
      :skipPage="false"
      :showFooter="false"
      :eventDialog="false"
      :minHeight="800"
      @close="onCancel"
      @forceClose="forceClose"
      @success="onSuccess"
      @reload="onReload"
      @formLoadingChange="(evt) => (formLoading = evt)"
    />

    <template #comment>
      <comment-panel
        v-if="!reloading"
        ref="commentPanelRef"
        :tableName="tableName"
        :dataId="dataId"
        :showComment="getShowComment"
        :showFiles="getShowFiles"
        :showDataLog="getShowDataLog"
        :otherHeight="commentOtherHeight"
      />
    </template>

    <template #footer>
      <a-button @click="onCancel">关闭</a-button>
      <a-button v-if="!isDetail" type="primary" :loading="formLoading || viewRef?.pageLoading || loading" preIcon="ant-design:save" @click="onSubmit">
        <a-tooltip v-if="formLoading || viewRef?.pageLoading" placement="top" title="仍在渲染表单中，当前操作可能会有卡顿，请耐心等待">
          <span>请稍后</span>
        </a-tooltip>
        <span v-else>保存</span>
      </a-button>
    </template>
  </BasicModal>
  <DesformViewModal v-if="showDataModal" :dynamicConfig="dynamicConfig" @register="registerDataModal" @success="onDataModalSuccess" />
  <ShareRecordModal @register="registerShareModal" />
</template>

<script setup lang="ts">
  import type { DesformConfigType } from './index';
  import type { ActionItem } from '/@/components/Table';
  import { ref, computed, reactive, inject, nextTick, watchEffect } from 'vue';
  import { sleep } from '/@/utils';
  import { defHttp } from '/@/utils/http/axios';
  import { propTypes } from '/@/utils/propTypes';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal, useModalInner, BasicModal } from '/@/components/Modal';
  import CommentPanel from '/@/components/jeecg/comment/CommentPanel.vue';
  import { useCustomButton } from '/@/views/super/online/desform/multi/ts/useCustomButton';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ShareRecordModal from './components/ShareRecordModal.vue';
  import { useLowAppAuthStore } from '/@/store/modules/lowAppAuth';
  import { useActionAuth } from '/@/views/super/online/desform/auto/hooks/useAuth';
  import { queryDesformIdByCode } from '/@/utils/super/desform/desformRouteUtils';
  import { simpleDebounce } from '@/utils/common/compUtils';
  import { getIsLowAppEnv } from '@/utils/super/low/lowAppUtils';

  const props = defineProps({
    zIndex: propTypes.number.def(999),
    defaultFormData: propTypes.object.def({}),
    widgetConfig: propTypes.array,
    // 显示评论
    showComment: propTypes.bool.def(true),
    // 显示文件
    showFiles: propTypes.bool.def(true),
    // 显示日志
    showDataLog: propTypes.bool.def(true),
    // 显示复制
    showRecordCopy: propTypes.bool.def(true),
    // 显示分享
    showRecordShare: propTypes.bool.def(true),
    // 显示打印
    showRecordSysPrint: propTypes.bool.def(true),
    // 显示编辑表单（根据admin角色判断）
    showDesignFormBtn: propTypes.bool.def(true),
    // 新增配置
    dynamicConfig: {
      type: Object,
      default: () => {},
    },
    // 当前下标
    index: propTypes.number,
    // 总记录数
    total: propTypes.number,
    // 是否是inline模式（内嵌模式，弹窗内嵌到页面上，而不是弹出）
    inlineMode: propTypes.bool.def(false),
    // 弹窗body高度，不传自动计算
    bodyHeight: propTypes.string,
    // 关闭弹窗回调，返回true则关闭，false则不关闭
    closeFunc: propTypes.func,
  });
  const emit = defineEmits(['register', 'reload', 'success', 'close', 'goto-record', 'design-form']);
  const { prefixCls } = useDesign('desform-view-modal');
  const { createConfirmSync } = useMessage();
  const viewRef = ref();
  const modalRef = ref();

  const loading = ref(false);
  const record = ref<Recordable>();
  const mode = ref('add');
  const desformId = ref<string | null>(null);
  // 页面视图的code
  const viewCode = ref(null);
  // 实际逻辑code（当子视图时此处是主视图的code）
  const desformCode = ref(null);
  const desformName = ref(null);
  const dataId = ref(null);
  const viewId = ref(null);
  const lowAppId = ref(null);
  // @ts-ignored
  const bgColor = ref('rgba(0,0,0,0.6)');
  const isOnline = ref(false);
  const isLinkDialog = ref(false);
  // 是否是编辑模式
  const isEditMode = computed(() => mode.value === 'edit');
  // 是否是 add 模式
  const isAdd = computed(() => mode.value === 'add');
  // 是否是 detail 模式
  const isDetail = computed(() => mode.value === 'detail');
  // 是否 在弹窗上显示自定义按钮-，自定义按钮打开的弹窗不需要再显示自定义按钮
  const hideCustomButton = ref(false);
  // form是否在加载中
  const formLoading = ref(false);

  // 更多按钮权限
  const buttonAuth = reactive({
    delete: false,
  });

  // 表单配置
  const formConfig = ref<Nullable<DesformConfigType>>(null);

  // 是否启用评论（讨论）
  const getShowComment = computed(() => {
    return props.showComment && hasButtonAuth('comment_record');
  });
  // 是否启用附件（下载）
  const getShowFiles = computed(() => {
    return props.showFiles && hasButtonAuth('download_record');
  });
  // 是否启用日志（操作记录）
  const getShowDataLog = computed(() => {
    return props.showDataLog && hasButtonAuth('log_record');
  });
  // 是否启用评论
  const enableComment = computed(() => {
    if (formConfig.value?.enableComment === false) {
      return false;
    }
    if (!getShowComment.value && !getShowFiles.value && !getShowDataLog.value) {
      return false;
    }
    return !isAdd.value && desformCode.value != null;
  });
  // 评论额外需要减去的高度
  const commentOtherHeight = computed(() => (props.inlineMode ? 60 : 0));
  // 评论表名，表单设计器前缀
  const tableName = computed(() => `desform:${desformCode.value}`);
  // 弹窗宽度
  const modalWidth = computed(() => {
    if (isAdd.value) {
      if (formConfig.value?.dialogOptions?.width) {
        return `${formConfig.value.dialogOptions.width}px`;
      }
      return '900px';
    }
    return '100%';
  });
  // 表单标题
  const modalTitle = computed(() => {
    if (desformName.value) {
      return desformName.value;
    }
    return '加载中';
  });
  // 弹窗body样式
  const modalBodyStyle = computed(() => {
    let calcHeight;
    if (props.bodyHeight) {
      calcHeight = props.bodyHeight;
    } else {
      calcHeight = window.innerHeight - 110 + 'px';
    }
    return {
      padding: '0',
      height: calcHeight,
    };
  });
  const canFullscreen = computed(() => isAdd.value);
  // 是否全屏显示弹窗
  const isFullscreen = computed(() => !isAdd.value);
  // desformView 父级滚动条，只有传了此参数才会突破内部弹窗
  const parentNode = computed(() => {
    return modalRef.value?.modalWrapperRef?.wrapperRef?.scrollbarRef?.wrap;
  });
  // 是否显示快速切换按钮
  const showSwitchBtn = computed(() => {
    if (isAdd.value) {
      return false;
    }
    // total或者index为null时，不显示快速切换按钮
    if (props.total == null || props.index == null) {
      return false;
    }
    // 只有一条记录时，不显示快速切换按钮
    return props.total !== 1;
  });
  // 是否低代码
  const isLowApp = computed(() => {
    return getIsLowAppEnv();
  });
  // 是否是自定义按钮创建的关联记录表单
  const isLinkRecordForm = ref(false);
  // 自定义按钮的ID
  const customButtonId = ref('');
  // 当前记录ID
  const currentRecordId = ref('');
  // 发起流程的 processId
  const processId = ref('');
  // 是否在填写表单后触发流程
  const flowStatus = ref(false);
  // 自定义按钮 创建关联记录中的关联记录时用到
  const linkRecordId = ref('');

  const [registerModal, { closeModal }] = useModalInner(openModal);

  //update-begin-author:sunjianlei date:20230225 for: 自定义按钮渲染逻辑
  const showDataModal = ref(false);
  const [registerDataModal, dataModal] = useModal();
  // 重写 openModal
  const dataOpenModal = dataModal.openModal;
  dataModal.openModal = async function (...args) {
    if (!showDataModal.value) {
      showDataModal.value = true;
      await nextTick();
    } else {
    }
    dataOpenModal(...args);
  };
  // 自定义按钮
  const customButtonList = ref<ActionItem[]>([]);
  const customButtonProps = reactive({
    ...props,
    code: desformCode.value,
    designFormCode: desformCode.value,
    viewId: viewId.value,
  });
  watchEffect(() => {
    customButtonProps.dynamicConfig = props.dynamicConfig;
    customButtonProps.code = desformCode.value;
    customButtonProps.designFormCode = desformCode.value;
    customButtonProps.viewId = viewId.value;
  });

  const { designButtonList, getCustomButtons } = useCustomButton(customButtonProps, dataModal, desformCode, lowAppId);

  //update-end-author:sunjianlei date:20230225 for: 自定义按钮渲染逻辑

  const mask = ref(true);
  const keyboard = ref(true);
  watchEffect(() => {
    // inline模式下，不显示遮罩和键盘事件
    if (props.inlineMode) {
      keyboard.value = false;
      mask.value = false;
    }
  });

  async function openModal(data) {
    loading.value = false;
    //update-begin-author:liusq---date:2024-06-03--for: [TV360X-731]评论，在切换数据时查看时，评论记录会串。
    reloading.value = true;
    await nextTick();
    reloading.value = false;
    //update-end-author:liusq---date:2024-06-03--for:[TV360X-731]评论，在切换数据时查看时，评论记录会串。
    isOnline.value = data.isOnline;
    isLinkDialog.value = data.isLinkDialog;
    mode.value = data.mode;
    dataId.value = data.dataId;
    viewId.value = data.viewId;
    lowAppId.value = data.lowAppId;
    if (data.parentCode) {
      desformCode.value = data.parentCode;
      viewCode.value = data.desformCode;
    } else {
      desformCode.value = data.desformCode;
      viewCode.value = data.desformCode;
    }
    desformId.value = await queryDesformIdByCode(data.desformCode);
    hideCustomButton.value = data.hideCustomButton || false;

    // 如果是表单设计器-自定义按钮创建关联记录 需要下面3个参数
    isLinkRecordForm.value = data.isLinkRecordForm || false;
    customButtonId.value = data.customButtonId || '';
    currentRecordId.value = data.currentRecordId || '';

    // QQYUN-4721 【应用】自定义按钮选择填写指定内容执行工作流不起作用
    flowStatus.value = data.flowStatus;
    processId.value = data.processId;
    linkRecordId.value = data.linkRecordId;

    // 查询record
    await queryRecord();
    if (record.value) {
      checkButtonAuth();
      if (typeof data.setMode === 'function') {
        mode.value = data.setMode({
          mode: mode.value,
          record: record.value,
        });
      }
    }

    // 查询自定义按钮
    queryCustomButtons();
    // 查询表单配置
    queryFormConfig(desformCode.value);
  }

  // 查询当前这条数据
  async function queryRecord() {
    record.value = undefined;
    // 新增模式下不查询数据
    if (isAdd.value) {
      return;
    }
    try {
      // 获取record
      let url = `/desform/data/queryById`;
      record.value = await defHttp.get({
        url,
        params: {
          id: dataId.value,
          desformCode: desformCode.value,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  // 查询自定义按钮
  async function queryCustomButtons() {
    // 新增模式下不显示自定义按钮
    if (isAdd.value) {
      return;
    }
    try {
      // 获取自定义按钮
      //update-begin-author:taoyan date:2023-3-22 for: QQYUN-4760【视图】采购单 自定义按钮 表单弹窗上没出来 （可能是因为带上了筛选条件的）
      if(record.value && record.value.desformData){

        //update-begin-author:taoyan date:2023-4-11 for: QQYUN-5011 4、按钮无反应，无法进行下一步操作。
        let temp = {
          ...record.value.desformData,
          id: record.value.id
        }
        let btnList: ActionItem[] = getCustomButtons(temp, designButtonList);
        //update-end-author:taoyan date:2023-4-11 for: QQYUN-5011 4、按钮无反应，无法进行下一步操作。
        
        customButtonList.value = btnList;
      }else{
        customButtonList.value = [];
      }
      //update-end-author:taoyan date:2023-3-22 for: QQYUN-4760【视图】采购单 自定义按钮 表单弹窗上没出来 （可能是因为带上了筛选条件的）
    } catch (e) {
      console.error(e);
    }
  }

  // 自定义按钮点击事件
  async function onCustomButtonClick(args, button: ActionItem) {
    const buttonEvent = await getButtonEvent(button);
    if (typeof buttonEvent === 'function') {
      loading.value = true;
      try {
        await buttonEvent(...args);
        await sleep(500);
        // 刷新表单
        onGotoReload();
      } finally {
        loading.value = false;
      }
    }
  }

  /**
   * 获取按钮事件
   *
   * @param button
   */
  async function getButtonEvent(button: ActionItem): Promise<Fn | null> {
    if (!button) {
      return null;
    }
    if (button.popConfirm) {
      let flag = await createConfirmSync({
        content: button.popConfirm.title,
        okText: button.popConfirm.okText,
        cancelText: button.popConfirm.cancelText,
      });
      if (!flag) {
        return null;
      }
      return button.popConfirm.confirm;
    }
    if (button.onClick) {
      return button.onClick;
    }
    return null;
  }

  // 查询表单配置
  async function queryFormConfig(desformCode) {
    try {
      const url = `/desform/api/config/${desformCode}`;
      const result = await defHttp.get({ url });
      desformName.value = result.desformName;
      formConfig.value = result.config;
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCloseFunc() {
    if (typeof props.closeFunc === 'function') {
      if (props.closeFunc() === false) {
        return false;
      }
    }
    if (props.inlineMode) {
      // inline模式下单独触发close事件
      emit('close');
    }
    return true;
  }

  //提交防抖
  const onSubmit = simpleDebounce(() => {
    viewRef.value.doActionSubmit();
  }, 150);

  // 数据弹窗保存事件
  function onDataModalSuccess(event) {
    // 刷新iframe
    viewRef.value.reload();
    
    //update-begin-author:taoyan date:2023-4-11 for: QQYUN-5011 4、按钮无反应，无法进行下一步操作。
    //onSuccess(event, false);
    emit('success', event);
    //update-end-author:taoyan date:2023-4-11 for: QQYUN-5011 4、按钮无反应，无法进行下一步操作。
  }

  // --------------------- 切换上下条记录 ---------------------

  // 禁用上一条按钮
  const disableUp = computed(() => {
    if (props.index == null) {
      return true;
    }
    return props.index === 0;
  });

  function onGotoUp() {
    if (disableUp.value) {
      return;
    }
    onGotoRecord(props.index - 1);
  }

  // 禁用下一条按钮
  const disableDown = computed(() => {
    if (props.index == null) {
      return true;
    }
    return props.index === props.total - 1;
  });

  function onGotoDown() {
    if (disableDown.value) {
      return;
    }
    onGotoRecord(props.index + 1);
  }

  async function onGotoReload() {
    onGotoRecord(props.index);
  }

  const reloading = ref(false);

  async function onGotoRecord(index) {
    emit('goto-record', {
      index,
      mode: mode.value,
    });
    reloading.value = true;
    await nextTick();
    reloading.value = false;
  }

  // --------------------- 切换上下条记录 ---------------------

  // --------------------- 更多按钮功能 ---------------------

  // 获取分享链接
  function getShareUrl() {
    // return `/myapp/${lowAppId.value}/desform/${desformCode.value}/${viewId.value}/share/${dataId.value}`;
    return `/myapp/${lowAppId.value}/form/${desformId.value}/${viewId.value}/share/${dataId.value}`;
  }

  // 注册分享弹窗
  const [registerShareModal, shareModal] = useModal();

  // 打开分享弹窗
  function onShare() {
    const href = `${window.location.origin}${getShareUrl()}`;
    shareModal.openModal(true, {
      href: href,
    });
  }

  // 打开新页面
  function onOpen() {
    window.open(getShareUrl(), '_blank');
  }

  enum Api {
    copy = '/desform/data/${desformCode}/copyRecord',
    delete = '/desform/data/${desformCode}/delete',
  }

  // 复制数据
  async function onCopy() {
    try {
      const flag = await createConfirmSync({ title: '复制', content: `确定要复制这条数据吗？` });
      if (!flag) {
        return;
      }
      let result = await defHttp.put(
        {
          url: Api.copy.replace('${desformCode}', desformCode.value!),
          params: {
            id: dataId.value,
          },
        },
        { joinParamsToUrl: true }
      );
      emit('goto-record', {
        id: result.id,
        mode: mode.value,
      });
    } catch (e) {
      console.error(e);
    }
  }

  // 是否显示打印
  const showPrinter = computed(() => {
    const { allowJmReport, allowPrint } = formConfig.value || {};
    return allowJmReport || allowPrint;
  });

  // 打印数据
  function onPrinter() {
    viewRef.value.doPrint();
  }

  // 删除数据
  async function onDelete() {
    try {
      const flag = await createConfirmSync({ title: '删除', content: `确定要删除这条数据吗？` });
      if (!flag) {
        return;
      }
      await defHttp.delete(
        {
          url: Api.delete.replace('${desformCode}', desformCode.value!),
          params: {
            id: dataId.value,
          },
        },
        { joinParamsToUrl: true }
      );
      doClose();
      onSuccess({ dataId: dataId.value });
    } catch (e) {
      console.error(e);
    }
  }

  let doDesignForm = inject<Fn | Boolean>('doDesignForm', false);

  // 触发编辑表单
  function onDesignForm() {
    console.log("typeof doDesignForm",typeof doDesignForm)
    if (!doDesignForm) {
      // 没有注入doDesignForm方法，说明不是lowApp环境，直接打开新页面
      openNewWindowDesignForm();
    } else {
      doClose();
      if (typeof doDesignForm === 'function') {
        doDesignForm();
      }
    }
  }

  // 在新页面打开设计表单页面
  function openNewWindowDesignForm() {
    window.open('/online/desform?open=' + desformCode.value, '_blank)');
  }

  // --------------------- 更多按钮功能 ---------------------

  function onCancel() {
    if (typeof props.closeFunc === 'function') {
      if (props.closeFunc() === false) {
        return false;
      }
    }
    doClose();
  }

  function doClose() {
    formLoading.value = false;
    loading.value = false;
    closeModal();
    emit('close');
  }

  function onSuccess({ dataId }, close = true) {
    emit('success', {
      dataId,
      isLinkRecordForm: isLinkRecordForm.value,
      linkRecordId: linkRecordId.value,
      customButtonId: customButtonId.value,
      currentRecordId: currentRecordId.value,
      flowStatus: flowStatus.value,
      processId: processId.value,
    });
    // 处于 inline 模式下，不关闭弹窗
    if (!props.inlineMode) {
      close && closeModal();
    }
    loading.value = false;
  }

  function forceClose() {
    doClose();
  }

  function onReload() {
    emit('reload');
  }

  // QQYUN-4412【应用】角色 操作按钮 记录相关的 权限没对接
  const authStore = useLowAppAuthStore();

  function hasButtonAuth(buttonCode) {
    let hasAdmin = authStore.getLowAppAdminAuth();
    if (hasAdmin === true) {
      return true;
    }
    let designFormCode = desformCode.value;
    let operations = authStore.getOperationAuth(designFormCode) || {};
    let result = operations[buttonCode] || false;
    return result;
  }

  const { hasDeleteAuth } = useActionAuth();

  // 判断按钮权限
  function checkButtonAuth() {
    let desformData = record.value?.desformData ? record.value.desformData : record.value;
    buttonAuth.delete = hasDeleteAuth(desformCode.value, viewId.value, [desformData]);
  }
</script>

<style lang="less">
  //noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-desform-view-modal';

  .@{prefix-cls}-wrapper {
    > .ant-modal {
      top: 0;
    }

    .jeecg-basic-title {
      cursor: default;
    }

    .jeecg-modal-content > .scroll-container {
      padding: 0;

      > .scrollbar__wrap {
        margin: 0 !important;
      }
    }
  }

  // --------------- 自定义标题样式 -------------
  .@{prefix-cls}-custom-header {
    display: flex;
    height: 24px;

    .left-content,
    .right-content {
      width: 50%;
      display: flex;
      align-items: center;
    }

    .left-content {
      .custom-button-box {
        .ant-btn {
          &.is-disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .right-content {
      display: flex;
      justify-content: right;
      padding-right: 90px;

      .ant-btn {
        &:hover {
          opacity: 0.6;
        }

        &:active {
          opacity: 0.8;
        }
      }
    }

    // 顶部图标按钮样式
    .header-icon-btns {
      // 横排flex布局
      display: flex;
      align-items: center;

      .app-iconify {
        color: #888888;
        margin-right: 12px;

        &.disabled {
          color: #cccccc !important;
          cursor: not-allowed !important;
        }

        &:hover {
          color: @primary-color;
          cursor: pointer;
        }

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  // 更多下拉框样式
  .@{prefix-cls}-header-more-dropdown {
    .ant-dropdown-menu-item {
      padding: 8px 12px;

      .app-iconify {
        margin-right: 8px;
        color: #888888;
      }

      &.delete-item {
        &,
        .app-iconify {
          color: #ff4d4f;
        }
      }
    }
  }

  // --------------- 自定义标题样式 -------------
</style>
