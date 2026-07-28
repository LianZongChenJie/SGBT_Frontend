<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" :width="1200" destroyOnClose>
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script name="" lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './cms.menu.data';
  import { saveOrUpdateCmsMenu, updateCmsMenu, getCmsMenuList } from './cms.menu.api';

  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);

  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, getFieldsValue }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { sm: 24, xs: 24, md: 12, lg: 12, xl: 12, xxl: 12 },
  });

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;

    //获取下拉树信息
    const cmsMenuTreeData = await getCmsMenuList();
    console.log('cmsMenuTreeData', cmsMenuTreeData);
    //update-begin---author:wangshuai---date:2024-07-04---for:【TV360X-1452】栏目管理 编辑的时候自己可以选择自己---
    if(data.isUpdate){
      //过滤掉当前节点
      await handleHiddenNode(cmsMenuTreeData,data.record.id);
    }
    //update-end---author:wangshuai---date:2024-07-04---for:【TV360X-1452】栏目管理 编辑的时候自己可以选择自己---
    updateSchema([
      {
        field: 'parentId',
        componentProps: { treeData: cmsMenuTreeData },
      },
    ]);

    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  //表单提交事件
  async function handleSubmit(v) {
    try {
      let formValue = await validate();
      setModalProps({ confirmLoading: true });
      if (isUpdate.value) {
        let allFieldsValue = getFieldsValue();
        // 编辑页面 如果表单没有父级下拉框 则提交时候 validate方法不返该值 需要手动设置
        if (!formValue.parentId && allFieldsValue.parentId) {
          formValue.parentId = allFieldsValue.parentId;
        }
        await updateCmsMenu(formValue);
      } else {
        await saveOrUpdateCmsMenu(formValue, isUpdate.value);
      }
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /**
   * 过滤掉当前节点
   *
   * @param data
   * @param id
   */
  async function handleHiddenNode(data,id) {
    if (id && data?.length) {
      for (let i = 0, len = data.length; i < len; i++) {
        const item = data[i];
        if (item.key == id) {
          data.splice(i, 1);
          i--;
          len--;
          return;
        }
        if(item.children && item.children.length>0) {
          await handleHiddenNode(item.children,id);
        }
      }
    }
  }
</script>

<style scoped></style>
