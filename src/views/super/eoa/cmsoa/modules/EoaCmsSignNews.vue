<template>
  <a-tabs v-bind="$attrs" defaultActiveKey="1" :style="{ marginTop: '12px', height: '440px', background: '#fff' }">
    <template #rightExtra>
      <a @click="loadMore('A03')" style="margin-right: 10px">更多</a>
    </template>
    <a-tab-pane key="1">
      <template #tab>
        <span><a-icon type="tags" style="margin-right: 5px" theme="filled" />签约新闻</span>
      </template>
      <!--展示规章制度信息-->
      <template v-if="newsList.length > 0">
        <a-list itemLayout="horizontal" :dataSource="newsList">
          <template #renderItem="{ item, index }" :key="index">
            <a-list-item @click.stop="showDetail(item)" style="margin: 0 10px">
              <div @click.stop="eyeClick(item)">
                <a-icon type="eye" style="margin-right: 5px" />
                {{ item.readTimes == 0 ? '' : item.readTimes }}
              </div>
              <a href="javascript:void(0)" style="margin-left: 5px; color: #000">
                <JEllipsis :value="item.title" :length="15" />
              </a>
              <div class="ant-list-item-content">{{ item.createTime }}</div>
            </a-list-item>
          </template>
        </a-list>
      </template>
      <template v-else>
        <a-empty />
      </template>
    </a-tab-pane>
  </a-tabs>
  <EoaCmsArticleReaderModal ref="readerModal"></EoaCmsArticleReaderModal>
</template>

<script lang="ts" name="eoa-cms-sign-news" setup>
  import { ref, watchEffect } from 'vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { router } from '/@/router';
  import { getSiteInfo } from '../cmsoa.api';

  const EoaCmsArticleReaderModal = createAsyncComponent(() => import('./EoaCmsArticleReaderModal.vue'));
  const JEllipsis = createAsyncComponent(() => import('/@/components/Form/src/jeecg/components/JEllipsis.vue'));

  const newsList = ref([]);
  const readerModal = ref();
  const emit = defineEmits(['compRouter', 'btnClick']);
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

  watchEffect(() => {
    if (props.formData && props.formData.length > 0) {
      newsList.value = props.formData;
    } else {
      initInfo();
    }
  });

  async function initInfo() {
    const res = await getSiteInfo();
    if (res.success) {
      newsList.value = res.result.SIGN_NEWS;
    }
  }
  function loadMore(type) {
    !props.isDesign && router.push({ path: '/eoa/cms/eoaCmsArticlePortal', query: { type } });
  }

  function showDetail(item) {
    !props.isDesign && router.push({ path: '/eoa/cms/eoaCmsArticleDetail', query: { id: item.id } });
  }

  function eyeClick(item) {
    readerModal.value.show(item);
  }
</script>

<style scoped></style>
