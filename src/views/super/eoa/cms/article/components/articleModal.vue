<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" width="900" @ok="handleSubmit" destroyOnClose>
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '../article.data';
  import { saveOrUpdate, getCmsMenuList } from '../article.api';
  import { useUserStore } from '/@/store/modules/user';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const userStore = useUserStore();
  const realname = userStore.getUserInfo?.realname;
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, getFieldsValue }] = useForm({
    labelWidth: 90,
    schemas: formSchema,
    showActionButtonGroup: false,
  });

  //表单赋值
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    //重置表单
    await resetFields();
    setDrawerProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    //获取下拉树信息
    const cmsMenuTreeData = await getCmsMenuList();
    updateSchema([
      {
        field: 'columnId',
        componentProps: { treeData: cmsMenuTreeData },
      },
    ]);
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    } else {
      await setFieldsValue({ author: realname });
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  //表单提交事件
  async function handleSubmit() {
    try {
      let formValue = await validate();
      setDrawerProps({ confirmLoading: true });
      await saveOrUpdate(formValue, isUpdate.value);
      closeDrawer();
      //刷新列表
      emit('success');
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>

<style scoped></style>
