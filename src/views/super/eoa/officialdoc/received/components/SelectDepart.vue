<!--部门选择组件-->
<template>
  <div>
    <JSelectBiz @handleOpen="handleOpen" v-bind="attrs" :disabled="disabled"></JSelectBiz>
    <SelectDepartModal @register="registerModal" @departOk="setValue" v-bind="getBindValue"></SelectDepartModal>
  </div>
</template>
<script lang="ts">
  import SelectDepartModal from './SelectDepartModal.vue';
  import JSelectBiz from '/@/components/Form/src/jeecg/components/base/JSelectBiz.vue';
  import { unref, defineComponent, ref, reactive, watchEffect, watch, provide, toRaw } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { propTypes } from '/@/utils/propTypes';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { SelectValue } from 'ant-design-vue/es/select';
  import { isArray } from '/@/utils/is';
  export default defineComponent({
    name: 'SelectDepart',
    components: {
      SelectDepartModal,
      JSelectBiz,
    },
    inheritAttrs: false,
    props: {
      value: propTypes.oneOfType([propTypes.string, propTypes.array]),
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['options-change', 'change', 'select', 'departOk', 'update:value'],
    setup(props, { emit, refs }) {
      const emitData = ref<object>();
      //注册modal弹窗
      const [registerModal, { openModal }] = useModal();
      //表单值
      const [state] = useRuleFormItem(props, 'value', 'change', emitData);
      //下拉框选项值
      const selectOptions = ref<SelectValue>([]);
      //下拉框选中值
      let selectValues = reactive<object>({
        value: [],
        change: false,
      });
      //下发 selectOptions,xxxBiz组件接收
      provide('selectOptions', selectOptions);
      //下发 selectValues,xxxBiz组件接收
      provide('selectValues', selectValues);
      const tag = ref(false);
      const attrs = useAttrs();

      /**
       * 监听组件值
       */
      watchEffect(() => {
        props.value && initValue();
      });

      /**
       * 监听selectValues变化
       */
      watch(selectValues, () => {
        if (selectValues) {
          emit('select', toRaw(unref(selectOptions)), toRaw(unref(selectValues)));
        }
        //selectValues变化则返回对应的value
        emit('departOk', selectValues);
      });

      /**
       * 打卡弹出框
       */
      function handleOpen() {
        tag.value = true;
        openModal(true, {
          isUpdate: false,
        });
      }

      /**
       * 将字符串值转化为数组
       */
      function initValue() {
        let value = props.value ? props.value : [];
        if (value && typeof value === 'string') {
          state.value = value.split(',');
          selectValues.value = value.split(',');
        }
      }

      /**
       * 设置下拉框的值
       */
      function setValue(options, values) {
        selectOptions.value = options;
        state.value = values;
        selectValues.value = values;
        if (values && isArray(values)) {
          emit('update:value', values.join(','));
        } else {
          emit('update:value', values);
        }
      }

      const getBindValue = Object.assign({}, unref(props), unref(attrs));
      return {
        state,
        attrs,
        selectOptions,
        getBindValue,
        selectValues,
        tag,
        registerModal,
        setValue,
        handleOpen,
      };
    },
  });
</script>
<style lang="less" scoped>
  .j-select-row {
    @width: 82px;

    .left {
      width: calc(100% - @width - 8px);
    }

    .right {
      width: @width;
    }

    .full {
      width: 100%;
    }

    :deep(.ant-select-search__field) {
      display: none !important;
    }
  }
</style>
