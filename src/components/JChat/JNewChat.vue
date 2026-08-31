<template>
  <div class="j-chat-online" :style="chatStyle">
    <iframe :src="chatUrl" id="jChatOnline"></iframe>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, unref, reactive, watch } from "vue";
import { randomString } from '/@/utils/common/compUtils';
import { getToken, setCacheByDynKey } from "/@/utils/auth";
import { useMessage } from '/@/hooks/web/useMessage';
import { JEECG_CHAT_UID } from "/@/enums/cacheEnum";
import {useUserStore} from "/@/store/modules/user";

export default defineComponent({
  name: 'JNewChat',
  props: {
    chatStatus: { type: String },
    titleHeight: {
      type: Number,
      default: 62
    },
    isLowApp: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:chatStatus', 'showMessageModal', 'getSystemUnreadNum', 'getAddressBook', 'expand', 'clearAllUnMessage'],
  setup(props, { emit }) {
    const mId = ref(randomString(16));
    const { createMessage } = useMessage();
    const chatStyle = reactive({
      width: '0px', 
      height: '0px',
      right: '8px'
    });
    const userStore = useUserStore();
    let token = getToken();
    let tenantId = userStore.getTenant;
    setCacheByDynKey(JEECG_CHAT_UID,mId.value)
    const url = window._CONFIG['domianURL'] + `/eoa/im/newApi/index` + `?token=${token}&messageId=${mId.value}&tenantId=${tenantId}`;
    const chatUrl = ref('');
    const iframeLoad = ref<boolean>(false)
    const openWindows = ref<boolean>(false)

    window.addEventListener(
        'message',
        function (event) {
          let { messageId, type, data } = event.data;
          if (`${mId.value}` !== messageId) {
            return;
          }
          switch (type) {
            // 触发展开折叠事件
            case 'expand-change':
              if (data.expand === true) {
                emit('expand', true);
              } else {
                emit('expand', false)
              }
              break;
              //更改DIV大小事件
            case 'change-size':
              //update-begin---author:wangshuai ---date:20221025  for：[VUEN-2348]打开聊天的时候，隐藏前端的上下滚动条，但是允许内容滚动------------
              let height = data.height;
              let body = document.body;
              //根据高度的不同和是否打开聊天窗口来进行显示和隐藏滚动条
              if(height.indexOf('calc') !=-1 && !unref(openWindows)){
                body.setAttribute("class","hide-scrollbar");
                openWindows.value = true;
                //高度100%时即打开弹窗聊天贴边
                chatStyle.right = "1px";
              }else if(height.indexOf('calc') ==-1 && height!='100%' && unref(openWindows)){
                body.setAttribute("class","show-scrollbar");
                openWindows.value = false;
                //聊天关闭的时候，存在滚动条，需要聊天调整位置
                chatStyle.right = "8px";
              }
              //update-end---author:wangshuai ---date:20221025  for：[VUEN-2348]打开聊天的时候，隐藏前端的上下滚动条，但是允许内容滚动--------------
              //size.value = data;
              // style改成reactive对象
              chatStyle.width = data.width;
              chatStyle.height = data.height;
              break;
              //显示信息
            case 'show-info':
              createMessage.info(data.message);
              emit('update:chatStatus', JSON.stringify(data.status));
              break;
            //初始化页面发送高度给聊天
            case 'get-dialog-height':
              let iframes = document.getElementById('jChatOnline');
              iframes.contentWindow.postMessage({ type: 'change-height', messageId: `${mId.value}`, data: {titleHeight: props.titleHeight} }, '*');
            //update-begin-author:taoyan date:2022-8-31 for: 点击右侧聊天栏的消息图标触发弹窗事件
              break;
            case 'system-click':
              emit('showMessageModal');
              break;
            //update-begin-author:taoyan date:2022-8-31 for: 点击右侧聊天栏的消息图标触发弹窗事件
            //update-begin-author:wangshuai date:2022-09-01 for: 初始化获取系统未读数
            case 'get-system-unread-num':
              iframeLoad.value = true
              emit('getSystemUnreadNum')
              break;
            //update-end-author:wangshuai date:2022-09-01 for: 初始化获取系统未读数
            case 'address-book-click':
              emit('getAddressBook')
              break;
            case 'clear-all-message':
              emit('clearAllUnMessage');
              break;
          }
        },
        false
    );

    //update-begin-author:taoyan date:2022-8-31 for:  当有消息推送的时候，修改显示的消息数量
    function updateMessageCount(count){
      //update-begin---author:wangshuai ---date:2022-09-01  for：iframe加载成功之后再发送消息------------
      if(unref(iframeLoad)){
        let iframe:any = document.getElementById('jChatOnline')
        iframe.contentWindow.postMessage({type: 'system-unread-num', messageId: mId.value, data:{systemUnreadNum: count} }, "*")
      }
      //update-end---author:wangshuai ---date:2022-09-01  for：iframe加载成功之后再发送消息-------------
    }
    //update-end-author:taoyan date:2022-8-31 for:  当有消息推送的时候，修改显示的消息数量

    // 监听是不是low app中的聊天窗口
    watch(()=>props.isLowApp, (val)=>{
      if(val===true){
        // low app下 right设置太多右边有空白
        chatStyle.right = '1px';
        // low app下 不需要显示 关闭
        chatUrl.value = url+'&hideClose=1';
      }else{
        chatStyle.right = '8px';
        chatUrl.value = url;
      }
    }, {immediate: true});
    
    return {
      chatStyle,
      chatUrl,
      updateMessageCount
    };
  },
});
</script>

<style scoped lang="less">
.j-chat-online {
  display: block;
  position: fixed;
  bottom: 2px;
  right: 8px;
  z-index: 511;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}
</style>
<style>
/*begin 加上scoped不起作用，显示隐藏滚动条，加上单独class，避免样式冲突*/
.hide-scrollbar::-webkit-scrollbar{
  display : none !important;
}
.show-scrollbar::-webkit-scrollbar{
  display : block !important;
}
/*end 加上scoped不起作用，显示隐藏滚动条，加上单独class，避免样式冲突*/
</style>
