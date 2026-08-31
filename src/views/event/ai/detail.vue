<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" showFooter :width="adaptiveWidth" :title="title" @ok="handleSubmit" @close="handleSubmit">
    <div class="detail-content">
      <h3
        >通话详情 <a-tag :color="serviceType === '人工' ? 'green' : 'orange'" size="big">{{ serviceType }}</a-tag></h3
      >
      <ul>
        <li>
          <span>编号： </span>
          <span>{{ detail.basicInfo.callNo }}</span>
        </li>
        <li>
          <span>通话类型： </span>
          <span>{{ detail.basicInfo.callType }}</span>
        </li>
        <li>
          <span>用户： </span>
          <span>{{ detail.basicInfo.callerNumber }}</span>
        </li>
        <li>
          <span>被叫号码： </span>
          <span>{{ detail.basicInfo.calledNumber }}</span>
        </li>
        <li>
          <span>接听时间： </span>
          <span>{{ detail.basicInfo.answeredTime }}</span>
        </li>
        <li>
          <span>挂机时间： </span>
          <span>{{ detail.basicInfo.overTime }}</span>
        </li>
        <li>
          <span>通话时长： </span>
          <span>{{ detail.basicInfo.duration }}</span>
        </li>
        <li>
          <span>通话日期： </span>
          <span>{{ detail.basicInfo.callDate }}</span>
        </li>
      </ul>
    </div>
    <div class="call-record">
      <h3>通话录音</h3>
      <div>
        <audio v-if="showAudio" :src="detail.recordingUrl" preload="auto" controls></audio>
      </div>
    </div>
    <div class="text-record">
      <h3>文字记录</h3>
      <ul>
        <li v-for="(item, index) in detail.textRecord" :key="index"
          ><span>{{ Object.keys(item)[0] }}</span
          >： <div>{{ item[Object.keys(item)[0]] }}</div></li
        >
      </ul>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useDrawerAdaptiveWidth } from '/@/hooks/jeecg/useAdaptiveWidth';
  import { getDetail } from './api';
  // 声明Emits
  const { adaptiveWidth } = useDrawerAdaptiveWidth();
  const serviceType = ref('');

  interface CallDetailBasicInfo {
    callNo: string;
    callType: string;
    calledNumber: string;
    callerNumber: string;
    answeredTime: string;
    overTime: string;
    duration: number;
    callDate: string;
  }
  const detail = ref({
    basicInfo: {} as CallDetailBasicInfo,
    recordingFile: '',
    recordingUrl: '',
    textRecord: [{ callee: '', caller: '' }],
  });
  const title = ref('');
  const showAudio = ref(false);
  const [registerDrawer, { closeDrawer }] = useDrawerInner(async (data) => {
    await getDetailHandle(data.record.id);
    serviceType.value = data.record.serviceType;
  });
  function getDetailHandle(id) {
    showAudio.value = false;
    getDetail({
      id: id,
    }).then((res) => {
      detail.value = res;
      setTimeout(() => {
        showAudio.value = true;
      }, 100);
    });
  }
  function handleSubmit() {
    closeDrawer();
    const audio = document.querySelector('audio');
    console.log(audio);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
</script>
<style lang="less" scoped>
  .detail-content {
    padding: 20px;
    h3 {
      font-weight: 900;
      margin-bottom: 20px;
      span {
        float: right;
        font-size: 14px;
        line-height: 24px;
      }
    }
    ul {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      padding-bottom: 10px;
      border-bottom: 1px solid #ccc;
      margin-bottom: 0;
      li {
        width: 50%;
        margin-bottom: 20px;
      }
    }
  }
  .call-record {
    padding: 0 20px 20px 20px;
    h3 {
      font-weight: 900;
      margin-bottom: 20px;
    }
    div {
      border-bottom: 1px solid #ccc;
      padding-bottom: 20px;
      audio {
        width: 100%;
        max-width: 500px;
      }
    }
  }
  .text-record {
    padding: 0 20px 20px 20px;
    h3 {
      font-weight: 900;
      margin-bottom: 20px;
    }
    ul {
      li {
        display: flex;
        span {
          width: 46px;
          text-align-last: justify;
        }
        div {
          flex: 1;
        }
      }
    }
  }
</style>
