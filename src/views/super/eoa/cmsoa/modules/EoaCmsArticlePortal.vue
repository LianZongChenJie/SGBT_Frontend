<template>
  <!--轮播图-->
  <ACarousel autoplay>
    <div v-for="(item, index) in carouselImg" :key="index" v-if="carouselImg.length > 0">
      <img :src="getAvatarView(item)" style="height: 220px; width: 100%" />
    </div>
  </ACarousel>
  <!--目录树结构-->
  <a-card style="width: 100%; margin: 0 12px" :style="{ height: '700px' }">
    <a-row :gutter="24">
      <a-col :span="4">
        <a-directory-tree :treeData="treeData" defaultExpandAll v-model:selectedKeys="selectedKeys" @select="onSelect" @expand="onExpand" />
      </a-col>
      <!--目录内容-->
      <a-col :span="16">
        <EoaCmsMenuArticleList ref="eoaCmsMenuArticleList"></EoaCmsMenuArticleList>
      </a-col>
    </a-row>
  </a-card>
</template>

<script lang="ts" setup>
  import { ref, unref, onMounted } from 'vue';
  import EoaCmsMenuArticleList from './EoaCmsMenuArticleList.vue';
  import { getSiteInfo } from '../cmsoa.api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { Carousel } from 'ant-design-vue';
  import type { TreeProps } from 'ant-design-vue';
  import { useRouter } from 'vue-router';

  const ACarousel = Carousel;
  const { currentRoute } = useRouter();

  const eoaCmsMenuArticleList = ref();

  const carouselImg = ref([]);
  const selectedKeys = ref([]);

  const route = unref(currentRoute);

  onMounted(() => {
    if (route.query.type) {
      selectedKeys.value = [];
      selectedKeys.value.push(route.query.type);
    }
    eoaCmsMenuArticleList.value.loadList(route.query.type);
    loadMenuArticle();
  });

  function loadMenuArticle() {
    getSiteInfo().then((res) => {
      if (res.success && res.result.site[0].carouselImg) {
        carouselImg.value = res.result.site[0].carouselImg.split(',');
      }
    });
  }

  function onSelect(keys) {
    console.log('keys', keys);
    if (keys[0] !== 'A0') {
      eoaCmsMenuArticleList.value.loadList(keys[0]);
    }
  }

  function onExpand() {
    console.log('Trigger Expand');
  }
  const treeData: TreeProps['treeData'] = [
    {
      title: '目录',
      key: 'A0',
      children: [
        {
          title: '新闻动态',
          key: 'A01',
          isLeaf: true,
        },
        {
          title: '规章制度',
          key: 'A02',
          isLeaf: true,
        },
        {
          title: '签约新闻',
          key: 'A03',
          isLeaf: true,
        },
        {
          title: '常用下载',
          key: 'A04',
          isLeaf: true,
        },
      ],
    },
  ];
  function getAvatarView(url) {
    return getFileAccessHttpUrl(url);
  }
</script>

<style lang="less" scoped>
  .ant-list-item-meta-title {
    font-weight: 600;
  }

  .demo-infinite-container {
    border: 1px solid #e8e8e8;
    overflow: auto;
    padding: 8px 24px;
    overflow: auto;
    height: 100px;
  }

  .demo-loading-container {
    position: absolute;
    bottom: 40px;
    width: 100%;
    text-align: center;
  }
</style>
