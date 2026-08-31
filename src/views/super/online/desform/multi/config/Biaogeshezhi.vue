<template>
  <div class="inner-content">
    <div class="title">表格设置</div>
    <div class="config-detail">
      <div>
        <div class="label">行高</div>
        <div class="config-item">
          <a-radio-group v-model:value="lineHeight" @change="onChangeLineHeight">
            <a-radio-button value="small">紧凑</a-radio-button>
            <a-radio-button value="middle">中等</a-radio-button>
            <a-radio-button value="large">高</a-radio-button>
          </a-radio-group>
        </div>

        <div class="label">自动刷新</div>
        <div class="tip">每隔一段时间后自动刷新当前视图</div>
        <div class="config-item">
          <a-select style="width: 280px" v-model:value="autoRefresh" @change="onChangeAutoRefresh">
            <a-select-option v-for="item in refreshList" :value="item.time">{{ item.label }}</a-select-option>
          </a-select>
        </div>

        <div class="label">数据统计</div>
        <div class="config-item">
          <a-switch class="sjtj" v-model:checked="hasSummary" checkedChildren="开" unCheckedChildren="关" size="small" @change="onChangeHasSummary"/>
        </div>

        <div class="label">显示列</div>
        <div class="config-item">
          <a-radio-group v-model:value="showColumn" @change="onChangeShowColumn">
            <a-radio :style="radioStyle" value="default">
              <span>与表单中的字段保持一致</span>
              <span>&nbsp;</span>
              <a-tooltip title="仅显示前50个控件且排除多行文本、富文本、Markdown" placement="top">
                <a-icon type="question-circle-filled"/>
              </a-tooltip>
            </a-radio>
            <a-radio :style="radioStyle" value="diy">自定义显示列</a-radio>
          </a-radio-group>
        </div>

        <template v-if="showColumn == 'default'">
          <div class="label">显示系统字段</div>
          <div class="config-item">
            <div class="field-warp">
              <div class="field" v-for="element in systemFields">
                <a-switch v-model:checked="element.show" size="small" @change="onChangeSystemFields" style="margin-right: 12px" />
                <component-icon :type="element.type"/>
                <span>{{ element.name }}</span>
              </div>
            </div>
          </div>
        </template>

        <div class="config-item" v-else>
          <div style="width: 360px; border-bottom: 1px solid #eee">
            <a-input placeholder="搜索字段" class="my-input" v-model:value="filterValue">
              <template #prefix>
                <search-outlined style="color: #c0c0c0" />
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

          <div class="field-warp all-fields">
            <draggable item-key="name" animation="300" v-model="myFields" dragClass="dragClass" @end="onDragEnd">
              <template #item="{ element }">
                <div class="field" v-if="isFilterField(element)">
                  <div style="display:flex;width: 330px" :title="element.name">
                    <a-switch style="margin-right: 12px;align-self: center" :title="element.disabled?'该列在显示字段配置中被设定为隐藏，此处无法修改！':''" :disabled="element.disabled" v-model:checked="element.show" @change="handleChangeShow" size="small" />
                    <component-icon :type="element.type"/>
                    <span class="ellipsis">{{ element.name }}</span>
                  </div>
                  <div class="icon" title="调整顺序"><OrderedListOutlined /></div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { ref, computed, watchEffect, watch } from 'vue';
  import {
    OrderedListOutlined,
    TableOutlined,
    FilterOutlined,
    EyeOutlined,
    SearchOutlined,
    ControlOutlined,
    AppstoreOutlined,
  } from '@ant-design/icons-vue';
  import draggable from 'vuedraggable';
  import {ColumnShower} from '../model/Bgsz';
  import { pick } from 'lodash-es';
  import ComponentIcon from "/@/components/jeecg/super/desform/ComponentIcon.vue";
  
  
  export default {
    name: 'Biaogeshezhi',
    components: {
      TableOutlined,
      FilterOutlined,
      EyeOutlined,
      OrderedListOutlined,
      SearchOutlined,
      AppstoreOutlined,
      ControlOutlined,
      draggable,
      ComponentIcon
    },
    props: {
      // 表单设计器默认的列
      columnList: {
        type: Array,
        default: () => [],
      },
      info: {
        type: [Object, String],
        required: false
      },
      //配置的列，哪些显示哪些不显示
      viewColumn: {
        type: Array,
        default: () => [],
      },
    },
    emits:['save'],
    setup(props, {emit}) {
      const lineHeight = ref('default');
      const autoRefresh = ref(0);
      const hasSummary = ref(false);
      const showColumn = ref('default');
      const refreshList = [
        { time: 0, label: '关闭' },
        { time: 30, label: '30秒' },
        { time: 60, label: '1分钟' },
        { time: 120, label: '2分钟' },
        { time: 180, label: '3分钟' },
        { time: 240, label: '4分钟' },
        { time: 300, label: '5分钟' },
      ];
      const radioStyle = {
        display: 'block',
        margin: '0px 0px 10px 0px',
      };

      const systemFieldDataList = [
        {name:'创建时间', show: false, field: 'create_time', type:'date', seq: 100},
        {name:'创建人', show: false, field: 'create_by', type:'select-user', seq: 101},
        {name:'修改时间', show: false, field: 'update_time', type:'date', seq: 102},
        {name:'修改人', show: false, field: 'update_by', type:'select-user', seq: 103},
        {name:'流程状态', show: false, field: 'bpm_status', type:'select', seq: 104, dictCode: 'bpm_status'},
      ];
      
      const systemFields = ref<any[]>([]);
      systemFields.value = [...systemFieldDataList];

      const myFields = ref<any[]>([]);
      watchEffect(() => {
        // 表单中配置的列
        let cList = props.columnList;
        if (!cList || cList.length == 0) {
          myFields.value = [];
        } else {
          // 右侧 表格设置-自定义显示列配置
          let columnConfigList:any[] = props.info.columnList||[];
          // 显示字段 配置的显示/隐藏列
          let showColumnList: any[] = props.info.showColumnList||[];
          let arr: any[] = [];
          for (let column of cList) {
            //判断显示/隐藏状态
            let {show, seq, disabled} = isShowColumn(column, columnConfigList, showColumnList);
            arr.push({
              name: column.name,
              key: column.key,
              show,
              seq,
              disabled,
              type: column.type
            });
          }
          for (let column of systemFieldDataList) {
            //判断显示/隐藏状态
            let {show, seq} = isShowSystemField(column, columnConfigList);
            arr.push({
              disabled: false,
              name: column.name,
              key: column.field,
              show,
              seq,
              type: column.type
            });
          }
          
          arr.sort(function (a, b) {
            return a.seq - b.seq;
          });
          myFields.value = arr;
        }
        let sysShowColumnList:any[] = props.info.systemColumnList||[];
        let sList = systemFields.value
        for (let column of sList) {
          //判断显示/隐藏状态
          let {show} = isShowSystemField(column, sysShowColumnList);
          column.show = show
        }
        systemFields.value = sList;
        
      });
      
      watch(()=>props.info, (temp)=>{
        if(temp){
          lineHeight.value = temp.lineHeight;
          autoRefresh.value = temp.autoRefresh;
          showColumn.value = temp.showColumn;
          hasSummary.value = temp.hasSummary;
        }
      }, {immediate: true});
      
      const showColumnNum = computed(() => {
        let arr = myFields.value;
        if (arr.length == 0) {
          return 0;
        }
        return arr.filter((item) => item.show === true).length;
      });

      /**
       * 判断列 显示/隐藏
       * @param column
       * @param columnConfigList
       * @param showColumnList
       */
      function isShowColumn(column, columnConfigList, showColumnList) {
        let flag = true;
        let seq = 98;
        let disabled = false;
        if (columnConfigList && columnConfigList.length > 0) {
          for (let item of columnConfigList) {
            if (item.field === column.key || item.field === column.field) {
              flag = item.show;
              seq = item.seq;
            }
          }
        }
        // 如果当前字段为显示，需要查看 显示字段的配置决定最终的状态
        if (showColumnList && showColumnList.length > 0) {
          for (let item of showColumnList) {
            if (item.field === column.key || item.field === column.field) {
              if(item.show === false){
                flag = item.show;
                disabled = true;
                seq = 98;
              }else{
                disabled = false;
              }
            }
          }
        }
        
        return {
          show: flag,
          seq,
          disabled
        };
      }
      
      function isShowSystemField(column, showColumnList) {
        let temp = showColumnList;
        let flag = false;
        let seq = 99;
        if (temp && temp.length > 0) {
          for (let item of temp) {
            if (item.field === column.key||item.field === column.field) {
              flag = item.show;
              seq = item.seq;
            }
          }
        }
        return {
          show: flag,
          seq
        };
      }

      const filterValue = ref('');
      function isFilterField(item) {
        let temp = filterValue.value;
        if (!temp) {
          return true;
        }
        return item.name.indexOf(temp) >= 0;
      }

      function allShow() {
        let arr = myFields.value;
        for (let item of arr) {
          item.show = true;
        }
        myFields.value = arr;
        onChangeOtherFields();
      }

      function allHide() {
        let arr = myFields.value;
        for (let item of arr) {
          item.show = false;
        }
        myFields.value = arr;
        onChangeOtherFields();
      }

      function handleChangeShow(flag) {
        if (flag == false) {
          //重排
          let arr = myFields.value;
          let arr2: any[] = [];
          for (let item of arr) {
            if (item.show == true) {
              arr2.push(item);
            }
          }
          for (let item of arr) {
            if (item.show == false) {
              arr2.push(item);
            }
          }
          myFields.value = arr2;
        }
        onChangeOtherFields();
      }

      function onDragEnd() {
        //拖拽完成后 触发页面重新渲染的事件
        onChangeOtherFields();
      }
      
     
      
      function onChangeLineHeight(){
        emit('save', {
          lineHeight: lineHeight.value
        })
      }
      
      function onChangeAutoRefresh(){
        emit('save', {
          autoRefresh: autoRefresh.value
        })
      }
      
      function onChangeShowColumn(){
        emit('save', {
          showColumn: showColumn.value
        })
      }
      
      function onChangeSystemFields(){
        let fields = systemFields.value;
        let list: ColumnShower[] = []
        for(let item of fields){
          let temp = pick(item, 'field', 'show', 'seq');
          list.push(temp);
        }
        emit('save', {
          systemColumnList: list
        })
      }

      function onChangeOtherFields(){
        let fields = myFields.value;
        let list: ColumnShower[] = [];
        for(let i=0;i<fields.length;i++){
          let temp = {
            field: fields[i].key,
            show: fields[i].show,
            seq: i
          };
          list.push(temp);
        }
        emit('save', {
          columnList: list
        })
      }
      
      function onChangeHasSummary() {
        emit('save', {
          hasSummary: hasSummary.value
        })
      }

      return {
        lineHeight,
        refreshList,
        autoRefresh,
        hasSummary,
        radioStyle,
        showColumn,
        systemFields,
        filterValue,
        isFilterField,
        myFields,
        allHide,
        allShow,
        showColumnNum,
        handleChangeShow,
        onDragEnd,
        onChangeLineHeight,
        onChangeShowColumn,
        onChangeAutoRefresh,
        onChangeHasSummary,
        onChangeSystemFields
      };
    },
  };
</script>

<style scoped lang="less">
 @import "./common";
 /* switch样式问题 */
 :deep(.sjtj){
    height: 18px;
    line-height: 18px;
    width:37px;
    .ant-switch-handle{
      top: 3px !important;
    }
  }
</style>
