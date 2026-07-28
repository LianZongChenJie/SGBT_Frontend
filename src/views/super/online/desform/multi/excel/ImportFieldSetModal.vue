<template>
  <BasicModal
      :maxHeight="500"
      title="数据导入 - 建立映射（3/3）"
      @register="registerModal"
      :width="960"
      :canFullscreen="false"
      :maskClosable="false"
      destroyOnClose
      closable
  >

    <div style="display: flex; flex-direction: column; margin: 0 10px">
      <template v-if="isSubTable">
        <div style="font-weight: 700; display: flex">
          <div style="flex: 1">Excel列</div>
          <div style="width: 100px"></div>
          <div style="flex: 1">主表匹配字段</div>
        </div>
        <div style="margin-top: 10px; position: relative; overflow: hidden; height: 50px">
          <div class="field-list-container" style="right: -10px; z-index: 9999">
            <div class="item">
              <div style="flex: 1">
                <a-select
                  style="width: 100%"
                  placeholder="请选择"
                  v-model:value="matchFields.sub"
                  allowClear
                >
                  <a-select-option v-for="str in leftSelectOptions" :value="str">{{ str }}</a-select-option>
                </a-select>
              </div>
              <div class="center-arrow" :class="true ? 'active' : ''">
                <Icon icon="ant-design:arrow-left-outlined" :size="22" />
              </div>
              <div class="right" style="flex: 1">
                <a-select
                    style="width: 100%"
                    placeholder="请选择"
                    v-model:value="matchFields.main"
                    allowClear
                >
                  <template v-for="field in mainFieldList">
                    <a-select-option v-if="!['sub-table-design'].includes(field.type)" :value="field.model">
                      <span>{{ field.name }}</span>
                    </a-select-option>
                  </template>
                </a-select>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div style="font-weight: 700; display: flex; height: 60px;">
        <div style="flex: 1; padding-top: 40px;">Excel列</div>
        <div style="width: 100px"></div>
        <div style="flex: 1">
          <span v-if="isSubTable">子表字段</span>
          <span v-else>工作表字段</span>
          <div style="margin-top: 6px;">
            <a-input
                v-model:value="fieldKeywords"
                allow-clear
                :placeholder="'过滤' + (isSubTable ? '子表字段' : '工作表字段') + '…'"
            />
          </div>
        </div>
      </div>
      <div style="margin-top: 10px; position: relative; overflow: hidden; height: 270px">
        <div class="field-list-container" style="right: -10px; z-index: 9999">
          <template v-for="field in fieldList">
            <div v-show="!fieldKeywords || field.name.includes(fieldKeywords)" class="item">
              <div style="flex: 1">
                <template v-if="!field.disabled">
                  <template v-if="field.isSubTable">
                    <a-select
                        allowClear
                        placeholder="不导入"
                        :value="field.isImport"
                        style="width: 100%"
                        @change="(v)=>onChangeSubTableImport(v, field)"
                    >
                      <a-select-option value="N">
                        <span v-if="field.isImport==='N'">不导入</span>
                        <span v-else>取消映射</span>
                      </a-select-option>
                      <a-select-option value="Y" :disabled="field.isImport==='Y'">
                        <span v-if="field.isImport==='N'">导入并建立映射</span>
                        <span v-else>已建立映射</span>
                      </a-select-option>
                    </a-select>
                  </template>
                  <a-select
                    v-else
                    style="width: 100%"
                    placeholder="请选择"
                    v-model:value="field.excelColumn"
                    allowClear
                  >
                    <a-select-option v-for="str in leftSelectOptions" :value="str">{{ str }}</a-select-option>
                  </a-select>
                </template>
              </div>
              <div class="center-arrow" :class="arrowIsActive(field) ? 'active' : ''">
                <Icon v-if="!field.disabled" icon="ant-design:arrow-left-outlined" :size="22" />
              </div>
              <div class="right" style="flex: 1">
                <div class="content">
                  <div>
                    <ComponentIcon :type="field.type" />
                  </div>
                  <div style="margin-left: 10px; flex: 1" class="ellipsis">
                    {{ field.name }}
                  </div>
                  <div v-if="field.disabled" style="color: #9e9e9e; font-size: 12px"> 此字段不支持建立映射 </div>
                  <div v-else-if="isLinkRecord(field)" style="display: flex;align-items: center;flex-direction: row">
                    <span>
                      匹配字段:
                    </span>
                    
                    <a-select v-model:value="field.link" size="small" style="width: 100px;margin-left: 10px">
                      <a-select-option value="id">记录ID</a-select-option>
                      <a-select-option value="title">标题字段</a-select-option>
                    </a-select>
                  </div>
                  
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    
      <div style="margin-top: 5px;display: flex;flex-direction: row;align-items: center;">
        <div>
          <a-checkbox v-model:checked="duplicateCheckInfo.status">识别重复记录</a-checkbox>
        </div>
        <div>
          <a-select v-model:value="duplicateCheckInfo.type" style="width: 140px;margin-left: 5px" >
            <a-select-option value="skip" title="忽略重复数据">跳过</a-select-option>
            <a-select-option value="cover" title="对重复记录更新为excel中的数据，其他数据新增">更新或新增</a-select-option>
            <a-select-option value="update" title="仅对工作表中已有数据更新，其他数据不予处理">更新忽略新增</a-select-option>
          </a-select>
        </div>
        <div style="margin-left: 5px;">依据字段</div>
        <div style="margin-left: 5px;">
          <a-select v-model:value="duplicateCheckInfo.field" placeholder="请选择依据字段" style="width: 150px" :options="viewFieldOptions"/>
        </div>
        <div v-if="!isSubTable" style="margin-left: 30px;">
          <a-checkbox v-model:checked="duplicateCheckInfo.triggerProcess">导入触发工作流</a-checkbox>
        </div>
      </div>
      
      <div style="margin-top: 10px;display: flex">
        <span>
          <a-checkbox v-model:checked="duplicateCheckInfo.skipErrorRow">
          跳过错误行
        </a-checkbox>
        </span>
        <span>
           <a-tooltip placement="top" title="未勾选时，对于错误的数据仅跳过错误字段，其他字段仍然导入。勾选后将跳过整行数据。">
             <Icon icon="ant-design:question-circle-outlined" :size="16" style="color: #555;margin-top: 2px"/>
           </a-tooltip>
        </span>
      </div>
    </div>
    <template #footer>
      <a-button @click="back()">上一步 </a-button>
      <a-button style="margin-left: 15px" type="primary" @click="next()">
        <span v-if="isSubTable">保存映射</span>
        <span v-else>开始导入</span>
      </a-button>
    </template>
  </BasicModal>
  <!-- 导入映射子表 -->
  <ImportSubTable v-if="showFieldModal" @register="registerSubTableModal"/>
