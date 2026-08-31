<template>
  <a-select
    v-model:value="selectedValue"
    show-search
    allow-clear
    :getPopupContainer="getParentContainer"
    placeholder="请输入关键字搜索后选择"
    @search="onSearch"
    :default-active-first-option="false"
    :filter-option="false"
    :not-found-content="null"
    :options="useOptions"
    :mode="mode"
  >
  </a-select>
</template>

<script lang="ts">
  /**
   * 关联记录控件 用于表单设计器的查询
   */
  import { ref, computed, watch, toRaw } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { useDebounceFn } from '@vueuse/core';

  export default {
    name: 'LinkTableForQuery',
    props: {
      getParentContainer: {
        type: Function,
        default: (node) => node?.parentNode,
      },
      placeholder: {
        type: String,
        default: '请输入关键字搜索后选择',
      },
      code: {
        type: String,
        default: '',
      },
      field: {
        type: String,
        default: '',
      },
      multi: {
        type: Boolean,
        default: false,
      },
      value: {
        type: String,
        default: '',
      },
    },
    emits: ['update:value', 'change'],
    setup(props, { emit }) {
      const selectedValue = ref([]);
      // 搜索结果options
      const searchedOptions = ref<any[]>([]);
      // 选中结果 options
      const selectedOptions = ref<any[]>([]);
      // 最终使用的options
      const useOptions = computed(() => {
        let arr1 = toRaw(searchedOptions.value);
        let arr2 = toRaw(selectedOptions.value);
        let arr: any[] = [];
        let valueArr: string[] = [];
        for (let item of arr1) {
          arr.push({
            ...item,
          });
          valueArr.push(item.value);
        }
        for (let item of arr2) {
          if (valueArr.indexOf(item.value) < 0) {
            arr.unshift({
              ...item,
            });
          }
        }
        return arr;
      });

      const mode = computed(() => {
        if (props.multi === true) {
          return 'multiple';
        } else {
          return 'combobox';
        }
      });

      function getParams(keyword) {
        let params = {
          order: 'desc',
          column: 'createTime',
          desformCode: props.code,
        };
        if (keyword) {
          let arr = [
            {
              field: props.field,
              type: 'text',
              rule: 'like',
              val: keyword,
            },
          ];
          let superQuery = {
            matchType: 'and',
            superQueryParams: encodeURIComponent(JSON.stringify(arr)),
          };
          params['superQuery'] = JSON.stringify(superQuery);
        }
        return params;
      }

      async function loadData(keyword) {
        const url = '/desform/data/list';
        let params = getParams(keyword);
        let options: any[] = [];
        //'[{"field":"store","type":"text","rule":"like","val":"1"}]'
        const data = await defHttp.get({ url, params }, { isTransformResponse: false });

        if (data.success) {
          let arr = data.result.records;
          if (arr && arr.length > 0) {
            for (let item of arr) {
              options.push({
                value: item.id,
                label: item.desformData[props.field],
              });
            }
          }
        }
        searchedOptions.value = options;
      }

      watch(
        () => selectedValue.value,
        (val) => {
          let temp: any = toRaw(val);
          if (!temp || temp.length == 0) {
            temp = '';
          } else {
            if (temp instanceof Array) {
              temp = temp.join(',');
            }
          }
          emit('update:value', temp);
          emit('change', temp);
        }
      );

      watch(
        () => props.code,
        (val) => {
          if (val) {
            loadData('');
          }
        },
        { immediate: true }
      );

      watch(
        () => props.value,
        async (val) => {
          if (val) {
            await loadItem(val);
            selectedValue.value = val.split(',');
          } else {
            selectedValue.value = [];
          }
        },
        { immediate: true }
      );

      async function loadItem(val) {
        let params = {
          order: 'desc',
          column: 'createTime',
          desformCode: props.code,
        };
        if (val) {
          let arr = [{ field: '_id', type: 'text', rule: 'in', val: val }];
          let superQuery = {
            matchType: 'and',
            superQueryParams: encodeURIComponent(JSON.stringify(arr)),
          };
          params['superQuery'] = JSON.stringify(superQuery);
        }
        const url = '/desform/data/list';
        let options: any[] = [];
        //'[{"field":"store","type":"text","rule":"like","val":"1"}]'
        const data = await defHttp.get({ url, params }, { isTransformResponse: false });
        if (data.success) {
          let arr = data.result.records;
          if (arr && arr.length > 0) {
            for (let item of arr) {
              options.push({
                value: item.id,
                label: item.desformData[props.field],
              });
            }
          }
        }
        selectedOptions.value = options;
      }

      return {
        selectedValue,
        loadData,
        mode,
        onSearch: useDebounceFn(loadData, 600),
        useOptions,
      };
    },
  };
</script>

<style scoped></style>
