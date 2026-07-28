<template>
  <a-row :class="['p-4', `${prefixCls}--box`]" :gutter="10" style="max-height: 800px" type="flex">
    <a-col :lg="24" :md="24" :xl="4" style="margin-bottom: 10px">
      <DepartLeftTree ref="leftTree" @select="onTreeSelect" />
    </a-col>
    <a-col :lg="24" :md="24" :xl="20" style="margin-bottom: 10px">
      <div class="address-book" style="height: 100%">
        <!--引用表格-->
        <BasicTable :rowSelection="rowSelection" @register="registerTable" style="padding: 0">
          <template #tableTitle>
            <a-button v-if="hasPermission('operation:operation_video_monitor_group:add')" preIcon="ant-design:plus-outlined" type="primary" @click="handleAdd"
              >新增</a-button
            >
            <a-button
              v-if="hasPermission('operation:operation_video_monitor_group:exportXls')"
              preIcon="ant-design:export-outlined"
              type="primary"
              @click="handleExportXls('视频监控分组', getExportUrl, exportParams)"
            >
              导出
            </a-button>
            <a-dropdown v-if="checkedKeys.length > 0 && hasPermission('operation:operation_video_monitor_group:deleteBatch')">
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="hasPermission('operation:operation_video_monitor_group:deleteBatch')" key="1" @click="batchHandleDelete">
                    <Icon icon="ant-design:delete-outlined"></Icon>
                    删除
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button
                >批量操作
                <Icon icon="ant-design:down-outlined" style="fontsize: 12px"></Icon>
              </a-button>
            </a-dropdown>
          </template>
          <template #action="{ record }">
            <TableAction :actions="getActions(record)" />
          </template>
        </BasicTable>
        <DemoModal :isDisabled="isDisabled" @register="registerModal" @success="handleAddSuccess" />
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
  import { computed, provide, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import DepartLeftTree from './components/DepartLeftTree.vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { columns, searchFormSchema } from './demo.data';
  import { useModal } from '/@/components/Modal';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { filterObj } from '/@/utils/common/compUtils';
  import DemoModal from './DemoModal.vue';
  import { getDemoList, deleteDemo, batchDeleteDemo, getExportUrl } from './demo.api';
  import { usePermission } from '/@/hooks/web/usePermission';
  const { hasPermission } = usePermission();
  const { prefixCls } = useDesign('address-list');
  provide('prefixCls', prefixCls);

  // 给子组件定义一个ref变量
  const leftTree = ref();
  const isDisabled = ref(false);
  const selectedGroupId = ref<string | number>('0');
  const selectedGroupName = ref('');
  const checkedKeys = ref<Array<string | number>>([]);
  const [registerModal, { openModal }] = useModal();
  const { handleExportXls } = useMethods();
  // 列表页面公共参数、方法
  const [registerTable, { reload, getForm }] = useTable({
    title: '',
    api: getDemoList,
    columns,
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
    },
    //自定义默认排序
    // defSort: {
    //   column: 'createTime,sex',
    //   order: 'desc',
    // },
    striped: true,
    useSearchForm: true,
    showTableSetting: true,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: false,
    rowKey: 'id',
    actionColumn: {
      width: 120,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  const exportParams = computed(() => {
    const paramsForm: Record<string, unknown> = {
      ...(getForm()?.getFieldsValue?.() || {}),
    };
    if (selectedGroupName.value) {
      paramsForm.groupName = selectedGroupName.value;
    }
    if (checkedKeys.value.length > 0) {
      paramsForm.selections = checkedKeys.value.join(',');
    }
    return filterObj(paramsForm);
  });

  /**
   * 操作列定义
   * @param record
   */
  function getActions(record) {
    return [
      {
        label: '编辑',
        onClick: handleEdit.bind(null, record),
        auth: 'operation:operation_video_monitor_group:edit', //通过权限指令控制显示（有权限显示/无权限不显示）
      },
      {
        label: '删除',
        auth: 'operation:operation_video_monitor_group:delete',
        popConfirm: {
          title: '是否确认删除',
          confirm: handleDelete.bind(null, record),
        },
      },
    ];
  }

  /**
   * 选择列配置
   */
  const rowSelection = {
    type: 'checkbox',
    columnWidth: 40,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
    fixed: 'left',
  };

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

  /**
   * 新增事件
   */
  function handleAdd() {
    isDisabled.value = false;
    const record = selectedGroupId.value && selectedGroupId.value !== '0' ? { parentId: selectedGroupId.value } : {};
    openModal(true, { isUpdate: false, isChild: true, record });
  }

  /**
   * 编辑事件
   */
  function handleEdit(record) {
    isDisabled.value = false;
    openModal(true, {
      record,
      isUpdate: true,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteDemo({ id: record.id }, function () {
      checkedKeys.value = [];
      leftTree.value?.loadRootTreeData(); // ✅ 刷新左树
      reload();
    });
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDeleteDemo({ ids: checkedKeys.value }, function () {
      checkedKeys.value = [];
      leftTree.value?.loadRootTreeData(); // ✅ 刷新左树
      reload();
    });
  }

  // 左侧树选择后触发
  function onTreeSelect(data) {
    selectedGroupId.value = data.id ?? '0';
    selectedGroupName.value = data.groupName ?? '';
    checkedKeys.value = [];
    reload({
      searchInfo: {
        groupName: selectedGroupName.value,
      },
    });
  }

  function handleAddSuccess() {
    checkedKeys.value = [];
    leftTree.value?.loadRootTreeData(); // ✅ 刷新左树
    reload();
  }
</script>

<style lang="less">
  @import './index.less';
</style>
