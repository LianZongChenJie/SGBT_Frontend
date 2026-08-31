<template>
  <a-cascader v-model:value="selectedValue" :options="options" :multiple="multiple" maxTagCount="responsive" @change="handleChange" />
</template>

<script lang="ts">
  /**
   * 省市区控件 用于表单设计器的查询
   */
  import { computed, defineComponent, ref, watch  } from 'vue';
  import { regionData, getRealCode } from '/@/components/Form/src/utils/areaDataUtil';

  export default defineComponent({
    name: 'CascaderPcaForQuery',
    props:{
      value: {
        type: String,
        default: ''
      },
      // 省市县联动级别
      // 1 = 省
      // 2 = 省市
      // 3 = 省市县
      areaLevel: {
        type: Number,
        default: 3
      },
      // 是否支持多选
      multiple: {
        type: Boolean,
        default: false
      },
    },
    emits: ['update:value', 'change'],
    setup(props, {emit}) {
      const selectedValue = ref<any[]>([]);

      // 省市县联动级别
      const areaLevel = computed(() => {
        if ([1, 2].includes(props.areaLevel)) {
          return props.areaLevel;
        } else {
          return 3;
        }
      });

      // 省市县数据
      const options = computed(() => {
        const data: Recordable[] = []
        const makeup = (dataList: Recordable[], array: Recordable[], level: number) =>{
          if (level <= areaLevel.value) {
            for (const dataItem of dataList) {
              const { value, label, children } = dataItem;
              const item: Recordable = { value, label, isLeaf: false};
              if (children && children.length > 0) {
                item.children = [];
                item.isLeaf = makeup(children, item.children, level + 1);
              } else {
                item.isLeaf = true;
              }
              array.push(item);
            }
            return false
          } else {
            return true
          }
        }
        makeup(regionData, data, 1)
        return data;
      });

      function handleChange(arr, selectedOptions) {
        console.log('handleChange', arr);
        if(!arr || arr.length == 0) {
          emit('update:value', '')
          emit('change', '')
        }else if(props.multiple) {
          let code = getAllChildren(selectedOptions);
          emit('update:value', code)
          emit('change', code)
        }else{
          if (areaLevel.value === 1) {
            emit('update:value', arr[0])
            emit('change', arr[0])
          } else if(areaLevel.value === 2){
            emit('update:value', arr[1])
            emit('change', arr[1])
          } else if(arr.length==3){
            emit('update:value', arr[2])
            emit('change', arr[2])
          }
        }
      }

      // 获取所有选中的叶级节点
      function getAllChildren(selectedOptions: any[][]) {
        const code: string[] = [];
        const isEmpty = (arr) => !arr || arr.length === 0;
        if (isEmpty(selectedOptions)) {
          return code;
        }
        const isLeaf = (item) => item.isLeaf || isEmpty(item.children);
        const setTo = (item) => (isLeaf(item) ? code.push(item.value) : item.children.forEach(setTo));
        selectedOptions.forEach((item) => {
          if (item.length === 3) {
            setTo(item[2]);
          } else if (item.length === 2) {
            setTo(item[1]);
          } else if (item.length === 1) {
            setTo(item[0]);
          }
        });
        return code.join(',');
      }

      watch(()=>props.value, (val)=>{
        if(val){
          if (props.multiple) {
            selectedValue.value = val.split(',').filter(item=>!!item).map((item) => {
              return getRealCode(item, areaLevel.value);
            });
          } else {
            let arr = getRealCode(val, areaLevel.value);
            selectedValue.value = arr;
          }
        }else{
          selectedValue.value = [];
        }
      }, {immediate: true});

      return {
        options,
        selectedValue,
        handleChange,
      };
    },
  });
</script>

<style scoped></style>
