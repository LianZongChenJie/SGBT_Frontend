import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();
enum Api {
  loginApi = '/third/login/spsSystem',

}

/**
 * 水能耗统计日
 */
export const loginApi = () => defHttp.post({ url: Api.loginApi });