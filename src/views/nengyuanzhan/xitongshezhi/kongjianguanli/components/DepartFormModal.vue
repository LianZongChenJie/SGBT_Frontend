<template>
  <BasicModal :title="title" :width="800" v-bind="$attrs" @ok="handleOk" @register="registerModal">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { nextTick, computed, ref, unref } from 'vue';

  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  import { saveOrUpdateDepart, getTreeListSpace } from '../depart.api';
  import { useBasicFormSchema } from '../depart.data';

  const emit = defineEmits(['success', 'register']);
  // 当前是否是更新模式
  const isUpdate = ref<boolean>(false);
  // 当前的弹窗数据
  const model = ref<object>({});
  const title = computed(() => (isUpdate.value ? '编辑' : '新增'));

  //注册表单
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: useBasicFormSchema().basicFormSchema,
    showActionButtonGroup: false,
  });

  function normalizeSpaceTreeData(list: Record<string, any>[] = []): Record<string, any>[] {
    return list.map((item) => ({
      ...item,
      id: item.id ?? item.value,
      label: item.label ?? item.spaceName ?? item.title ?? '',
      children: Array.isArray(item.children) ? normalizeSpaceTreeData(item.children) : [],
    }));
  }

  function findTreeNodeById(list: Record<string, any>[] = [], targetId?: string | number) {
    if (targetId == null || targetId === '') {
      return null;
    }

    for (const item of list) {
      if (String(item.id) === String(targetId)) {
        return item;
      }
      const matchedChild = findTreeNodeById(item.children, targetId);
      if (matchedChild) {
        return matchedChild;
      }
    }

    return null;
  }

  // 注册弹窗
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await resetFields();
    isUpdate.value = unref(data?.isUpdate);
    // 当前是否为添加子级
    let isChild = unref(data?.isChild);
    // 隐藏不需要展示的字段
    const treeData = normalizeSpaceTreeData(await getTreeListSpace());
    await updateSchema([
      {
        field: 'parentId',
        show: isChild,
        componentProps: {
          disabled: isChild,
          treeData: Array.isArray(treeData) ? treeData : [],
        },
      },
      {
        field: 'id',
        show: false,
      },
    ]);
    // await updateSchema([
    //   {
    //     field: 'parentId',
    //     show: isChild,
    //     componentProps: {
    //       // 如果是添加子部门，就禁用该字段
    //       disabled: isChild,
    //       treeData: props.rootTreeData,
    //     },
    //   },
    //   {
    //     field: 'id',
    //     show: false,
    //   },
    //   // {
    //   //   field: 'orgCategory',
    //   //   componentProps: {options: categoryOptions},
    //   // },
    // ]);

    let record = unref(data?.record);
    if (typeof record !== 'object') {
      record = {};
    }
    // 赋默认值
    record = Object.assign(
      {
        id: undefined,
        parentId: undefined,
      },
      record
    );

    const matchedParentNode = findTreeNodeById(treeData, record.parentId);
    if (matchedParentNode) {
      record.parentId = matchedParentNode.id;
    }

    await nextTick();
    model.value = record;
    await setFieldsValue({ ...record });
  });

  // 提交事件
  async function handleOk() {
    try {
      setModalProps({ confirmLoading: true });
      let values = await validate();
      //提交表单
      await saveOrUpdateDepart(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
