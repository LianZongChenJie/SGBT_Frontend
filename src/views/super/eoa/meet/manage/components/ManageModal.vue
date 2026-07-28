<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="1200px">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane tab="基本信息" key="1">
        <BasicForm @register="registerForm">
          <template #meetUse>
            <a style="color: #19a5ff; margin-left: 50px" @click="showUse">会议室使用情况</a>
          </template>
          <template #location="{ model, field }">
            <MeetRoomSelect :multi="false" v-model:value="model[field]" @change="mettingRoomChange"></MeetRoomSelect>
          </template>
        </BasicForm>
      </a-tab-pane>
      <a-tab-pane tab="签到信息" key="2">
        <a-form :model="signModel" :label-col="{ xs: { span: 24 }, sm: { span: 5 } }" :wrapper-col="{ xs: { span: 24 }, sm: { span: 16 } }">
          <a-form-item style="display: flex" label="背景颜色" :wrapper-col="{ xs: { span: 24 }, sm: { span: 8 } }">
            <a-tooltip class="setting-drawer-theme-color-colorBlock" v-for="(item, index) in colorList" :key="index">
              <template #title>
                {{ item.key }}
              </template>
              <a-tag :color="item.color" @click="signModel.bgColor = item.color">
                <a-icon type="check" v-if="item.color === signModel.bgColor" />
              </a-tag>
            </a-tooltip>
          </a-form-item>
          <!--<a-form-item label="背景图片">-->
          <!--<JImageUpload v-model:value="signModel.bgImg" :fileMax="1"></JImageUpload>-->
          <!--</a-form-item>-->
          <a-form-item label="字体颜色" :wrapper-col="{ xs: { span: 24 }, sm: { span: 8 } }">
            <a-tooltip class="setting-drawer-theme-color-colorBlock" v-for="(item, index) in colorList" :key="index">
              <template #title>
                {{ item.key }}
              </template>
              <a-tag :color="item.color" @click="signModel.fontColor = item.color">
                <a-icon type="check" v-if="item.color === signModel.fontColor" />
              </a-tag>
            </a-tooltip>
          </a-form-item>
          <a-form-item label="字体大小">
            <a-input-number
              placeholder="请输入字体大小"
              v-model:value="signModel.fontSize"
              :min="24"
              :max="100"
              :precision="0"
              style="width: 150px"
            />
            <span style="margin-left: 10px; color: red; font-size: 14px">注：字体最小值为24</span>
          </a-form-item>
          <a-form-item label="显示头像">
            <a-switch v-model:checked="signModel.showAvatar" unCheckedValue="0" checkedValue="1" />
          </a-form-item>
          <a-form-item label="显示部门">
            <a-switch v-model:checked="signModel.showDepart" unCheckedValue="0" checkedValue="1" />
          </a-form-item>
          <a-form-item label="显示签到信息">
            <a-switch v-model:checked="signModel.showSign" unCheckedValue="0" checkedValue="1" />
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
    <template #centerFooter>
      <a-button type="primary" v-if="activeKey == '2'" @click="previewSign" style="margin-right: 5px">签到预览</a-button>
    </template>
    <MeetRoomUseModal ref="roomUse"></MeetRoomUseModal>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive, toRaw, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import MeetRoomSelect from './MeetRoomSelect.vue';
  import MeetRoomUseModal from '../../meetUse/MeetRoomUseModal.vue';
  import JImageUpload from '/@/components/Form/src/jeecg/components/JImageUpload.vue';
  import { useRouter } from 'vue-router';
  import { formSchema } from '../manage.data';
  import { saveOrUpdate, queryById } from '../manage.api';
  import { pick } from 'lodash-es';
  import { colorList } from '@/views/super/eoa/plan/plan.data';

  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const router = useRouter();
  const isUpdate = ref(true);
  const activeKey = ref('1');
  const roomUse = ref(null);
  const signModel = reactive({
    bgColor: '#006699',
    bgImg: '',
    fontColor: '#FFFFFF',
    fontSize: 24,
    showAvatar: '',
    showDepart: '',
    showSign: '',
  });
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, getFieldsValue, validate, clearValidate }] = useForm({
    // labelWidth: 160,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { lg: 12, md: 24 },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    setFieldsValue({ approvalStatus: '0' });
    if (unref(isUpdate)) {
      let res = await queryById({ id: data.id });
      if (res.success) {
        let obj = res.result;
        //表单赋值
        await setFieldsValue({
          ...obj,
        });
        Object.assign(signModel, pick(obj, ['bgColor', 'fontColor', 'fontSize']));
      }
      clearValidate();
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  //选择会议室回调
  async function mettingRoomChange(room, processStatus) {
    setFieldsValue({
      location: room,
      approvalStatus: processStatus,
    });
    clearValidate(['location', 'customLocation']);
  }
  /** 确定按钮点击事件 */
  async function handleSubmit() {
    try {
      /** 触发表单验证 */
      let values = await validate();
      let allValues = Object.assign(values, toRaw(signModel));
      setModalProps({ confirmLoading: true });
      //提交表单
      await saveOrUpdate(allValues, unref(isUpdate));
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } catch (e) {
      activeKey.value = '1';
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
  async function previewSign() {
    let size = signModel.fontSize;
    let record = getFieldsValue();
    let routeUrl = router.resolve({
      path: '/meet/signPreview',
      query: {
        bgColor: signModel.bgColor,
        fontColor: signModel.fontColor,
        fontSize: size,
        id: record.id,
      },
    });
    console.log('routeUrl', routeUrl);
    window.open(routeUrl.href, '_blank');
  }

  function showUse() {
    roomUse.value.show();
  }
</script>
<style scoped>
  .setting-drawer-theme-color-colorBlock {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    cursor: pointer;
    float: left;
    margin-right: 8px;
    padding-left: 0;
    padding-right: 0;
    text-align: center;
    color: #fff;
    font-weight: 700;

    i {
      font-size: 14px;
    }
  }
</style>
