<template>
  <div>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane tab="基本信息" key="1">
        <BasicForm @register="registerForm">
          <template #location="{ model, field }">
            <MeetRoomSelect :multi="false" v-model:value="model[field]" :disabled="true" />
          </template>
        </BasicForm>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import MeetRoomSelect from './MeetRoomSelect.vue';
  import { formSchema } from '../manage.data';
  import { queryById } from '../manage.api';
  import { pick } from 'lodash-es';

  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const props = defineProps({
    formData: {
      type: Object,
      default: () => ({}),
    },
  });
  const activeKey = ref('1');
  const signModel = reactive({
    bgColor: '#006699',
    bgImg: '',
    fontColor: '#FFFFFF',
    fontSize: 24,
    showAvatar: '',
    showDepart: '',
    showSign: '',
  });
  //表单配置
  const [registerForm, { setFieldsValue,clearValidate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { lg: 12, md: 24 },
    disabled: true,
  });

  async function initFormData() {
    let res = await queryById({ id: props.formData.dataId });
    if (res.success) {
      //表单赋值
      await setFieldsValue({
        ...res.result,
      });
      clearValidate();
      Object.assign(signModel, pick(res.result, ['bgColor', 'fontColor', 'fontSize']));
    }
  }
  initFormData();
</script>