</template>

<script lang="ts">
  import { CloudUploadOutlined } from '@ant-design/icons-vue';
  import { ref, defineComponent, inject, reactive } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import HeaderTag from './HeaderTag.vue';
  import type { Ref } from 'vue';
  import ComponentIcon from '/@/components/jeecg/super/desform/ComponentIcon.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ImportSubTable from './ImportSubTable.vue';

  export default defineComponent({
    name: 'ImportFieldSetModal',
    components: {
      BasicModal,
      CloudUploadOutlined,
      HeaderTag,
      ComponentIcon,
      ImportSubTable,
    },
    emits: ['register', 'back', 'next'],
    setup(_p, { emit }) {
      // 全局字段
      let currentColumnList: Ref<any[]> | undefined = inject('globalColumnList', undefined);
      const desformName = ref<string>();
      const fileKey = ref<string>();
      const fileName = ref<string>();
      const leftSelectOptions = ref<any[]>([]);
      const sheetList = ref<any[]>([]);
      const fieldList = ref<any[]>([]);
      const showFieldModal = ref<boolean>(false);
      //  视图列 用于选择- model & name
      const viewFieldOptions = ref<any[]>([]);

      const mainFieldList = ref<any[]>([]);
      const isSubTable = ref<boolean>(false);
      const matchFields = ref({main:undefined,sub:undefined});
      const subTableModel = ref<string>('');
      const subFieldOptions = ref<Recordable>({});

      // 字段过滤关键字
      const fieldKeywords = ref<string>('');

      // 重复校验信息  状态-数据处理方式-依据字段
      const duplicateCheckInfo = reactive({
        status: false,
        type: 'skip',
        field: [],
        triggerProcess: false,
        skipErrorRow: false
      });

      const [registerModal, { closeModal }] = useModalInner(async (data) => {
        console.log('importFieldSetModal open data:', data);
        let arr: any[] = [];
        if (data.titleList && data.titleList.length > 0) {
          for (let str of data.titleList) {
            arr.push(str);
          }
        }
        leftSelectOptions.value = arr;
        desformName.value = data.desformName;
        viewFieldOptions.value = data.viewFieldOptions;
        subFieldOptions.value = data.subFieldOptions;
        sheetList.value = data.sheetList;
        isSubTable.value = data.isSubTable ?? false;
        subTableModel.value = data.subTableModel;
        fileKey.value = data.fileKey;
        fileName.value = data.fileName;
        matchFields.value = {main:undefined,sub:undefined};
        mainFieldList.value = []
        initFieldList();
        subAutoMatch();
      });

      function initFieldList() {
        let list: any[] = [];
        let leftList = leftSelectOptions.value;
        if (currentColumnList) {
          let columnList = currentColumnList.value
          if (isSubTable.value && subTableModel.value) {
            const find = currentColumnList.value.find((item) => item.model === subTableModel.value);
            if (find) {
              mainFieldList.value = columnList
              columnList = find.columns;
            }
          }
          //: name: '名称', key: '1675137281300_803143', model: 'input_1675137281300_803143', type: 'input'
          for (let item of columnList) {
            let excelColumn = [];
            if (leftList.indexOf(item.name) >= 0) {
              excelColumn = item.name;
            }
            let obj = {
              name: item.name,
              model: item.model,
              type: item.type,
              disabled: dontConfigRelation(item),
              excelColumn,
            }

            if (item.type == 'link-record') {
              obj['link'] = 'title'
            }

            if (['sub-table-design'].includes(item.type)) {
              obj['isSubTable'] = true;
              obj['isImport'] = 'N';
              obj['mapping'] = {};
              showFieldModal.value = true;
            }

            list.push(obj);
          }
        }
        fieldList.value = list;
      }

      // 自动匹配主表关联字段列名
      function subAutoMatch() {
        if (!isSubTable.value || mainFieldList.value.length == 0) {
          return
        }
        const titleField = mainFieldList.value.find((item) => item.isTitle);
        if (!titleField?.model) {
          return;
        }
        matchFields.value.main = titleField.model;
        const excelStandardNames = desformName.value + '_' + titleField.name;
        if (leftSelectOptions.value.includes(excelStandardNames)) {
          matchFields.value.sub = excelStandardNames as any;
        }
      }

      function back() {
        closeModal();
        emit('back');
      }

      const { createMessage, notification } = useMessage();
      function next() {
        if (isSubTable.value && (!matchFields.value.main || !matchFields.value.sub)) {
          createMessage.warning('请选择主表匹配字段');
          return;
        }
        let list = fieldList.value;
        let map: any = {};
        let subMap: Recordable = {};
        let flag = false;
        for (let item of list) {
          if (item.excelColumn && item.excelColumn.length > 0) {
            flag = true;
            if(item.type == 'link-record' && item.link == 'id'){
              map[item.name+"_"+item.link] = item.excelColumn;
            }else{
              map[item.name] = item.excelColumn;
            }
          } else if (item.isSubTable && item.isImport === 'Y') {
            subMap[item.model] = item.mapping;
          }
        }
        if (!flag) {
          createMessage.warning('未配置excel的列映射');
          return;
        }
        let result:any = {
          relationMap: map,
          duplicateCheckStatus: false,
          duplicateDataHandle: '',
          duplicateBasisField: '',
          triggerProcess: duplicateCheckInfo.triggerProcess,
          skipErrorRow: duplicateCheckInfo.skipErrorRow,
          subRelationMap: subMap,
          matchFields: matchFields.value,
        }
        
        if(duplicateCheckInfo.status===true){
          if(duplicateCheckInfo.field && duplicateCheckInfo.field.length>0){
            result.duplicateCheckStatus = true;
            result.duplicateDataHandle = duplicateCheckInfo.type;
            result.duplicateBasisField = duplicateCheckInfo.field;
          }else{
            createMessage.warning('请选择依据字段');
            return;
          }
        }
        emit('next', result);
      }
      
      function isLinkRecord(field) {
        return field.type == 'link-record';
      }

      /**
       * 子表/关联记录表格的不支持映射
       * @param field
       */
      function dontConfigRelation(field) {
        if(field.type == 'link-record' && field.isSubTable===true){
          return true
        }
        return false
      }

      const [registerSubTableModal, subTableModal] = useModal()

      // 子表导入change事件
      function onChangeSubTableImport(value, field) {
        value = value ? value : 'N'
        if (value === 'Y') {
          const fieldOptions = subFieldOptions.value[field.model] ?? [];
          // 过滤已经选择的Sheet
          const selectedSheetNames = fieldList.value
              .map(item => item.isImport === 'Y' ? item.mapping.sheetName : void 0)
              .filter(item => item && typeof item.split === 'function')
              .flatMap(item => item.split(':'));
          const filterSheetList = selectedSheetNames ? sheetList.value.filter((item) => !selectedSheetNames.includes(item.sheetName)) : sheetList.value;
          if (filterSheetList.length === 0) {
            createMessage.warning('没有可选择的Sheet');
            return
          }
          subTableModal.openModal(true, {
            field,
            fileKey: fileKey.value,
            titleList: [],
            sheetList: filterSheetList,
            viewFieldOptions: fieldOptions ?? [],
            isSubTable: true,
            desformName: desformName.value,
          });
        } else {
          field.isImport = value;
        }
      }

      function arrowIsActive(field) {
        if(field.excelColumn && field.excelColumn.length > 0){
          return true
        }
        if (field.isSubTable) {
          return field.isImport === 'Y'
        }
        return false;
      }

      return {
        registerModal,
        closeModal,
        next,
        back,
        fieldList,
        mainFieldList,
        leftSelectOptions,
        duplicateCheckInfo,
        viewFieldOptions,
        isLinkRecord,
        arrowIsActive,
        fieldKeywords,

        isSubTable,
        matchFields,
        showFieldModal,
        registerSubTableModal,
        onChangeSubTableImport,
      };
    },
  });
</script>

<style scoped lang="less">
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    white-space: nowrap;
  }
  .field-list-container {
    bottom: 0;
    left: 0;
    overflow: scroll;
    overflow-x: hidden;
    position: absolute;
    top: 0;
    right: 0;

    .item {
      display: flex;
      min-width: 0;
      margin-bottom: 6px;
      .center-arrow {
        display: flex;
        justify-content: center;
        padding-top: 9px;
        transform: rotate(180deg);
        width: 100px;
        .anticon {
          color: #bdbdbd;
        }
        &.active {
          .anticon {
            color: #1e88e5 !important;
          }
        }
      }
      .right {
        background: #fafafa;
        border-radius: 3px;

        .content {
          align-items: center;
          box-sizing: border-box;
          height: 36px;
          line-height: 36px;
          padding: 0 12px;
          display: flex;
          min-width: 0;
        }
      }
    }
  }
</style>
