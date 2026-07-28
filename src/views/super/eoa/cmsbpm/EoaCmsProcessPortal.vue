<template>
  <div class="p-4">
    <!--头部导航-->
    <a-row :gutter="24">
      <a-col>
        <DynamicEoaCms :path="comps.module1.function" :formData="getFormData(comps.module1)"></DynamicEoaCms>
      </a-col>
    </a-row>
    <!--流程中心、流程提醒-->
    <a-row :gutter="24">
      <a-col :span="16" :style="{ paddingRight: '-12px' }">
        <DynamicEoaCms :path="comps.module2.function" :formData="getFormData(comps.module2)"></DynamicEoaCms>
      </a-col>
      <a-col :span="8">
        <DynamicEoaCms :path="comps.module3.function" :formData="getFormData(comps.module3)"></DynamicEoaCms>
      </a-col>
    </a-row>
    <!--我的申请、系统公告-->
    <a-row :gutter="24">
      <a-col :span="16" :style="{ paddingRight: '-12px' }">
        <DynamicEoaCms :path="comps.module4.function" :formData="getFormData(comps.module4)"></DynamicEoaCms>
      </a-col>
      <a-col :span="8">
        <DynamicEoaCms :path="comps.module5.function" :formData="getFormData(comps.module5)"></DynamicEoaCms>
      </a-col>
    </a-row>
    <!--流程数据分析、流程类型统计-->
    <a-row :gutter="24">
      <a-col :span="16" :style="{ paddingRight: '-12px' }">
        <DynamicEoaCms :path="comps.module6.function" :formData="getFormData(comps.module6)"></DynamicEoaCms>
      </a-col>
      <a-col :span="8">
        <DynamicEoaCms :path="comps.module7.function" :formData="getFormData(comps.module7)"></DynamicEoaCms>
      </a-col>
    </a-row>
    <!--近期邮件、我的计划-->
    <a-row :gutter="24">
      <a-col :span="16" :style="{ paddingRight: '-12px' }">
        <DynamicEoaCms :path="comps.module8.function" :formData="getFormData(comps.module8)"></DynamicEoaCms>
      </a-col>
      <a-col :span="8">
        <DynamicEoaCms :path="comps.module9.function" :formData="getFormData(comps.module9)"></DynamicEoaCms>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, unref } from 'vue';
  import { getSiteInfo, getUserNoticeInfo, queryPortalSite } from '/@/views/super/eoa/cmsoa/cmsoa.api.ts';
  import DynamicEoaCms from './modules/DynamicEoaCms.vue';

  const code = 'processPortal';
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
  const comps = reactive({ module1: {}, module2: {}, module3: {}, module4: {}, module5: {}, module6: {}, module7: {}, module8: {}, module9: {} });
  const portalId = ''; //TODO 从路由中获取

  initNoticePlanEmailInfo();

  async function initNoticePlanEmailInfo() {
    const res = await getSiteInfo();
    console.log('res==》流程', res);
    if (res.success) {
      dataInfo.siteInfo = res.result;
      dataInfo.signNews = res.result.SIGN_NEWS;
      dataInfo.newsInfo = res.result.NEWS_INFO;
      dataInfo.ruleDownInfo.ruleInfo = res.result.Rule;
      dataInfo.ruleDownInfo.downloadInfo = res.result.DOWNLOAD;
      if (res.result?.site[0]?.carouselImg) {
        dataInfo.carouselImg = res.result.site[0].carouselImg.split(',');
      }
    }

    const noticeRes = await getUserNoticeInfo({ pageNo: 1, pageSize: 5 });
    if (noticeRes.success) {
      dataInfo.userNotice.value = noticeRes?.result?.records || {};
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
          case 'module7':
            comps.module7 = item;
            break;
          case 'module8':
            comps.module8 = item;
            break;
          default:
            comps.module9 = item;
            break;
        }
      }
      console.log('comps====>流程', comps);
    }
  }

  function getFormData(module) {
    return dataInfo[module.formData];
  }
</script>

<style lang="less" scoped>
  .ant-list-item-meta-title {
    font-weight: 600;
  }

  .demo-infinite-container {
    border: 1px solid #e8e8e8;
    overflow: auto;
    height: 95px;
  }

  .demo-loading-container {
    position: absolute;
    bottom: 40px;
    width: 100%;
    text-align: center;
  }

  .timespan {
    background: #f5f5f5;
    width: 100px;
    height: 30px;
    line-height: 30px;
    text-align: center;
  }

  .demo-infinite-container .ant-list-item {
    padding: 0 0;
  }

  .headicon {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 0;
  }
  .header1 {
    width: 100%;
    text-align: center;
    display: flex;
    background-color: white;
    border-bottom: 1px solid #e7eaec;
    height: 42px;
    border-top: 1px solid #e7eaec;
    margin-top: 10px;
  }
  .full-calendar {
    margin: 0 30px 0 30px !important;
  }

  :deep(.fc-center) {
    font-size: x-small;
  }

  :deep(.fc-button-primary) {
    background-color: @primary-color !important;
    border-color: @primary-color !important;
  }
</style>
