<template>
  <BasicModal
    ref="modalRef"
    :title="title"
    :width="1200"
    :maskClosable="false"
    :defaultFullscreen="true"
    :confirmLoading="confirmLoading"
    v-bind="$attrs"
    @cancel="onCancel"
    @register="registerModal"
  >
    <a-spin wrapperClassName="p-2" :spinning="confirmLoading">
      <BasicForm @register="registerForm">
        <template #extConfigButton>
          <div style="flex: 1; text-align: right">
            <a-button preIcon="ant-design:setting" @click="onOpenExtConfig">扩展配置</a-button>
          </div>
        </template>
      </BasicForm>
      <a-spin :spinning="tableLoading || hideTabs">
        <a-tabs v-if="!hideTabs" v-model:activeKey="activeKey" animated @change="onTabsChange">
          <a-tab-pane tab="数据库属性" key="dbTable" forceRender>
            <DBAttributeTable
              ref="dbTable"
              :actionButton="actionButton"
              @added="onTableAdded"
              @removed="onTableRemoved"
              @dragged="onTableDragged"
              @inserted="onTableInserted"
              @syncDbType="onTableSyncDbType"
              @syncDbIsPersist="onTableSyncDbIsPersist"
              @syncDbIsNull="onTableSyncDbIsNull"
            />
          </a-tab-pane>
          <a-tab-pane tab="页面属性" key="pageTable" forceRender>
            <PageAttributeTable ref="pageTable" />
          </a-tab-pane>
          <a-tab-pane tab="校验字段" key="checkTable" forceRender>
            <CheckDictTable ref="checkTable" />
          </a-tab-pane>
          <a-tab-pane tab="外键" key="fkTable" forceRender>
            <ForeignKeyTable ref="fkTable" :actionButton="actionButton" />
          </a-tab-pane>
          <a-tab-pane tab="索引" key="idxTable" forceRender>
            <IndexTable ref="idxTable" :actionButton="actionButton" />
          </a-tab-pane>
          <a-tab-pane key="queryTable" forceRender>
            <template #tab>
              <span>
                个性查询配置
                 <a-tooltip>
                    <template #title>允许自定义，查询表单字段控件类型！</template>
                    <Icon icon="bx:help-circle"></Icon> 
                  </a-tooltip>
              </span>
            </template>
            <QueryTable ref="queryTable" @query="onTableQuery" />
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </a-spin>

    <template #footer>
      <div class="footer-area">
        <div class="rightArea">
          <a-button @click="onCancel">关闭</a-button>
          <a-button type="primary" :loading="confirmLoading" preIcon="ant-design:save" @click="onSubmit">保存</a-button>
        </div>
        <div class="leftArea">
          <div v-if="aiTestMode && !isUpdate">
            <a-select
              v-model:value="aiTestTable"
              placeholder="请选择测试的数据模型"
              :getPopupContainer="(n) => n?.parentElement"
              style="width: 300px; margin: 0 10px 0 0;text-align: left;"
            >
              <template v-for="(item, index) in aiTableList" :key="index">
                <a-select-option :value="item.name">{{ item.title + '（' + item.name + '）' }}</a-select-option>
              </template>
            </a-select>
            <a-button type="primary" ghost @click="initVirtualData">生成数据&gt;&gt;</a-button>
          </div>
          <div v-if="isUpdate" class="positioning-area">
            <a-input v-model:value="positioning" placeholder="请输入字段名称或字段备注" allowClear @pressEnter="handlePositioning"></a-input>
            <a-button type="primary" ghost @click="handlePositioning">定位</a-button>
          </div>
        </div>
      </div>
    </template>
    <!-- 扩展配置弹窗 -->
    <ExtendConfigModal @register="registerExtendConfigModal" :parentForm="formAction" @ok="onExtConfigOk" />
  </BasicModal>
</template>

