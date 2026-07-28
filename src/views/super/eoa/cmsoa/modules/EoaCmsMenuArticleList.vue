<template>
  <a-list size="large" :pagination="pagination" :dataSource="listData" :loading="spinLoading">
    <template #renderItem="{ item, index }" :key="index">
      <a-list-item v-if="item.type != 'file' && item.type != 'url'">
        <a-list-item-meta :description="contentFilter(item.content)" @click="showDetail(item)">
          <template #title>
            <a href="#">{{ item.title }}</a>
          </template>
          <template #avatar>
            <img :src="getAvatarView(item.imageHref)" style="width: 220px; height: 110px" />
          </template>
        </a-list-item-meta>
      </a-list-item>
      <a-list-item @click="recordDownload(item)" v-else>
        <a-list-item-meta>
          <template #title>
            <a v-if="item.type == 'file'" :href="getFileAccessHttpUrl(item.fileUrl)" target="_blank">{{ item.title }}</a>
            <a v-else :href="item.linkUrl" target="_blank">{{ item.title }}</a>
          </template>
          <template #avatar>
            <img :src="getAvatarView(item.imageHref)" style="width: 220px; height: 110px" />
          </template>
        </a-list-item-meta>
        <div class="ant-list-item-content">{{ item.createTime }}</div>
      </a-list-item>
    </template>
  </a-list>
</template>

<script lang="ts" setup>
  import { reactive, ref, unref, onMounted } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { router } from '/@/router';
  import { recordReader, menuArticlelist } from '../cmsoa.api';

  const $message = useMessage();
  const userStore = useUserStore();

  const type = ref('1');
  const spinLoading = ref(false);
  const listData = ref([]);
  const pagination = reactive({
    current: 1,
    showSizeChanger: false,
    showQuickJumper: true,
    pageSize: 4,
    pageSizeOptions: ['12', '24', '36'],
    total: 0,
    onChange: (page, pageSize) => {
      pageChange(page, pageSize);
    },
    onShowSizeChange: (current, pageSize) => {
      pageChange(current, pageSize);
    },
    showTotal: (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条';
    },
  });

  function recordDownload(item) {
    if (item.id && userStore.getUserInfo.username) {
      recordReader({ articleId: item.id, username: userStore.getUserInfo.username });
    } else {
      $message.createMessage.warning('信息异常');
    }
  }

  function loadDate(arg) {
    spinLoading.value = true;
    pagination.current = arg;
    var params = { type: unref(type), pageNo: pagination.current, pageSize: pagination.pageSize };
    menuArticlelist(params).then((res) => {
      if (res.success) {
        listData.value = res.result.records;
        pagination.total = res.result.total;
      }
      spinLoading.value = false;
    });
  }

  function loadList(menu) {
    type.value = menu;
    loadDate(1);
  }

  function contentFilter(content) {
    if (content && content.length > 0) {
      let reg2 = /<\/?.+?\/?>/g;
      content = content.replace(reg2, '').replace(new RegExp('&nbsp;', 'gm'), '').replace(new RegExp('&darr;', 'gm'), '');
      if (content.length > 100) {
        content = content.slice(0, 100) + '......';
      }
    }
    return content;
  }

  function getAvatarView(url) {
    return getFileAccessHttpUrl(url);
  }

  function pageChange(page, pageSize) {
    pagination.pageSize = pageSize;
    loadDate(page);
  }

  function showDetail(item) {
    router.push({ path: '/eoa/cms/eoaCmsArticleDetail', query: { id: item.id } });
  }

  defineExpose({
    loadList,
  });
</script>

<style lang="less" scoped></style>
