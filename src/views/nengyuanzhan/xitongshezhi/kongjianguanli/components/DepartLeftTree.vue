<template>
  <a-card :bordered="false" style="height: 100%">
    <div class="j-table-operator" style="width: 100%">
      <a-button v-if="hasPermission('energy:dim_space:add')" type="primary" preIcon="ant-design:plus-outlined" @click="onAddDepart"> 新增 </a-button>
      <a-button v-if="hasPermission('energy:dim_space:add')" type="primary" preIcon="ant-design:plus-outlined" @click="onAddChildDepart()">
        添加下级
      </a-button>
      <template v-if="checkedKeys.length > 0 && hasPermission('energy:dim_space:deleteBatch')">
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="onDeleteBatch">
                <icon icon="ant-design:delete-outlined" />
                <span>删除</span>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            <span>批量操作 </span>
            <icon icon="akar-icons:chevron-down" />
          </a-button>
        </a-dropdown>
      </template>
    </div>
    <a-alert type="info" show-icon class="alert" style="margin-bottom: 8px">
      <template #message>
        <template v-if="checkedKeys.length > 0">
          <span>已选中 {{ checkedKeys.length }} 条记录</span>
          <a-divider type="vertical" />
          <a @click="checkedKeys = []">清空</a>
        </template>
        <template v-else>
          <span>未选中任何数据</span>
        </template>
      </template>
    </a-alert>
    <a-spin :spinning="loading">
      <a-input-search placeholder="按空间名称搜索…" style="margin-bottom: 10px" @search="onSearch" allowClear />
      <!--组织机构树-->
      <template v-if="treeData.length > 0">
        <a-tree
          v-if="!treeReloading"
          checkable
          :clickRowToExpand="false"
          :treeData="treeData"
          :selectedKeys="selectedKeys"
          :checkStrictly="checkStrictly"
          :load-data="loadChildrenTreeData"
          :checkedKeys="checkedKeys"
          v-model:expandedKeys="expandedKeys"
          @check="onCheck"
          @select="onSelect"
          :fieldNames="{ children: 'children', title: 'spaceName', value: 'id', key: 'id' }"
        >
          <template #title="{ key: treeKey, spaceName, dataRef }">
            <a-dropdown :trigger="['contextmenu']">
              <span>{{ spaceName }}</span>

              <template #overlay>
                <a-menu @click="">
                  <a-menu-item v-if="hasPermission('energy:dim_space:add')" key="1" @click="onAddChildDepart(dataRef)">添加子级</a-menu-item>
                  <a-menu-item v-if="hasPermission('energy:dim_space:edit')" key="3" @click="onEdit(dataRef)">修改</a-menu-item>
                  <!--                  <a-menu-item key="2" @click="visibleTreeKey = treeKey">-->
                  <a-menu-item v-if="hasPermission('energy:dim_space:delete')" key="2" @click="onDelete(dataRef)">
                    <span style="color: red">删除</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-tree>
      </template>
      <a-empty v-else description="暂无数据" />
    </a-spin>
    <DepartFormModal :rootTreeData="treeData" @register="registerModal" @success="loadRootTreeData" />
  </a-card>
</template>

