<template>
  <BasicModal v-bind="getProps">
    <a-spin wrapperClassName="p-2" :spinning="loading">
      <BasicForm @register="registerForm" />
    </a-spin>
  </BasicModal>
</template>

<script lang="ts">
  import type { ModalProps } from '/@/components/Modal';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { BasicColumn } from '/@/components/Table';
  import {computed, defineComponent, nextTick, ref, unref, watch} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { BasicForm, useForm } from '/@/components/Form';
  import {dataAuth, SYS_VAR_OPTIONS} from '../../auth.data';
  import { dataAuthApi } from '../../auth.api';
  import { generateColumns } from '../../../../utils/desformUtils';
  import {triggerWindowResizeEvent} from "@/utils/common/compUtils";

  export default defineComponent({
    name: 'DataAuthModal',
    components: {
      BasicForm,
      BasicModal,
    },
    props: {
      desformRecord: propTypes.any.isRequired,
    },
    emits: ['register', 'success'],
    setup(props, { emit }) {
      const attrs = useAttrs();
      // 当前是否正在加载中
      const loading = ref(false);
      // 表单model
      const model = ref<Recordable>();
      // 是否是更新模式
      const isUpdate = ref(false);
      // 弹窗标题
      const title = computed(() => (isUpdate.value ? '编辑' : '新增'));
      // 注册弹窗
      const [registerModal, { closeModal, setModalProps, getVisible }] = useModalInner(open);
      // 注册表单
      const [registerForm, { resetFields, setFieldsValue, getFieldsValue, validate, updateSchema, clearValidate }] = useForm({
        schemas: dataAuth.formSchemas,
        showActionButtonGroup: false,
      });

      const modalHeight = ref(280)

      // 弹窗最终props
      const getProps = computed(() => {
        let modalProps: Partial<ModalProps> = {
          width: 800,
          height: modalHeight.value,
          title: unref(title),
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

      watch(
        () => getVisible?.value,
        (visible) => {
          if (visible && props.desformRecord) {
            loadAuthFieldOptions();
          }
        },
        { immediate: true }
      );

      let authFieldOptions: any[] = [];

      /** 加载规则字段 */
      function loadAuthFieldOptions() {
        let columns: BasicColumn[] = [];
        try {
          let json = JSON.parse(props.desformRecord.desformDesignJson);
          columns = generateColumns({ dataList: json.list });
        } catch (e) {
          console.error(e);
        }
        let options = columns.map((column) => {
          let { title, dataIndex } = column;
          let valueType = column['valueType'];
          return { label: `${title}（${dataIndex}）`, value: dataIndex, valueType };
        });
        authFieldOptions = [
          { label: '请选择', value: undefined },
          ...options,
          { label: '创建人（create_by）', value: 'create_by' },
          { label: '创建时间（create_time）', value: 'create_time', valueType: 'datetime' },
          { label: '更新人（update_by）', value: 'update_by' },
          { label: '更新时间（update_time）', value: 'update_time', valueType: 'datetime' },
        ];
      }

      /** 弹窗开启 */
      function open(data) {
        isUpdate.value = !!unref(data?.isUpdate);
        if (!isUpdate.value) {
          add();
        } else {
          edit(data?.record);
        }
        updateSchema([
          {
            field: 'authField',
            componentProps: {
              options: authFieldOptions,
              onChange: onAuthFieldChange,
            },
          },
          {
            field: 'authType',
            componentProps: {
              onChange: onAuthTypeChange,
            },
          }
        ]);
        if (data?.record?.authType === 'custom_mongodb') {
          updateAuthValue('mongodb')
        } else {
          updateAuthValue('normal', data?.record?.authValueType)
        }
      }

      // 权限字段变化时，设置数据类型
      function onAuthFieldChange(value, options) {
        if (value) {
          let valueType = options.valueType || 'string';
          setFieldsValue({ authValueType: valueType });
          updateAuthValue('normal', valueType);
        }
      }

      async function onAuthTypeChange(value: string) {
        let oldValue = getFieldsValue()['authType'];
        if (value === 'custom_mongodb') {
          updateAuthValue('mongodb');
        } else if (oldValue === 'custom_mongodb') {
          updateAuthValue('normal');
        }
      }

      /**
       * 更新规则值类型
       * @param flag
       * @param valueType
       */
      async function updateAuthValue(flag: 'normal' | 'mongodb', valueType?:string) {
        if (flag === 'mongodb') {
          await setFieldsValue({authValue: `{\n  "$and": [\n  ]\n}`});
          await updateSchema({
            field: 'authValue',
            label: 'MongoDB语句',
            component: 'JCodeEditor',
            componentProps: {
              style: {width: '100%'},
              language: 'javascript',
              fullScreen: true,
              autoHeight: '!ie',
              height: '300px',
            },
            rules: [
              {
                required: true,
                validator(_rule, value) {
                  // 判断JSON格式是否正确
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch (e) {
                    return Promise.reject('JSON格式错误');
                  }
                },
                trigger: 'blur',
              }
            ],
          });
          // await clearValidate('authValue');
          modalHeight.value = 500
          await nextTick()
          triggerWindowResizeEvent()
        } else if (flag === 'normal') {
          const isDate = isDateType(valueType);
          const componentProps: Recordable = {}

          if (isDate) {
            componentProps.style = {width: '100%'}
            componentProps.showTime = valueType === 'datetime'
            componentProps.valueFormat = valueType === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
          } else {
            componentProps.style = {width: 'none'}
            componentProps.inputPlaceholder = '请输入规则值'
            componentProps.selectPlaceholder = '可选择系统变量'
            componentProps.options = SYS_VAR_OPTIONS
          }

          await setFieldsValue({authValue: ''});
          await updateSchema({
            field: 'authValue',
            label: '规则值',
            component: isDate ? 'DatePickerInFilter' : 'JInputSelect',
            componentProps: componentProps,
            rules: [
              {required: true, message: '请输入规则值'},
            ],
          });
          await clearValidate('authValue');
          modalHeight.value = 300
        }
      }

      // 判断是否为日期类型
      function isDateType(valueType: string | undefined) {
        if (!valueType) {
          return false;
        }
        return ['date', 'datetime'].includes(valueType);
      }

      /** 弹窗关闭 */
      function close() {
        closeModal();
      }

      /** 新增 */
      function add() {
        edit({});
      }

      /** 编辑 */
      async function edit(record) {
        // 重置表单
        await resetFields();
        model.value = cloneDeep(record);
        await setFieldsValue({ ...model.value });
      }

      /** 提交表单 */
      async function onSubmit() {
        try {
          // 表单验证
          let values = await validate();
          let formData = Object.assign(
            {
              desformId: props.desformRecord.id,
              desformCode: props.desformRecord.desformCode,
            },
            model.value,
            values
          );
          setLoading(true);
          // 提交表单
          await dataAuthApi.saveOrUpdate(formData, isUpdate.value);
          close();
          emit('success');
        } finally {
          setLoading(false);
        }
      }

      /** 设置加载状态*/
      function setLoading(flag) {
        loading.value = flag;
        setModalProps({ confirmLoading: flag });
      }

      return {
        registerForm,
        getProps,
        loading,
      };
    },
  });
</script>

<style scoped lang="less"></style>