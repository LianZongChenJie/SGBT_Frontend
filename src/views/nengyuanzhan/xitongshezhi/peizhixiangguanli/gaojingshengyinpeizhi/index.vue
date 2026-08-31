<template>
  <div class="app-container">
    <a-card v-for="(list, i) in arr" :key="i" :title="list.alarmLevelName" class="mb-2" style="width: 100%" size="small">
      <div class="flex align-middle">
        <a-radio-group @change="changeRadio(list)" v-model:value="list.radio">
          <div class="flex flex-self-start align-middle">
            <a-radio :style="radioStyle" value="1" class="flex flex-self-start"> 默认提示声 </a-radio>
            <div class="sound flex align-middle">
              <SoundOutlined @click.stop="openSound('1', i)" style="font-size: 26px" />
            </div>
          </div>
          <div class="flex flex-self-start align-middle">
            <a-radio :style="radioStyle" value="2" class="align--center"> 自定义提示音 </a-radio>
            <div>
              <a-upload
                name="file"
                :max-count="1"
                accept=".mp3,.wav"
                :showUploadList="false"
                :action="action"
                :headers="tokenHeader"
                :beforeUpload="beforeUpload"
                @change="handleChange(i, $event)"
                @remove="remove(i)"
              >
                <a-button size="middle" type="primary" preIcon="ant-design:upload-outlined">上传</a-button>
              </a-upload>
            </div>
            <div style="font-size: 16px; margin-top: 4px" class="ml-3 mr3">{{ list.audioUrl || '-' }}</div>
            <div class="sound flex align-middle">
              <SoundOutlined v-if="list.audioPreviewUrl" @click="openSound('2', i)" style="font-size: 26px" />
            </div>
          </div>

          <a-radio :style="radioStyle" value="3">关闭提示音</a-radio>
        </a-radio-group>
      </div>
    </a-card>

    <audio ref="messageAudioRef" :src="urlMp3" preload="auto">
      <source :src="urlMp3" />
      您的浏览器不支持 audio 元素。
    </audio>
  </div>
</template>

