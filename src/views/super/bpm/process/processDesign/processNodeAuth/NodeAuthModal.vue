<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" :width="800" destroyOnClose>
    <BasicForm @register="registerForm">
      <template #formBizCode="{ model, field, schema }">
        <a-select
          :disabled="formBizCodeDisabled"
          v-model:value="model[field]"
          @change="handleFormBizCodeChange"
          :placeholder="'请选择' + schema.label"
        >
          <a-select-option v-for="(item, key) in processFormList" :key="key" :value="item.formTableName">{{ item.formTableName }}</a-select-option>
        </a-select>
      </template>

      <template #ruleName="{ field, model, schema }">
        <a-input v-if="model.formType == '3'" v-model:value="model[field]" :placeholder="'请输入' + schema.label" />
        <a-input-group v-else>
          <a-input v-model:value="model[field]" readonly style="width: calc(100% - 90px)" :placeholder="'请选择' + schema.label" />
          <a-button style="width: 90px" @click="handleSelectRuleName(model)"><SearchOutlined #icon />选择</a-button>
        </a-input-group>
      </template>

      <template #ruleType="{ model, field }">
        <a-radio-group v-model:value="model[field]">
          <a-tooltip placement="topLeft" title="显示的反向： 隐藏">
            <a-radio value="1">显示</a-radio>
          </a-tooltip>
          <a-tooltip placement="topLeft" title="禁用的反向： 可编辑">
            <a-radio value="2">禁用</a-radio>
          </a-tooltip>
        </a-radio-group>
      </template>

      <template #status="{ model, field }">
        <a-radio-group v-model:value="model[field]">
          <a-tooltip placement="topLeft" title="实现页面组件‘显示/禁用’功能">
            <a-radio value="1">正向有效 </a-radio>
          </a-tooltip>
          <a-tooltip placement="topLeft" title="实现页面组件‘隐藏/可编辑’功能">
            <a-radio value="0"> 反向有效</a-radio>
          </a-tooltip>
        </a-radio-group>
      </template>
    </BasicForm>
  </BasicModal>

  <!-- 从online字段里选择 -->
  <select-online-field-modal @register="registerOnlineFieldsModal" @selected="handleSelectedField"></select-online-field-modal>

  <!-- 从设计器字段里选择 -->
  <select-design-field-modal @register="registerDesignFieldsModal" @selected="handleSelectedField"></select-design-field-modal>
</template>

