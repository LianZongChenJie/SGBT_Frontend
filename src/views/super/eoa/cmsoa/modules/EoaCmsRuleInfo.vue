<template>
  <a-tabs v-bind="$attrs" defaultActiveKey="1" :style="{ marginTop: '12px', height: '440px', background: '#fff' }" @change="ruleTabChange">
    <template #rightExtra>
      <a @click="loadMore(key)" style="margin-right: 10px">更多</a>
    </template>
    <a-tab-pane key="1">
      <template #tab>
        <span><a-icon type="tags" style="margin-right: 5px" theme="filled" />规章制度</span>
      </template>
      <!--展示规章制度信息-->
      <template v-if="newsInfo.ruleInfo.length > 0">
        <a-list itemLayout="horizontal" :dataSource="newsInfo.ruleInfo">
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
    <a-tab-pane key="2">
      <template #tab>
        <span><a-icon type="download" style="margin-right: 5px"></a-icon> 常用下载</span>
      </template>
      <a-list itemLayout="horizontal" :dataSource="newsInfo.downloadInfo">
        <template #renderItem="{ item, index }">
          <a-list-item :key="index" style="margin: 0 20px" @click.stop="recordDownload(item)">
            <div @click.stop="eyeClick(item)">
              <a-icon type="eye" style="margin-right: 5px" />
              {{ item.readTimes == 0 ? '' : item.readTimes }}
            </div>
            <a v-if="item.type == 'url'" style="margin-left: 5px; color: #000" :href="item.linkUrl" target="_blank">
              <JEllipsis :value="item.title" :length="15" />
            </a>
            <a v-else style="margin-left: 5px; color: #000" :href="getFileDownloadUrl(item.fileUrl)" target="_blank">
              <JEllipsis :value="item.title" :length="15" />
            </a>
            <div class="ant-list-item-content">{{ item.createTime }}</div>
          </a-list-item>
        </template>
      </a-list>
    </a-tab-pane>
  </a-tabs>
  <EoaCmsArticleReaderModal ref="readerModal"></EoaCmsArticleReaderModal>
</template>

<script lang="ts" name="eoa-cms-rule-info" setup>
  import { ref, reactive, watchEffect } from 'vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { router } from '/@/router';
  import { recordReader } from '../cmsoa.api';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getSiteInfo } from '../cmsoa.api';
  const EoaCmsArticleReaderModal = createAsyncComponent(() => import('./EoaCmsArticleReaderModal.vue'));
  const JEllipsis = createAsyncComponent(() => import('/@/components/Form/src/jeecg/components/JEllipsis.vue'));
  const emit = defineEmits(['compRouter', 'btnClick']);
  const props = defineProps({
    formData: {
      type: Object,
      required: false,
      default: () => ({}),
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
  const $message = useMessage();
  const userStore = useUserStore();
  const readerModal = ref();
  const key = ref('A02');
  const newsInfo = reactive({ ruleInfo: [], downloadInfo: [] });

  watchEffect(() => {
    if (props.formData && Object.keys(props.formData).length > 0) {
      Object.assign(newsInfo, props.formData);
    } else {
      initInfo();
    }
  });

  async function initInfo() {
    const res = await getSiteInfo();
    if (res.success) {
      newsInfo.ruleInfo = res.result.Rule;
      newsInfo.downloadInfo = res.result.DOWNLOAD;
    }
  }

  function ruleTabChange(type) {
    key.value = type == '1' ? 'A02' : 'A04';
  }

  function loadMore(type) {
    !props.isDesign && router.push({ path: '/eoa/cms/eoaCmsArticlePortal', query: { type } });
  }

  function showDetail(item) {
    !props.isDesign && router.push({ path: '/eoa/cms/eoaCmsArticleDetail', query: { id: item.id } });
  }

  function getFileDownloadUrl(path) {
    return getFileAccessHttpUrl(path);
  }

  function eyeClick(item) {
    readerModal.value.show(item);
  }

  function recordDownload(item) {
    if (item.id && userStore.getUserInfo.username) {
      recordReader({ articleId: item.id, username: userStore.getUserInfo.username });
    } else {
      if (!item.id) {
        $message.createMessage.warning('文章信息异常');
      } else {
        $message.createMessage.warning('登录信息异常');
      }
    }
  }
</script>

<style scoped></style>
