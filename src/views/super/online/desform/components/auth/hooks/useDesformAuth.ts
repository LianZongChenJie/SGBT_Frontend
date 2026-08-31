import { useMessage } from '/@/hooks/web/useMessage';

export function useDesformAuth(props) {
  const { createWarningModal } = useMessage();

  async function doUpdateStatus(api: Fn, record, params?) {
    let status = record.status === 1 ? 0 : 1;
    let formData = {
      id: record.id,
      status: status,
      desformId: props.desformRecord.id,
      desformCode: props.desformRecord.desformCode,
      ...params,
    };
    // 如果是临时ID,剔除掉
    if (formData.id.startsWith('temp-')) {
      delete formData.id;
    }
    try {
      record.loading = true;
      await api(formData);
      record.status = params?.status || status;
    } catch (e: any) {
      console.error(e);
      createWarningModal({ title: '操作失败', content: e.message || e });
    } finally {
      delete record.loading;
    }
  }

  return {
    doUpdateStatus,
  };
}
