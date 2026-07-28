<template>
  <detail-form :schemas="detailFormSchemas" :data="subFormData" :span="formSpan"></detail-form>
</template>

<script lang="ts">
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref, watch } from 'vue';
  import { BasicForm } from '/@/components/Form/index';
  import { defHttp } from '/@/utils/http/axios';
  import { getRefPromise } from '../../hooks/auto/useAutoForm';
  import { Loading } from '/@/components/Loading';
  import DetailForm from '../../extend/form/DetailForm.vue';
  import { getDetailFormSchemas } from '../../hooks/auto/useAutoForm';

  const baseUrl = '/online/cgform/api/subform';
  export default {
    name: 'OnlineSubFormDetail',
    components: {
      BasicForm,
      Loading,
      DetailForm,
    },
    props: {
      properties: {
        type: Object,
        required: true,
      },
      mainId: {
        type: String,
        default: '',
      },
      table: {
        type: String,
        default: '',
      },
      formTemplate: {
        type: Number,
        default: 1,
      },
    },
    emits: ['formChange'],
    setup(props) {
      // 表单是否渲染完成
      const formRendered = ref(false);
      const { createMessage: $message } = useMessage();
      const tableName = ref('');
      const subFormData = ref<any>({});
      const { detailFormSchemas, createFormSchemas, formSpan } = getDetailFormSchemas(props);

      watch(
        () => props.table,
        () => {
          tableName.value = props.table;
        },
        { immediate: true }
      );

      //监听配置改变事件
      watch(
        () => props.properties,
        () => {
          //重新渲染表单
          console.log('主表properties改变', props.properties);
          formRendered.value = false;
          createFormSchemas(props.properties);
          formRendered.value = true;
        },
        { deep: true, immediate: true }
      );

      //监听主表数据ID
      watch(
        () => props.mainId,
        () => {
          //重新加载子表数据
          console.log('主表ID改变', props.mainId);
          // 此处延迟100毫秒是为了让properties的监听先执行
          setTimeout(() => {
            resetSubForm();
          }, 100);
        },
        { immediate: true }
      );

      /**
       * 当主表数据ID发生改变，子表重现获取数据
       * @returns {Promise<void>}
       */
      async function resetSubForm() {
        await getRefPromise(formRendered);
        subFormData.value = {};
        const { table, mainId } = props;
        if (!table || !mainId) {
          return;
        }
        let values = (await loadData(table, mainId)) || {};
        subFormData.value = values;
      }

      function loadData(table, mainId) {
        let url = `${baseUrl}/${table}/${mainId}`;
        return new Promise((resolve, reject) => {
          defHttp.get({ url }, { isTransformResponse: false }).then((res) => {
            console.log(res);
            if (res.success) {
              resolve(res.result);
            } else {
              console.log(res.message);
              reject();
            }
          });
        }).catch(() => {
          $message.warning('子表获取数据失败:' + table);
        });
      }

      return {
        detailFormSchemas,
        subFormData,
        formSpan,
      };
    },
  };
</script>

<style scoped></style>
