import { defineStore } from 'pinia';
import { store } from '/@/store';
// interface EventState {
//   changeFlag: boolean;
//   eventOperationList: Array<string>;
// }
interface Item {
  name: string,
  code: string
}
export const useEventStore = defineStore({
  id: 'app-event',
  state: () => ({
    changeFlag: false,
    eventOperationList: [] as Item[], // 初始化为空数组
  }),
  // state: (): EventState => ({
  //   changeFlag: false,
  //   eventOperationList: []
  // }),
});

// Need to be used outside the setup
export function useEventStoreWithOut() {
  return useEventStore(store);
}
