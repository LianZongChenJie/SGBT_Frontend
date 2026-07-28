<template>
  <ACarousel autoplay v-if="refresh">
    <div v-for="(item, index) in imageList" :key="index" v-if="imageList.length > 0">
      <img :src="getAvatarView(item)" :style="styleObject" />
    </div>
    <a-empty v-else />
  </ACarousel>
</template>

<script lang="ts" name="eoa-cms-banner" setup>
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { Carousel } from 'ant-design-vue';
  import { ref, watchEffect, computed, nextTick } from 'vue';
  import { getSiteInfo } from '../cmsoa.api';

  const ACarousel = Carousel;
  const imageList = ref([]);
  const refresh = ref(true);

  const props = defineProps({
    formData: {
      type: Array,
      required: false,
      default: () => [],
    },
    size: {
      type: Object,
      default: () => {},
    },
  });

  watchEffect(() => {
    if (props.formData && props.formData.length > 0) {
      imageList.value = props.formData;
    } else {
      initSiteInfo();
    }
  });
  //监听高度变化
  watchEffect(() => {
    props.size && props.size?.height && initCarousel();
  });
  /**
   * 高度自适应
   */
  const styleObject = computed(() => {
    return {
      height: props.size && props.size?.height ? `${props.size.height}px` : '300px',
      width: '100%',
    };
  });
  function initCarousel() {
    refresh.value = false;
    nextTick(() => {
      refresh.value = true;
    });
  }
  function getAvatarView(url) {
    return getFileAccessHttpUrl(url);
  }

  async function initSiteInfo() {
    const res = await getSiteInfo();
    if (res.success) {
      if (res.result.site[0].carouselImg) {
        console.log('carouselImg', res.result.site[0].carouselImg.split(','));
        imageList.value = res.result.site[0].carouselImg.split(',');
        console.log('imageList.value', imageList.value);
      }
    }
  }
</script>

<style scoped></style>
