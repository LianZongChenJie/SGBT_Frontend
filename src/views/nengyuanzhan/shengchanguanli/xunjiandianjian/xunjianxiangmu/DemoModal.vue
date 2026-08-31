<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="80%">
    <BasicForm @register="registerForm" :disabled="isDisabled" class="pr3">
      <!--  添加input的插槽  -->
      <template #addForm="{ field }">
        <a-button v-if="Number(field) === 0" @click="addField" >+</a-button>
        <a-button v-if="Number(field) > 0" @click="delField(field)">-</a-button>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
import {ref, computed, unref} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm, useForm} from '/@/components/Form/index';
import {formSchema} from './demo.data';
import {saveOrUpdateDemo, getDemoById} from './demo.api';
import { getTreeListBanzu } from '@/views/nengyuanzhan/shengchanguanli/renyuanguanli/paibanguanli/banzuguanli/demo.api';
// 声明Emits
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
//组件个数
let n = ref<number>(2);
//自定义接受参数
const props = defineProps({
  //是否禁用页面
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

//表单配置
const [registerForm, {resetFields, setFieldsValue, validate,updateSchema,appendSchemaByField,removeSchemaByFiled}] = useForm({
  labelWidth: 150,
  labelCol: {span: 24},
  wrapperCol: {span: 24},
  schemas: formSchema,
  showActionButtonGroup: false,
});
//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  for (let i = 2; i <= 15; i++) {
    removeSchemaByFiled([`optionLabel${i}`, `${i}`]);
  }
  n.value = 2;
  // const res = await getTreeListBanzu();
  //
  // const options = (res || []).map(item => ({
  //   label: item.groupName,
  //   value: item.groupCode,
  // }));
  // updateSchema({
  //   field: 'inspectionGroup',
  //   componentProps: {
  //     options,
  //   },
  // });
  setModalProps({confirmLoading: false, showOkBtn: !props.isDisabled});
  isUpdate.value = !!data?.isUpdate;
  if (data.createBy) {
    await setFieldsValue({createBy: data.createBy})
  }
  if (data.createTime) {
    await setFieldsValue({createTime: data.createTime})
  }
  if (unref(isUpdate)) {
    //获取详情
    data.record = await getDemoById({id: data.record.id});

    let values = {};
    if (Array.isArray(data.record.inspectionItemOptions)) {
      data.record.inspectionItemOptions.forEach((item,i) => {
        values[`optionLabel${item.sortOrder}`] = item.optionLabel;
        if (item.sortOrder>=2){
          appendSchemaByField(
            {
              field: `optionLabel${item.sortOrder}`,
              component: 'Input',
              label: '选项' + item.sortOrder,
              labelWidth:140,
              ifShow: ({ values }) => {
                return values.resultType == 'radio' || values.resultType == 'checkbox';
              },
              colProps: {
                span: 20,
              },
            },
            ''
          );
          appendSchemaByField(
            {
              field: `${item.sortOrder}`,
              component: 'Input',
              label: '',
              ifShow: ({ values }) => {
                return values.resultType == 'radio' || values.resultType == 'checkbox';
              },
              colProps: {
                span: 2,
              },
              slot: 'addForm',
            },
            ''
          );
        }

      });
      n.value = data.record.inspectionItemOptions.length+1;
    }

    Object.assign(data.record,values)
    await setFieldsValue({
      ...data.record,
    });
  }
});
//设置标题
const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));



/**
 * 添加字段
 * appendSchemaByField类型: ( schema: FormSchema, prefixField: string | undefined, first?: boolean | undefined ) => Promise<void>
 * 说明: 插入到指定 filed 后面，如果没传指定 field，则插入到最后,当 first = true 时插入到第一个位置
 */
async function addField() {
  //添加表单字段，里面为schemas对应的属性，可自行配置
  await appendSchemaByField(
    {
      field: `optionLabel${n.value}`,
      component: 'Input',
      label: '选项' + n.value,
      labelWidth:140,
      ifShow: ({ values }) => {
        return values.resultType == 'radio' || values.resultType == 'checkbox';
      },
      colProps: {
        span: 20,
      },
    },
    ''
  );
  await appendSchemaByField(
    {
      field: `${n.value}`,
      component: 'Input',
      label: '',
      ifShow: ({ values }) => {
        return values.resultType == 'radio' || values.resultType == 'checkbox';
      },
      colProps: {
        span: 2,
      },
      slot: 'addForm',
    },
    ''
  );
  n.value++;
}

/**
 * 删除字段
 * 类型: (field: string | string[]) => Promise<void>
 * 说明: 根据 field 删除 Schema
 * @param field 当前字段名称
 */
function delField(field) {
  //移除指定字段
  removeSchemaByFiled([`optionLabel${field}`, `${field}`]);
  n.value--;
}
function extractOptionLabels(obj) {
  return Object.keys(obj)
    .filter(key => key.startsWith('optionLabel') && obj[key] !== undefined)
    .sort((a, b) => {
      // 按 optionLabel 后面的数字排序
      const na = Number(a.replace('optionLabel', ''));
      const nb = Number(b.replace('optionLabel', ''));
      return na - nb;
    })
    .map(key => obj[key]);
}
//表单提交事件
async function handleSubmit(v) {
  try {
    let values = await validate();
    values.optionLabels =extractOptionLabels(values)
    console.log(values,'aaaaaaaaaaa');

    setModalProps({confirmLoading: true});
    //提交表单
    await saveOrUpdateDemo(values, isUpdate.value);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', values);
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>
