<template>
  <div :class="prefixCls">
    <BasicTable @register="registerTable" :rowSelection="rowSelection" v-bind="$attrs">
      <template #tableTitle>
        <a-button @click="onAddRecord" type="primary" preIcon="ant-design:plus">新增</a-button>
        <a-button @click="onCreateByAi" type="primary" preIcon="bxs:bot">AI建表</a-button>

        <!-- 重置索引 
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="onRedoIndex">快速重置索引</a-menu-item>
              <a-menu-item key="2" @click="onRedoIndexForce">强制重置索引</a-menu-item>
            </a-menu>
          </template>
          <a-button type="primary" preIcon="ant-design:redo">重置索引</a-button>
        </a-dropdown>-->
        <!-- 批量操作 -->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="onDeleteBatch">
                <a-icon type="delete" />
                <span>删除</span>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            <span>批量操作</span>
            <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </template>

      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <DesformModal @register="registerDesformModal" @success="onModalOk" />
    <!-- 通过Ai生成表单 -->
    <DesformAigcModal @register="registerDesformAigcModal" @success="onModalOk" />
    <FormDesignerIframeModal @register="registerFormDesignerIframeModal" @success="onFormDesignerSuccess" @close="onFormDesignerClose" :isLowApp="false"/>
    <!-- 授权抽屉 -->
    <DesformAuthDrawer @register="registerAuthDrawer" />
    <!-- 【角色】批量授权 -->
    <DesformAuthBatchModal @register="registerAuthBatchModal" authScopeType="role" />
    <!-- 配置地址弹窗 -->
    <DesformAddressModal @register="registerAddressModal" />
    <!-- 下一步路由配置 -->
    <DesformRouteDrawer @register="registerRouteDrawer" />
    <!-- 重置索引工具 -->
    <DesformRedoIndexModal @register="registerRedoIndexModal" />
    <!-- 变更索引工具 -->
    <DesformIndexToolsModal @register="registerIndexToolsModal" />
  </div>
</template>

