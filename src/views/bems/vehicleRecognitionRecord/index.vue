<template>
  <div class="vehicleRecognitionRecord_index">
    <BasicTable @register="registerTable">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'plate_val'">
          {{ getPlateVal(record.plate_val) }}
        </template>
      </template>
    </BasicTable>
  </div>
</template>

<script setup lang="ts">
import { BasicColumn, BasicTable, FormSchema } from '/@/components/Table';
import { useListPage } from '/@/hooks/system/useListPage';
import { getVehicleRecognitionRecordListApi } from './VehicleRecognition.api';

// 表格列配置
const columns: BasicColumn[] = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: '80px',
    customRender: ({ index }) => index + 1, // 显示序号，从 1 开始
  },
  {
    title: '车牌号码',
    dataIndex: 'plate_num',
    key: 'plate_num',
    width: 140,
  },
  {
    title: '车牌底色',
    dataIndex: 'plate_color',
    key: 'plate_color',
    width: 120,
  },
  {
    title: '车辆品牌',
    dataIndex: 'car_logo',
    key: 'car_logo',
    width: 120,
  },
  {
    title: '车牌信息',
    dataIndex: 'plate_val',
    key: 'plate_val',
    width: 120,
  },
  {
    title: '车辆颜色',
    dataIndex: 'car_color',
    key: 'car_color',
    width: 120,
  },
  {
    title: '车辆类型',
    dataIndex: 'vehicle_type',
    key: 'vehicle_type',
    width: 120,
  },
  {
    title: '识别时间',
    dataIndex: 'local_time',
    key: 'local_time',
    width: 200,
  },
];

//表单搜索字段
const searchFormSchema: FormSchema[] = [
  {
    label: '车牌号码', //显示label
    field: 'plate_num', //查询字段
    component: 'JInput', //渲染的组件
  },
  {
    label: '识别时间', //显示label
    field: 'date', //查询字段
    component: 'RangePicker', //渲染的组件
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      showTime: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
];

// 获取表格数据
const getData = async (pageParams) => {
  const { pageNo, pageSize } = pageParams;
  const { getFieldsValue } = getForm();
  const searchData = getFieldsValue();
  const params = {
    pageNo: pageNo,
    pageSize: pageSize,
    plate_num: searchData.plate_num || undefined,
    startDate: searchData.date ? searchData.date.split(',')[0] : undefined,
    endDate: searchData.date ? searchData.date.split(',')[1] : undefined,
  };
  const res = await getVehicleRecognitionRecordListApi(params);
  return {
    records: res.records, // 当前页数据
    total: res.total, // 总记录数
  };
};

const { tableContext } = useListPage({
  designScope: 'basic-table-demo',
  tableProps: {
    api: getData,
    columns: columns,
    showActionColumn: false,
    size: 'middle',
    rowKey: 'id',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
    },
    formConfig: {
      schemas: searchFormSchema,
      // 默认展开
      showAdvancedButton: false,
      submitOnReset: true,
      //默认row行配置,当 layout 为 horizontal 生效
      rowProps: { gutter: 24, justify: 'start', align: 'middle' },
      //全局col列占比(每列显示多少位)，和schemas中的colProps属性一致
      baseColProps: { span: 6 },
      //row行的样式
      baseRowStyle: { width: '100%' },
      labelCol: { style: { width: 'auto' } },
    },
  },
});

// BasicTable绑定注册
const [registerTable, { getForm }] = tableContext;

// 车牌信息处理：true 表示真牌，false 表示虚假车牌
const getPlateVal = (val) => {
  if (val === true || val === 'true') return '真牌';
  if (val === false || val === 'false') return '虚假车牌';
  return '-';
};
</script>

<style scoped lang="less">
.vehicleRecognitionRecord_index {
  height: 100%;
}
</style>
