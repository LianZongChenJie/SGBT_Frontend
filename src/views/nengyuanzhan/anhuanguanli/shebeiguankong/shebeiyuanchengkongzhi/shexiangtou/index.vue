<template>
  <div class="app-container">
    <a-row :gutter="10">
      <a-col :span="4">
        <a-card class="treeBox">
          <a-tabs v-model:activeKey="activeKey" size="small" type="card">
            <a-tab-pane key="1" tab="设备列表">
              <ShebeiList ref="leftTree" @select="onTreeSelect" />
            </a-tab-pane>
            <a-tab-pane key="2" force-render tab="摄像机组">
              <ShexiangjiList ref="leftTree" @select="onTreeSelect" />
            </a-tab-pane>
          </a-tabs>
        </a-card>
        <a-card class="mt2" size="small" title="云台控制">
          <div class="flex justify-around items-start gap-4">
            <div class="yuanchengBox">
              <div class="flex justify-center">
                <a-button @click="onClickPtzControl('UP')" class="text-white" preIcon="ant-design:up-circle-outlined" type="link"></a-button>
              </div>
              <div class="flex justify-between mt3 mb3">
                <a-button @click="onClickPtzControl('LEFT')" class="text-white" preIcon="ant-design:left-circle-outlined" type="link"></a-button>
                <a-button @click="onClickPtzControl('RIGHT')" class="text-white" preIcon="ant-design:right-circle-outlined" type="link"></a-button>
              </div>
              <div class="flex justify-center">
                <a-button @click="onClickPtzControl('DOWN')" class="text-white" preIcon="ant-design:down-circle-outlined" type="link"></a-button>
              </div>
            </div>
            <div>
              <a-space>
                <a-button @click="onClickPtzControl('ZOOM_IN')" preIcon="ant-design:zoom-in-outlined" type="primary"></a-button>
                <a-button @click="onClickPtzControl('ZOOM_OUT')" preIcon="ant-design:zoom-out-outlined" type="primary"></a-button>
              </a-space>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="20">
        <a-card>
          <div :class="['player_container', 'player_container_' + radio]">
            <div v-for="(item, index) in playerList" class="player_item">
              <div :id="'player_box' + (index + 1)" class="player_box"> </div>
            </div>
          </div>

          <!--          <div class="radio-container">-->
          <!--            <div v-for="(item,index) in radioList" :key="index" :class="['radio-item',{'radio-active': radio==item.value}]"-->
          <!--                 @click="onRadio(item.value)">-->
          <!--              {{ item.label }}-->
          <!--            </div>-->

          <!--          </div>-->
        </a-card>
      </a-col>
    </a-row>

    <!--    <div class="df">-->
    <!--      <div>-->
    <!--        <input @click="onUse('hasAudio')" type="checkbox" :checked="config.hasAudio" /><span-->
    <!--        @click="onUse('hasAudio')">音频</span>-->
    <!--      </div>-->

    <!--    </div>-->
    <!--    <div class="df">-->
    <!--      <div>播放地址：</div>-->
    <!--      <input class="inputs" v-model="videoUrl">-->
    <!--    </div>-->
    <!--    <div class="df">-->
    <!--      <div class="radio-item" @click="onReplay()" v-if="isPlay">重播</div>-->
    <!--      <div class="radio-item" @click="onPlayer()" v-if="!isPlay">播放</div>-->
    <!--      <div class="radio-item" @click="onPause()">暂停</div>-->
    <!--      <div class="radio-item" @click="onMute()">静音</div>-->
    <!--      <div class="radio-item" @click="setFullscreen()">全屏</div>-->
    <!--      <div class="radio-item" @click="onStop()" v-if="isPlay">注销</div>-->
    <!--    </div>-->
  </div>
</template>
<script lang="ts" setup>
  import { message } from 'ant-design-vue';
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { useEasyPlayer } from '@/views/nengyuanzhan/anhuanguanli/hooks/useEasyPlayer';
  import { normalizeVideoStreamUrl } from '@/views/nengyuanzhan/anhuanguanli/utils/videoStreamUrl';
  import { getDemoList, setPtzControl } from '@/views/nengyuanzhan/anhuanguanli/shipinjiankong/shishishipin/depart.api';
  import ShebeiList from './shebeiList.vue';
  import ShexiangjiList from './shexiangjiList.vue';

  const activeKey = ref('1');
  const radio = ref(1);
  const deviceCode = ref('');
  const videoUrl = ref('');
  const config = ref({
    hasAudio: true,
    MSE: false,
    WCS: false,
  });
  const playerList = ref([{ index: 1 }]);
  const { create: createPlayer, destroy: destroyPlayer, play: playPlayer } = useEasyPlayer();

  // 左侧树选择后触发
  async function onTreeSelect(data) {
    if (data.camera !== 'true') {
      message.error('请选择摄像头后再播放!');
      return;
    }

    deviceCode.value = data.key;
    videoUrl.value = normalizeVideoStreamUrl(await getDemoList({ deviceCode: deviceCode.value }));
    await onPlayer();
  }

  function onClickPtzControl(command) {
    if (!deviceCode.value) {
      message.error('请先选择摄像头后再进行云台操作!');
      return;
    }
    setPtzControl({
      command,
      deviceCode: deviceCode.value,
    });
  }

  function createCurrentPlayer() {
    return createPlayer('player_box1', {
      MSE: config.value.MSE,
      WCS: config.value.WCS,
      hasAudio: config.value.hasAudio,
    });
  }

  function onPlayer() {
    if (!videoUrl.value) {
      message.warning('未获取到视频流地址');
      return;
    }

    return playPlayer(videoUrl.value, 'play');
  }

  onMounted(() => {
    void createCurrentPlayer();
  });
  onBeforeUnmount(() => {
    void destroyPlayer();
  });
</script>

<style lang="less" scoped>
  .app-container {
    padding: 10px;
    :deep(.ant-card-body) {
      padding: 10px;
    }
    .treeBox {
      height: calc(100vh - 318px);
    }
    .yuanchengBox {
      width: 120px;
      height: 120px;
      background: url('@/assets/images/yuanchengBg.png') no-repeat;
      background-size: 100% 100%;
    }
  }

  .radio-container {
    padding: 10px 0;
    display: flex;
    justify-content: flex-end;
  }

  .radio-item {
    cursor: pointer;
    display: inline-block;
    padding: 2px 6px;
    margin-right: 1px;
    border-radius: 4px;
    border: 1px #ccc solid;
  }

  .radio-active {
    color: #fff;
    background-color: #07baf4;
    border-color: #07baf4;
  }

  .player_container {
    display: grid;
  }

  .player_container_1 {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  .player_container_4 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .player_container_9 {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }

  .player_container_16 {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
  }

  .player_container_25 {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
  }

  .player_container_36 {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
  }

  .player_item {
    position: relative;
    //padding-bottom: 64.5%;
    height: calc(100vh - 152px);
    background-color: #000;
    border: 1px #fff solid;
  }

  .inputs {
    -webkit-appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    box-sizing: border-box;
    color: #606266;
    display: inline-block;
    font-size: inherit;
    height: 36px;
    line-height: 36px;
    outline: none;
    padding: 0 15px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 100%;
    max-width: 600px;
    margin-right: 16px;
  }

  .player_box {
    height: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }

  .df {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  .df span {
    margin-left: 4px;
  }

  .df form {
    margin-right: 4px;
  }
</style>
