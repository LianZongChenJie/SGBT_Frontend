<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" :width="1000" @ok="handleSubmit">
    <a-form ref="formEl" :model="model" :label-col="{ xs: { span: 24 }, sm: { span: 3 } }" :wrapper-col="{ xs: { span: 24 }, sm: { span: 12 } }" :disabled="formDisabled">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane tab="站点配置" key="1">
          <a-form-item label="站点名称">
            <a-input placeholder="请输入标题" v-model:value="model.siteName" />
          </a-form-item>
          <a-form-item label="站点模板">
            <a-input placeholder="请输入站点模板" v-model:value="model.siteTemplateStyle" />
          </a-form-item>
          <a-form-item label="站点背景图片">
            <JImageUpload v-model:value="model.siteLogo" :fileMax="1" :disabled="formDisabled" />
          </a-form-item>
          <a-form-item label="站点Logo">
            <JImageUpload v-model:value="model.siteBackgroundImg" :fileMax="1" :disabled="formDisabled" />
          </a-form-item>
          <a-form-item label="站点轮播图">
            <JImageUpload v-model:value="model.carouselImg" :fileMax="5" :disabled="formDisabled" />
          </a-form-item>
        </a-tab-pane>
        <a-tab-pane tab="公司信息" key="2" forceRender>
          <a-form-item label="公司电话">
            <a-input placeholder="请输入公司电话" v-model:value="model.companyTel" />
          </a-form-item>
          <a-form-item label="经度">
            <a-input placeholder="请输入经度" v-model:value="model.longitude" />
          </a-form-item>
          <a-form-item label="纬度">
            <a-input placeholder="请输入纬度" v-model:value="model.latitude" />
          </a-form-item>
          <a-form-item label="备案信息">
            <JEditor v-model:value="model.recordInformation" :showImageUpload="false" :disabled="formDisabled"></JEditor>
          </a-form-item>
        </a-tab-pane>
        <a-tab-pane tab="分享配置" key="3" forceRender>
          <a-form-item label="分享给朋友标题">
            <a-input placeholder="请输入标题" v-model:value="model.shareFriendTitle" />
          </a-form-item>
          <a-form-item label="分享给朋友标题">
            <a-input placeholder="请输入分享给朋友描述" v-model:value="model.shareFriendDesc" />
          </a-form-item>
          <a-form-item label="分享到朋友圈标题">
            <a-input placeholder="请输入分享到朋友圈标题" v-model:value="model.shareFriendCircle" />
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { JImageUpload, JEditor } from '/@/components/Form';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface';
  import { saveOrUpdate } from '../site.api';
  // 声明Emits
  const emit = defineEmits(['success', 'register']);
  const formEl = ref();
  const confirmLoading = ref(false);
  const activeKey = ref('1');
  const isUpdate = ref(true);
  const showFooter = ref(true);
  const title = ref('编辑');
  const formDisabled = ref(false);
  //表单modal
  const model = reactive({
    id: null,
    siteName: '',
    siteTemplateStyle: '',
    siteLogo: '',
    siteBackgroundImg: '',
    carouselImg: '',

    shareFriendTitle: '',
    shareFriendDesc: '',
    shareFriendCircle: '',

    companyTel: '',
    longitude: '',
    latitude: '',
    recordInformation: '',
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    activeKey.value = '1';
    resetModal();
    showFooter.value = !!data?.showFooter;
    isUpdate.value = !!data?.isUpdate;
    setModalProps({ confirmLoading: false, showCancelBtn: unref(showFooter), showOkBtn: unref(showFooter)});
    // update-begin--author:liaozhiyang---date:20240701---for：【TV360X-1594】站点管理详情页面禁用
    title.value = showFooter.value ? '编辑' : '详情';
    formDisabled.value = !showFooter.value;
    // update-end--author:liaozhiyang---date:20240701---for：【TV360X-1594】站点管理详情页面禁用
    if (unref(isUpdate)) {
      Object.assign(model, data.record);
      model.siteLogo = getFileAccessHttpUrl(data.record.siteLogo);
      model.siteBackgroundImg = getFileAccessHttpUrl(data.record.siteLogo);
    }
  });

  /**
   * 重置modal
   */
  function resetModal() {
    Object.assign(model, {
      id: null,
      siteName: '',
      siteTemplateStyle: '',
      siteLogo: '',
      siteBackgroundImg: '',
      carouselImg: '',

      shareFriendTitle: '',
      shareFriendDesc: '',
      shareFriendCircle: '',

      companyTel: '',
      longitude: '',
      latitude: '',
      recordInformation: '',
    });
  }

  /**
   * 表单提交事件
   * */
  async function handleSubmit() {
    formEl.value
      .validate()
      .then(async () => {
        try {
          setModalProps({ confirmLoading: true });
          let formData = Object.assign({}, model);
          console.log('model====>', model);
          await saveOrUpdate(formData, unref(isUpdate));
          closeModal();
          emit('success');
        } finally {
          setModalProps({ confirmLoading: false });
        }
      })
      .catch((error: ValidateErrorEntity<any>) => {
        console.log('error', error);
      });
  }
</script>
<style lang="less" scoped></style>
