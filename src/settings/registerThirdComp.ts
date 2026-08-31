import type { App } from 'vue';
import { registerJVxeTable } from '/@/components/jeecg/JVxeTable';
import { registerJVxeCustom } from '/@/components/JVxeCustom';

// // 全局注册gantt甘特图
// import { gantt } from "dhtmlx-gantt";
// import "dhtmlx-gantt/codebase/dhtmlxgantt.css";

// 注册全局聊天表情包
// import { Picker } from 'emoji-mart-vue-fast/src';
// import { EmojiIndex } from "emoji-mart-vue-fast/src";

// 注册全局dayjs
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

export async function registerThirdComp(app: App) {
  //---------------------------------------------------------------------
  // //注册甘特图
  // app.config.globalProperties.$gantt = gantt;
  //---------------------------------------------------------------------
  // 注册 JVxeTable 组件
  registerJVxeTable(app);
  // 注册 JVxeTable 自定义组件
  await registerJVxeCustom();
  //---------------------------------------------------------------------
  // 注册全局聊天表情包
  // update-begin--author:liaozhiyang---date:20240308---for：【QQYUN-8241】emoji-mart-vue-fast库异步加载
  app.component(
    'Picker',
    createAsyncComponent(() => {
      return new Promise((resolve, rejected) => {
        import('emoji-mart-vue-fast/src')
          .then((res) => {
            const { Picker } = res;
            resolve(Picker);
          })
          .catch((err) => {
            rejected(err);
          });
      });
    })
  );
  // update-end--author:liaozhiyang---date:20240308---for：【QQYUN-8241】emoji-mart-vue-fast库异步加载

  // let myEmojiIndex = new EmojiIndex(data, {
  //   function() {
  //     return true;
  //   },
  //   exclude:['recent','people','nature','foods','activity','places','objects','symbols','flags']
  // });
  // app.config.globalProperties.$globalEmojiIndex = myEmojiIndex
  // app.provide('$globalEmojiIndex', myEmojiIndex)
  //---------------------------------------------------------------------
  // 注册全局dayjs
  dayjs.locale('zh-cn');
  dayjs.extend(relativeTime);
  dayjs.extend(customParseFormat);
  app.config.globalProperties.$dayjs = dayjs
  app.provide('$dayjs', dayjs)
  //---------------------------------------------------------------------
}
