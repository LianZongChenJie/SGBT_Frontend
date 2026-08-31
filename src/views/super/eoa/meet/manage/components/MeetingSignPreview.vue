<template>
  <a-modal
    :open="true"
    switchFullscreen
    :width="960"
    class="prewiewModal"
    :footer="null"
    :closable="false"
    :keyboard="false"
    :maskClosable="false"
  >
    <div class="container" @click="testSign" :style="{ backgroundColor: background }">
      <a-row :gutter="24">
        <a-col :span="12" style="padding-top: 40px; padding-left: 40px">
          <QrCode
            :value="text"
            :width="300"
            logo="http://jeecg.com/images/logo.png"
            :options="{
              color: { dark: '#000000', light: '#ffffff' },
            }"
          />
        </a-col>
        <a-col :span="12" style="padding-top: 30px">
          <table :style="{ fontSize: fontSize, color: fontColor }" class="prewiew-right-table">
            <thead>
              <tr align="center">
                <th>姓名</th>
                <th>部门</th>
                <th>签到时间</th>
              </tr>
            </thead>
            <tbody>
              <tr align="center">
                <td style="padding: 0 20px">{{ name }}</td>
                <td style="padding: 0 20px">{{ depart }}</td>
                <td style="padding: 0 20px">{{ signTime }}</td>
              </tr>
            </tbody>
          </table>
        </a-col>
      </a-row>
    </div>
  </a-modal>
</template>

<script lang="ts">
  import { defineComponent, reactive, toRefs, onMounted, unref } from 'vue';
  import { connectWebSocket, onWebSocket } from '/@/hooks/web/useWebSocket';
  import { getToken } from '/@/utils/auth';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useUserStore } from '/@/store/modules/user';
  import { queryMettingInfo, mettingSign } from '/@/views/super/eoa/meet/manage/manage.api';
  import { QrCode } from '/@/components/Qrcode/index';
  import { useRouter } from 'vue-router';
  import md5 from "crypto-js/md5";

  export default defineComponent({
    components: { QrCode },
    setup() {
      const userStore = useUserStore();
      const { currentRoute } = useRouter();
      const glob = useGlobSetting();
      const signInfo = reactive<any>({
        text: '',
        background: '#006699',
        fontSize: '24px',
        fontColor: '#000',
        name: '',
        depart: '',
        signTime: '',
        websockSign: null,
        lockReconnect: false,
      });

      function init() {
        const route = unref(currentRoute);
        const query = route.query;
        let fontSize = query.fontSize;
        let fontColor = query.fontColor;
        let bgColor = query.bgColor;
        let meetId = query.id;
        meetId && (signInfo.text = meetId);
        fontSize && (signInfo.fontSize = query.fontSize + 'px');
        fontColor && (signInfo.fontColor = query.fontColor);
        bgColor && (signInfo.background = query.bgColor);
      }

      async function testSign() {
        let userId = unref(userStore.getUserInfo).id;
        let res = await mettingSign({ mettingId: signInfo.text, userId });
        console.log('res******>', res);
        if (res.success) {
          await loadUser(res.result.userId);
        }
      }

      async function loadUser(userId) {
        let res = await queryMettingInfo({ id: signInfo.text, userid: userId });
        console.log('res******>', res);
        if (res.success) {
          signInfo.name = res.result.username;
          signInfo.depart = res.result.userDepart;
          if (res.result.signTime != null) {
            signInfo.signTime = res.result.signTime.split(' ')[1];
          }
        }
      }

      function initWebSocket() {
        let token = getToken();
        //将登录token生成一个短的标识
        let wsClientId = md5(token);
        let userId = unref(userStore.getUserInfo).id + '_' + wsClientId;
        let url = glob.domainUrl?.replace('https://', 'wss://').replace('http://', 'ws://') + '/websocket/' + userId;
        connectWebSocket(url);
        onWebSocket(onWebSocketMessage);
      }

      function onWebSocketMessage(data) {
        console.log("签到测试data>>>",data)
        if (data.cmd === 'sign') {
          loadUser(data.userId);
        }
      }

      onMounted(() => {
        init();
        initWebSocket();
      });

      return { ...toRefs(signInfo), testSign };
    },
  });
</script>

<style scoped>
  .prewiewModal .container {
    height: 460px !important;
    width: 100%;
    padding: 24px;
    text-align: center;
  }

  .prewiewModal .ant-modal-content {
    height: 460px !important;
  }

  .prewiewModal .ant-modal-body {
    padding: 0;
  }

  .prewiew-right-table {
    border-collapse: collapse;
  }

  .prewiew-right-table th,
  .prewiew-right-table td {
    padding: 24px 30px;
  }
</style>
