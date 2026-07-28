<template>
  <div ref="boxRef" :class="[`${prefixCls}-box`]" :style="boxStyle">
    <DesformViewModal
      v-if="dynamicConfig != null"
      inline-mode
      :bodyHeight="bodyHeight"
      :getContainer="() => boxRef"
      :showComment="showComment"
      :showFiles="showFiles"
      :showDataLog="showDataLog"
      :showRecordShare="showRecordShare"
      :showRecordSysPrint="showRecordSysPrint"
      :showDesignFormBtn="false"
      :dynamicConfig="dynamicConfig"
      :closeFunc="handleCloseFunc"
      @register="registerDataModal"
      @success=""
      @close="onClose"
      @goto-record="onGotoRecord"
    />
    <div v-else-if="currentViewId && currentViewId !== viewId" class="no-view-auth">
      <div class="icon">
        <Icon icon="ic:baseline-error" :size="80" />
      </div>
      <div class="tip">数据无法访问</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue';
  import type { ModalMethods } from '/@/components/Modal';
  import type { FormMenu } from '../../../myapps/ts/type.definition';
  import { ref, watch, computed, nextTick, onUnmounted, inject } from 'vue';
  import { useRouter } from 'vue-router';
  import { useModal } from '/@/components/Modal';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useFuncSwitch } from "/@/hooks/jeecg/desform/useFuncSwitch";
  import { useActionAuth } from '../auto/hooks/useAuth';
  import { useUserStore } from '/@/store/modules/user';
  import { queryDesformCodeById } from '/@/utils/super/desform/desformRouteUtils';

  const props = defineProps({
    currentViewId: {
      type: String,
      default: '',
    },
    viewConfigList: {
      type: Array as PropType<Recordable[]>,
      default: () => [],
    },
  });
  const userStore = useUserStore()
  const router = useRouter();
  const route = computed(() => router.currentRoute.value);
  const boxRef = ref<HTMLDivElement>();

  const { prefixCls } = useDesign('auto-desform-data-view');
  const [registerModal, { openModal }] = useModal();
  const { hasUpdateAuth } = useActionAuth();

  const appId = computed(() => route.value.params.appId);
  const viewId = computed(() => route.value.params.viewId);
  const dataId = computed(() => route.value.params.dataId);
  const desformId = computed(() => route.value.params.code);
  const desformCode = ref('');

  const registerDataModal = async (modalMethods: ModalMethods, uuid?: string) => {
    registerModal(modalMethods, uuid);
    desformCode.value = await queryDesformCodeById(desformId.value as string);
    await nextTick();
    doOpenModal();
  };

  // box样式
  const boxStyle = computed(() => {
    let paddingTop = 20;
    let paddingLeft = 100;
    // 兼容窄屏幕、移动端样式，不动态刷新
    if (window.innerWidth < 1200) {
      paddingTop = 0;
      paddingLeft = 0;
    }
    return {
      padding: `${paddingTop}px ${paddingLeft}px`,
    };
  });

  // 动态配置
  const dynamicConfig = computed(() => {
    if (props.viewConfigList) {
      return props.viewConfigList.find((item) => item.id === viewId.value);
    }
    return null;
  });

  // 动态计算高度
  const bodyHeight = computed(() => {
    return (boxRef.value?.offsetHeight ?? window.innerHeight) - 130 + 'px';
  });

  // 功能开关
  const { getHasFunc } = useFuncSwitch();
  // 【功能开关】是否开启评论
  const showComment = getHasFunc('RECORD_COMMENT');
  // 【功能开关】是否开启附件
  const showFiles = getHasFunc('FILES_DOWNLOAD');
  // 【功能开关】是否开启日志
  const showDataLog = getHasFunc('RECORD_LOGS');
  // 【功能开关】记录分享
  const showRecordShare = getHasFunc('RECORD_SHARE');
  // 【功能开关】记录打印
  const showRecordSysPrint = getHasFunc('RECORD_SYS_PRINT');
  // 左侧菜单列表
  const leftMenuList = inject<Ref<FormMenu[]>>('leftMenuList', ref([]));

  function onClose() {
    if (appId.value) {
      const checks = [desformId.value, desformCode.value];
      const menu = leftMenuList.value.find((item) => checks.includes(item.menuUrl as string));
      let url: string;
      if (menu) {
        url = `/myapp/${appId.value}/${menu.type}/${menu.menuUrl}`;
      } else {
        url = `/myapp/${appId.value}/desform/${desformCode.value}`;
      }
      router.push(url);
    }
  }

  function onGotoRecord() {
    doOpenModal();
  }

  function doOpenModal() {
    openModal(true, {
      mode: 'detail',
      desformCode: desformCode.value,
      dataId: dataId.value,
      isOnline: false,
      viewId: viewId.value,
      lowAppId: appId.value,
      setMode({ record }) {
        // 判断这条数据是否有编辑权限
        let desformData = record?.desformData ? record.desformData : record;
        let status = hasUpdateAuth(desformCode.value, viewId.value, [desformData]);
        return status ? 'edit' : 'detail';
      },
    });
  }

  function handleCloseFunc() {
    // 判断当前是否是临时租户
    if (userStore.hasShareTenantId) {
      // 如果是临时租户，则不关闭弹窗
      onClose()
      return false
    }
    return true
  }

</script>

<style lang="less">
  // noinspection LessUnresolvedVariable
  @prefix-cls: ~'@{namespace}-auto-desform-data-view';

  .@{prefix-cls}-box {
    padding: 20px 100px;
    height: calc(100vh - 50px);
    background-color: #f0f2f5;

    .ant-modal {
      animation: none !important;
    }

    .ant-modal-wrap {
      position: relative;
    }

    // 无法访问数据（无视图权限）时的提示样式
    .no-view-auth {
      height: 100%;
      display: flex;
      // flex 垂直居中
      align-items: center;
      justify-content: center;
      flex-direction: column;

      font-size: 20px;
      background-color: #ffffff;
      // 阴影
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);

      .icon {
        color: #e0e0e0;
        font-size: 30px;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .tip {
        color: #afafaf;
      }
    }
  }
</style>
