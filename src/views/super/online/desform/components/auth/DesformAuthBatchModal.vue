<template>
  <BasicModal v-bind="getProps">
    <a-row type="flex" style="height: 100%">
      <a-col :md="12" :sm="24" style="flex: 1; padding-right: 5px;">
        <BasicTable @register="registerTable" :rowSelection="rowSelection" />
      </a-col>
      <a-col :md="12" :sm="24" class="col-right" style="flex: 1; padding-left: 5px;">
        <a-spin :spinning="loading">
          <a-tabs>
            <a-tab-pane tab="数据权限" key="data" forceRender>
              <AuthBatchTransfer permissionType="data" v-bind="transferProps" />
            </a-tab-pane>
            <a-tab-pane tab="按钮权限" key="button" forceRender>
              <AuthBatchTransfer permissionType="button" v-bind="transferProps" />
            </a-tab-pane>
            <a-tab-pane tab="字段权限" key="field" forceRender>
              <AuthBatchTransfer permissionType="field" v-bind="transferProps" />
            </a-tab-pane>
          </a-tabs>
        </a-spin>
        <p style="margin: 8px 0 0 0">
          <a-icon type="eye-invisible" style="margin-right: 8px" />
          <span>符号开头的字段代表已勾选“授权给所有人”</span>
        </p>
      </a-col>
    </a-row>
  </BasicModal>
</template>

<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import { ref, defineComponent, computed, unref, nextTick } from 'vue';
  import { BasicTable } from '/@/components/Table';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { cloneDeep } from 'lodash-es';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useAuthBatch } from './hooks/useAuthBatch';
  import AuthBatchTransfer from './components/batch/AuthBatchTransfer.vue';

  export default defineComponent({
    name: 'DesformAuthBatchModal',
    components: {
      BasicModal,
      BasicTable,
      AuthBatchTransfer,
    },
    props: {
      // 权限范围类型（role、depart）
      authScopeType: propTypes.oneOf(['role', 'depart']).isRequired,
    },
    emits: ['register'],
    setup(props) {
      const attrs = useAttrs();
      // 当前是否正在加载中
      const loading = ref(false);
      // 表单model
      const model = ref<Recordable>();
      // 当前批量授权scope
      const { authScope, loadTableData } = useAuthBatch(props.authScopeType);
      // 弹窗标题
      const title = computed(() => authScope.name + '批量授权');
      // 注册弹窗
      const [registerModal, { closeModal, setModalProps }] = useModalInner(open);
      const ctx = useListPage({
        tableProps: {
          immediate: false,
          api: (params) => {
            setAllLoading(true);
            try {
              return loadTableData(params);
            } finally {
              setAllLoading(false);
            }
          },
          columns: authScope.columns,
          canResize: false,
          clickToRowSelect: true,
          showTableSetting: false,
          useSearchForm: false,
          showActionColumn: false,
          rowSelection: { type: 'radio' },
          afterFetch: handleAfterFetch,
        },
      });
      const { tableContext } = ctx;
      // 注册table数据
      const [registerTable, { reload, setLoading }, { rowSelection, selectedRows, selectedRowKeys }] = tableContext;
      // 弹窗最终props
      const getProps = computed(() => {
        let modalProps: Partial<ModalProps> = {
          width: 1000,
          title: unref(title),
          confirmLoading: unref(loading),
          defaultFullscreen: true,
          wrapClassName: 'desform-auth-batch-modal',
        };
        let finalProps: Recordable = {
          ...unref(attrs),
          ...modalProps,
          ...props,
          onOk: onSubmit,
          onCancel: close,
          onRegister: registerModal,
        };
        return finalProps;
      });
      // 选中的授权范围 code
      const authScopeCode = computed(() => {
        if (selectedRows.value.length > 0) {
          return selectedRows.value[0][authScope.codeName];
        }
        return '';
      });
      const transferProps = computed(() => {
        return {
          authScope,
          authScopeCode: authScopeCode.value,
          authScopeType: props.authScopeType,
          desformId: model.value?.id,
          desformCode: model.value?.desformCode,
          loading: loading.value,
          'onUpdate:loading': (flag) => setAllLoading(flag),
        };
      });

      /**
       * 处理请求完成后的操作
       * @param records
       */
      function handleAfterFetch(records) {
        if (records.length > 0) {
          // 默认选中第一行
          let firstRow = records[0];
          setTimeout(() => {
            selectedRows.value = [firstRow];
            selectedRowKeys.value = [firstRow.id];
          }, 300);
        }
      }

      /** 弹窗开启 */
      function open(data) {
        model.value = cloneDeep(data?.record);
        reload();
      }

      /** 弹窗关闭 */
      function close() {
        closeModal();
      }

      /** 提交表单 */
      async function onSubmit() {
        close();
      }

      /** 设置加载状态*/
      function setAllLoading(flag) {
        loading.value = flag;
        setLoading(flag);
        setModalProps({ confirmLoading: flag });
      }

      return {
        getProps,
        loading,
        transferProps,

        registerTable,
        rowSelection,

        authScopeCode,
        selectedRows,
        selectedRowKeys,
      };
    },
  });
</script>

<style scoped lang="less">
  :deep(.ant-table){
    .ant-table-content {
      margin: 0 !important;
    }

    .j-row-select {
      cursor: pointer !important;
    }
  }

  :deep(.col-right){

    .ant-spin-nested-loading {
      height: 92%;
    }

    .ant-spin-container,
    .ant-tabs {
      height: 100%;
    }

    .ant-tabs-content {
      height: 100%;
    }

    .ant-transfer-list {
      height: 100%;
    }
  }

</style>

<style lang="less">

/* 在Modal全屏模式下样式特殊处理 */
.desform-auth-batch-modal.fullscreen-modal {
  .col-right {
    .ant-spin-nested-loading {
      height: 95%;
    }
  }
}
</style>
