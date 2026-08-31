<template>
  <PageWrapper>
    <template #headerContent>
      <DynamicEoaCms :path="comps.module1.function" :formData="getFormData(comps.module1)"></DynamicEoaCms>
    </template>
    <div class="lg:flex">
      <div class="lg:w-7/10 w-full !mr-4 enter-y">
        <DynamicEoaCms :path="comps.module2.function" :formData="getFormData(comps.module2)"></DynamicEoaCms>
        <div class="lg:flex">
          <div class="lg:w-5/10 w-full !mr-4">
            <DynamicEoaCms :path="comps.module3.function" :formData="getFormData(comps.module3)"></DynamicEoaCms>
          </div>
          <div class="lg:w-5/10">
            <DynamicEoaCms :path="comps.module4.function" :formData="getFormData(comps.module4)"></DynamicEoaCms>
          </div>
        </div>
      </div>
      <div class="lg:w-3/10 w-full enter-y">
        <DynamicEoaCms :path="comps.module5.function" :formData="getFormData(comps.module5)"></DynamicEoaCms>
        <DynamicEoaCms :path="comps.module6.function" :formData="getFormData(comps.module6)"></DynamicEoaCms>
        <DynamicEoaCms :path="comps.module7.function" :formData="getFormData(comps.module7)"></DynamicEoaCms>
      </div>
    </div>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { reactive, ref, unref } from 'vue';
  import { getSiteInfo, getUserNoticeInfo, queryPortalSite } from './cmsoa.api';
  import DynamicEoaCms from './modules/DynamicEoaCms.vue';
  import { PageWrapper } from '/@/components/Page';

  const code = 'enterprisePortal';
  const dataInfo = reactive({
    siteInfo: {},
    userNotice: [],
    carouselImg: [],
    signNews: [],
    newsInfo: [],
    ruleDownInfo: {
      ruleInfo: [],
      downloadInfo: [],
    },
  });
  const comps = reactive({ module1: {}, module2: {}, module3: {}, module4: {}, module5: {}, module6: {}, module7: {} });
  const portalId = ''; //TODO 从路由中获取

  initSiteInfo();

  async function initSiteInfo() {
    const res = await getSiteInfo();
    if (res.success) {
      dataInfo.siteInfo = res.result;
      dataInfo.signNews = res.result.SIGN_NEWS;
      dataInfo.newsInfo = res.result.NEWS_INFO;
      dataInfo.ruleDownInfo.ruleInfo = res.result.Rule;
      dataInfo.ruleDownInfo.downloadInfo = res.result.DOWNLOAD;
      if (res.result?.site[0]?.carouselImg) {
        dataInfo.carouselImg = res.result?.site[0]?.carouselImg.split(',');
        console.log('dataInfo.carouselImg====》', dataInfo.carouselImg);
      }
    }
    const noticeRes = await getUserNoticeInfo({ pageNo: 1, pageSize: 5 });
    if (noticeRes.success) {
      dataInfo.userNotice = noticeRes?.result?.records || {};
    }
    let params = { portalType: code };
    if (portalId) {
      params['id'] = portalId;
    }
    const portalRes = await queryPortalSite(params);
    if (portalRes.success) {
      let records = portalRes.result.records[0].dataJson;
      let tempList = JSON.parse(records);
      for (let item of tempList) {
        switch (item.name) {
          case 'module1':
            comps.module1 = item;
            break;
          case 'module2':
            comps.module2 = item;
            break;
          case 'module3':
            comps.module3 = item;
            break;
          case 'module4':
            comps.module4 = item;
            break;
          case 'module5':
            comps.module5 = item;
            break;
          case 'module6':
            comps.module6 = item;
            break;
          default:
            comps.module7 = item;
            break;
        }
      }
      console.log('comps====>', comps);
    }
  }

  function getFormData(module) {
    return dataInfo[module.formData];
  }
</script>

<style lang="less" scoped>
  :deep(.fc-center) {
    font-size: x-small;
  }

  :deep(.fc-button-primary) {
    background-color: @primary-color !important;
    border-color: @primary-color !important;
  }
</style>
