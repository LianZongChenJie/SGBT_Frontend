<template>
  <a-card :bordered="false">
    <!--页面加载-->
    <a-spin v-if="pageLoading" :spinning="pageLoading" style="width: 100%; height: 48px"> </a-spin>
    <!--没有设计表单-->
    <template v-else-if="error.notDesignForm">
      <h1 style="text-align: center">你还没有设计任何表单项，不能查看表单数据！</h1>
    </template>

    <template v-else>
      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <!-- 按钮前面的插槽（目前仅工单查询使用） -->
        <slot name="buttonBefore"></slot>

        <a-button v-if="buttonsAuth.add" type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">新增</a-button>
        <a-button v-if="buttonsAuth.export" type="primary" preIcon="ant-design:download-outlined" @click="handleExportXls">导出</a-button>
        <a-button v-if="buttonsAuth.import" type="primary" preIcon="ant-design:upload-outlined" @click="handleImportXls">导入</a-button>

        <!-- TODO 高级查询 -->
        <!--<JSuperQuery v-if="buttonsAuth.superQuery" :fieldList="squeryFieldList" :saveCode="superQuerySaveCode" :loading="loading" @handleSuperQuery="handleSuperQuery" />-->
        <a-button v-if="buttonsAuth.superQuery" type="primary" preIcon="ant-design:filter-outlined">高级查询</a-button>

        <!-- 批量操作 -->
        <a-dropdown v-if="buttonsAuth.batchAction && selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="handleDeleteBatch">
                <a-icon type="delete" />
                <span>删除</span>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button style="margin-left: 8px">
            <span>批量操作</span>
            <Icon icon="ant-design:down-outlined" />
          </a-button>
        </a-dropdown>
      </div>

      <!-- table区域-begin -->
      <div>
        <!--自定义表格头部-->
        <a-alert type="info" showIcon style="margin-bottom: 16px">
          <template #message>
            <a-row>
              <a-col :span="12">
                <span>已选择</span>
                <a style="font-weight: 600; padding: 0 4px">{{ selectedRowKeys.length }}</a>
                <span>项</span>
                <a v-show="selectedRowKeys.length > 0" style="margin-left: 12px" @click="selectedRowKeys = []">清空</a>
              </a-col>
              <a-col :span="12" style="text-align: right">
                <a @click="handleClickReload">
                  <Icon icon="ant-design:sync-outlined" />
                  <span v-show="!isMobile" style="margin-left: 4px">刷新</span>
                </a>
                <template v-if="buttonsAuth.customColumn">
                  <a-divider type="vertical" />
                  <a-popover title="自定义列" trigger="click" placement="leftTop">
                    <template #content>
                      <a-checkbox-group :value="selectedColumnKeys" @change="handleCustomColumnChange">
                        <a-row :style="{ maxWidth: '360px' }">
                          <a-col :md="8" :sm="24" style="width: 120px">
                            <a-checkbox value="$selection$">选择列</a-checkbox>
                          </a-col>
                          <a-col :md="8" :sm="24" style="width: 120px">
                            <a-checkbox value="$rowNumber$">行号列</a-checkbox>
                          </a-col>
                          <a-col :md="8" :sm="24" style="width: 120px">
                            <a-checkbox value="$action$">操作列</a-checkbox>
                          </a-col>
                          <a-col :md="8" :sm="24" v-for="column in allColumns" :key="column.key" style="width: 120px">
                            <a-checkbox :value="column.key">
                              <JEllipsis :length="5" :value="column.title" />
                            </a-checkbox>
                          </a-col>
                        </a-row>
                      </a-checkbox-group>
                    </template>
                    <a>
                      <Icon icon="ant-design:setting-outlined" />
                      <span v-show="!isMobile" style="margin-left: 4px">自定义列</span>
                    </a>
                  </a-popover>
                </template>
              </a-col>
            </a-row>
          </template>
        </a-alert>

        <a-table
          class="j-table-force-nowrap"
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          :scroll="tableScroll"
          :rowSelection="rowSelection"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, text, record }">
            <!--图片显示-->
            <template v-if="column.dataIndex === 'view-picture'">
              <div v-if="Array.isArray(text) && text.length > 0" class="j-table-slot-view">
                <img v-for="(item, imgIndex) of text" :src="getFileAccessHttpUrl(item.url)" alt="" :preview="index" v-show="imgIndex === 0" />
              </div>
            </template>
            <!--文件显示-->
            <template v-if="column.dataIndex === 'view-file'">
              <div v-if="Array.isArray(text) && text.length > 0" class="j-table-slot-view">
                <a-button type="primary" preIcon="ant-design:download-outlined" size="small" ghost @click="downloadRowFile(text)">下载</a-button>
              </div>
            </template>
            <!--颜色显示-->
            <template v-if="column.dataIndex === 'view-color'">
              <a-tooltip v-if="text" placement="top" :title="text" :getPopupContainer="(node) => node?.parentNode">
                <div class="j-table-slot-view-color" :style="{ backgroundColor: text }"></div>
              </a-tooltip>
            </template>
            <template v-if="column.dataIndex === 'action'">
              <template v-if="buttonsAuth.detail">
                <a @click="handleView(record)">查看</a>
                <a-divider type="vertical" />
              </template>
              <template v-if="buttonsAuth.edit">
                <a @click="handleEdit(record)">编辑</a>
                <a-divider type="vertical" />
              </template>
              <template v-if="buttonsAuth.getUrl">
                <a data-dev-action="配置地址" @click="handleGetEditUrl(record)">获取编辑地址</a>
                <a-divider type="vertical" />
              </template>
              <template v-if="buttonsAuth.delete">
                <a-dropdown>
                  <a class="ant-dropdown-link"
                    >更多
                    <Icon icon="ant-design:down-outlined" />
                  </a>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item v-if="buttonsAuth.delete">
                        <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                          <a>删除</a>
                        </a-popconfirm>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </template>
            </template>
          </template>
        </a-table>
      </div>
      <!-- table区域-end -->
    </template>
    <!-- 表单区域 -->
    <DesignFormDataModal ref="desformModal" @ok="handleAutoModalOk" />
    <!-- 导入弹窗 -->
    <JImportModal @register="registerModal" :url="importXlsUrl" @ok="handleImportOk" />

    <!-- 复制编辑地址弹框 -->
    <a-modal title="编辑地址" :open="getUrlVisible" @cancel="getUrlVisible = false">
      <template #footer>
        <a-button @click="getUrlVisible = false">关闭</a-button>
        <a-button type="primary" class="copy-_data-text" :data-clipboard-text="getUrlText" @click="onCopyUrl(getUrlText)">复制</a-button>
      </template>
      <p>{{ getUrlText }}</p>
    </a-modal>
  </a-card>
