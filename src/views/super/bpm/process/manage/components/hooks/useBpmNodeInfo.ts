import { ref, unref } from 'vue';
import { hisProcessNodeInfo } from '../bpm.api';
import { getQueryVariable } from '/@/utils';
import { isUrl } from '/@/utils/is';

/**
 *
 * @param path 路径
 * @param taskDealRef 弹窗示例
 */
export function useBpmNodeInfo(path, taskDealRef) {
  const formData = ref({});
  /**
   * 获取流程历史节点信息
   * @param record
   */
  function getHisProcessNodeInfo(record) {
    hisProcessNodeInfo({ procInstId: record.processInstanceId }).then((res) => {
      console.log('获取流程节点信息', res);
      if (res.success) {
        let data = {
          dataId: res.result.dataId,
          taskId: record.id,
          taskDefKey: record.taskId,
          procInsId: record.processInstanceId,
          tableName: res.result.tableName,
          vars: res.result.records,
        };
        formData.value = data;
        //update--begin--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
        console.log('获取流程节点表单URL ', res.result.formUrl);
        let tempFormUrl = res.result.formUrl;
        //节点配置表单URL，VUE组件类型对应的拓展参数
        if (tempFormUrl && tempFormUrl.indexOf('?') != -1 && !isUrl(tempFormUrl) && tempFormUrl.indexOf('{{DOMAIN_URL}}') == -1) {
          tempFormUrl = res.result.formUrl.split('?')[0];
          console.log('获取流程节点表单URL（去掉参数）', tempFormUrl);
          formData.value['extendUrlParams'] = getQueryVariable(res.result.formUrl);
        }
        path.value = tempFormUrl;
        //update--end--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
        console.log('获取流程节点信息formData', unref(formData));
        console.log('获取流程节点信息path', unref(path));
        taskDealRef.value.deal(record);
        taskDealRef.value.data.title = '流程历史';
        console.log('taskDealRef', taskDealRef.value);
      }
    });
  }

  return { getHisProcessNodeInfo, formData };
}
