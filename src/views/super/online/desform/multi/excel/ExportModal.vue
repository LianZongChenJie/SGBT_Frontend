<template>
  <BasicModal title="将视图下数据导出为 Excel" @register="registerModal" :width="470" :canFullscreen="false" destroyOnClose closable @ok="doExport">
    <div style="width: 100%; position: relative">
      <!--  autoExpandParent
      defaultExpandAll-->
      <div style="position: absolute; right: 30px; z-index: 999">
        <a-input placeholder="搜索字段名称" v-model:value="searchText">
          <template #prefix>
            <SearchOutlined style="color: #c0c0c0" />
          </template>
        </a-input>
      </div>
      <div style="max-height: 300px; overflow-y: auto;position: relative">
        <div v-if="treeData" style="position: absolute; left: 85px; top: 1px; font-size: 14px; z-index: 999; color: rgb(158, 158, 158)">
          {{ getCountText }}
        </div>
        <a-tree
          checkable
          :tree-data="treeData"
          v-model:selectedKeys="selectedKeys"
          v-model:checkedKeys="checkedNewKeys"
          v-model:expandedKeys="expandedKeys"
          checkStrictly
          @check="onCheck"
          @select="onSelect">
        </a-tree>
      </div>

      <div style="margin-top: 10px; padding: 0 20px">
        <div style="font-size: 13px; color: #757575">其他</div>
        <div style="margin-top: 10px">
          <a-checkbox v-model:checked="showStatus.summary" disabled>列统计结果</a-checkbox>
        </div>
        <div style="margin-top: 10px">
          <a-checkbox v-model:checked="showStatus.multiSheet">在其他sheet导出关联表</a-checkbox>
        </div>
        <div style="margin-top: 10px; margin-left: 20px" v-if="showStatus.multiSheet">
          <div v-for="sub in subTableList">
            <a-checkbox v-model:checked="sub.checked">{{ sub.title }}</a-checkbox>
          </div>
        </div>
      </div>

      <div style="margin-top: 10px; padding: 0 20px">
        <div style="font-size: 13px; color: #757575">导出格式</div>
        <div style="margin-top: 10px">
          <a-radio-group v-model:value="showStatus.exportType">
            <a-radio value="xlsx">Excel 文件（.xlsx）</a-radio>
            <a-radio value="csv" style="margin-left: 10px" disabled>CSV 文件（.csv）</a-radio>
          </a-radio-group>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts">
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { ref, defineComponent, computed, reactive, toRaw, watch } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { systemFields } from '../ts/type.definition'
  import {defHttp} from "/@/utils/http/axios";
  import {useColumns} from "../../auto/hooks/useColumns";

  export default defineComponent({
    name: 'ExportModal',
    components: {
      BasicModal,
      SearchOutlined,
    },
    props: {
      designFormCode: {
        type: String,
        default: '',
      },
      viewId: {
        type: String,
        default: '',
      },
      tableColumns: {
        type: Array,
        default: () => [],
      },
    },
    setup(props) {
      let queryParams: any = {};
      let excelName = '';
      const { handleExportXlsx } = useMethods();
      const selectedIdList = ref([])

      const loading = ref(false)
      const desformCode = ref(props.designFormCode)

      // 加载列配置
      const {allColumns, loadColumnsInfo} = useColumns({desformCode, maxColumnLength: -1});

      const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(async (data) => {
        console.log('data', data);

        loading.value = true;
        changeLoading(true);
        changeOkLoading(true);
        // 查询全部列字段
        await loadColumnsInfo(data.info.designFormCode)
        loading.value = false;
        changeLoading(false);
        changeOkLoading(false);

        initTreeData(data.info.columns);
        queryParams = data.info.queryParams || {};
       
        if(!data.info.idList || data.info.idList.length==0){
          selectedIdList.value = [];
        }else{
          selectedIdList.value = data.info.idList;
        }
        // QQYUN-4338【应用】表单导出导入的几个问题
        if(data.info.name){
          excelName = data.info.name;
        }else{
          if(data.info.designFormCode){
            await queryFormConfig(data.info.designFormCode, data.info.viewName)
          }
        }
      });

      // 查询表单名称
      async function queryFormConfig(desformCode, viewName) {
        try {
          const url = `/desform/api/config/${desformCode}`;
          const result = await defHttp.get({ url });
          excelName = result.desformName+'_'+viewName
        } catch (e) {
          console.error(e);
        }
      }

      const showStatus = reactive({
        summary: false,
        multiSheet: false,
        exportType: 'xlsx',
      });

      const allData = ref<any[]>([]);
      const subTableList = ref<any[]>([]);
      const expandedKeys = ref<string[]>([]);
      const checkedKeys = ref<string[]>([]);
      const selectedKeys = ref<any[]>([]);
      const checkedNewKeys = computed({
        get() {
          let arr = checkedKeys.value
          return {
            checked: arr,
            halfChecked: []
          }
        },
        set(val){
          if(val && val.checked){
            checkedKeys.value = val.checked
          }else{
            checkedKeys.value = []
          }
        }
      })

      function initTreeData(columns) {
        let children: any[] = [];
        let checks: string[] = [];
        let pushRoot = true;
        // 选中的列
        const checkedColKeySet = new Set(columns.map((item) => item.key));
        /*  const idFieldKey = 'id'
        children.push({ title: '记录ID', key: idFieldKey });
        checks.push(idFieldKey);*/
        let subTables: any[] = [];
        let expandKeyArray: any[] = []
        for (let item of allColumns.value) {
          // QQYUN-5533【导出】他表字段没有导出 隐藏他表字典-仅显示
          if(item.compType == 'link-field'){
            if(!item['saveType']){
              continue;
            }
          }
          if (item.compType === 'sub-table-design') {
            subTables.push({
              title: item.title as string,
              key: item.dataIndex,
              checked: true,
            });
          } else if(item.compType === 'link-record'){
            if(item['isSubTable'] === true){
              subTables.push({
                title: item.title,
                key: item.dataIndex,
                checked: true,
              });
            }else{
              let one2one = {
                title: item.title,
                key: item.key,
                children: [{
                  title: '标题字段',
                  key: item.key+'_title',
                  disableCheckbox: true
                },{
                  title: '记录ID',
                  key: item.key+'_id',
                }]
              }
              expandKeyArray.push(item.key)
              children.push(one2one);
              if (checkedColKeySet.has(item.key)) {
                checks.push(item.key as string);
                checks.push(item.key+'_title');
              } else {
                pushRoot = false;
              }
            }
          } else {
            // 主表不需要前缀，子表（一对一）需要加上“表名#”前缀
            let keyPrefix = item.extraProps?.isMainField ? '' : item.extraProps!.subTableName + '#'
            let realKey = keyPrefix + item.key
            children.push({
              title: item.title,
              key: realKey,
            });
            if (checkedColKeySet.has(item.key)) {
              checks.push(realKey);
            } else {
              pushRoot = false;
            }
          }
        }
        
        // QQYUN-4334【应用】表单导出，如何导出创建和修改时间、创建人等系统标准字段
        for(let item of systemFields){
          // 过滤重复的
          if (checks.findIndex( v => v === item.field) > -1) {
            continue;
          }
          children.push({
            title: item.name,
            key: item.field,
          });
          checks.push(item.field);
        }

        children.unshift({
          title: "记录ID",
          key: "_id",
        });
        checks.push("_id");
        if (pushRoot) {
          checks.push("root");
        }

        const data = [{ title: '全选', key: 'root', children }];
        allData.value = data;

        expandedKeys.value = [...expandKeyArray, 'root'];
        checkedKeys.value = checks;
        subTableList.value = subTables;
      }

      const searchText = ref('');
      const treeData = computed(() => {
        let all = allData.value;
        let text = searchText.value;
        if (!text) {
          return all;
        }
        let children: any[] = [];
        for (let item of all[0].children) {
          if (item.title.indexOf(text) >= 0) {
            //disableCheckbox: true
            children.push({ ...item });
          }
        }
        return [{ title: '全选', key: 'root', children }];
      });
      
      function onCheck(_data, event) {
        let item = event.node.dataRef;
        if(item.key == 'root'){
          if(event.checked === true){
            //选中
            selectAll();
          }else{
            //取消全选
            checkedKeys.value = []
          }
        }else{
          if(event.checked === true){
            //选中
            if(item.children && item.children.length>0){
              let arr = checkedKeys.value;
              arr.push(item.children[0].key)
              checkedKeys.value = arr;
            }
          }else{
            unSelectRoot();
          }
        }
      }
      
      function unSelectRoot() {
        let arr = checkedKeys.value;
        let index = arr.indexOf('root')
        if(index>=0){
          arr.splice(index, 1)
        }
        checkedKeys.value = arr;
      }
      
      function selectAll() {
        // 全选
        let arr:any[] = checkedKeys.value
        let children:any[] = treeData.value[0].children
        for(let c of children){
          if(arr.indexOf(c.key)<0){
            arr.push(c.key);
          }
          if(c.children && c.children.length>0){
            let s = c.children[0].key;
            if(arr.indexOf(s)<0){
              arr.push(s);
            }
          }
        }
        arr.push('root');
        checkedKeys.value = arr
      }

      function onSelect(keys, event) {
        console.log(keys[0], event);
        let item = event.node.dataRef;
        if(item.disableCheckbox){
        }else{
          //如果选择根节点 需要走全选或是全不选的状态
          if(keys[0] == 'root'){
            if (event.node.checked === true) {
              //取消全选
              checkedKeys.value = []
            } else {
              selectAll();
            }
          }else{
            let arr = checkedKeys.value;
            if (event.node.checked === true) {
              arr.splice(arr.indexOf(keys[0]), 1);
              unSelectRoot();
            } else {
              arr.push(keys[0]);
              selectedLinkRecord(keys[0], arr)
            }
            checkedKeys.value = arr;
          }
        }
  
        selectedKeys.value = [];
      }

      /**
       * 选中 关联记录字段 需要同步选中其子节点
       */
      function selectedLinkRecord(key, arr) {
        for(let item of treeData.value[0].children){
          if(item.key == key){
            if(item.children && item.children.length>0){
              arr.push(item.children[0].key)
            }
          }
        }
      }

      const getCountText = computed(() => {
        let list: any = treeData.value;
        if (list && list.length > 0) {
          let checks:any = checkedKeys.value || [];
          if(checks.checked){
            checks = checks.checked
          }
          let checkCount = 0;
          let children = list[0].children;
          if (checks.indexOf('root') >= 0) {
            return '(' + children.length + '/' + children.length + ')';
          }
          if (children && children.length > 0) {
            for (let item of children) {
              if (checks.indexOf(item.key) >= 0) {
                checkCount++;
              }
            }
            return '(' + checkCount + '/' + children.length + ')';
          }
        }
        return '';
      })

      function getFieldKeyString() {
        let list = allData.value;
        let arr: any[] = [];
        if (list && list.length > 0) {
          let checks = checkedKeys.value;
          let children = list[0].children;
          let allChecked = false;
          if (checks.indexOf('root') >= 0) {
            allChecked = true;
          }
          addFieldKey2Array(arr, children, checks, allChecked)
        }
        return arr.join(',');
      }
      
      function addFieldKey2Array(arr, children, checks, allChecked) {
        if (children && children.length > 0) {
          for (let item of children) {
            if (allChecked || checks.indexOf(item.key) >= 0) {
              arr.push(item.key);
              if(item.children && children.length > 0){
                addFieldKey2Array(arr, item.children, checks, false);
              }
            }
          }
        }
      }

      function getSubTables() {
        let subTableArray: any[] = [];
        if (showStatus.multiSheet === true) {
          let arr = subTableList.value;
          if (arr && arr.length > 0) {
            for (let item of arr) {
              if (item.checked === true) {
                subTableArray.push(item.key);
              }
            }
          }
        }
        return subTableArray.join(',');
      }

      function doExport() {
        const url = '/desform/data/lowAppExport/' + queryParams.code;
        let subTables = getSubTables();
        let fieldKeyString = getFieldKeyString();
        let exportParams = {
          ...queryParams,
          subTables,
          fieldKeyString,
          selectedIds: toRaw(selectedIdList.value)
        };
        console.log('导出参数', exportParams);
        handleExportXlsx(excelName, url, exportParams);
        closeModal();
      }

      watch(checkedKeys, ()=>{
        let expands:any[] = expandedKeys.value;
        let checks:any[] = checkedKeys.value;
        // 1.找expands中有 但是checks中没有的，删除expands中的元素
        let deleteArr:any[] = []
        for(let item of expands){
          if(item == 'root'){
            continue;
          }
          if(checks.indexOf(item)<0){
            deleteArr.push(item)
          }
        }
        if(deleteArr.length>0){
          for(let item of deleteArr){
            let index = expands.indexOf(item)
            expands.splice(index, 1)
          }
          expandedKeys.value = expands
        }
        // 2.找checks中有 但是 expands 中没有的，判断是不是有子节点，如果有需要添加展开
        let addArr:any[] = []
        for(let item of checks){
          if(item == 'root'){
            continue;
          }
          if(expands.indexOf(item)<0){
            addArr.push(item)
          }
        }
        if(addArr.length>0){
          for(let item of treeData.value[0].children){
            if(item.children && item.children.length>0){
              if(addArr.indexOf(item.key)>=0){
                expands.push(item.key)
              }
            }
          }
          expandedKeys.value = expands
        }
        
      }, {deep: true});

      return {
        registerModal,
        closeModal,
        doExport,
        treeData,
        expandedKeys,
        checkedKeys,
        selectedKeys,
        searchText,
        onSelect,
        onCheck,
        showStatus,
        subTableList,
        getCountText,
        checkedNewKeys
      };
    },
  });
</script>

<style scoped></style>
