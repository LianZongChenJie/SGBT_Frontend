<template>
  <BasicModal v-bind="getProps">
    <a-spin wrapperClassName="p-2" :spinning="loading">
      <div>
        <component :is="content" />
      </div>
      <a-divider />
      <a-row type="flex">
        <a-col :span="4">
          <span style="line-height: 2">分页重置：</span>
        </a-col>
        <a-col :span="4">
          <a-switch v-model:checked="enabledPage" checkedChildren="开启" unCheckedChildren="关闭" />
        </a-col>
        <template v-if="enabledPage">
          <a-col :span="6">
            <span style="line-height: 2">每页大小（条）：</span>
          </a-col>
          <a-col :span="6">
            <a-input-number v-model:value="pageSize" :min="10" />
          </a-col>
        </template>
      </a-row>
    </a-spin>
  </BasicModal>
</template>

<!--suppress ExceptionCaughtLocallyJS -->
<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import { ref, defineComponent, computed, unref, h } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { defHttp } from '/@/utils/http/axios';

  export default defineComponent({
    name: 'DesformRedoIndexModal',
    components: {
      BasicModal,
    },
    emits: ['register'],
    setup(props) {
      const attrs = useAttrs();
      const { createMessage: $message, createErrorModal: $error, createWarningModal: $warning } = useMessage();
      // 当前是否正在加载中
      const loading = ref(false);
      const modeIndex = ref(0);
      const selections = ref([]);
      const modes = [
        // 快速
        {
          url: '/desform/redoAllIndex',
          title: '快速重置索引',
          content: ['确定要开始快速重置索引吗？'],
        },
        // 强制
        {
          url: '/desform/redoAllIndexForce',
          title: '强制重置索引',
          content: [h('p', {}, '确定要开始强制重置索引吗？'), h('p', { style: { color: 'red' } }, '强制重置索引会删除并重建所有索引，耗时较长！')],
        },
      ];
      const mode = computed(() => modes[modeIndex.value]);
      // 启用分页
      const enabledPage = ref(false);
      // 每页大小
      const pageSize = ref(1000);
      // 弹窗标题
      const title = computed(() => mode.value.title);
      // 显示的提示内容
      const content = computed(() => () => h('div', {}, [...mode.value.content]));
      // 注册弹窗
      const [registerModal, { closeModal, setModalProps }] = useModalInner(open);

      // 弹窗最终props
      const getProps = computed(() => {
        let modalProps: Partial<ModalProps> = {
          width: 500,
          minHeight: 160,
          title: unref(title),
          confirmLoading: unref(loading),
          centered: true,
          canFullscreen: false,
          maskClosable: false,
          closeFunc: onCloseFunc,
        };
        let finalProps: Recordable = {
          ...unref(attrs),
          ...modalProps,
          ...props,
          onOk: onSubmit,
          onCancel: close,
          onRegister: registerModal,
        };
        return finalProps;
      });

      /** 弹窗开启 */
      function open(data) {
        enabledPage.value = false;
        modeIndex.value = data?.modeIndex ?? 0;
        selections.value = data?.selections ?? [];
      }

      function forceClose() {
        setLoading(false);
        closeModal();
      }

      /** 弹窗关闭 */
      function close() {
        closeModal();
      }

      function onCloseFunc() {
        if (loading.value) {
          $message.warn('请等待结束...');
          return false;
        }
        return true;
      }

      /** 提交表单 */
      async function onSubmit() {
        let params = {};
        // 重置选中
        if (selections.value) {
          params['selections'] = selections.value;
        }
        // 分页重置
        if (enabledPage.value) {
          params['pageSize'] = pageSize.value;
        }
        setLoading(true);
        const hideLoading = $message.loading(`重置索引中...`, 0);
        try {
          // 发送重置索引请求
          const { success, message } = await defHttp.put(
            {
              url: mode.value.url,
              params,
              timeout: 600000,
            },
            { isTransformResponse: false }
          );
          // 判断返回结果
          if (success) {
            forceClose();
            $message.success('重置成功！');
          } else {
            throw message;
          }
        } catch (e) {
          let content = e;
          if (typeof e !== 'string') {
            console.error(e);
            content = e.message;
          }
          if (/timeout of \d+ms exceeded/.test(content)) {
            content = '重置索引时间过长，已进入后台执行，请在后台查看日志结果！';
            $warning({ title: '重置索引超时', content });
          } else {
            $error({ title: '重置索引失败', content });
          }
        } finally {
          hideLoading();
          setLoading(false);
        }
      }

      /** 设置加载状态*/
      function setLoading(flag) {
        loading.value = flag;
        setModalProps({ confirmLoading: flag });
      }

      return {
        getProps,
        loading,
        content,
        pageSize,
        enabledPage,
      };
    },
  });
</script>

<style scoped lang="less"></style>
