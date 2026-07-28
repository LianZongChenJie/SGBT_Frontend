<template>
  <a-card v-bind="$attrs" :bordered="false" :style="{ marginTop: '12px', height: '395px', overflow:'hidden' }">
    <template #title>
      <span> <a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />系统公告</span>
    </template>
    <template #extra>
      <a @click="loadMore('notice')">更多</a>
    </template>
    <template v-if="noticeList && noticeList.length > 0">
      <a-list itemLayout="horizontal" :dataSource="noticeList">
        <template #renderItem="{ item, index }" :key="index">
          <a-list-item @click.stop="showAnnouncement(item)">
            <a-list-item-meta>
              <template #title>
                <a href="javascript:void(0)" :style="{ color: item.readFlag == '0' ? '' : '#d2d2d2' }">{{ item.titile }}</a>
              </template>
            </a-list-item-meta>
            <div>{{ item.sendTime }}</div>
          </a-list-item>
        </template>
      </a-list>
    </template>
    <template v-else>
      <a-empty />
    </template>
    <DynamicNotice ref="showDynamNotice" :path="openPath" :formData="formDataNotice" />
    <EoaDetailModal ref="detailRef" />
  </a-card>
</template>

<script lang="ts" name="eoa-cms-user-notice" setup>
  import { ref, getCurrentInstance, watchEffect } from 'vue';
  import { getUserNoticeInfo, editReadStatus } from '../cmsoa.api';
  import DynamicNotice from '/@/views/monitor/mynews/DynamicNotice.vue';
  import EoaDetailModal from './EoaDetailModal.vue';
  import { router } from '/@/router';

  const noticeList = ref([]);
  const detailRef = ref();
  const showDynamNotice = ref();

  const props = defineProps({
    formData: {
      type: Array,
      required: false,
      default: () => [],
    },
    isDesign: {
      type: Boolean,
      required: false,
      default: false,
    },
    size: {
      type: [String, Object],
    },
  });
  const instance: any = getCurrentInstance();
  const formDataNotice = ref({});
  const openPath = ref('');

  watchEffect(() => {
    if (props.formData && props.formData.length > 0) {
      noticeList.value = props.formData;
    } else {
      initInfo();
    }
  });
  async function initInfo() {
    const res = await getUserNoticeInfo();
    if (res.success) {
      noticeList.value = res.result.records || {};
    }
  }
  async function loadMore(type) {
    !props.isDesign && (await router.push({ path: '/monitor/mynews' }));
  }

  async function showAnnouncement(record) {
    const res = await editReadStatus({ anntId: record.anntId });
    if (record.openType === 'component') {
      openPath.value = record.openPage;
      formDataNotice.value = { id: record.busId };
      showDynamNotice.value.detail(record.openPage);
    } else {
      detailRef.value.show({
        record,
        isUpdate: true,
      });
    }
  }
</script>

<style scoped></style>
