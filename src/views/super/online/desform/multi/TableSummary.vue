<template>
  <a-table-summary fixed>
    <a-table-summary-row v-if="summaryVisible" class="design-summary-row">
      <a-table-summary-cell :index="0"><div class="first" title="统计行">=</div></a-table-summary-cell>
      <a-table-summary-cell :index="1">&nbsp;&nbsp;</a-table-summary-cell>
      <template v-for="(item, index) in summaryList">
        <a-table-summary-cell :index="index + 2">
          <a-popover
            v-model:open="item.popVisible"
            overlayClassName="pop-summary-container"
            placement="topLeft"
            :overlayStyle="{ width: '160px' }"
            trigger="click"
          >
            <template #title></template>
            <template #content>
              <div class="label">选择统计方式</div>
              <div v-for="option in summaryOptions" @click="(e) => onChangeSummaryType(e, item, option.type)" class="item">{{option.label}}</div>
              <template v-if="item.isNumber">
                <a-divider style="margin: 2px 0"/>
                <div v-for="option in numberSummaryOptions" @click="(e) => onChangeSummaryType(e, item, option.type)" class="item">{{option.label}}</div>
              </template>
            </template>
            <div style="width: 100%; display: flex">
              <span style="flex: 1; display: inline-block; text-align: center;overflow: hidden;" :title="getTwoDecimal(item.val)">
                <a-tag v-if="item.type" color="blue">{{ getText(item) }}：{{ getTwoDecimal(item.val) }}</a-tag>
              </span>
              <span style="display: inline-block; width: 20px; text-align: right">
                <DownOutlined />
              </span>
            </div>
          </a-popover>
        </a-table-summary-cell>
      </template>
      <a-table-summary-cell :index="tableColumns.length + 2">&nbsp;&nbsp;</a-table-summary-cell>
    </a-table-summary-row>
  </a-table-summary>
</template>

