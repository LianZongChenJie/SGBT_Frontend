import {ref, watch} from 'vue'
import {systemFields } from "./type.definition";

interface SelectOption {
  label: string,
  value: string,
  type: string,
  dictCode?:string,
  dictTable?:string,
  dictText?:string,
  staticOptions?: any
}

interface ExtraArg {
  type?: string|string[],
  multi?: boolean,
  remote?: boolean
}

/**
 * 用于下拉框数据
 * @param props
 * @param options: type:select用于筛选列表的字段
 */
export function useFieldSelect(props, options?:ExtraArg) {
  const selectFieldList = ref<SelectOption[]>([]);
  let types:string[] = [];
  if(options && options.type){
    if(options.type instanceof Array){
      types = [...options.type]
    }else{
      types = options.type.split(',')
    }
  }
  watch(()=>props.columnList, (list)=>{
    if(!list || list.length==0){
      selectFieldList.value = []
    }else{
      let arr:SelectOption[] = [];
      for(let item of list){
        if(types.length>0){
          if(types.indexOf(item.type)>=0){
            let flag = true;
            if(options?.multi === false){
              if(item.multi === true || item.multiple === true){
                // 只需要找单选的字段
                flag = false;
              }
            }
            if(options?.remote === false){
              if(item.remote){
                // 判断是不是远程数据
                flag = false;
              }
            }
            if(flag){
              arr.push({
                label: item.name,
                value: item.model,
                type: item.type,
                dictCode: item.dictCode,
                dictTable: item.dictTable,
                dictText: item.dictText,
                staticOptions: item.options
              })
            }
          }
        }else{
          arr.push({
            label: item.name,
            value: item.model,
            type: item.type
          })
        }
      }
      for(let item of systemFields){
        if(types.length>0){
          if(types.indexOf(item.type)>=0){
            arr.push({
              label: item.name,
              value: item.field,
              type: item.type,
            })
          }
        }else{
          arr.push({
            label: item.name,
            value: item.field,
            type: item.type
          })
        }
      }
      selectFieldList.value = arr;
      
    }
  }, {immediate: true})

  const myFilter = (input, option)=>{
    return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.label.indexOf(input) >= 0;
  }
  
  const getColumnInfo= (field)=>{
    const list = props.columnList;
    if(list && list.length>0){
      let arr = list.filter(item=>item.key==field || item.model==field);
      if(arr && arr.length>0){
        return arr[0]
      }
    }
    return false
  }


  const showPop = ref(false);
  const filterValue = ref('')
  function isFilterItem(item){
    let temp = filterValue.value;
    if(!temp){
      return true;
    }
    if(!item){
      return false;
    }
    return item.label.indexOf(temp)>=0
  }
  
  return {
    selectFieldList,
    getColumnInfo,

    //下拉框过滤数据
    myFilter,

    //pop过滤数据
    filterValue,
    isFilterItem,
    showPop,
    
  }

}

