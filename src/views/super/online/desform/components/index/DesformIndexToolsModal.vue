<template>
  <BasicModal v-bind="getProps">
    <a-spin :spinning="loading">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane tab="变更数据格式" key="1" forceRender>
          <ChangeDataTool ref="tool1" v-bind="toolProps" />
        </a-tab-pane>
        <a-tab-pane tab="变更数据绑定model" key="2" forceRender>
          <ChangeModelTool ref="tool2" v-bind="toolProps" />
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </BasicModal>
</template>

<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import { ref, defineComponent, computed, unref } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import ChangeDataTool from './tools/ChangeDataTool.vue';
  import ChangeModelTool from './tools/ChangeModelTool.vue';
  import { defHttp } from '/@/utils/http/axios';

  export default defineComponent({
    name: 'DesformIndexToolsModal',
    components: {
      BasicModal,
      ChangeDataTool,
      ChangeModelTool,
    },
    emits: ['register', 'success'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      const refs = {
        tool1: ref(),
        tool2: ref(),
      };
      const activeKey = ref('1');
      // 当前是否正在加载中
      const loading = ref(false);
      // 表单model
      const model = ref<Recordable>();
      // 组件信息
      const widgetInfo = ref<Recordable[]>([]);
      // 注册弹窗
      const [registerModal, { closeModal, setModalProps }] = useModalInner(open);
      // 弹窗最终 props
      const getProps = computed(() => {
        let modalProps: Partial<ModalProps> = {
          width: 800,
          title: '索引同步工具',
          confirmLoading: unref(loading),
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
      // 工具统一props
      const toolProps = computed(() => {
        return {
          desformCode: model.value?.desformCode,
          widgetInfo: widgetInfo.value,
          timeout: 600000,
          loading: loading.value,
          'onUpdate:loading': (flag) => setLoading(flag),
        };
      });

      /** 弹窗开启 */
      function open(data) {
        model.value = cloneDeep(data?.record);
        Object.values(refs).forEach((tool) => unref(tool)?.resetFields());
        queryWidgetInfoLite();
      }

      /** 弹窗关闭 */
      function close(ok) {
        closeModal();
        if (ok) {
          emit('success');
        }
      }

      /**
       * 获取某个表单的所有组件的基本信息，返回一个数组，数组的每项包含：type、 key、 name、 model
       */
      async function queryWidgetInfoLite() {
        let desformCode = model.value?.desformCode;
        setLoading(true);
        try {
          widgetInfo.value = await defHttp.get({
            url: '/desform/tools/getWidgetInfoLite',
            params: {
              desformCode: desformCode,
            },
          });
        } finally {
          setLoading(false);
        }
      }

      function onSubmit() {
        let tool = unref(refs[`tool${activeKey.value}`]);
        if (tool) {
          tool.execute({ close });
        }
      }

      /** 设置加载状态*/
      function setLoading(flag) {
        loading.value = flag;
        setModalProps({ confirmLoading: flag });
      }

      return {
        ...refs,
        getProps,
        toolProps,
        loading,
        activeKey,
      };
    },
  });
</script>

<style scoped lang="less"></style>