<script lang="ts">
  import { ref, computed, watchEffect } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { round } from 'lodash-es';
  import { DownOutlined } from '@ant-design/icons-vue';

  interface SummaryInfo {
    field?: string;
    type?: string;
    val?: number | string;
    // 是否弹出pop
    popVisible?: boolean;
    // 是否是数字类型的控件 支持统计最大值最小值
    isNumber?: boolean;
  }

  const summaryOptions = [
    { label: '不显示', type: '' },
    { label: '已填写', type: 'notEmpty' },
    { label: '未填写', type: 'empty' },
  ];

  const numberSummaryOptions = [
    { label: '求和', type: 'sum' },
    { label: '平均值', type: 'avg' },
    { label: '最大值', type: 'max' },
    { label: '最小值', type: 'min' },
  ];
  
  const numberArray = ['money', 'integer', 'number', 'rate', 'slider', 'formula'];
  
  export default {
    name: 'TableSummary',
    props: {
      tableColumns: {
        type: Array,
        default: () => [],
      },
      //- summaryList
      dynamicConfig: {
        type: Object,
        default: () => {},
      },
      superQueryParams: {
        type: Object,
        default: () => {},
      },
      // 最初的统计数据
      dataList: {
        type: Array,
        default: () => [],
      },
      show: {
        type: Boolean,
        default: true,
      },
    },
    components: {
      DownOutlined,
    },
    emits: ['load'],
    setup(props, { emit }) {
      const visible = ref(false);
      const viewId = ref('');
      const summaryList = ref<SummaryInfo[]>([]);

      watchEffect(() => {
        if (props.dynamicConfig) {
          viewId.value = props.dynamicConfig.id;
          if (props.dynamicConfig.hasSummary === true) {
            let columns = props.tableColumns;
            console.log('col', columns);
            // 获取之前配置好的统计列
            //let summaryFieldList = props.dynamicConfig.summaryList||[];
            let dbSummaryList = props.dataList;
            // 遍历列-结合老数据 获取新的统计列
            init(columns, dbSummaryList);
          } else {
            visible.value = false;
          }
        }
      });

      function init(columns, dbSummaryList) {
        if (!columns || columns.length == 0) {
          visible.value = false;
          return;
        }
        visible.value = true;
        let arr: any[] = [];
        for (let item of columns) {
          const { compType, dataIndex } = item;
          let summaryInfo: any = '';
          let isNumber = isNumberComp(compType);
          for (let i = 0; i < dbSummaryList.length; i++) {
            if (dataIndex === dbSummaryList[i].field) {
              summaryInfo = { ...dbSummaryList[i], isNumber, popVisible: false };
              break;
            }
          }
          if (!summaryInfo) {
            summaryInfo = {
              field: dataIndex,
              type: '',
              val: '',
              popVisible: false,
              isNumber,
            };
          }
          arr.push(summaryInfo);
        }
        summaryList.value = arr;
      }
      
      function isNumberComp(compType) {
        return numberArray.indexOf(compType) >= 0;
      }

      function getText(item) {
        let str: any = '  ';
        if (item.type) {
          let arr = summaryOptions.filter((s) => s.type === item.type);
          if (arr.length == 0) {
            arr = numberSummaryOptions.filter((s) => s.type === item.type);
          }
          str = arr[0].label;
        }
        return str;
      }

      function prevent(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      async function onChangeSummaryType(e, item, type) {
        prevent(e);
        item.type = type;
        // 请求数据
        console.log(e, item, type);
        if (!type) {
          await updateSummaryList(item.field, type, '');
        } else {
          emit('load', {
            field: item.field,
            type: type,
          });
        }
      }

      async function loadFieldSummary(params) {
        const url = '/desform/data/statisticalValue';
        let res = await defHttp.get({ url, params }, { isTransformResponse: false });
        if (res.success) {
          let val = res.result;
          await updateSummaryList(params.summaryField, params.summaryType, val);
        } else {
          console.log('根节点查询结果异常', res);
        }
      }

      async function updateSummaryList(summaryField, summaryType, val) {
        const url = '/desform/view/updateViewConfig';
        let list = summaryList.value;
        let arr: any[] = [];
        for (let item of list) {
          if (item.field === summaryField) {
            item.val = val;
            item.type = summaryType;
            item.popVisible = false;
          }
          if (item.type) {
            arr.push({ field: item.field, type: item.type });
          }
        }
        let params = {
          id: viewId.value,
          summaryList: arr,
        };
        await defHttp.put({ url, params }, { isTransformResponse: false });
        console.log('updateSummaryList', params);

        summaryList.value = list;
      }

      /**
       * 保留两位小数
       * @param data
       */
      function getTwoDecimal(data) {
        if (!data) {
          return 0;
        }
        return round(data, 2);
      }

      const summaryVisible = computed(() => {
        return props.show === true && visible.value === true;
      });

      return {
        viewId,
        getText,
        visible,
        summaryOptions,
        numberSummaryOptions,
        onChangeSummaryType,
        summaryList,
        loadFieldSummary,
        getTwoDecimal,
        summaryVisible,
      };
    },
  };
</script>

<style lang="less">
  .pop-summary-container {
    width: 160px;
    .ant-popover-inner-content {
      padding: 6px 0;
      > div {
        padding-left: 16px;
      }
      .item {
        box-sizing: border-box;
        cursor: pointer;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        width: 100%;
        &:hover {
          background: #0a8fe9;
          color: #fff;
        }
      }
      .label {
        color: #9e9e9e !important;
        font-size: 12px;
        line-height: 26px;
      }
    }
  }
  html[data-theme="light"] {
    .design-summary-row {
      .ant-table-cell {
        background-color: #fafafa !important;
        border-color: #fafafa !important;
        &:hover {
          background-color: #eaeaea !important;
        }
      }
    }
  }
  .design-summary-row {
    .ant-table-cell {
      padding: 8px !important;
      .first {
        color: #bdbdbd;
        height: 28px;
        line-height: 28px;
        text-align: center;
      }
      .anticon {
        display: none;
      }
      &:hover {
        .anticon {
          display: inline-block;
        }
      }
    }
  }
</style>