<script lang="ts" setup>
  import { Modal } from 'ant-design-vue';
  import { inject, nextTick, ref, unref } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { deleteBatchDepart, queryDepartTreeSync, searchByKeywords } from '../depart.api';
  import DepartFormModal from './DepartFormModal.vue';

  const prefixCls = inject('prefixCls');
  const emit = defineEmits(['select', 'rootTreeData']);
  const { createMessage } = useMessage();
  const { hasPermission } = usePermission();

  const loading = ref<boolean>(false);
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  // 当前选中的项
  const checkedKeys = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys = ref<any[]>([]);
  // 树组件重新加载
  const treeReloading = ref<boolean>(false);
  // 树父子是否关联
  const checkStrictly = ref<boolean>(true);
  // 当前选中的部门
  const currentDepart = ref<any>(null);
  // 搜索关键字
  const searchKeyword = ref('');

  // 注册 modal
  const [registerModal, { openModal }] = useModal();

  function normalizeTreeNodeData(data) {
    return data?.dataRef ?? data?.node?.dataRef ?? data?.node ?? data ?? null;
  }

  function findTreeNodeById(list: Record<string, any>[] = [], targetId?: string | number) {
    if (targetId == null || targetId === '') {
      return null;
    }

    for (const item of list) {
      if (String(item.id) === String(targetId)) {
        return item;
      }
      const matchedChild = findTreeNodeById(item.children || [], targetId);
      if (matchedChild) {
        return matchedChild;
      }
    }

    return null;
  }

  // 加载顶级部门信息
  async function loadRootTreeData() {
    try {
      loading.value = true;
      treeData.value = [];
      const result = await queryDepartTreeSync();
      treeData.value = Array.isArray(result) ? result : [];
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      } else {
        if (selectedKeys.value.length === 0) {
          let item = treeData.value[0];
          if (item) {
            // 默认选中第一个
            setSelectedKey(item.id, item);
          }
        } else {
          const selectedNode = findTreeNodeById(treeData.value, selectedKeys.value[0]);
          if (selectedNode) {
            setSelectedKey(selectedNode.id, selectedNode);
          } else {
            autoExpandParentNode();
          }
        }
      }
      emit('rootTreeData', treeData.value);
    } finally {
      loading.value = false;
    }
  }

  loadRootTreeData();

  // 加载子级部门信息
  async function loadChildrenTreeData(treeNode) {
    try {
      const result = await queryDepartTreeSync({
        pid: treeNode.dataRef.id,
      });
      const children = Array.isArray(result) ? result : [];
      if (children.length === 0) {
        treeNode.dataRef.isLeaf = true;
      } else {
        treeNode.dataRef.children = children;
        if (expandedKeys.value.length > 0) {
          // 判断获取的子级是否有当前展开的项
          let subKeys: any[] = [];
          for (let key of expandedKeys.value) {
            if (children.findIndex((item) => item.id === key) !== -1) {
              subKeys.push(key);
            }
          }
          if (subKeys.length > 0) {
            expandedKeys.value = [...expandedKeys.value];
          }
        }
      }
      treeData.value = [...treeData.value];
      emit('rootTreeData', treeData.value);
    } catch (e) {
      createMessage.error('空间树加载失败');
    }
    return Promise.resolve();
  }

  // 自动展开父节点，只展开一级
  function autoExpandParentNode() {
    let item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.id];
      }
      // 默认选中第一个
      setSelectedKey(item.id, item);
      reloadTree();
    } else {
      currentDepart.value = null;
      selectedKeys.value = [];
      emit('select', null);
    }
  }

  // 重新加载树组件，防止无法默认展开数据
  async function reloadTree() {
    await nextTick();
    treeReloading.value = true;
    await nextTick();
    treeReloading.value = false;
  }

  /**
   * 设置当前选中的行
   */
  function setSelectedKey(key: string, data?: object) {
    selectedKeys.value = key != null ? [key] : [];
    const normalizedData = normalizeTreeNodeData(data);
    currentDepart.value = normalizedData;
    emit('select', normalizedData);
  }

  // 添加一级部门
  function onAddDepart() {
    openModal(true, { isUpdate: false, isChild: false });
  }

  // 添加子级部门
  function onAddChildDepart(data = currentDepart.value) {
    const recordData = normalizeTreeNodeData(data);
    if (recordData == null) {
      createMessage.warning('请先选择一个空间');
      return;
    }
    const record = { parentId: recordData.id };
    openModal(true, { isUpdate: false, isChild: true, record });
  }
  function onEdit(data) {
    const recordData = normalizeTreeNodeData(data);
    if (recordData == null) {
      createMessage.warning('请先选择一个空间');
      return;
    }
    const record = recordData;
    openModal(true, { isUpdate: true, record });
  }
  // 搜索事件
  async function onSearch(value: string) {
    if (value) {
      try {
        loading.value = true;
        treeData.value = [];
        let result = await searchByKeywords({ keyWord: value });
        treeData.value = Array.isArray(result) ? result : [];
        autoExpandParentNode();
      } finally {
        loading.value = false;
      }
    } else {
      loadRootTreeData();
    }
    searchKeyword.value = value;
  }

  // 树复选框选择事件
  function onCheck(e) {
    if (Array.isArray(e)) {
      checkedKeys.value = e;
    } else {
      checkedKeys.value = e.checked;
    }
  }

  // 树选择事件
  function onSelect(selKeys, event) {
    const selectedNode = normalizeTreeNodeData(event);
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0], selectedNode);
    } else if (selKeys.length > 0) {
      setSelectedKey(selKeys[0], selectedNode || currentDepart.value);
    } else {
      emit('select', currentDepart.value);
    }
  }

  /**
   * 根据 ids 删除部门
   * @param idListRef array
   * @param confirm 是否显示确认提示框
   */
  async function doDeleteDepart(idListRef, confirm = true) {
    const idList = unref(idListRef);
    if (idList.length > 0) {
      try {
        loading.value = true;
        await deleteBatchDepart({ ids: idList.join(',') }, confirm);
        await loadRootTreeData();
      } finally {
        loading.value = false;
      }
    }
  }
  function onDelete(data) {
    const record = normalizeTreeNodeData(data);
    if (!record?.id) {
      createMessage.warning('未获取到空间信息，无法删除');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除【${record.spaceName || '-'}】吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await doDeleteDepart([record.id], false);
      },
    });
  }
  // 删除单个部门
  // async function onDelete(data) {
  //   if (data) {
  //     onVisibleChange(false);
  //     doDeleteDepart([data.id], false);
  //   }
  // }

  // 批量删除部门
  async function onDeleteBatch() {
    await doDeleteDepart(checkedKeys);
    checkedKeys.value = [];
  }

  defineExpose({
    loadRootTreeData,
  });
</script>