<script>
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { queryFormTypeByProcessId, queryFormBizCodeByProcessid, saveOrUpdate } from './node.auth.api';
  import { ref, computed, toRaw, h } from 'vue';
  import SelectOnlineFieldModal from './SelectOnlineFieldModal.vue';
  import SelectDesignFieldModal from './SelectDesignFieldModal.vue';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { pick } from 'lodash-es';
  import { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons-vue';
  import { Tooltip } from 'ant-design-vue';
  import { processFormTypeOptions } from '../processForm/process.form.data';

  export default {
    name: 'NodeAuthModal',
    components: {
      BasicModal,
      BasicForm,
      SearchOutlined,
      SelectOnlineFieldModal,
      SelectDesignFieldModal,
    },
    emits: ['success', 'register'],
    setup(_props, { emit }) {
      const formSchema = [
        {
          label: '',
          field: 'id',
          component: 'Input',
          show: false,
        },
        {
          label: 'processId',
          field: 'processId',
          component: 'Input',
          show: false,
        },
        {
          label: 'processNodeCode',
          field: 'processNodeCode',
          component: 'Input',
          show: false,
        },
        {
          label: 'onlineTableName',
          field: 'onlineTableName',
          component: 'Input',
          show: false,
        },
        {
          label: 'desformComKey',
          field: 'desformComKey',
          component: 'Input',
          show: false,
        },
        {
          field: 'formType',
          label: '表单类型',
          component: 'Select',
          buss: false,
          dynamicDisabled: (data) => {
            return data.schema.buss;
          },
          componentProps: ({ formActionType }) => {
            return {
              allowClear: false,
              options: processFormTypeOptions,
              onChange: (value) => {
                handleFormTypeChange(value);
                // 重置表单值
                formActionType.setFieldsValue({
                  formBizCode: '',
                  ruleName: '',
                  ruleCode: '',
                });
              },
            };
          },
        },
        {
          field: 'formBizCode',
          label: '表名',
          component: 'Input',
          slot: 'formBizCode',
        },

        {
          field: 'ruleName',
          label: '规则名称',
          component: 'Input',
          slot: 'ruleName',
        },
        {
          field: 'ruleCode',
          label: '规则编码',
          component: 'Input',
        },
        {
          field: 'ruleType',
          label: '策略',
          component: 'Input',
          slot: 'ruleType',
        },
        {
          field: 'status',
          label: h(
            'span',
            {
              title: '状态',
            },
            ['状态 ', h(Tooltip, { title: '策略与状态组合使用实现表单控件的：显示、可编辑、隐藏、禁用!' }, () => h(QuestionCircleOutlined))]
          ),
          component: 'Input',
          slot: 'status',
        },
      ];

      const { createMessage: $message } = useMessage();
      const processFormList = ref([]);
      const formBizCodeDisabled = ref(false);
      const isUpdate = ref(false);
      const title = computed(() => {
        return isUpdate.value === true ? '编辑' : '新增';
      });
      // 已经选中的权限字段
      const selectedAuthFields = ref([]);

      //表单配置
      const [registerForm, { resetFields, setFieldsValue, validate, updateSchema, getFieldsValue }] = useForm({
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: { span: 24, style: { marginTop: '10px' } },
      });

      //useModalInner
      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        console.log('进入表单>>', data);
        isUpdate.value = data.isUpdate;
        const { formData, dataSource } = data;
        setFieldsValue({ ...formData });

        console.log('da', toRaw(dataSource));
        selectedAuthFields.value = toRaw(dataSource);

        let formType = await resetFormType(formData.processId, formData.formType);
        await handleFormTypeChange(formType);
      });

      /**
       * 新增页面走此逻辑
       * @param processId
       * @returns {Promise<void>}
       */
      async function resetFormType(processId, updatePageFormType) {
        if (isUpdate.value === true) {
          return updatePageFormType;
        }
        //新增页面初始化-控制两个属性1.是否禁用表单formType，2.设置formType初始值
        let formType = '1';
        let formTypeDisabled = false;
        try {
          let data = await queryFormTypeByProcessId(processId);
          if (data.length == 1) {
            formTypeDisabled = true;
            formType = data[0];
          }
          if (data.length > 1) {
            formTypeDisabled = false;
            formType = data[0];
          }
        } catch (e) {
          console.log('resetFormType cause exception', e);
        }
        setFieldsValue({
          formType,
          status: '1',
          ruleType: '1',
        });
        updateSchema([
          {
            field: 'formType',
            buss: formTypeDisabled,
          },
        ]);
        return formType;
      }

      /**
       * 重置 表名/表单编码
       */
      async function resetFormBizCode(processId, formType) {
        let arr = [];
        try {
          let data = await queryFormBizCodeByProcessid(processId, formType);
          if (data && data.length > 0) {
            if (data.length == 1) {
              //只有一个表单-设置禁用
              formBizCodeDisabled.value = true;
            }
            if (isUpdate.value === false) {
              //如果新增页面需要 设置初始值
              let formBizCode = data[0].formTableName;
              setFieldsValue({ formBizCode });
            }
          }
          arr = [...data];
        } catch (e) {
          console.log('resetFormBizCode cause exception', e);
        }
        processFormList.value = arr;
      }

      /**
       * formType字段值改变--修改表单配置
       * @param value
       */
      async function handleFormTypeChange(value) {
        // 修改两个参数： 1.formBizCode字段的label描述；2.ruleName字段是否支持编辑
        console.log('表单类型改变事件触发', value);
        let label = '表名';
        let readOnly = true;
        if (value == '1') {
          //online 不作修改
        } else if (value == '2') {
          //设计器
          label = '表单编码';
        } else if (value == '3') {
          //自定义开发
          readOnly = false;
        }
        await updateSchema([
          { field: 'formBizCode', label: label },
          { field: 'ruleName', componentProps: { readonly: readOnly } },
          { field: 'ruleCode', componentProps: { readonly: readOnly } },
        ]);

        let tempFormData = getFieldsValue();
        resetFormBizCode(tempFormData.processId, value);
      }

      // 表名改变--重置规则编码和名称
      function handleFormBizCodeChange() {
        setFieldsValue({ ruleName: '', ruleCode: '' });
      }

      // 规则名称选择弹框
      const [registerOnlineFieldsModal, { openModal: openOnlineFeildsModal }] = useModal();
      const [registerDesignFieldsModal, { openModal: openDesignFeildsModal }] = useModal();

      function handleSelectRuleName(model) {
        console.log('handleSelectRuleName', model);
        let values = getFieldsValue();
        if (!values.formBizCode) {
          $message.warning('没有选择表名或表单编码!');
          return;
        }
        let data = {
          selectedAuthFields: selectedAuthFields.value,
          formBizCode: values.formBizCode,
        };
        if (values.formType == '1') {
          openOnlineFeildsModal(true, data);
        } else {
          openDesignFeildsModal(true, data);
        }
      }

      function handleSelectedField(data) {
        let formData = {
          ruleCode: data.authField,
          ruleName: data.authTitle,
          desformComKey: data.authComKey,
          onlineTableName: data.tableName,
        };
        console.log('formData', formData);
        setFieldsValue(formData);
      }

      // 表单提交事件
      async function handleSubmit() {
        let values = getFieldsValue();
        if(values.formType == '1'){
          //online设置权限时，子表使用子表的表名 而不是主表的表名
          values.formBizCode = values.onlineTableName
        }
        console.log('表单数据', values);
        await saveOrUpdate(values, isUpdate.value);
        emit('success');
        closeModal();
      }

      return {
        title,
        registerModal,
        registerForm,
        handleSubmit,
        handleFormBizCodeChange,
        formBizCodeDisabled,
        processFormList,
        handleSelectRuleName,
        registerOnlineFieldsModal,
        registerDesignFieldsModal,
        handleSelectedField,
      };
    },
  };
</script>

<style scoped></style>