<script lang="ts">
  import type { ActionItem } from '/@/components/Table';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { computed, defineComponent } from 'vue';
  import { router } from '/@/router';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { pageApi } from './desform.api';
  import { columns, searchFormSchema } from './desform.data';
  import { useTabs } from '/@/hooks/web/useTabs';
  import DesformModal from './components/DesformModal.vue';
  import DesformAigcModal from './components/DesformAigcModal.vue';
  import FormDesignerIframeModal from './components/FormDesignerIframeModal.vue';
  import DesformAddressModal from './components/DesformAddressModal.vue';
  import DesformAuthDrawer from './components/auth/DesformAuthDrawer.vue';
  import DesformAuthBatchModal from './components/auth/DesformAuthBatchModal.vue';
  import DesformRouteDrawer from './components/route/DesformRouteDrawer.vue';
  import DesformRedoIndexModal from './components/index/DesformRedoIndexModal.vue';
  import DesformIndexToolsModal from './components/index/DesformIndexToolsModal.vue';

  export default defineComponent({
    name: 'online-desform',
    components: {
      BasicTable,
      TableAction,
      DesformModal,
      DesformAigcModal,
      FormDesignerIframeModal,
      DesformAddressModal,
      DesformAuthDrawer,
      DesformAuthBatchModal,
      DesformRouteDrawer,
      DesformRedoIndexModal,
      DesformIndexToolsModal,
    },
    setup(_, { emit }) {
      const { close: closeTab } = useTabs();
      const ctx = useListPage({
        tableProps: {
          api: pageApi.list,
          columns,
          formConfig: {
            //labelWidth: 200,
            schemas: searchFormSchema,
          },
          actionColumn: {
            width: 360,
          },
          isTreeTable: true,
          beforeFetch: beforeFetch,
          afterFetch: afterFetch,
          onExpand: onExpand,
        },
      });
      const { prefixCls, tableContext, doRequest, doDeleteRecord } = ctx;
      // 注册table数据
      const [registerTable, { reload, collapseAll, updateTableDataRecord, getDataSource }, { rowSelection, selectedRowKeys }] = tableContext;
      // 注册编辑弹窗 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
      const [registerDesformModal, desformModal] = useModal();
      // 注册Aigc弹窗
      const [registerDesformAigcModal, desformAigcModal] = useModal();
      // 注册设计表单弹窗
      const [registerFormDesignerIframeModal, formDesignerIframeModal] = useModal();
      // 注册配置地址弹窗
      const [registerAddressModal, addressModal] = useModal();
      // 注册权限抽屉
      const [registerAuthDrawer, authDrawer] = useDrawer();
      // 注册角色授权弹窗
      const [registerAuthBatchModal, authBatchModal] = useModal();
      // 注册路由抽屉
      const [registerRouteDrawer, routeDrawer] = useDrawer();
      // 注册重置索引工具弹窗
      const [registerRedoIndexModal, redoIndexModal] = useModal();
      // 注册变更索引工具弹窗
      const [registerIndexToolsModal, indexToolsModal] = useModal();

      const queryOpenCode = computed(() => router.currentRoute.value.query.open);

      // 获取数据后打开的表单code
      let openDesignCode = '';
      if (queryOpenCode.value) {
        openDesignCode = queryOpenCode.value as string;
      }

      /** 列表数据请求之前触发的事件 */
      function beforeFetch(params: Recordable) {
        if (queryOpenCode.value) {
          params.desformCode = queryOpenCode.value;
        }
        if (openDesignCode) {
          params.openDesignCode = openDesignCode
        }
      }

      function onFormDesignerClose() {
        if (queryOpenCode.value) {
          closeTab();
        }
        reload()
      }
      //设计器保存关闭后，无痕刷新数据
      function onFormDesignerSuccess(record?) {
        record.id && updateTableDataRecord(record.id, record)
      }

      /** 列表数据请求完成后触发的事件 */
      function afterFetch(result) {
        collapseAll();
        let openRecord = null;
        for (const record of result) {
          // 增加children字段
          if (record.hasChildren) {
            record.children = [{ id: `${record.id}_loadChild`, desformName: 'loading...', isLoading: true }];
          }
          // 获取数据后打开的表单code
          if (openDesignCode && record.desformCode === openDesignCode) {
            openRecord = record;
          }
        }
        if (openDesignCode) {
          if (openRecord) {
            onOpenDesign(openRecord);
          } else {
            ctx.createWarningModal({
              title: '无法打开设计页面',
              content: `<span>无法找到新增的表单“${openDesignCode}”，可能是设置了查询条件导致查询不到该条数据导致的，请手动打开设计页面。</span>`,
            });
          }
          openDesignCode = '';
        }
      }

      async function onExpand(expanded, record) {
        // 判断是否是展开状态
        if (expanded) {
          // 判断子级的首个项的标记是否是“正在加载中”，如果是就加载数据
          if (record.children[0].isLoading === true) {
            let { records } = await pageApi.list({ parentId: record.id });
            // 处理好的数据可直接赋值给children
            if (records.length === 0) {
              record.children = null;
            } else {
              record.children = records;
            }
          }
        }
      }

      function onModalOk(payload) {
        if (payload.openDesign) {
          openDesignCode = payload.desformCode;
        }
        reload();
      }

      /** 打开设计表单 */
      function onOpenDesign(record) {
        formDesignerIframeModal.openModal(true, { record });
      }

      /**
       * 新增表单
       */
      function onAddRecord() {
        desformModal.openModal(true, { isUpdate: false });
      }

      function onCreateByAi() {
        desformAigcModal.openModal(true, {});
      }

      /**
       * 编辑表单
       */
      function onEditRecord(record, action = 'default') {
        desformModal.openModal(true, { isUpdate: true, record, action });
      }

      /** 删除单个表单*/
      async function onDelete(record) {
        if (record.children) {
          ctx.createErrorModal({ content: '请删除完所有的子视图以后再删除主视图！' });
        } else {
          doDeleteRecord(() => pageApi.delete(record.id));
        }
      }

      /** 批量删除 */
      function onDeleteBatch() {
        const getRecord = (id, data) => {
          for (let d of data) {
            if (d.id === id) {
              return d;
            }
            if (d.children) {
              return getRecord(id, d.children);
            }
          }
        };
        // 判断是否有包含子视图的表单，如果有就去掉选择 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
        let removeSelectKeys: any = [];
        selectedRowKeys.value.forEach((rowKey, rowIndex) => {
          let record = getRecord(rowKey, getDataSource());
          if (record && record.children) {
            removeSelectKeys.push(rowIndex);
          }
        });
        removeSelectKeys.reverse();
        for (let idx of removeSelectKeys) {
          selectedRowKeys.value.splice(idx, 1);
        }
        if (selectedRowKeys.value.length === 0) {
          ctx.createErrorModal({ content: '请删除完所有的子视图以后再删除主视图！' });
        } else {
          doRequest(() => pageApi.batchDelete(selectedRowKeys.value));
        }
      }

      // 快速重置索引
      function onRedoIndex() {
        openRedoIndexModal(0);
      }

      // 强制重置索引
      function onRedoIndexForce() {
        openRedoIndexModal(1);
      }

      // 打开重置索引窗口
      function openRedoIndexModal(modeIndex) {
        let selections = '';
        if (selectedRowKeys.value && selectedRowKeys.value.length > 0) {
          selections = selectedRowKeys.value.join(',');
        }
        redoIndexModal.openModal(true, { modeIndex, selections });
      }

      /**
       * 操作栏
       */
      function getTableAction(record): ActionItem[] {
        let arr:ActionItem[] = [
          {
            label: '编辑',
            onClick: () => onEditRecord(record),
          },
          {
            label: '设计表单',
            icon: 'ant-design:setting',
            onClick: () => onOpenDesign(record),
          }
        ];
        arr.push({
          label: '表单数据',
          class: ['low-app-hide'],
          onClick: () => router.push(`/online/desform/list/${record.desformCode}`),
        });
        arr.push({
          label: '配置地址',
          class: ['low-app-hide'],
          onClick: () => addressModal.openModal(true, { record }),
        });
        return arr;
      }

      /**
       * 下拉操作栏
       */
      function getDropDownAction(record): ActionItem[] {
        // 是否是视图
        const isView = record.desformType === 2;
        return [
          {
            label: '权限控制',
            onClick: () => authDrawer.openDrawer(true, { record }),
          },
          {
            label: '角色授权',
            onClick: () => authBatchModal.openModal(true, { record }),
          },
          {
            label: '路由配置',
            onClick: () => routeDrawer.openDrawer(true, { record }),
          },
          {
            label: '复制视图',
            onClick: () => onEditRecord(record, 'copy-view'),
            ifShow: !isView,
          },
          {
            label: '复制表单',
            onClick: () => onEditRecord(record, 'copy'),
            ifShow: !isView,
          },
          // {
          //   label: '索引工具',
          //   class: ['low-app-hide'],
          //   onClick: () => indexToolsModal.openModal(true, { record }),
          // },
          {
            label: '删除',
            popConfirm: {
              title: '确定要删除吗？',
              placement: 'left',
              confirm: () => onDelete(record),
            },
          },
        ];
      }

      return {
        prefixCls,
        rowSelection,
        selectedRowKeys,

        reload,
        onModalOk,
        onAddRecord,
        onCreateByAi,
        onDeleteBatch,
        onRedoIndex,
        onRedoIndexForce,
        onFormDesignerClose,
        onFormDesignerSuccess,
        getTableAction,
        getDropDownAction,

        registerTable,
        registerDesformModal,
        registerDesformAigcModal,
        registerFormDesignerIframeModal,
        registerAddressModal,
        registerAuthDrawer,
        registerAuthBatchModal,
        registerRouteDrawer,
        registerRedoIndexModal,
        registerIndexToolsModal,
      };
    },
  });
</script>

<style scoped></style>
