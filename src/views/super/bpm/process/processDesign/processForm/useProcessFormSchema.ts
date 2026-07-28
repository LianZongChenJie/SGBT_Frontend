import { defHttp } from '/@/utils/http/axios';
import { FormSchema } from '/@/components/Table';
import { processFormTypeOptions } from './process.form.data';
import { ref } from 'vue'

/**
 * 获取自定义开发的流程编码
 */
const GET_FLOW_CODE_FOR_CUTOM = '/act/process/extActProcessForm/genDefaultCode';

/**
 * 给表单添加相关事件
 */
export function useProcessFormSchema() {

  let showOnline = ref(false);
  let showDesigner = ref(false);
  let showCustom = ref(false);
  showOnline.value = true;
  
  function changeFormType(type){
    if (type == '1') {
      showOnline.value = true;
      showDesigner.value = false;
      showCustom.value = false;
    } else if (type == '2') {
      showOnline.value = false;
      showDesigner.value = true;
      showCustom.value = false;
    } else {
      showOnline.value = false;
      showDesigner.value = false;
      showCustom.value = true;
    }
  }
  
  
  /**
   * 表单类型改变触发
   * @param type
   * @param updateSchema
   * @param setFieldsValue
   */
  async function handleFormTypeChange(type, formAction) {
    const { updateSchema, setFieldsValue, clearValidate } = formAction;
    await clearValidate(['relationCode', 'formTableName1', 'formTableName2', 'formTableName3']);
    changeFormType(type)
    if (type == '1') {
      await resetFormForOnline(updateSchema, setFieldsValue);
    } else if (type == '2') {
      await resetFormForDesigner(updateSchema, setFieldsValue);
    } else {
      await resetFormForCode(updateSchema);
    }
    // 重置表单的值
    setFieldsValue({
      relationCode: '',
      formTableName1: '',
      formTableName2: '',
      formTableName3: '',
    });
  }

  /**
   * 表单类型改变触发-online
   * @param updateSchema
   */
  async function resetFormForOnline(updateSchema, setFieldsValue) {
    await updateSchema([
      {
        field: 'relationCode',
        required: false,
        componentProps: {
          readOnly: true,
        },
      },
      {
        field: 'flowStatusCol',
        required: false,
        componentProps: {
          readOnly: true,
        },
      },
   
    ]);
    setFieldsValue({ flowStatusCol: 'bpm_status' });
  }

  /**
   * 表单类型改变触发-表单设计器
   * @param updateSchema
   */
  async function resetFormForDesigner(updateSchema, setFieldsValue) {
    await updateSchema([
      {
        field: 'relationCode',
        required: false,
        componentProps: {
          readOnly: true,
        },
      },
      {
        field: 'flowStatusCol',
        required: false,
        componentProps: {
          readOnly: true,
        },
      },
   
    ]);
    setFieldsValue({ flowStatusCol: 'bpm_status' });
  }

  /**
   * 表单类型改变触发-自定义编码
   * @param updateSchema
   */
  async function resetFormForCode(updateSchema) {
    await updateSchema([
      {
        field: 'relationCode',
        required: true,
        componentProps: {
          readOnly: false,
        },
      },
      {
        field: 'flowStatusCol',
        required: true,
        componentProps: {
          readOnly: false,
        },
      },
     
    ]);
  }

  /**
   * 当 表名改变的时候 对应的流程编码需要动态改变，
   * change事件 只对online和表单设计器有效
   * @param e
   * @param formModel
   */
  function handleTableNameChange(e, formModel) {
    let val = e;
    if(e && e.target){
      val = e.target.value;
    }
    if (!formModel.flowStatusCol) {
      formModel.flowStatusCol = 'bpm_status';
    }
    if (!val) {
      formModel.relationCode = '';
    } else {
      if (formModel.formType == '1') {
        formModel.relationCode = 'onl_' + val;
      } else if (formModel.formType == '2') {
        formModel.relationCode = 'desform_' + val;
      }
    }
  }

  /**
   * 当 表名改变的时候 对应的流程编码需要动态改变，
   * blur事件 自定义开发
   * @param e
   * @param formModel
   */
  function handleTableNameBlur(e, formModel, setFieldsValue) {
    if (formModel.formType == '3') {
      let val = e.target.value;
      if (!val) {
        return;
      }
      let relationCode = formModel.relationCode;
      if (!relationCode) {
        //只有编码不存在的时候才需要请求后台获取最新的流程编码
        let params = { tabeName: val };
        defHttp.get({ url: GET_FLOW_CODE_FOR_CUTOM, params }, { isTransformResponse: false }).then((res) => {
          if (res.success) {
            setFieldsValue({
              relationCode: res.result,
            });
          }
        });
      }
    }
  }

  /**
   * 表单
   */
  const processFormSchema: FormSchema[] = [
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
      label: 'formDealStyle',
      field: 'formDealStyle',
      component: 'Input',
      show: false,
    },
    {
      label: '表单类型',
      field: 'formType',
      component: 'Select',
      defaultValue: '1',
      componentProps: ({ formActionType }) => {
        return {
          allowClear: false,
          options: processFormTypeOptions,
          onChange: async (value) => {
            await handleFormTypeChange(value, formActionType);
          },
        };
      },
    },

    {
      label: '表名',
      field: 'formTableName3',
      component: 'Input',
      required: true,
      ifShow: ()=>showCustom.value,
      componentProps: ({ formModel, formActionType: { setFieldsValue } }) => {
        return {
          allowClear: false,
          onChange: (e) => {
            handleTableNameChange(e, formModel);
          },
          onBlur: (e) => {
            handleTableNameBlur(e, formModel, setFieldsValue);
          },
        };
      },
    },
    {
      label: '表名',
      field: 'formTableName1',
      component: 'JSearchSelect',
      required: true,
      ifShow: ()=>showOnline.value,
      componentProps: ({ formModel, formActionType: { setFieldsValue } }) => {
        return {
          dict: 'onl_cgform_head where table_type!=3 and copy_type=0,table_txt,table_name',
          pageSize: 10,
          async: true,
          popContainer: '.process-form-modal',
          params:{order: 'desc', column: 'create_time'},
          onChange: (e) => {
            handleTableNameChange(e, formModel);
            handleTableNameBlur(e, formModel, setFieldsValue);
          }
          
        };
      }
    },
    {
      label: '表单编码',
      field: 'formTableName2',
      component: 'JSearchSelect',
      required: true,
      ifShow: ()=>showDesigner.value,
      componentProps: ({ formModel, formActionType: { setFieldsValue } }) => {
        return {
          dict: 'design_form where desform_type=1,desform_name,desform_code',
          pageSize: 10,
          async: true,
          popContainer: '.process-form-modal',
          params:{order: 'desc', column: 'create_time'},
          onChange: (e) => {
            handleTableNameChange(e, formModel);
            handleTableNameBlur(e, formModel, setFieldsValue);
          }

        };
      }
    },
    {
      label: '唯一编码',
      field: 'relationCode',
      component: 'Input',
      required: true,
      componentProps: {
        readOnly: true,
        allowClear: false,
      },
    },
    {
      label: '流程状态列名',
      field: 'flowStatusCol',
      component: 'Input',
      required: true,
      componentProps: {
        readOnly: true,
        allowClear: false,
      },
    },
    {
      label: '标题表达式',
      field: 'titleExp',
      component: 'Input',
      slot: 'titleExp',
      required: true,
    },
  ];

  return { processFormSchema, changeFormType };
}
