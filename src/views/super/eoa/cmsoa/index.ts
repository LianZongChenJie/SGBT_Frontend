import { withInstall } from '/@/utils';
import type { App } from 'vue';
import EoaCmsBanner from './modules/EoaCmsBanner.vue';
import EoaCmsLink from './modules/EoaCmsLink.vue';
import EoaCmsNewsInfo from './modules/EoaCmsNewsInfo.vue';
import EoaCmsPlan from './modules/EoaCmsPlan.vue';
import EoaCmsRuleInfo from './modules/EoaCmsRuleInfo.vue';
import EoaCmsSignNews from './modules/EoaCmsSignNews.vue';
import EoaCmsUserNotice from './modules/EoaCmsUserNotice.vue';

import EoaCmsApplyProcess from '../cmsbpm/modules/EoaCmsApplyProcess.vue';
import EoaCmsMyProcess from '../cmsbpm/modules/EoaCmsMyProcess.vue';
import EoaCmsProcessNotice from '../cmsbpm/modules/EoaCmsProcessNotice.vue';
import EoaCmsEmail from '../cmsbpm/modules/EoaCmsEmail.vue';

import EoaCmsCommUse from '../cmsbpm/modules/EoaCmsCommUse.vue';
import EoaCmsProcessChatData from '../cmsbpm/modules/EoaCmsProcessChatData.vue';
import EoaCmsProcessTypeChat from '../cmsbpm/modules/EoaCmsProcessTypeChat.vue';

import { IconPicker } from '/@/components/Icon/index';

const componentsOA = [EoaCmsBanner, EoaCmsLink, EoaCmsNewsInfo, EoaCmsRuleInfo, EoaCmsSignNews, EoaCmsUserNotice, EoaCmsPlan];
const componentsBPM = [
  EoaCmsEmail,
  EoaCmsMyProcess,
  EoaCmsApplyProcess,
  EoaCmsProcessNotice,
  EoaCmsCommUse,
  EoaCmsProcessChatData,
  EoaCmsProcessTypeChat,
];
const componentsCommon = [IconPicker];

export const oaPortalComponents = {
  install(app: App) {
    let comps = [] as any;
    let components = componentsOA.concat(componentsBPM).concat(componentsCommon);
    components.forEach((item) => {
      app.component(item.name || item.displayName, item);
    });
    return comps;
  },
};
