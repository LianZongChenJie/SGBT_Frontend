import {useMessage} from '/@/hooks/web/useMessage';
import {defHttp} from '/@/utils/http/axios';
import {router} from '/@/router';
import {useModal} from "@/components/Modal";
import { isFunction } from "@/utils/is";

/**
 * 表单设计器纸质化流程按钮定义
 * 1、发起流程按钮
 * 2、查看审批进度按钮
 */
export function useProcessListButton(reload?) {
  const [registerBpmModal, {openModal}] = useModal();
  const {createMessage: $message} = useMessage();

  // 发起流程
  async function startDesformListProcess(record) {
    let formLink = await processApi.queryFormLinkByTableName(record.desformCode);
    let isUpdate = formLink != null;
    if (isUpdate) {
      await processConfig.desform.startProcess(record);
    } else {
      $message.warning('没有设计流程，无法提交');
    }
  }


  /**
   * 查看流程图
   * @param record
   */
  function handleViewGraphic(record) {
    let flowCode = 'desform_' + record._record.desformCode;
    let dataId = record.id;
    openModal(true, {
      flowCode,
      dataId
    })
  }


  type ProcessConfigType = {
    // flowCode前缀
    flowCodePre: string;
    // 发起流程
    startProcess: (record) => Promise<any>;
  };
  type ProcessKeyType = 'desform';

  // 流程配置
  const processConfig: Record<ProcessKeyType, ProcessConfigType> = {
    desform: {
      flowCodePre: 'desform_',
      startProcess: async (record) => {
        let {id, desformCode, bpmStatus} = record._record;
        if (bpmStatus && bpmStatus != '1') {
          $message.warning('流程已发起，不能重复发起');
          return;
        }
        let {flowCodePre} = processConfig.desform;
        let formUrl = '{{DOMAIN_URL}}/desform/detail/' + desformCode + '/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}';
        let formUrlMobile = '{{DOMAIN_URL}}/desform/detail/' + desformCode + '/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}';
        let params = {id, flowCode: flowCodePre + desformCode, formUrl, formUrlMobile};
        let url = '/act/process/extActProcess/startMutilProcess';
        await defHttp.post({url, params});
        //update-begin-author:liusq---date:2024-06-03--for: 【TV360X-936】流程发起后，刷新列表
        reload && isFunction(reload) && reload();
        //update-end-author:liusq---date:2024-06-03--for: 【TV360X-936】流程发起后，刷新列表
        router.push({name: 'low-app-@appId-task-my-apply'});
      },
    },
  };

  /** 查询流程关联表 */
  const processApi = {
    /**
     * 通过表单名称获取流程关联
     * @param formTableName 表单名称
     */
    async queryFormLinkByTableName(formTableName) {
      let result = await defHttp.get({
        url: '/act/process/extActProcessForm/list',
        params: {pageNo: 1, pageSize: 1, formTableName}
      });
      if (result?.records?.length > 0) {
        return result.records[0];
      }
      return null;
    },
  };

  return {
    registerBpmModal,
    startDesformListProcess,
    handleViewGraphic
  };

}

