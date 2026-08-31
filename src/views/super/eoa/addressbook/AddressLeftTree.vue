<template>
  <a-card :bordered="false" style="height: 100%">
    <a-spin :spinning="loading">
      <!--组织机构树-->
      <template v-if="treeData.length > 0">
        <a-tree
          v-if="!treeReloading"
          showLine
          :clickRowToExpand="false"
          :treeData="treeData"
          :selectedKeys="selectedKeys"
          :load-data="loadChildrenTreeData"
          v-model:expandedKeys="expandedKeys"
          @select="onSelect"
        ></a-tree>
      </template>
      <a-empty v-else description="暂无数据" />
    </a-spin>
  </a-card>
</template>

<script lang="ts" setup>
  import { nextTick, ref, unref } from 'vue';
  import { queryDepartTreeSync } from '/@/views/system/depart/depart.api';
  import {defHttp} from "/@/utils/http/axios";

  const emit = defineEmits(['select', 'rootTreeData']);

  const loading = ref<boolean>(false);
  // 部门树列表数据
  const treeData = ref<any[]>([]);
  // 当前展开的项
  const expandedKeys = ref<any[]>([]);
  // 当前选中的项
  const selectedKeys = ref<any[]>([]);
  // 树组件重新加载
  const treeReloading = ref<boolean>(false);
  // 当前选中的部门
  const currentDepart = ref<any>(null);
  //租户id
  const tenantId = ref<number>(0);
  const Api  ={
    queryBookDepTreeSync: '/sys/sysDepart/queryBookDepTreeSync'
  }
  //部门名称
  const departName = ref<string>('')

  // 加载顶级部门信息
  async function loadRootTreeData(data) {
    try {
      expandedKeys.value = []
      loading.value = true;
      tenantId.value = data.id;
      let params = {tenantId: unref(tenantId),departName:unref(departName)};
      const result = await defHttp.get({ url: Api.queryBookDepTreeSync, params });
      if (Array.isArray(result)) {
        treeData.value = result;
      }else{
        treeData.value = [];
      }
      if (expandedKeys.value.length === 0) {
        autoExpandParentNode();
      }
    } finally {
      loading.value = false;
    }
  }

  // 加载子级部门信息
  async function loadChildrenTreeData(treeNode) {
    try {
      let params = {
        pid: treeNode.dataRef.id,
        tenantId: unref(tenantId),
        departName: unref(departName)
      }
      const result = await defHttp.get({ url: Api.queryBookDepTreeSync, params });
      if (result.length == 0) {
        treeNode.dataRef.isLeaf = true;
      } else {
        treeNode.dataRef.children = result;
        if (expandedKeys.value.length > 0) {
          // 判断获取的子级是否有当前展开的项
          let subKeys: any[] = [];
          for (let key of expandedKeys.value) {
            if (result.findIndex((item) => item.id === key) !== -1) {
              subKeys.push(key);
            }
          }
          if (subKeys.length > 0) {
            expandedKeys.value = [...expandedKeys.value];
          }
        }
      }
      treeData.value = [...treeData.value];
    } catch (e) {
      console.error(e);
    }
    return Promise.resolve();
  }

  // 自动展开父节点，只展开一级
  function autoExpandParentNode() {
    let item = treeData.value[0];
    if (item) {
      if (!item.isLeaf) {
        expandedKeys.value = [item.key];
      }
      reloadTree();
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
    selectedKeys.value = [key];
    if (data) {
      currentDepart.value = data;
      emit('select', data);
    }
  }

  // 树选择事件
  function onSelect(selKeys, event) {
    if (selKeys.length > 0 && selectedKeys.value[0] !== selKeys[0]) {
      setSelectedKey(selKeys[0], event.selectedNodes[0]);
    } else {
      // 这样可以防止用户取消选择
      setSelectedKey(selectedKeys.value[0]);
    }
  }

  /**
   * 清除选中(避免数据出现混乱)
   */
  function clearSelectedKeys() {
    selectedKeys.value = [];
  }

  /**
   * 搜索部门
   * @param val
   */
  function searchDepart(val) {
     nextTick(()=>{
       departName.value = val.departName;
       loadRootTreeData(val);
     })
  }

  /**
   * 清空部门名称
   */
  function clearDepartName() {
    departName.value = '';
  }
  
  defineExpose({
    loadRootTreeData,
    clearSelectedKeys,
    searchDepart,
    clearDepartName
  });
</script>
