<template>
  <div class="app-container">
    <a-row :gutter="10">
      <a-col :span="6">
        <a-card>
          <a-tabs v-model:activeKey="activeKey" size="small" type="card">
            <a-tab-pane key="2" force-render tab="摄像机组">
              <div class="treeBox">
                <DepartLeftTree ref="leftTree" @select="onTreeSelect" />
              </div>
            </a-tab-pane>
          </a-tabs>

          <a-card class="mt2" size="small" title="录像搜索">
            <div>
              <BasicTable @register="registerTable">
                <template #action="{ record }">
                  <TableAction :actions="getActions(record)" />
                </template>
              </BasicTable>
            </div>
          </a-card>
        </a-card>
      </a-col>
      <a-col :span="18">
        <a-card class="history-player-card">
          <div class="history-player-panel">
            <div class="player_container player_container_1">
              <div class="player_item">
                <div class="slot_header">
                  <span class="slot_index">回放</span>
                  <span class="slot_name">{{ currentHistoryLabel }}</span>
                </div>
                <div class="player_box" id="player_box1"></div>
              </div>
            </div>

            <div class="control-row">
              <div class="control-actions">
                <div v-if="isPlaying" class="radio-item" @click="onReplay">重播</div>
                <div v-else class="radio-item" @click="onPlayer">播放</div>
                <div class="radio-item" @click="onPause">暂停</div>
                <div class="radio-item" @click="setFullscreen">全屏</div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import DepartLeftTree from '@/views/nengyuanzhan/anhuanguanli/shebeiguankong/shipinshebeiguanli/components/DepartLeftTree.vue';
  import { useEasyPlayer } from '@/views/nengyuanzhan/anhuanguanli/hooks/useEasyPlayer';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { columns, searchFormSchema } from './demo.data';
  import { getDemoList } from './demo.api';

  interface VideoTreeNode {
    key?: string;
    camera?: string;
  }

  interface HistoryRecord {
    id?: string | number;
    beginTime?: string;
    endTime?: string;
    url?: string;
  }

  const activeKey = ref('2');
  const deviceCode = ref('');
  const videoUrl = ref('');
  const isPlaying = ref(false);
  const currentRecord = ref<HistoryRecord | null>(null);
  const {
    create: createPlayer,
    destroy: destroyPlayer,
    pause: pausePlayer,
    play: playPlayer,
    setFullscreen: setPlayerFullscreen,
  } = useEasyPlayer({
    playbackRate: (rate, player) => {
      player.setRate?.(rate);
    },
  });

  const currentHistoryLabel = computed(() => {
    const record = currentRecord.value;
    if (!record?.url) {
      return '当前回放：未选择录像';
    }

    const beginTime = record.beginTime || '--';
    const endTime = record.endTime || '--';
    return `当前回放：${beginTime} 至 ${endTime}`;
  });

  const [registerTable] = useTable({
    api: getDemoList,
    immediate: false,
    columns,
    formConfig: {
      labelWidth: 90,
      schemas: searchFormSchema,
      autoAdvancedCol: 1,
      actionColOptions: {
        span: 24,
        style: { textAlign: 'left', whiteSpace: 'nowrap' },
      },
      showAdvancedButton: false,
    },
    beforeFetch: (params) => {
      return {
        ...params,
        deviceCode: deviceCode.value,
      };
    },
    striped: true,
    useSearchForm: true,
    showTableSetting: false,
    clickToRowSelect: false,
    bordered: true,
    showIndexColumn: true,
    indexColumnProps: {
      fixed: 'left',
    },
    tableSetting: { fullScreen: true },
    canResize: true,
    rowKey: 'id',
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  });

  function getActions(record: HistoryRecord) {
    return [
      {
        label: '查看',
        onClick: handleDetail.bind(null, record),
      },
    ];
  }

  async function resetPlaybackState(options: { clearRecord?: boolean } = {}) {
    isPlaying.value = false;

    if (options.clearRecord) {
      currentRecord.value = null;
      videoUrl.value = '';
    }

    await recreateHistoryPlayer();
  }

  async function onTreeSelect(data: VideoTreeNode) {
    if (data.camera === 'true') {
      deviceCode.value = data.key || '';
      await resetPlaybackState({ clearRecord: true });
    }
  }

  async function createHistoryPlayer() {
    return createPlayer('player_box1', {
      isLive: false,
      MSE: false,
      WCS: false,
      hasAudio: false,
      hiddenRightMenu: true,
    });
  }

  async function recreateHistoryPlayer() {
    await destroyPlayer();
    await nextTick();
    await createHistoryPlayer();
  }

  async function playHistoryVideo(url = videoUrl.value) {
    if (!url) {
      message.warning('请先选择录像记录');
      return;
    }

    isPlaying.value = true;
    await playPlayer(url, 'playback', (error) => {
      isPlaying.value = false;
      console.error(error);
    });
  }

  async function handleDetail(record: HistoryRecord) {
    currentRecord.value = record;
    videoUrl.value = record.url || '';
    await recreateHistoryPlayer();
    await playHistoryVideo();
  }

  async function onPlayer() {
    if (!currentRecord.value?.url) {
      message.warning('请先选择录像记录');
      return;
    }

    await playHistoryVideo();
  }

  function onPause() {
    pausePlayer();
    isPlaying.value = false;
  }

  function setFullscreen() {
    setPlayerFullscreen(true);
  }

  async function onReplay() {
    if (!currentRecord.value?.url) {
      message.warning('请先选择录像记录');
      return;
    }

    await recreateHistoryPlayer();
    await playHistoryVideo();
  }

  onMounted(() => {
    void createHistoryPlayer();
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
      overflow: auto;
      height: 400px;
    }
  }

  .history-player-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    gap: 16px;
    overflow: hidden;
  }

  .history-player-card {
    height: calc(100vh - 84px);
    overflow: hidden;

    :deep(.ant-card-body) {
      height: 100%;
      overflow: hidden;
    }
  }

  .player_container {
    display: grid;
    flex: 1;
    min-height: 0;
  }

  .player_container_1 {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  .player_item {
    position: relative;
    height: 100%;
    background-color: #000;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
  }

  .slot_header {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    color: #fff;
    font-size: 12px;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.12));
  }

  .slot_index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background-color: rgba(7, 186, 244, 0.88);
    font-weight: 700;
  }

  .slot_name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .player_box {
    position: absolute;
    inset: 0;
  }

  .control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .control-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .radio-item {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    transition: all 0.2s ease;
  }

  .radio-item:hover {
    color: #07baf4;
    border-color: #07baf4;
  }
</style>
