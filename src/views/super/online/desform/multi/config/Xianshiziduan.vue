<template>
    <div class="inner-content">
        <div class="title">显示字段</div>
        <div class="tip">设置此视图下的表单中需要对用户隐藏的字段</div>
        <div class="config-detail" style="width:320px;padding-top: 0">
            <div>

                <div class="config-item">
                    <div style="width: 360px; border-bottom: 1px solid #eee">
                        <a-input placeholder="搜索字段" class="my-input" v-model:value="filterValue">
                            <template #prefix>
                                <SearchOutlined style="color: #c0c0c0" />
                            </template>
                        </a-input>
                    </div>
                    <div class="buttons">
                        <div>
                            <a-button type="text" @click="allShow">显示全部</a-button>
                            <a-button type="text" @click="allHide">隐藏全部</a-button>
                        </div>
                        <div class="column-num" v-if="showColumnNum">显示{{ showColumnNum }}列</div>
                    </div>

                    <div class="field-warp all-fields" :style="{'maxHeight': maxHeight + 'px'}">
                        <template v-for="element in myFields">
                            <div class="field" v-if="isFilterField(element)">
                                <div style="display:flex;width: 350px" :title="element.name">
                                    <a-switch v-model:checked="element.show" @change="handleChangeShow" size="small" style="margin-right: 12px;align-self: center"/>
                                    <component-icon :type="element.type"/>
                                    <span class="ellipsis" style="margin-left: 10px">{{ element.name }}</span>
                                </div>
                            </div>
                        </template>
                     
                    </div>
                </div>
                
                
            </div>
        </div>
    </div>
    
</template>

<script lang="ts">
  import { ref, watch, defineComponent, computed, watchEffect } from 'vue';
  import { pick } from 'lodash-es';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { ColumnShower } from '/@/views/super/online/desform/multi/model/Bgsz';
  import ComponentIcon from "/@/components/jeecg/super/desform/ComponentIcon.vue";

  /**
   * 显示字段
   */
  export default defineComponent({
    name: "Xianshiziduan",
    props: {
      // 表单设计器默认的列
      columnList: {
        type: Array,
        default: () => [],
      },
      // showColumnList
      info:{
        type: Object,
        require: false,
        default: {},
      },
      config: {
        type: Object,
        required: true,
      },
    },
    components:{
      SearchOutlined,
      ComponentIcon
    },
    emits:['save'],
    setup(props, {emit}){
      
      const myFields = ref<any[]>([]);
      const filterValue = ref('');
      function isFilterField(item) {
        let temp = filterValue.value;
        if (!temp) {
          return true;
        }
        return item.name.indexOf(temp) >= 0;
      }


      const showColumnNum = computed(() => {
        let arr = myFields.value;
        if (arr.length == 0) {
          return 0;
        }
        return arr.filter((item) => item.show === true).length;
      });
      
      function allShow() {
        let arr = myFields.value;
        for (let item of arr) {
          item.show = true;
        }
        myFields.value = arr;
        handleChangeShow()
      }

      function allHide() {
        let arr = myFields.value;
        for (let item of arr) {
          item.show = false;
        }
        myFields.value = arr;
        handleChangeShow()
      }

      
      watchEffect(()=>{
        const showColumn = props.config.bgsz.showColumn
        let list:any[] = props.columnList;
        let arr:any[] = []
        if(list && list.length>0){
          if(props.info && props.info.showColumnList){
            let showList = props.info.showColumnList;
            for(let item of list){
              // 【QQYUN-8909】默认不展示大字段
              if (showColumn === 'default' && ['textarea', 'markdown', 'editor'].includes(item.type)) {
                continue;
              }
              let {show, seq} = getFieldShow(item.key, showList);
              let temp = {
                name: item.name,
                field: item.key,
                show,
                seq,
                type: item.type,
              }
              arr.push(temp)
            }
            arr.sort(function (a, b) {
              return a.seq - b.seq;
            });
          }else{
            for(let item of list){
              let temp:any = pick(item, 'name', 'key', 'type')
              arr.push({
                ...temp,
                show: true
              })
            }
          }
        }
        myFields.value = arr;
      });
      
      function getFieldShow(key, showList){
        let show = true
        let seq = 99;
        for(let i=0;i<showList.length;i++){
          if(showList[i].field==key){
            show = showList[i].show;
            seq = showList[i].seq;
          }
        }
        return {show, seq};
      }


      const maxHeight = ref(300);
      initAllFieldHeight();
      function initAllFieldHeight(){
        let temp = window.innerHeight-400;
        if(temp<300){
          temp = 300;
        }
        maxHeight.value = temp;
      }

      
      function handleChangeShow(){
        let fields = myFields.value;
        let list: ColumnShower[] = [];
        for(let i=0;i<fields.length;i++){
          let temp = {
            field: fields[i].field,
            show: fields[i].show,
          };
          list.push(temp);
        }
        emit('save', {
          showColumnList: list
        })
      }
      
      return {
        myFields,
        filterValue,
        allHide,
        allShow,
        showColumnNum,
        isFilterField,
        maxHeight,
        handleChangeShow
      }
    }
  })
</script>

<style scoped lang="less">
    @import "./common";
</style>
