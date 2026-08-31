<template>
  <!--栏目文章详情-->
  <a-card>
    <div style="text-align: right">
      <a-icon type="close-circle" style="font-size: 20px" @click="closeCurrent" />
    </div>
    <div class="title">{{ item.title }}</div>
    <div class="author"
      >发布人：{{ item.author }} <span style="margin-left: 15px">{{ item.publishDate }}</span
      ><span @click.stop="eyeClick(item)"
        ><a-icon type="eye" style="margin: 0 5px 0 18px" />{{ item.readTimes == 0 ? '' : item.readTimes }}
      </span></div
    >
    <a-divider style="margin: 10px 0 10px 0" />
    <div v-html="item.content"></div>
  </a-card>
  <EoaCmsArticleReaderModal @register="registerModal"></EoaCmsArticleReaderModal>
</template>

<script lang="ts" setup>
  import { reactive, ref, unref, onMounted, toRaw } from 'vue';
  import { connectWebSocket, onWebSocket } from '/@/hooks/web/useWebSocket';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRouter } from 'vue-router';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { useModal } from '/@/components/Modal';
  import { recordReader, queryArticleById } from '../cmsoa.api';
  import {createAsyncComponent} from "/@/utils/factory/createAsyncComponent";
  const EoaCmsArticleReaderModal = createAsyncComponent(() => import('./EoaCmsArticleReaderModal.vue'));

  const router = useRouter();
  const { currentRoute } = router;

  const $message = useMessage();
  const userStore = useUserStore();
  const { closeCurrent } = useTabs();
  const [registerModal, { openModal }] = useModal();

  const item = ref({});

  onMounted(() => {
    const route = unref(currentRoute);
    queryArticle(route.query.id);
  });

  async function queryArticle(id) {
    const res = await queryArticleById({ id });
    if (res.success) {
      item.value = res.result;
      record();
    }
  }

  function record() {
    if (unref(item).id && userStore.getUserInfo.username) {
      recordReader({ articleId: unref(item).id, username: userStore.getUserInfo.username }).then((res) => {
        if (res.success) {
          //TODO readTimes的计算问题
          item.value.readTimes += 1;
        }
      });
    } else {
      $message.createMessage.warning('信息异常');
    }
  }

  function eyeClick(item) {
    openModal(true, {
      item,
    });
  }
</script>

<style lang="less" scoped>
  .title {
    text-align: center;
    font-size: 30px;
    font-weight: 600;
  }

  .author {
    font-size: 12px;
    margin-left: 50px;
    text-align: left;
  }
</style>
