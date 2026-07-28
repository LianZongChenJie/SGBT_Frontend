<template>
  <a-card v-bind="$attrs" :bordered="false" :style="{ marginTop: '12px', height: '450px', overflow:'hidden' }">
    <template #title>
      <span> <a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />流程提醒</span>
    </template>
    <template #extra>
      <a @click="loadMore()">更多</a>
    </template>
    <template v-if="processNotice.length > 0">
      <a-list itemLayout="horizontal" :dataSource="processNotice">
        <template #renderItem="{ item, index }" :key="index">
          <a-list-item @click="showAnnouncement(item)">
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
    <DynamicNotice ref="dynamicNoticeRef" :path="openPath" :formData="formDataNotice" />
    <EoaDetailModal ref="detailRef" />
  </a-card>
</template>

<script lang="ts" setup name="eoa-cms-process-notice">
  import { ref, getCurrentInstance } from 'vue';
  import { getUserNoticeInfo, editReadStatus } from '/@/views/super/eoa/cmsoa/cmsoa.api.ts';
  import { router } from '/@/router';
  import DynamicNotice from '/@/views/monitor/mynews/DynamicNotice.vue';
  import EoaDetailModal from '../../cmsoa/modules/EoaDetailModal.vue';

  const props = defineProps({
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
  const detailRef = ref(null);
  const openPath = ref('');
  const processNotice = ref([]);

  getData();

  function getData() {
    getUserNoticeInfo({ pageNo: 1, pageSize: 5, busType: 'bpm' }).then((res) => {
      console.log('getUserNoticeInfo===busType', res);
      if (res.success) {
        processNotice.value = res.result.records;
      }
    });
  }

  async function loadMore(type) {
    !props.isDesign && (await router.push({ path: '/monitor/mynews' }));
  }

  async function showAnnouncement(record) {
    const res = await editReadStatus({ anntId: record.anntId });
    if (record.openType === 'component') {
      openPath.value = record.openPage;
      formDataNotice.value = { id: record.busId };
      instance.refs.dynamicNoticeRef?.detail(record.openPage);
    } else {
      console.log('instance.refs=====>', instance.refs);
      instance.refs.detailRef?.show({
        record,
        isUpdate: true,
      });
    }
  }
  defineExpose({
    detailRef,
  });
</script>

<style scoped></style>