</template>

<script lang="ts">
  import { defineComponent, reactive, toRefs, computed, watch, ref, unref } from 'vue';
  import DesignFormDataModal from './DesignFormDataModal.vue';
  import JImportModal from '/@/components/Form/src/jeecg/components/JImportModal.vue';
  import JEllipsis from '/@/components/Form/src/jeecg/components/JEllipsis.vue';
  import { filterObj, pushIfNotExist, getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { filterDictText } from '/@/utils/dict/JDictSelectUtil';
  import { useAppProviderContext } from '/@/components/Application';
  import { useRouter } from 'vue-router';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { initDictOptions } from '/@/utils/dict/index';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { Switch, Slider, Rate } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { setCustomRender } from './designFormColumns.tsx';
  import { downloadFile } from '/@/api/common/api.ts';
  import { getCacheByDynKey, setCacheByDynKey } from '/@/utils/auth';
  import { getAreaTextByCode } from '/@/components/Form/src/utils/Area';
  import { list, getColumns, transitRESTful, startProcess, deleteOne, deleteBatch, getAction } from '../designForm.api';

  export default defineComponent({
    name: 'DesignFormDataTable',
    components: {
      DesignFormDataModal,
      JImportModal,
      JEllipsis,
      Switch,
      Slider,
      Rate,
    },
    props: {
      // 查询desformCode，如果传了该参数，就强制查询传的code的表单
      // 目前仅【工单查询】页面用到
      queryDesformCode: {
        type: String,
      },
      // 自定义按钮权限，如果传了该参数，就强制应用该按钮权限
      // 目前仅【工单查询】页面用到
      customButtonsAuth: {
        type: Object,
      },
    },
    setup(props, { emit }) {
      const values = useAppProviderContext();
      const { currentRoute } = useRouter();
      const { createMessage, createConfirm } = useMessage();
      const { clipboardRef, copiedRef } = useCopyToClipboard();
      const [registerModal, { openModal }] = useModal();
      const desformModal = ref(null);
      const _data = reactive({
        loading: false,
        pageLoading: true,
        // 固定columns
        fixedColumns: {
          rowIndex: {
            title: '#',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: ({ index }) => ++index,
          },
          action: {
            title: '操作',
            key: 'action',
            width: 280,
            align: 'center',
            dataIndex: 'action',
          },
        },
        fixedColumnKeys: ['$selection$', '$rowNumber$', '$action$'],
        tableColumnWidth: 180,
        tableScroll: undefined, //{ x: false },
        // 按钮权限
        innerButtonsAuth: {
          add: false,
          import: false,
          export: false,
          superQuery: false,
          batchAction: false,
          customColumn: false,
          detail: false,
          edit: false,
          delete: false,
          getUrl: false,
          startProcess: false,
        },

        // 所有可展示出来的表头
        allColumns: [],
        allColumnKeys: new Map(),
        selectedColumnKeys: [],
        // 表头
        columns: [],
        /* 数据源 */
        dataSource: [],
        // 是否显示选择列
        showRowSelection: true,
        /* 分页参数 */
        ipagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条';
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0,
        },
        // 地址栏的code
        addressCode: null,
        desformName: '表单设计器数据',
        desformCode: null,
        selectedRowKeys: [],
        dialogOptions: { top: 60, width: 1000, padding: { top: 25, right: 25, bottom: 30, left: 25 } },
        // 高级查询构造器
        squeryFieldList: [],
        // 高级查询条件生效状态
        superQueryFlag: false,
        // 高级查询条件
        superQueryParams: '',
        // 高级查询链接条件
        superQueryMatchType: '',
        superQuerySaveCode: unref(currentRoute).fullPath,
        // 远程选项
        remoteOptionsMap: {},
        // 后台翻译结果
        translData: {},
        error: {
          notDesignForm: false,
        },
        // 获取编辑地址是否显示
        getUrlVisible: false,
        getUrlText: false,
      });

      watch(
        () => currentRoute.value.path,
        () => {
          const val = unref(currentRoute);
          // 刷新参数放到这里去触发，就可以刷新相同界面了
          if (val.path.indexOf('/online/desform/list/') === 0) {
            reload();
            // low-app应用页面刷新
          } else if (val.path.indexOf('/app/') === 0) {
            reload();
            // 【工单查询】页面刷新
          } else if (val.path.indexOf('/oaOffice/designFormDataList') === 0) {
            reload();
          }
        },
        { immediate: true }
      );

      const isMobile = computed(() => unref(values.isMobile));
      const isDesktop = computed(() => !unref(values.isMobile));
      const importXlsUrl = computed(() => `/desform/data/importXls/${_data.desformCode}`);
      const rowSelection = computed(() => {
        return _data.showRowSelection ? { selectedRowKeys: _data.selectedRowKeys, onChange: (rowKeys) => (_data.selectedRowKeys = rowKeys) } : null;
      });
      const buttonsAuth: any = computed({
        get() {
          if (props.customButtonsAuth) {
            return props.customButtonsAuth;
          }
          return props.innerButtonsAuth;
        },
        set(val) {
          _data.innerButtonsAuth = val;
        },
      });

      function reload() {
        // 初始化
        _data.pageLoading = true;
        _data.columns = [];
        _data.dataSource = [];
        _data.selectedRowKeys = [];
        _data.ipagination.current = 1;
        _data.superQueryParams = '';
        _data.superQueryFlag = false;
        // 加载新数据
        let code = props.queryDesformCode ? props.queryDesformCode : unref(currentRoute).params.code;
        _data.desformCode = null;
        _data.addressCode = code;
        if (_data.addressCode) {
          loadColumnsInfo(code);
        }
        // 加载列配置
        _data.selectedColumnKeys = getColumnSetting();
      }

      async function loadColumnsInfo(code) {
        if(!code){
          console.error('加载表单的字段配置失败: code 为空!');
          return;
        }

        console.info(' ==>==>==> 加载表单的字段配置, code :', code);
        _data.loading = true;
        let res = await getColumns({
          desformCode: code,
        });
        _data.loading = false;
        _data.pageLoading = false;
        if (res.success) {
          let {
            result: { designForm, buttonsAuth },
          } = res;
          _data.buttonsAuth = buttonsAuth;
          _data.desformCode = designForm.desformCode;
          _data.desformName = designForm.desformName;
          // 判断是否是子表
          if (designForm.desformType === 2) {
            _data.desformCode = designForm.parentCode;
            return loadColumnsInfo(designForm.parentCode);
          }
          let designJson = designForm.desformDesignJson;
          if (designJson == null) {
            _data.pageLoading = false;
            _data.error.notDesignForm = true;
            return;
          }
          let json = JSON.parse(designJson);
          // 保存 dialogConfig
          let dialogOptions = json.config.dialogOptions;
          if (dialogOptions) {
            _data.dialogOptions = dialogOptions;
          }

          let allColumns = [];
          let allColumnKeys = new Map();
          let selectedColumnKeys = [];
          // 高级查询条件
          let superQuery = [];
          // 高级查询条件—，一对一的子表单独的集合
          let superQuerySubOne = {};
          // 允许使用字典的组件
          let dictWidgets = ['select', 'radio', 'checkbox'];
          // 所有待加载的远程选项
          let allRemoteOptions = [];

          /** 封装column，同时封装高级查询条件 */
          const packageColumn = (item) => {
            // 忽略部分显示
            let ignores = ['button', 'buttons', 'grid', 'card', 'tabs', 'text', 'sub-table-design', 'divider'];
            if (ignores.indexOf(item.type) === -1) {
              let options = item.options;
              let name = item.name.trim() || item.model;
              let column = {
                key: item.key,
                title: name,
                align: 'center',
                dataIndex: item.model,
              };
              // 判断是否使用了字典，是就做字典翻译（或远程数据）
              if (dictWidgets.includes(item.type)) {
                for (let type of dictWidgets) {
                  let { remote, remoteFunc, dictCode, showLabel } = options;
                  // 如果用户设置了不显示 label，就不翻译字典
                  if (!showLabel) {
                    continue;
                  }
                  if (remote === 'dict' && dictCode) {
                    column.customRender = ({ text, record, index }) => {
                      return columnsTranslator(dictCode + '_dict', text);
                    };
                  } else if (remote === true && remoteFunc) {
                    pushIfNotExist(allRemoteOptions, item);
                    column.customRender = ({ text, record, index }) => {
                      return filterDictText(_data.remoteOptionsMap[item.key], text);
                    };
                  } else {
                    options.options = options.options.map((item) => ({ ...item, text: item.label }));
                    column.customRender = ({ text, record, index }) => {
                      return filterDictText(options.options, text);
                    };
                  }
                }
              }
              // 翻译省市区组件
              if (item.type === 'area-linkage') {
                column.customRender = ({ text, record, index }) => {
                  try {
                    return getPcaText(text);
                  } catch (e) {
                    console.error(e);
                    return text;
                  }
                };
              }
              // 翻译用户组件、部门组件
              if (item.type === 'select-user' || item.type === 'select-depart') {
                // 只有当自定义返回字段是ID和Username的时候才翻译，因为只有这两个字段是唯一的
                if (options.customReturnField === 'id' || options.customReturnField === 'username' || options.customReturnField === 'orgCode') {
                  column.customRender = ({ text, record, index }) => {
                    return columnsTranslator(item.key, text);
                  };
                }
              }
              // 翻译下拉树组件
              if (item.type === 'select-tree') {
                column.customRender = ({ text, record, index }) => {
                  // 数据来源是分类字典
                  if (options.dataFrom === 'category') {
                    return columnsTranslator('sys_category', text);
                  } else {
                    return columnsTranslator(item.key, text);
                  }
                };
              }
              // 翻译【表字典：下拉搜索】组件
              if (item.type === 'table-dict' && options.style === 'select') {
                column.customRender = ({ text, record, index }) => {
                  return columnsTranslator(item.key, text);
                };
              }
              // 图片特殊处理
              if (item.type === 'imgupload') {
                column.dataIndex = 'view-picture';
              }
              // 文件特殊处理
              if (item.type === 'file-upload') {
                column.dataIndex = 'view-file';
              }
              if (item.type === 'color') {
                column.dataIndex = 'view-color';
              }
              column = setCustomRender(item, column, options);
              // column 只显示五个
              if (selectedColumnKeys.length < 5) {
                selectedColumnKeys.push(column.key);
              }
              allColumns.push(column);
              allColumnKeys.set(column.key, column);
              // 高级查询类型，可根据校验的不同生成不同的类型
              let superQueryType = item.type;
              // 格式化字符串，一般用于高级查询的日期格式处理
              let formatStr = null;
              // 特殊处理 input 的类型
              if (item.type === 'input') {
                if (Array.isArray(item.rules) && item.rules.length > 0) {
                  for (let rule of item.rules) {
                    // 如果校验是数字类型，那么高级查询的type也应该是number
                    let numberTypes = ['number', 'integer', 'float'];
                    if (numberTypes.includes(rule.type)) {
                      superQueryType = 'number';
                      break;
                    }
                  }
                }
              }
              // 处理日期类型
              if (item.type === 'date') {
                if (options.type === 'datetime') {
                  superQueryType = 'datetime';
                }
                formatStr = options.format;
              }
              // 处理时间类型
              if (item.type === 'time') {
                formatStr = options.format;
              }
              // 处理下拉选项
              if (Array.isArray(options.options) && options.options.length > 0) {
                options.options.forEach((opt) => {
                  // 处理没有显示label的情况
                  opt.label = opt.label ? opt.label : opt.value;
                });
              }

              // 是否有远程下拉选项
              let hasRemote = options.remote === true && options.remoteFunc;
              // update--begin--author:sunjianlei-----date:20220119------for：【JTC-775】【表单设计器】高级查询 一对一字段未显示一对一标识，容易混乱
              let pushQuery = superQuery;
              // 判断是否是一对一
              if (/#/.test(item.model)) {
                let subKey = item.model.split('#')[0];
                let arr = superQuerySubOne[subKey] || [];
                superQuerySubOne[subKey] = arr;
                pushQuery = arr;
              }
              // update--end--author:sunjianlei-----date:20220119------for：【JTC-775】【表单设计器】高级查询 一对一字段未显示一对一标识，容易混乱
              pushQuery.push({
                type: superQueryType,
                value: item.model,
                text: name,
                // 当设置了字典的时候才传dictCode
                dictCode: options.remote === 'dict' ? options.dictCode : null,
                dictTable: options.dictTable,
                // 当远程加载数据时，高级查询下拉选项是远程数据，否则就是静态数据
                remoteOptionsKey: hasRemote ? item.key : null,
                options: hasRemote ? [] : options.options,
                customReturnField: options.customReturnField,
                formatStr,
              });
            }
          };
          recursiveAllWidget(json.list, (item, parent) => {
            if (parent && parent.type === 'sub-table-design') {
              // do nothing
            } else {
              packageColumn(item);
            }
          });
          _data.allColumns = allColumns;
          _data.allColumnKeys = allColumnKeys;
          _data.squeryFieldList = superQuery;
          loadRemoteOptions(allRemoteOptions);
          // 合并一对一子表到 superQuery 里
          assignSuperQuerySubOne(superQuerySubOne);

          if (_data.selectedColumnKeys.length <= 0) {
            _data.selectedColumnKeys = [..._data.fixedColumnKeys, ...selectedColumnKeys];
          }
          // 触发列配置变化
          handleCustomColumnChange(_data.selectedColumnKeys, { first: true, selectedColumnKeys });

          return loadData(_data.desformCode);
        } else {
          createMessage.error({ title: '查询失败', content: res.message });
        }
      }

      // update--begin--author:sunjianlei-----date:20220119------for：【JTC-775】【表单设计器】高级查询 一对一字段未显示一对一标识，容易混乱
      // 合并一对一子表到 superQuery 里
      async function assignSuperQuerySubOne(superQuerySubOne) {
        let subOneKeys = Object.keys(superQuerySubOne);
        if (subOneKeys.length > 0) {
          let tableTxtMap = await queryOnlineTableTxt(subOneKeys);
          for (const subOneKey of subOneKeys) {
            _data.squeryFieldList.push({
              value: subOneKey,
              text: tableTxtMap.has(subOneKey) ? tableTxtMap.get(subOneKey) : subOneKey,
              children: superQuerySubOne[subOneKey],
              // 是否仅包含字段名，不需要拼接子表表名
              onlyFieldName: true,
            });
          }
        }
      }
      // 查询online表单的表名
      async function queryOnlineTableTxt(tableName) {
        let tableTxtMap = new Map();
        try {
          let dictCode = 'onl_cgform_head,table_txt,table_name';
          // TODO 不能使用 拼接 in 条件查询，因为逗号有冲突
          // let whereSql = `table_name in ("${tableName.join('","')}")`
          // 拼接 or 条件查询
          let whereSql = ` (table_name = '${tableName.join(`' or table_name = '`)}')`;
          let result = await initDictOptions(`${dictCode},${whereSql}`);
          console.log('result----->', result);
          if (result) {
            for (let item of result) {
              tableTxtMap.set(item.value, item.text);
            }
          } else {
            createMessage.warning('查询附表名失败：');
          }
        } catch (e) {
          console.error(e);
          createMessage.warning('查询附表名失败');
        }
        return tableTxtMap;
      }
      // update--end--author:sunjianlei-----date:20220119------for：【JTC-775】【表单设计器】高级查询 一对一字段未显示一对一标识，容易混乱

      // 列组件翻译器，可以翻译用户组件、部门组件、数据字典、下列树组件
      function columnsTranslator(key, text) {
        if (_data.translData[key]) {
          return filterDictText(_data.translData[key], text);
        } else {
          return text;
        }
      }

      function loadDataThis() {
        loadData(_data.desformCode);
      }

      async function loadData(desformCode) {
        let params = {
          desformCode,
          //superQuery: getQueryParams(),
          pageNo: _data.ipagination.current,
          pageSize: _data.ipagination.pageSize,
        };
        _data.loading = true;
        let res = await list(params);
        _data.loading = false;
        _data.pageLoading = false;
        if (res.success) {
          _data.dataSource = [];
          res.result.records.forEach((item) => {
            let desformData = {
              ...JSON.parse(item.desformDataJson),
              id: item.id,
            };
            _data.dataSource.push(desformData);
          });

          // 取出后台返回的翻译结果
          if (res.result.translData) {
            _data.translData = res.result.translData;
          }

          _data.ipagination.total = res.result.total;
          if (res.message !== '查询成功') {
            createMessage.warning(res.message);
          }
        } else {
          createMessage.error({ title: '查询失败', content: res.message });
        }
      }
      /** 加载远程选项 */
      function loadRemoteOptions(remoteOptions = []) {
        remoteOptions.forEach(async (element) => {
          let { key, options } = element;
          let { remoteFunc, props } = options;
          remoteFunc = remoteFunc.trim();
          // 内部请求直接请求，外部请求需要中转
          let response;
          if (/^https?/.test(remoteFunc)) {
            response = await transitRESTful.get(remoteFunc);
          } else {
            //直接访问
            response = await getAction(remoteFunc);
          }
          let remoteOptions = null;
          // 返回值可能存在的情况：
          // 1、直接返回了个数组
          // 2、result是个数组
          // 3、result.records是个数组（后台包裹了分页对象）
          if (Array.isArray(response)) {
            remoteOptions = response;
          } else if (response.success) {
            if (Array.isArray(response.result)) {
              remoteOptions = response.result;
            } else if (response.result && Array.isArray(response.result.records)) {
              remoteOptions = response.result.records;
            }
          }
          if (remoteOptions == null) {
            console.error('远端数据请求失败：', response);
            return Promise.reject(response);
          }
          remoteOptions = remoteOptions.map((item) => {
            return {
              value: item[props.value],
              label: item[props.label],
              text: item[props.label],
              // children: item[options.props.children]
            };
          });
          _data.remoteOptionsMap[key] = remoteOptions;
          // 由于可能在加载完高级查询时还没有加载出远程数据，所以需要同步更新下
          for (let field of _data.squeryFieldList) {
            if (field.remoteOptionsKey === key) {
              field.options = remoteOptions;
              break;
            }
          }
        });
      }
      /**
       * 新增
       */
      function handleAdd() {
        desformModal.value.open('add', _data.addressCode, null, '新增数据');
      }
      /**
       * 查看数据
       */
      function handleView(record) {
        desformModal.value.open('detail', _data.addressCode, record.id, '查看数据');
      }
      /**
       * 编辑数据
       */
      function handleEdit(record) {
        desformModal.value.open('edit', _data.addressCode, record.id, '编辑数据');
      }
      /**
       * 复制地址
       */
      function handleGetEditUrl(record) {
        _data.getUrlVisible = true;
        _data.getUrlText = `/online/desform/view/${_data.addressCode}?did=${record.id}`;
      }

      function handleAutoModalOk() {
        loadDataThis();
      }

      // 发起流程
      function onStartProcess(record) {
        createConfirm({
          title: '提示',
          content: '确认提交流程吗？',
          onOk: () => {
            //根据desformDataId查询数据对象
            startDesFormProcess(record);
          },
        });
      }
      async function startDesFormProcess(record) {
        let params = {
          flowCode: _data.flowCodePre + record.desformCode,
          id: record.id,
          formUrl: '{{DOMAIN_URL}}/desform/detail/' + record.desformCode + '/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}',
          formUrlMobile: '{{DOMAIN_URL}}/desform/detail/' + record.desformCode + '/${BPM_DES_DATA_ID}?token={{TOKEN}}&taskId={{TASKID}}',
          jsonData: record.desformDataJson,
        };
        let res = await startProcess(params);
        if (res.success) {
          createMessage.success(res.message);
        } else {
          createMessage.warning(res.message);
        }
      }
      /**
       * 删除
       */
      async function handleDelete(id) {
        await deleteOne({ id }, (res) => {
          if (res.success) {
            createMessage.success(res.message);
            loadDataThis();
            _data.selectedRowKeys = [];
          } else {
            createMessage.warning(res.message);
          }
        });
      }
      /**
       * 批量删除
       */
      function handleDeleteBatch() {
        if (_data.selectedRowKeys.length === 0) {
          createMessage.warning('没有选中任何记录');
          return;
        }
        let ids = _data.selectedRowKeys.join(',');
        createConfirm({
          title: '确认删除',
          content: '是否删除选中的数据？',
          onOk: async () => {
            await deleteBatch({ ids }, (res) => {
              if (res.success) {
                createMessage.success(res.message);
                loadDataThis();
                _data.selectedRowKeys = [];
              } else {
                createMessage.warning(res.message);
              }
            });
          },
        });
      }

      // 分页时触发
      function handleTableChange(pagination) {
        _data.ipagination = pagination;
        loadDataThis();
      }
      // 高级查询
      function handleSuperQuery(params, matchType) {
        if (!params || params.length === 0) {
          _data.superQueryParams = '';
          _data.superQueryFlag = false;
        } else {
          _data.superQueryFlag = true;
          _data.superQueryParams = JSON.stringify(params);
        }
        _data.superQueryMatchType = matchType;

        loadDataThis();
      }
      // 获取高级查询条件
      function getQueryParams() {
        let sqp = {};
        if (_data.superQueryParams) {
          sqp['superQueryParams'] = encodeURI(_data.superQueryParams);
        }
        let params = Object.assign(sqp, _data.queryParam, _data.isorter, _data.filters);

        params.field = 'id';
        _data.columns.forEach(function (column) {
          if (column.dataIndex) params.field += ',' + column.dataIndex;
        });

        params.matchType = _data.superQueryMatchType;

        return filterObj(params);
      }

      function getColumnSettingKey() {
        return unref(currentRoute).fullPath + '$ColumnSetting';
      }

      function getColumnSetting() {
        const key = getColumnSettingKey();
        return getCacheByDynKey(key) || [];
      }

      function setColumnSetting(selectedKeys) {
        const key = getColumnSettingKey();
        setCacheByDynKey(key, selectedKeys);
      }
      /**
       * 重新加载点击
       */
      function handleClickReload() {
        loadDataThis();
      }

      /**
       * 更改自定义列时触发的事件
       * @param checkedValues 显示的列
       * @param options 配置项（first，是否首次运行）
       */
      function handleCustomColumnChange(checkedValues, options = {}) {
        let { first, selectedColumnKeys } = options;
        if (!Array.isArray(checkedValues)) {
          //TODO
          checkedValues = checkedValues.split(',');
        }
        // 去掉特殊列
        let fixed = checkedValues.filter((v) => _data.fixedColumnKeys.includes(v));
        let selected = checkedValues.filter((v) => !_data.fixedColumnKeys.includes(v));

        if (selected.length <= 0) {
          // 如果是首次进入页面，就自动恢复设置（默认显示前五个）
          if (first === true) {
            selected = selectedColumnKeys;
            createMessage.warning('检测到列配置损坏，已自动修复');
          } else {
            createMessage.warning('请至少留一项非特殊字段的列');
            return;
          }
        }

        // 去掉已失效的列，留下有效的列
        let effective = selected.filter((k) => _data.allColumnKeys.has(k));

        // 如果有效的列数小于保存的列数，说明存在失效的列，用新的补上
        let diffLength = selected.length - effective.length;
        if (diffLength > 0) {
          // 缺几个就补几个，不够补了就不补
          for (let i = 0; i < diffLength; i++) {
            for (let colKey of _data.allColumnKeys.keys()) {
              if (!effective.includes(colKey)) {
                effective.push(colKey);
                break;
              }
            }
          }
        }
        // 加上特殊列并保存到缓存
        let effectiveCheckedValues = fixed.concat(effective);
        setColumnSetting(effectiveCheckedValues);
        _data.selectedColumnKeys = effectiveCheckedValues;

        // 删选普通字段
        let columns = _data.allColumns.filter((item) => (item.ignore ? false : effective.includes(item.key)));

        if (fixed.includes('$rowNumber$')) {
          _data.columns = [Object.assign({}, _data.fixedColumns.rowIndex)].concat(columns);
        } else {
          _data.columns = columns;
        }
        if (fixed.includes('$action$')) {
          _data.columns.push(Object.assign({}, _data.fixedColumns.action));
        }
        // _data.tableScroll.x = _data.columns.length * _data.tableColumnWidth
        // 处理特殊字段
        _data.showRowSelection = fixed.includes('$selection$');
      }

      function handleExportXls() {
        _data.loading = true;
        let fileName = _data.desformName + '.xls';

        //支持选择行导出
        let selectionIds;
        if (_data.selectedRowKeys && _data.selectedRowKeys.length > 0) {
          selectionIds = _data.selectedRowKeys.join(',');
        }
        downloadFile(`/desform/data/exportXls/${_data.desformCode}`, fileName, {
          desformCode: _data.desformCode,
          superQuery: getQueryParams(),
          selectionIds: selectionIds,
          pageNo: _data.ipagination.current,
          pageSize: _data.ipagination.pageSize,
        }).finally(() => {
          _data.loading = false;
        });
      }
      /**
       * 导入
       */
      function handleImportXls() {
        openModal(true);
      }
      /**
       * 导入完成
       */
      function handleImportOk() {
        loadDataThis();
      }

      function getPictureSrc(pictureList) {
        return pictureList[0].url;
      }
      /**
       * 下载
       */
      function downloadRowFile(fileList) {
        _data.loading = true;
        let count = 0;
        for (let file of fileList) {
          let url = getFileAccessHttpUrl(file.url);
          count++;
          downloadFile(url, file.name).finally(() => {
            if (--count === 0) {
              _data.loading = false;
            }
          });
        }
      }
      //获取省市区数据
      function getPcaText(code) {
        return getAreaTextByCode(code);
      }
      //复制链接
      function onCopyUrl(value) {
        if (value) {
          clipboardRef.value = value;
          if (unref(copiedRef)) {
            createMessage.success('复制成功！');
          }
        } else {
          createMessage.warning('复制失败，请检查路径！');
        }
      }

      /**
       * 递归调用处理所有的组件（包括栅格或其他容器组件内的组件）
       * 注：这是一个同步方法
       */
      function recursiveAllWidget(dataList, handler) {
        const recursive = (array, parent) => {
          for (let item of array) {
            // 判断是否是栅格或其他容器组件
            if (item.isContainer === true) {
              if (item.columns) {
                for (let column of item.columns) {
                  recursive(column.list, item);
                }
              } else if (item.type === 'card') {
                // 卡片和tab需要特殊处理
                recursive(item.list, item);
              } else if (item.type === 'tabs') {
                for (let pane of item.panes) {
                  recursive(pane.list, item);
                }
              }
            }
            // 执行处理回调
            if (typeof handler === 'function') handler(item, parent);
          }
        };
        recursive(dataList, null);
      }

      return {
        ...toRefs(_data),
        buttonsAuth,
        isMobile,
        isDesktop,
        importXlsUrl,
        rowSelection,
        desformModal,
        registerModal,
        handleAdd,
        handleExportXls,
        handleImportXls,
        handleSuperQuery,
        handleCustomColumnChange,
        handleClickReload,
        handleTableChange,
        getFileAccessHttpUrl,
        downloadRowFile,
        handleView,
        handleEdit,
        handleGetEditUrl,
        handleDelete,
        handleAutoModalOk,
        handleImportOk,
        onCopyUrl,
      };
    },
  });
</script>
<style scoped>
  @import '../../less/common.less';
</style>
<style scoped lang="less">
  .j-table-slot-view {
    font-size: 12px;
    font-style: italic;

    img {
      max-width: 80px;
      max-height: 25px;
    }
  }

  .j-table-slot-view-color {
    width: 25px;
    height: 25px;
    margin: 0 auto;
  }
</style>
