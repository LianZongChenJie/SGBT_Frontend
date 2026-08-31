<template>
  <div style="padding: 10px">
    <div class="btnGroup">
      <a-button type="primary" @click="addNode(true)">新增根节点</a-button>
      <a-button type="primary" @click="addNode(false)">新增空间</a-button>
      <a-popconfirm title="确定要删除节点吗？" ok-text="Yes" cancel-text="No" @confirm="deleteNodeHandle">
        <a-button type="primary">删除空间</a-button>
      </a-popconfirm>
    </div>
    <div class="content">
      <a-row :gutter="10">
        <a-col :span="8">
          <div class="col">
            <a-directory-tree
              v-model:expandedKeys="expandedKeys"
              v-model:selectedKeys="selectedKeys"
              multiple
              :tree-data="treeData"
              :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
              @select="onSelectNode"
            ></a-directory-tree>
          </div>
        </a-col>
        <a-col :span="16"
          ><div class="col" v-loading="loading"><BasicForm @register="registerForm" @submit="handleSubmit" style="margin-top: 20px; margin-left: 0px" /></div
        ></a-col>
      </a-row>
    </div>
    <nodeModal @register="registerRootModal" @success="getTreeDataHandle"></nodeModal>
  </div>
</template>

<script setup lang="ts">
  import type { TreeProps } from 'ant-design-vue';
  import { ref, onMounted } from 'vue';
  import { getTreeData, detail, saveOrUpdate, deleteNode } from './space.api';
  import nodeModal from './nodeModal.vue';
  import { useModal } from '@/components/Modal';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useForm, BasicForm } from '/@/components/Form';
  import { nodeFormSchema, nodeFormDetailSchema } from './space.data';
  const { createMessage } = useMessage();
  const [registerRootModal, { openModal: openRootModal }] = useModal();
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  const treeData = ref<TreeProps['treeData']>([]);
  const parentId = ref<Number>();
  const nodePath = ref<string[]>([]);
  const isEndNode = ref<Boolean>(false);
  const spacePropertyList = ref<any[]>([]);
  const loading = ref<Boolean>(false);
  /**
   * BasicForm绑定注册;
   * useForm 是整个框架的核心用于表单渲染，里边封装了很多公共方法;
   * 支持（schemas: 渲染表单列，autoSubmitOnEnter：回车提交,submitButtonOptions：自定义按钮文本和图标等方法）；
   * 平台通过此封装，简化了代码，支持自定义扩展;
   */
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    //注册表单列
    schemas: nodeFormDetailSchema,
    //回车提交
    autoSubmitOnEnter: true,
    //不显示重置按钮
    showResetButton: false,
    //自定义提交按钮文本和图标
    submitButtonOptions: { text: '提交', preIcon: '' },
    //查询列占比 24代表一行 取值范围 0-24
    actionColOptions: { span: 17, style: { textAlign: 'right' } },
  });

  /**
   * 点击提交按钮的value值
   * @param values
   */
  async function handleSubmit() {
    try {
      loading.value = true;
      const values = await validate();
      //提交表单数据;
      delete values.projectDept;
      values.spacePropertyList = JSON.parse(values.spacePropertyList || '[]');
      spacePropertyList.value.forEach((item: any) => {
        if (item.propCode == '项目部') {
          item.value = values.value;
          item.valueTranslation = values.valueTranslation;
        }
      });
      await saveOrUpdate(values, true);
      getTreeDataHandle();
    } finally {
      loading.value = false;
    }
  }
  function addNode(isRoot: boolean) {
    if (!isRoot && !parentId.value) {
      createMessage.error('请先选择一个父节点');
      return;
    }
    openRootModal(true, { isRoot: isRoot, isUpdate: false, parentId: parentId.value, nodePath: nodePath.value.join('，') });
  }
  async function getTreeDataHandle() {
    const res = await getTreeData({});
    console.log(res);
    treeData.value = res;
  }
  async function getNodeDetail(id: string) {
    resetFields();
    loading.value = true;
    const res = await detail({ id: id });
    if (res.type == '建筑') {
      spacePropertyList.value = res.spacePropertyList || [];
      console.log(spacePropertyList.value,"sss");
      res.spacePropertyList.forEach((item: any) => {
        if (item.propCode == '项目部') {
          res.projectDept = item.value;
        }
      });
    }
    console.log(res,"sss");
    await setFieldsValue({
      ...res,
    });
    loading.value = false;
  }
  /**
   * 选择树节点时的回调函数
   *
   * @param keys 被选中的节点的 key 值，可以是单个 key 值，也可以是一个 key 值的数组
   * @param info 被选中节点的信息
   */
  function onSelectNode(keys: React.Key[] | React.Key, info: any) {
    // 处理单选和多选情况
    const selectedKey = Array.isArray(keys) ? keys[keys.length - 1] : keys;
    if (selectedKey && treeData.value) {
      // 查找选中节点的完整路径
      nodePath.value = findNodePath(treeData.value, selectedKey as string);
      sessionStorage.setItem('nodePath', nodePath.value.join('，'));
    }
    parentId.value = keys[0];
    getNodeDetail(selectedKey as string);
    console.log('选中节点路径:', nodePath.value);
    console.log('选中节点ID:', selectedKey);
    console.log('选中节点信息:', info);
    if (info.node.children.length > 0) {
      isEndNode.value = false;
    } else {
      isEndNode.value = true;
    }
  }

  // 辅助函数：从树数据中查找节点的完整路径
  function findNodePath(treeData: TreeProps['treeData'], targetId: string, path: string[] = []): string[] {
    if (!treeData) return [];
    for (const node of treeData) {
      if (!node) continue;
      const nodeId = node.id || node.key;
      if (nodeId === targetId) {
        // 找到目标节点，返回完整路径
        return [...path, node.name as string];
      }

      // 如果有子节点，递归查找
      if (node.children && node.children.length > 0) {
        const childPath = findNodePath(node.children as TreeProps['treeData'], targetId, [...path, node.name as string]);
        if (childPath.length > 0) {
          console.log('找到子节点路径:', childPath.join(' / '));
          return childPath;
        }
      }
    }

    return []; // 未找到目标节点
  }
  function deleteNodeHandle() {
    if (!isEndNode.value) {
      createMessage.error('当前节点下有子节点，不能删除');
      return;
    }
    deleteNode({ id: parentId.value }, () => {
      getTreeDataHandle();
    });
  }
  onMounted(() => {
    getTreeDataHandle();
  });
</script>

<style scoped lang="less">
  .btnGroup {
    padding: 20px;
    background: #fff;
    border-radius: 2px;
    .ant-btn {
      margin-right: 10px;
    }
  }
  .content {
    .col {
      background: #fff;
      padding: 20px;
      margin-top: 20px;
    }
  }
</style>