<script setup lang="ts" name="gaojingshengyinpeizhi">
  import { getUpLoad, list, saveOrUpdate } from './DimAlarmAudio.api';
  import { SoundOutlined } from '@ant-design/icons-vue';
  import { ref, computed, nextTick } from 'vue';
  import generalAlarmSound from '@/assets/sound/general_alarm.wav';
  import lowAlarmSound from '@/assets/sound/low_alarm.wav';
  import urgentAlarmSound from '@/assets/sound/urgent_alarm.wav';
  import criticalAlarmSound from '@/assets/sound/critical_alarm.wav';
  import legacyAlarmSound from '@/assets/sound/alarm.wav';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import { useMessage } from '@/hooks/web/useMessage';
  import { getFileAccessHttpUrl } from '@/utils/common/compUtils';
  const { createMessage } = useMessage();
  const prefix = import.meta.env.VITE_GLOB_API_URL_PREFIX;

  const glob = useGlobSetting();
  const tokenHeader = { 'X-Access-Token': getToken() };
  /**
   * 上传url
   */
  const action = computed(() => `${glob.uploadUrl}${prefix}${getUpLoad}`);
  const urlMp3 = ref('');
  const arr = ref<any[]>([]);
  const messageAudioRef = ref<HTMLAudioElement | null>(null);
  const radioStyle = {
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
  };

  const defaultAlarmSounds = {
    critical: criticalAlarmSound,
    general: generalAlarmSound,
    low: lowAlarmSound,
    urgent: urgentAlarmSound,
  } as const;

  const defaultAlarmSoundOrder = [defaultAlarmSounds.general, defaultAlarmSounds.low, defaultAlarmSounds.urgent, defaultAlarmSounds.critical];

  function resolveDefaultAudioUrl(item, index = 0) {
    const alarmLevelName = String(item?.alarmLevelName || '').trim();
    const alarmLevel = String(item?.alarmLevel ?? '').trim();

    if (alarmLevelName.includes('非常紧急') || alarmLevel === '4') {
      return defaultAlarmSounds.critical;
    }
    if (alarmLevelName.includes('紧急') || alarmLevel === '3') {
      return defaultAlarmSounds.urgent;
    }
    if (alarmLevelName.includes('一般') || alarmLevel === '2') {
      return defaultAlarmSounds.general;
    }
    if (alarmLevelName.includes('较低') || alarmLevel === '1') {
      return defaultAlarmSounds.low;
    }

    return defaultAlarmSoundOrder[index] || legacyAlarmSound;
  }

  function getRadioValue(item) {
    if (item.audioFlag === '1' && item.audioType === '1') {
      return '1';
    }
    if (item.audioFlag === '1' && item.audioType === '2' && item.audioUrl) {
      return '2';
    }
    return '3';
  }

  function decorateAudioItem(item) {
    return {
      ...item,
      audioPreviewUrl: item.audioUrl ? getFileAccessHttpUrl(item.audioUrl) : '',
      radio: getRadioValue(item),
    };
  }

  async function persistAudioConfig(item) {
    await saveOrUpdate({
      alarmLevel: item.alarmLevel,
      alarmLevelName: item.alarmLevelName,
      audioFlag: item.audioFlag,
      audioType: item.audioType,
      audioUrl: item.audioUrl,
      id: item.id,
    });
    await init();
  }

  async function playAudio(audioUrl: string) {
    if (!audioUrl) {
      createMessage.warning('暂无可播放的提示音');
      return;
    }

    const audioElement = messageAudioRef.value;
    if (!audioElement) {
      createMessage.warning('音频播放器初始化失败');
      return;
    }

    if (urlMp3.value !== audioUrl) {
      urlMp3.value = audioUrl;
      await nextTick();
      audioElement.load();
    }

    audioElement.pause();
    audioElement.currentTime = 0;
    try {
      await audioElement.play();
    } catch (error) {
      createMessage.warning('提示音播放失败');
    }
  }

  function openSound(audioType, i) {
    const currentItem = arr.value[i];
    const audioUrl = audioType === '1' ? resolveDefaultAudioUrl(currentItem, i) : currentItem?.audioPreviewUrl || '';
    void playAudio(audioUrl);
  }

  /**
   * 上传前事件
   */
  function beforeUpload(file) {
    const fileName = String(file?.name || '').toLowerCase();
    const fileType = String(file?.type || '').toLowerCase();
    const isValidAudio =
      fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileType === 'audio/mpeg' || fileType === 'audio/wav' || fileType === 'audio/x-wav';

    if (!isValidAudio) {
      createMessage.warning('请上传 mp3 或 wav 格式的音频文件');
      return false;
    }

    return true;
  }

  /**
   * 文件上传事件
   */
  async function handleChange(i, info) {
    if (info.file.status === 'done') {
      if (info.file.response.success) {
        const uploadedPath = info.file.response.message;
        createMessage.success(`${info.file.name} 上传成功!`);
        arr.value[i].audioUrl = uploadedPath;
        arr.value[i].audioPreviewUrl = getFileAccessHttpUrl(uploadedPath);
        arr.value[i].radio = '2';
        arr.value[i].audioFlag = '1';
        arr.value[i].audioType = '2';
        await persistAudioConfig(arr.value[i]);
      } else {
        createMessage.error(`${info.file.response.message}`);
      }
    } else if (info.file.status === 'error') {
      createMessage.error(info.file.response?.message || '上传失败');
    }
  }
  // 删除自定义声音
  function remove(i) {
    arr.value[i].audioUrl = '';
    arr.value[i].audioPreviewUrl = '';
  }

  async function init() {
    const res = await list({ pageNo: 1, pageSize: 20 });
    const records = Array.isArray(res?.records) ? res.records : [];
    arr.value = records.map((item) => decorateAudioItem(item));
  }

  async function changeRadio(list) {
    if (list.radio === '2' && !list.audioUrl) {
      createMessage.warning('请先上传自定义提示音');
      list.radio = getRadioValue(list);
      return;
    }

    switch (list.radio) {
      case '1':
        list.audioFlag = '1';
        list.audioType = '1';
        break;
      case '2':
        list.audioFlag = '1';
        list.audioType = '2';
        break;
      default:
        list.audioFlag = '0';
        list.audioType = '';
        break;
    }

    await persistAudioConfig(list);
  }

  void init();
</script>

<style scoped lang="less">
  .app-container {
    padding: 10px;

    :deep(.ant-upload-list) {
      display: inline-block;
    }

    .sound {
      //line-height: 30px;
      margin: 0 10px;
    }
  }
</style>
