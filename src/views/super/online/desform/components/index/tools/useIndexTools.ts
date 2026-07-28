import type { DynamicProps } from '/#/utils';
import type { FormProps } from '/@/components/Form';
import { computed, ref } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { BasicForm, useForm } from '/@/components/Form';

type Props = Partial<DynamicProps<FormProps>>;

export function useIndexTools(props, { emit }, formProps: Props, doAction) {
  const { createConfirm: $confirm, createErrorModal: $error } = useMessage();
  // 表单ref
  const formRef = ref<InstanceType<typeof BasicForm>>();
  // 表单model
  const formModel = computed(() => formRef.value?.formModel);

  // 注册表单
  const useFormRes = useForm({
    showActionButtonGroup: false,
    ...formProps,
  });
  const [, { resetFields, validate }] = useFormRes;

  /**
   * 创建 widgetOptions
   * @param widgetInfo
   * @param type
   */
  function packageWidgetOptions(widgetInfo: any[], type?: string) {
    return widgetInfo
      .filter((item) => {
        if (type) {
          return item.type === type;
        }
        return true;
      })
      .map((item) => {
        return {
          label: `${item.model}（${item.name}）`,
          value: item.model,
        };
      });
  }

  /** 执行操作 */
  async function execute({ close }) {
    try {
      const values = await validate();
      setLoading(true);
      let { success, message } = await doAction({ ...values, desformCode: props.desformCode });
      if (success) {
        $confirm({
          content: message,
          okText: '继续操作',
          iconType: 'success',
          cancelText: '关闭',
          onOk: () => resetFields(),
          onCancel: () => close(true),
          // icon: () => (`<a-icon type="check-circle" style="color: #52C41A;"/>`),
        });
      } else {
        $error({ content: message });
      }
    } finally {
      setLoading(false);
    }
  }

  function setLoading(flag) {
    emit('update:loading', flag);
  }

  return {
    useFormRes,
    formRef,
    formModel,
    execute,
    packageWidgetOptions,
  };
}
