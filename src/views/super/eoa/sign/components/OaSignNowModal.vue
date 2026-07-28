<template>
  <BasicModal
    @visible-change="visibleHandleChange"
    :showCancelBtn="false"
    :showOkBtn="false"
    v-bind="$attrs"
    destroyOnClose
    @register="registerModal"
    :title="title"
    :width="500"
  >
    <a-spin :spinning="loading" size="large" class="spin">
      <div v-if="!loading" class="content">
        <div v-if="showOkIcon || showWarnIcon || showErrorIcon" class="icon-box">
          <a-icon v-if="showOkIcon" type="check-circle-filled" style="color: #32cd32" />
          <a-icon v-if="showWarnIcon" type="exclamation-circle-filled" style="color: #ffa500" />
          <a-icon v-if="showErrorIcon" type="close-circle-filled" style="color: #ee0000" />
        </div>
        <div class="current-type">{{ forceSignText || signToDayStatus.label || signToDayStatus.text }}</div>
        <div class="current-time">{{ currentDateTime }}</div>
        <div class="btn-box" v-if="!showOkIcon && !showWarnIcon && !showErrorIcon">
          <a-button class="btn-sign" @click="handleSignNow">
            <div class="time">{{ currentHour }}<span class="sec">:</span>{{ currentMinute }}</div>
            <div class="text">{{ confirmLoading ? '打卡中' : '立即打卡' }}</div>
          </a-button>
        </div>
      </div>
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup name="eoa-sign-now-modal">
  import { ref, onMounted, computed, onUnmounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { statusAndRule, signNow } from '../OaSign.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { SignToDayStatusEnum } from '../utils/constant';
  import { getEnumByValue } from '../utils/util';
  import dayjs from 'dayjs';
  import { Modal } from 'ant-design-vue';

  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const { createMessage } = useMessage();
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ height: 300 });
    initialStatus();
  });
  const currentHour = ref<string>('');
  const currentMinute = ref<string>('');
  const signToDayStatus = ref<any>({});
  const myStatus = ref<string>('');
  const signRule = ref<string>('');
  const forceSignText = ref<string>('');
  const currentDateTime = ref<string>('');
  const timer = ref<any>();
  //设置标题
  const title = ref('打卡');
  const loading = ref<boolean>(false);
  const confirmLoading = ref<boolean>(false);

  /**
   * 初始化打卡状态
   */
  function initialStatus() {
    forceSignText.value = '';
    //update-begin---author:wangshuai ---date:20230216  for：[QQYUN-4287]OA考勤打卡成功后日期没有显示出来------------
    currentDateTime.value = dayjs().format('YYYY年MM月DD日 dddd');
    //update-end---author:wangshuai ---date:20230216  for：[QQYUN-4287]OA考勤打卡成功后日期没有显示出来------------
    timer.value = setInterval(setCurrentStatus, 1000);
    querySignStatus();
  }

  /**
   * 查询打卡状态
   */
  function querySignStatus() {
    loading.value = true;
    statusAndRule()
      .then((res) => {
        if (res.success) {
          myStatus.value = res.result.status;
          signRule.value = res.result.signRule;
          setCurrentStatus();
        } else {
          throw res.message;
        }
      })
      .catch((e) => {
        let message = (e || {}).message || e;
        if (message != '未设置考勤规则') {
          createMessage.warning({
            title: '打卡状态查询失败',
            content: message,
          });
          close();
        }
      })
      .finally(() => {
        loading.value = false;
      });
  }

  /**
   * 设置打卡状态
   */
  function setCurrentStatus() {
    let time = dayjs();
    currentHour.value = time.format('HH');
    currentMinute.value = time.format('mm');
    signToDayStatus.value = getMySignToDayStatus();
  }

  /**
   * 查询打卡状态
   */
  function getMySignToDayStatus() {
    // 今天还没有打卡
    if (myStatus.value['value'] == SignToDayStatusEnum.NO.value) {
      return SignToDayStatusEnum.ON;
    }
    // 今天只打了上班卡
    if (myStatus.value['value'] == SignToDayStatusEnum.ON.value) {
      return SignToDayStatusEnum.OFF;
    }
    // 今天只打了下班卡或已完成
    if (myStatus.value['value'] == SignToDayStatusEnum.OFF.value || myStatus.value['value'] == SignToDayStatusEnum.OK.value) {
      return SignToDayStatusEnum.OK;
    }
    return getEnumByValue(myStatus.value, SignToDayStatusEnum, false);
  }

  //已打卡
  const showOkIcon = computed(() => {
    return signToDayStatus.value['value'] === SignToDayStatusEnum.OK.value;
  });

  //无需打卡
  const showWarnIcon = computed(() => {
    return (
      signToDayStatus.value['value'] === SignToDayStatusEnum.USER_NO_NEED.value ||
      signToDayStatus.value['value'] === SignToDayStatusEnum.TO_DAY_NO_NEED.value
    );
  });

  //打卡失败
  const showErrorIcon = computed(() => {
    return signToDayStatus.value['value'] === SignToDayStatusEnum.NO_RULE.value;
  });

  /**
   * 立即打卡
   */
  function handleSignNow() {
    confirmLoading.value = true;
    checkSignType().then(() => {
      signNow()
        .then((res) => {
          if (res) {
            if (res.success) {
              signToDayStatus.value = SignToDayStatusEnum.OK;
              clearInterval(timer.value);
              forceSignText.value = res.message;
            } else {
              throw res.message;
            }
          }
        })
        .catch((e) => {
          createMessage.warning({
            title: '打卡失败，请稍后重试',
            content: (e || {}).message || e,
          });
        })
        .finally(() => {
          confirmLoading.value = false;
        });
    });
  }

  /**
   * 判断打卡类型，并给出相应的提示
   */
  function checkSignType() {
    let current = dayjs();
    let currentDate = current.format('YYYY-MM-DD');
    return new Promise((resolve, reject) => {
      if (signToDayStatus.value['value'] === SignToDayStatusEnum.OFF.value) {
        // 判断是否已到打卡时间
        let offTime = dayjs(currentDate + ' ' + signRule.value['offTimeEarly']);
        if (current < offTime) {
          Modal.confirm({
            title: '下班打卡',
            content: '当前还没有到下班时间，如果这个时候打卡将会被视为早退，确定要打卡吗？',
            onOk: () => resolve(''),
            onCancel: () => reject(),
          });
        } else {
          resolve('');
        }
      } else if (signToDayStatus.value['value'] === SignToDayStatusEnum.OK.value) {
        reject();
      } else {
        resolve('');
      }
    });
  }

  /**
   * 页面关闭事件
   */
  function close() {
    clearInterval(timer.value);
    timer.value = null;
    closeModal();
  }

  /**
   * 弹窗关闭打开时间
   * @param visible
   */
  function visibleHandleChange(visible) {
    if (!visible) {
      clearInterval(timer.value);
      timer.value = null;
      emit('success');
    }
  }

  /**
   * 离开页面销毁定时任务
   */
  onUnmounted(() => {
    clearInterval(timer.value);
    timer.value = null;
  });

  onMounted(() => {
    //初始化页面加载数据
    setCurrentStatus();
  });
