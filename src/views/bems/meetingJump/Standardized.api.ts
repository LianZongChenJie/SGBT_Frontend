import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  getTokenApi = '/third/login/meetingSystem',

}

/**
 * 水能耗统计日
 */
export const getTokenApi = () => defHttp.get({ url: Api.getTokenApi });