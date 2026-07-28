<template>
  <a-card v-bind="$attrs" :bordered="false" :style="{ marginTop: '12px', height: '670px' }">
    <template #title>
      <span> <a-icon type="tags" style="color: #3393fc; margin-right: 5px" theme="filled" />新闻动态</span>
    </template>
    <template #extra>
      <a @click="loadMore('A01')">更多</a>
    </template>
    <!--展示新闻动态信息-->
    <template v-if="newInfos && newInfos.length > 0">
      <a-list itemLayout="horizontal" :dataSource="newInfos" class="tableList">
        <template #renderItem="{ item, index }" :key="index">
          <a-list-item @click.stop="showDetail(item)" style="margin: 10px 0">
            <a-list-item-meta :description="contentFilter(item.content)">
              <template #title>
                <a href="javascript:void(0)" @click.stop="showDetail(item)">{{ item.title }}</a>
              </template>
              <template #avatar>
                <img :src="getAvatarView(item.imageHref)" style="width: 220px; height: 110px" />
              </template>
            </a-list-item-meta>
            <template #actions>
              <span @click.stop="eyeClick(item)">
                <a-icon type="eye" style="margin-right: 5px;cursor: pointer;" />{{ item.readTimes == 0 ? '' : item.readTimes }}
              </span>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </template>
    <template v-else>
      <a-empty />
    </template>
  </a-card>
  <EoaCmsArticleReaderModal ref="readerModal"></EoaCmsArticleReaderModal>
</template>

<script lang="ts" name="eoa-cms-news-info" setup>
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { getSiteInfo } from '../cmsoa.api';
  import { reactive, ref, unref, onMounted, toRaw, watchEffect } from 'vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { connectWebSocket, onWebSocket } from '/@/hooks/web/useWebSocket';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter } from 'vue-router';

  const EoaCmsArticleReaderModal = createAsyncComponent(() => import('./EoaCmsArticleReaderModal.vue'));

  const router = useRouter();
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
  const userStore = useUserStore();
  const glob = useGlobSetting();
  const newInfos = ref([]);
  const readerModal = ref();

  watchEffect(() => {
    if (props.formData && props.formData.length > 0) {
      newInfos.value = props.formData;
    } else {
      initSiteInfo();
    }
  });

  function loadMore(type) {
    !props.isDesign && router.push({ path: '/eoa/cms/eoaCmsArticlePortal', query: { type } });
  }

  function contentFilter(content) {
    let reg2 = /<\/?.+?\/?>/g;
    content = content.replace(reg2, '').replace(new RegExp('&nbsp;', 'gm'), '').replace(new RegExp('&darr;', 'gm'), '');
    if (content.length > 100) {
      content = content.slice(0, 100) + '......';
    }
    return content;
  }

  async function initSiteInfo() {
    const res = await getSiteInfo();
    if (res.success) {
      newInfos.value = res.result.NEWS_INFO;
    }
  }

  function showDetail(item) {
    !props.isDesign && router.push({ path: '/eoa/cms/eoaCmsArticleDetail', query: { id: item.id } });
  }

  function getAvatarView(url) {
    return getFileAccessHttpUrl(url);
  }

  function eyeClick(item) {
    !props.isDesign && readerModal.value.show(item);
  }

  onMounted(() => {
    initWebSocket();
  });

  // 初始化 WebSocket
  function initWebSocket() {
    let userId = unref(userStore.getUserInfo).id;
    // WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
    let url = glob.uploadUrl?.replace('https://', 'wss://').replace('http://', 'ws://') + '/socketUrl/' + userId;
    connectWebSocket(url);
    onWebSocket(onWebSocketMessage);
  }

  function onWebSocketMessage(data) {
    //解析对象
    if (data.cmd == 'publish') {
      //查询新闻
      initSiteInfo();
    }
  }
</script>

<style scoped></style>