<script lang="ts">
  import { ref, reactive, computed, nextTick, provide, defineComponent,toRaw } from 'vue';
  import { Icon } from '/@/components/Icon';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useFormSchemas } from '../hooks/useSchemas';
  import DBAttributeTable from './tables/DBAttributeTable.vue';
  import PageAttributeTable from './tables/PageAttributeTable.vue';
  import CheckDictTable from './tables/CheckDictTable.vue';
  import ForeignKeyTable from './tables/ForeignKeyTable.vue';
  import IndexTable from './tables/IndexTable.vue';
  import QueryTable from './tables/QueryTable.vue';
  import ExtendConfigModal from './ExtendConfigModal.vue';
  import { CgformModal } from '../types';
  import { ExtConfigDefaultJson, useInitialData, VALIDATE_FAILED, useTreeNeedFields } from '../cgform.data';
  import { formApi } from '../cgform.api';
  import { simpleDebounce } from '/@/utils/common/compUtils';
  import { useOnlineTest } from '../hooks/aitest/useOnlineTest';
  import { buildUUID } from '/@/utils/uuid';
  import { sleep } from '/@/utils';
  import { getRefPromise } from '../hooks/auto/useAutoForm';

  export default defineComponent({
    name: 'CgformModal',
    components: {
      BasicModal,
      BasicForm,
      DBAttributeTable,
      PageAttributeTable,
      CheckDictTable,
      ForeignKeyTable,
      IndexTable,
      QueryTable,
      ExtendConfigModal,
      Icon
    },
    emits: ['success', 'register'],
    props: {
      actionButton: {
        type: Boolean,
        default: true,
        required: false,
      },
    },
    setup(props, { emit }) {
      const { createMessage: $message } = useMessage();
      const modalRef = ref();
      // 是否是更新模式
      const isUpdate = ref(false);
      // 编辑时存储的值
      let model: Recordable = {};
      const title = computed(() => (isUpdate.value ? '编辑' : '新增'));
      // 当前是否正在加载中
      const confirmLoading = ref(true);
      // 表格区域正在加载中
      const tableLoading = ref(false);
      // tabs当前活动的页面
      const activeKey = ref('dbTable');
      // 解决打开弹窗速度缓慢的问题
      const hideTabs = ref(true);
      // table refs
      const tables: CgformModal.TablesRef = {
        dbTable: ref<CgformModal.DBAttributeTableType>(),
        pageTable: ref<CgformModal.PageAttributeTableType>(),
        checkTable: ref<CgformModal.CheckDictTableType>(),
        fkTable: ref<CgformModal.ForeignKeyTableType>(),
        idxTable: ref<CgformModal.IndexTableType>(),
        queryTable: ref<CgformModal.QueryTableType>(),
      };
      // 当前是否是全屏状态
      const fullScreenRef = computed(() => modalRef.value?.fullScreenRef ?? false);
      provide('tables', tables);
      provide('fullScreenRef', fullScreenRef);
      const expandingConfig = { value: {} };
      const positioning = ref('');
      // 表单 FormSchemas
      const { formSchemas } = useFormSchemas(props, expandingConfig, {
        onTableTypeChange,
        onIsTreeChange,
        ifShowOfSubTableStr: () => showSubTableStr,
      });
      // 表单配置
      const [registerForm, formAction] = useForm({
        schemas: formSchemas,
        showActionButtonGroup: false,
        labelAlign: 'right',
      });
      const { resetFields, setFieldsValue, validate } = formAction;
      // 表单赋值
      const [registerModal, { closeModal }] = useModalInner((data) => {
        isUpdate.value = data?.isUpdate ?? false;
        if (isUpdate.value) {
          edit(data?.record);
        } else {
          add();
        }
      });
      // 旧表名
      const oldTableName = ref('');
      // 扩展JSON
      let extConfigJson = reactive<Recordable>({});
      // 立即同步所有 table（防抖版）
      const syncAllTableNowDebounce = simpleDebounce(() => syncAllTableNowPromise(), 150);
      // 临时数据ID，不提交到后台
      let fieldTempIds: string[] = [];
      // 是否显示附表字段
      let showSubTableStr = false;
      // 是否已添加树表单字段
      let treeFieldAdded = false;
      // 已添加的树表单字段ID
      let treeFieldIds: string[] = [];

      // hook OnlineTest
      const { aiTestMode, aiTestTable, aiTableList, initVirtualData, tableJsonGetHelper, refreshCacheTableName } = useOnlineTest(
        {
          oldTableName,
          tables,
        },
        {
          initialAllShowItem,
          setAllTableData,
        },
        formAction
      );

      function add() {
        edit({});
      }

      async function edit(record) {
        confirmLoading.value = false;
        activeKey.value = 'dbTable';
        // 重置表单
        await resetFields();
        model = Object.assign({}, record);
        initialAllShowItem(model);
        // 重置定位内容
        positioning.value = '';
        
        // 便于 ai test data 复制
        tableJsonGetHelper(model);
        
        initialExtConfigJson(model);
        setFieldsValue(model);
        oldTableName.value = model.tableName;
        // 解决打开弹窗速度缓慢的问题
        sleep(1, () => (hideTabs.value = false));
        // update模式，加载数据库中的数据
        if (isUpdate.value) {
          tables.dbTable.value?.setDataSource([]);
          await loadFields(model.id);
          // 加载index的数据，由于默认不可见，所以可以分开加载，提升加载效率
          await loadIndexes(model.id);
          // 设置子表下拉选择
          getRefPromise(tables.pageTable).then(() => {
            tables.pageTable.value!.changePageType(model.tableType == 3);
          });
        } else {
          // 添加初始数据
          let { initialData, tempIds } = useInitialData();
          await setAllTableData(initialData, true);
          fieldTempIds = tempIds;
        }
      }

      // 加载表字段配置
      async function loadFields(headId) {
        tableLoading.value = true;
        try {
          let fields = await formApi.doQueryField(headId);
          // 便于 ai test data 复制
          console.log("online fields:", fields)
          tableLoading.value = false;
          await setAllTableData(fields);
        } finally {
          tableLoading.value = false;
        }
      }

      // 加载表索引配置
      async function loadIndexes(headId) {
        let indexes = await formApi.doQueryIndexes(headId);
        // 便于 ai test data 复制
        console.log("online indexs:", indexes)
        tables.idxTable.value!.setDataSource(indexes);
      }

      // 初始化扩展JSON
      function initialExtConfigJson(record) {
        // 解析扩展JSON
        let parseJSON = {};
        if (record.extConfigJson) {
          try {
            parseJSON = JSON.parse(record.extConfigJson);
          } catch (e) {
            console.error('online扩展JSON转换失败：', e);
          }
        }
        // 从数据库中取值，并合并
        extConfigJson = Object.assign({}, ExtConfigDefaultJson, parseJSON, {
          isDesForm: record.isDesForm || 'N',
          desFormCode: record.desFormCode || '',
        });
         // update-begin--author:liaozhiyang---date:20240520---for：【QQYUN-9350】未开启联合查询，但是提示内嵌风格不支持联合查询功能
        // 重置状态
        expandingConfig.value = extConfigJson;
        // update-end--author:liaozhiyang---date:20240520---for：【QQYUN-9350】未开启联合查询，但是提示内嵌风格不支持联合查询功能
      }

      function initialAllShowItem(model) {
        treeFieldAdded = model.isTree == 'Y';
        showSubTableStr = model.tableType === 2;
      }

      // 设置除索引配置之外所有的JVxeTable的数据
      async function setAllTableData(data: Recordable[], insert?) {
        const { dbTable, pageTable, checkTable, fkTable, queryTable } = tables;
        if (!dbTable.value) {
          await nextTick();
          await sleep(1);
        }
        dbTable.value!.setDataSource(data, insert);
        // 先加载第一个tab的数据，延时加载其他tab，可以使打开速度的视觉效果更好
        setTimeout(() => {
          pageTable.value!.setDataSource(data, insert);
          checkTable.value!.setDataSource(data, insert);
          fkTable.value!.setDataSource(data, insert);
          queryTable.value!.setDataSource(data, insert);
        }, 10);
      }

      /** ATab切换事件 */
      function onTabsChange(activeKey) {
        // 当切换了选项卡的时候只同步修改当前所能看到的table
        if (['pageTable', 'checkTable', 'fkTable', 'idxTable', 'queryTable'].indexOf(activeKey) !== -1) {
          const dbTable = tables.dbTable;
          const table = tables[activeKey];
          dbTable.value!.tableRef!.resetScrollTop();
          table.value.syncTable(dbTable);
        }
      }

      // 表类型tableType字段change事件
      function onTableTypeChange(value) {
        if (value === 1) {
          setFieldsValue({ themeTemplate: 'normal' });
        } else {
        }
        tables.pageTable.value!.changePageType(value == 3);
      }

      // 是否树isTree字段change事件
      function onIsTreeChange(value) {
        value === 'Y' ? addTreeNeedField() : deleteTreeNeedField();
      }

      /** 立即主动同步所有table */
      function syncAllTableNow() {
        syncAllTableNowDebounce();
      }

      // 立即同步所有 table
      async function syncAllTableNowPromise() {
        let { dbTable, pageTable, checkTable, fkTable, queryTable } = tables;
        await pageTable.value!.syncTable(dbTable);
        await checkTable.value!.syncTable(dbTable);
        await fkTable.value!.syncTable(dbTable);
        await queryTable.value!.syncTable(dbTable);
      }

      /** 当新增了的时候应立即同步 */
      function onTableAdded() {
        syncAllTableNow();
      }

      /** 当删除的时候也应立即同步 */
      function onTableRemoved() {
        syncAllTableNow();
      }

      /** 当拖动后立即同步 */
      function onTableDragged(event) {
        let { oldIndex, newIndex } = event;
        syncAllOrderNumNow(oldIndex, newIndex);
      }

      /** 当插入后立即同步 */
      async function onTableInserted(event) {
        let { insertIndex, row } = event;
        let { pageTable, checkTable, fkTable, queryTable } = tables;
        pageTable.value!.tableRef!.insertRows(row, insertIndex);
        checkTable.value!.tableRef!.insertRows(row, insertIndex);
        fkTable.value!.tableRef!.insertRows(row, insertIndex);
        queryTable.value!.tableRef!.insertRows(row, insertIndex);
      }

      /** 立即同步所有的表的排序顺序 */
      function syncAllOrderNumNow(oldIndex: number, newIndex: number) {
        let { pageTable, checkTable, fkTable, queryTable } = tables;
        pageTable.value!.tableRef!.rowResort(oldIndex, newIndex);
        checkTable.value!.tableRef!.rowResort(oldIndex, newIndex);
        fkTable.value!.tableRef!.rowResort(oldIndex, newIndex);
        queryTable.value!.tableRef!.rowResort(oldIndex, newIndex);
      }

      /** 当value变化时同步 date */
      function onTableSyncDbType(event) {
        tables.pageTable.value!.syncFieldShowType(event.row);
      }
      // update-begin--author:liaozhiyang---date:20240313---for：【QQYUN-8485】不同步数据库的字段则去掉对应查询勾选
      /** 当dbIsPersist（同步数据库） value变化时同步 查询去掉勾选 */
      function onTableSyncDbIsPersist(event) {
        tables.pageTable.value!.syncIsQuery(event.row);
      }
      // update-end--author:liaozhiyang---date:20240313---for：【QQYUN-8485】不同步数据库的字段则去掉对应查询勾选
      // update-begin--author:liaozhiyang---date:20240313---for：【QQYUN-8485】数据库不允许为空，校验默认相应勾上
      /** 当dbIsNull(不允许空值) value变化时同步 校验必填 */
      function onTableSyncDbIsNull(event) {
        tables.checkTable.value!.syncFieldMustInput(event.row);
      }
      // update-end--author:liaozhiyang---date:20240313---for：【QQYUN-8485】数据库不允许为空，校验默认相应勾上

      function onTableQuery(id) {
        tables.pageTable.value!.enableQuery(id);
      }

      /** 添加树字段 */
      function addTreeNeedField() {
        if (!treeFieldAdded) {
          let { dbTable, pageTable, checkTable } = tables;
          let treeFields = useTreeNeedFields();
          treeFields = treeFields.filter((item: any) => {
            let nameList = dbTable.value!.tableRef!.getTableData().map((o) => o.dbFieldName);
            return !nameList.includes(item.dbFieldName);
          });
          treeFieldIds = [];
          treeFields.forEach((newData: any) => {
            let uuidTemp = buildUUID() + '__tempId';
            treeFieldIds.push(uuidTemp);
            newData.id = uuidTemp;
          });
          dbTable.value!.tableRef!.addRows(treeFields, { setActive: false });
          pageTable.value!.tableRef!.addRows(treeFields, { setActive: false });
          checkTable.value!.tableRef!.addRows(treeFields, { setActive: false });
          nextTick(() => syncAllTableNow());
          treeFieldAdded = true;
        }
        nextTick(() => {
          formAction.setFieldsValue({
            treeIdField: 'has_child',
            treeParentIdField: 'pid',
          });
        });
      }

      /** 删除树字段 */
      function deleteTreeNeedField() {
        if (treeFieldIds && treeFieldIds.length > 0) {
          let { dbTable } = tables;
          dbTable.value!.tableDeleteLines(treeFieldIds);
          treeFieldIds = [];
          treeFieldAdded = false;
        }
      }

      // 触发所有表单验证
      function validateAll() {
        let options = {};
        return new Promise((resolve, reject) => {
          // 验证主表表单
          validate().then(
            (values) => resolve({ values }),
            () => reject(VALIDATE_FAILED)
          );
        })
          .then((result) => {
            Object.assign(options, result);
            return validateTableFields();
          })
          .then((allTableData) => {
            Object.assign(options, allTableData);
            let formData = classifyIntoFormData(options);
            return validateForeignKey(formData);
          })
          .catch((e) => {
            if (e === VALIDATE_FAILED || e?.code === VALIDATE_FAILED) {
              $message.warning('校验未通过');
            } else {
              // update-begin--author:liaozhiyang---date:20231226---for：【QQYUN-7503】附表配置多个外键，保存失败没提示
              e?.msg ? $message.warning(e.msg) : console.error(e);
              // update-end--author:liaozhiyang---date:20231226---for：【QQYUN-7503】附表配置多个外键，保存失败没提示
            }
            return Promise.reject(null);
          });
      }

      /** 验证并获取所有表的数据 */
      function validateTableFields() {
        return new Promise(async (resolve, reject) => {
          let tableKeys = Object.keys(tables);
          let allTableData: any = {};
          for (let i = 0; i < tableKeys.length; i++) {
            let key = tableKeys[i];
            let table = tables[key];
            try {
              allTableData[key] = await table.value!.validateData(key);
            } catch (e: any) {
              if (e.code === VALIDATE_FAILED) {
                // 未通过就跳转到相应的tab选项卡
                activeKey.value = e.activeKey;
              } else {
                console.error(e);
              }
              reject(e);
              return;
            }
          }
          resolve(allTableData);
        });
      }

      /** 将所有表的数据整理整合成后台识别的formData */
      function classifyIntoFormData(options) {
        // 整理数据
        let formData = {
          head: {} as Recordable,
          fields: [] as any[],
          indexs: [] as any[],
          deleteFieldIds: [] as any[],
          deleteIndexIds: [] as any[],
        };
        formData.head = Object.assign(model, options.values);
        // 整理online表单扩展JSON
        formData.head.isDesForm = extConfigJson.isDesForm;
        formData.head.desFormCode = extConfigJson.desFormCode;
        // 清除不需要的字段
        delete extConfigJson.isDesForm;
        delete extConfigJson.desFormCode;
        // 提交扩展JSON
        formData.head.extConfigJson = JSON.stringify(extConfigJson);
        // 整理 fields
        options.dbTable.tableData.forEach((item, index) => {
          // ID 以 dbTable 的 ID 为准
          let rowId = item.id;
          let fields = Object.assign({}, item);

          let pageTable = options.pageTable.tableData[index];
          fields = Object.assign(pageTable, fields);

          let checkTable = options.checkTable.tableData[index];
          fields = Object.assign(checkTable, fields);

          let fkTable = options.fkTable.tableData[index];
          fields = Object.assign(fkTable, fields);

          let queryTable = options.queryTable.tableData[index];
          fields = Object.assign(queryTable, fields);

          // 如果 dbTable 没有返回id，则代表是新增的数据
          if (rowId == null || rowId === '') {
            delete fields.id;
          } else {
            fields.id = rowId;
          }
          // 去掉临时ID
          let tempIds = ([] as string[]).concat(fieldTempIds, treeFieldIds);
          if (tempIds.includes(fields.id)) {
            delete fields.id;
          }
          formData.fields.push(fields);
        });
        formData.deleteFieldIds = options.dbTable.deleteIds;
        // 整理 index
        formData.indexs = options.idxTable.tableData;
        formData.deleteIndexIds = options.idxTable.deleteIds;
        return formData;
      }

      /** 外键配置校验 只能配置一个 */
      function validateForeignKey(formData) {
        // 1.配置两个 校验
        // 2.配置一个后，保存，再配置新的 删除老的 校验
        // 3.配置一个后，保存,修改当前为新的 校验
        return new Promise((resolve, reject) => {
          let fields = formData.fields;
          let saved = true;
          if (fields && fields.length > 0) {
            let hasForeignKey = 0;
            for (let i = 0; i < fields.length; i++) {
              if (fields[i].mainField || fields[i].mainTable) {
                hasForeignKey += 1;
              }
              if (hasForeignKey > 1) {
                saved = false;
                break;
              }
            }
          }
          if (saved) {
            resolve(formData);
          } else {
            reject({
              code: -1,
              msg: '外键只允许配置一个!',
              error: VALIDATE_FAILED,
            });
          }
        });
      }

      // 表单提交事件
      function onSubmit() {
        confirmLoading.value = true;
        validateAll()
          .then(
            async (formData: any) => {
              // 表字段转小写
              if (formData.fields && formData.fields.length > 0) {
                for (let field of formData.fields) {
                  field.dbFieldName = field.dbFieldName.toLowerCase().trim();
                }
              }
              if (formData.head?.tableName) {
                formData.head.tableName = formData.head.tableName.toLowerCase().trim();
              }
              // 发起请求
              await formApi.doSaveOrUpdate(formData, isUpdate.value);
              refreshCacheTableName(oldTableName.value, formData.head['tableName']);
              emit('success');
              // 解决关闭弹窗时会闪一下的问题，因为同时加载多个JVxeTable造成的卡顿影响了弹窗关闭效果
              sleep(1, () => onCancel());
            },
            (e) => {
              console.error(e);
            }
          )
          .finally(() => {
            confirmLoading.value = false;
          });
      }

      const [registerExtendConfigModal, extendConfigModal] = useModal();

      async function onExtConfigOk(values) {
        // update-begin--author:liaozhiyang---date:20231123---for：【QQYUN-7073】提示ERP、内嵌子表不支持联合查询
        expandingConfig.value = values;
        if(values.joinQuery == 0){
          formAction.validateFields(['themeTemplate']);
        }
        // update-end--author:liaozhiyang---date:20231123---for：【QQYUN-7073】提示ERP、内嵌子表不支持联合查询
        extConfigJson = values;
        //update-begin-author:taoyan date:2022-8-15 for: VUEN-1891 online表单编辑时 修改了扩展配置能否 确认即保存，不用再点整个表单得确定
        if(isUpdate.value == true){
          let json = toRaw(extConfigJson);
          const params = {
            id: model.id,
            extConfigJson: JSON.stringify(json)
          };
          // 发起请求
          await formApi.editHead(params);
          emit('success');
        }
        //update-end-author:taoyan date:2022-8-15 for: VUEN-1891 online表单编辑时 修改了扩展配置能否 确认即保存，不用再点整个表单得确定
      }

      function onOpenExtConfig() {
        extendConfigModal.openModal(true, {
          extConfigJson,
        });
      }

      function onCancel() {
        hideTabs.value = true;
        // 解决关闭弹窗时会闪一下的问题，因为同时加载多个JVxeTable造成的卡顿影响了弹窗关闭效果
        sleep(1, () => closeModal());
      }
      /**
       * 2024-07-17
       * liaozhiyang
       * 【TV360X-829】根据字典名称和字段备注快速定位到行
       * */
      const handlePositioning = () => {
        const val = positioning.value.trim();
        if (val.length) {
          const jVxe_instance = tables[activeKey.value].value.tableRef;
          const vxe_instance = jVxe_instance.getXTable();
          const fullData = vxe_instance.getTableData().fullData;
          // 先精确，再模糊
          const preciseIndex = fullData.findIndex((item) => val === item.dbFieldName || val === item.dbFieldTxt);
          let index = -1;
          if (preciseIndex == -1) {
            // 模糊
            const dimIndex = fullData.findIndex((item) => item.dbFieldName.includes(positioning.value) || item.dbFieldTxt.includes(positioning.value));
            index = dimIndex;
          } else {
            index = preciseIndex;
          }
          if(index != -1) {
            const row = fullData[index];
            vxe_instance.scrollToRow(row).then(() => {
              const { refTableBody } = vxe_instance.getRefMaps();
              const tableBody = refTableBody.value;
              const bodyElem = tableBody ? tableBody.$el : null;
              if (bodyElem) {
                const trElem = bodyElem.querySelector(`[rowid="${vxe_instance.getRowid(row)}"]`);
                if (trElem) {
                  trElem.classList.add('customHighlight');
                  setTimeout(() => {
                    trElem?.classList.remove('customHighlight');
                  }, 1e3);
                }
              }
            });
          } else {
            $message.warning('没搜到相关字段名称或字段备注~');
          }
        } else {
          $message.warning('请输入字段名称或字段备注~');
        }
      };
      return {
        ...tables,
        modalRef,
        title,
        confirmLoading,
        tableLoading,
        activeKey,
        onCancel,
        extConfigJson,
        formAction,
        hideTabs,
        onSubmit,
        onTabsChange,
        onTableAdded,
        onTableRemoved,
        onTableDragged,
        onTableInserted,
        onTableSyncDbType,
        onTableQuery,
        onOpenExtConfig,
        onExtConfigOk,
        registerForm,
        registerModal,
        registerExtendConfigModal,
        // hook OnlineTest
        aiTestMode,
        aiTestTable,
        aiTableList,
        initVirtualData,
        onTableSyncDbIsPersist,
        onTableSyncDbIsNull,
        isUpdate,
        positioning,
        handlePositioning,
      };
    },
  });
</script>

<style lang="less" scoped>
  // update-begin--author:liaozhiyang---date:20240717---for：【TV360X-829】根据字典名称和字段备注快速定位到行
  .footer-area {
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;
    .leftArea {
      display: flex;
      > * {
        &:not(:first-child) {
          margin-left: 16px;
        }
      }
    }
  }

  .positioning-area {
    width: 280px;
    display: flex;
    > :first-child {
      margin-right: 8px;
    }
  }
  :deep(.vxe-table) {
    .vxe-body--row.customHighlight {
      background-color: var(--vxe-table-row-hover-background-color);
    }
  }
  // update-begin--author:liaozhiyang---date:20240717---for：【TV360X-829】根据字典名称和字段备注快速定位到行
</style>