</script>

<style lang="less" scoped>
  .spin {
    min-height: 320px;
    max-height: 320px;
    min-width: 100%;
    overflow: hidden;
  }

  .content {
    text-align: center;

    .current-type {
      font-size: 24px;
      color: #389e0d;
      margin-top: 12px;
    }

    .current-time {
      font-size: 18px;
      color: #aaaaaa;
      margin-top: 12px;
    }

    .icon-box {
      margin: 20px 0 60px 0;

      :deep(.anticon) {
        font-size: 120px !important;
      }
    }

    .btn-box {
      margin-top: 60px;

      .btn-sign {
        width: 120px;
        height: 120px;
        color: #000000;
        border-radius: 50%;
        border: 4px solid #ff8c00;

        &:hover {
          background-color: #f6f6f6;
        }

        &:active {
          background-color: #efefef;
        }

        .time {
          font-size: 32px;
          position: relative;
          top: -8px;

          @keyframes secFlash {
            0% {
              opacity: 1;
            }
            60% {
              opacity: 0;
            }
            80% {
              opacity: 1;
            }
          }

          .sec {
            position: relative;
            top: -2px;
            margin: 0 4px;
            animation: secFlash 1s infinite;
          }
        }

        .text {
          position: relative;
          top: -4px;
        }
      }
    }
  }
</style>
