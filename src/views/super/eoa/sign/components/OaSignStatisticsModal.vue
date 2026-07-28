<template>
  <BasicModal
    :bodyStyle="{ height: '700px' }"
    v-bind="$attrs"
    @register="registerModal"
    :title="title"
    :width="800"
    :showCancelBtn="false"
    :showOkBtn="false"
  >
    <a-spin :spinning="loading" size="large" class="spin">
      <a-form layout="horizontal">
        <a-form-item label="统计月份" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
          <a-month-picker v-model:value="monthValue" placeholder="请选择统计月" format="YYYY年MM月" :allowClear="false"/>
        </a-form-item>
      </a-form>

      <a-tabs v-model:value="tabKey">
        <a-tab-pane tab="柱状图" key="bar" forceRender>
          <bar :chartData="barChartData" width="700px" height="254px" />
        </a-tab-pane>
        <a-tab-pane tab="饼图" key="pie" forceRender>
          <pie :chartData="pieChartData" width="700px" height="254px" />
        </a-tab-pane>
      </a-tabs>

      <a-divider orientation="left">详细数据</a-divider>

      <a-form layout="horizontal">
        <a-row :gutter="10">
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="预期工作" readonly v-model:value="data.expectedWorkingDays" addonAfter="天" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="实际工作" readonly v-model:value="data.actualWorkingDays" addonAfter="天" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="本月总共" readonly v-model:value="data.monthDayTotal" addonAfter="天" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="10">
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="正常次数" readonly v-model:value="data.normalTotal" addonAfter="次" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="迟到次数" readonly v-model:value="data.lateTotal" addonAfter="次" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="旷工次数" readonly v-model:value="data.absentTotal" addonAfter="次" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="10">
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="早退次数" readonly v-model:value="data.leaveEarlyTotal" addonAfter="次" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="请假天数" readonly v-model:value="data.leaveTotal" addonAfter="天" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="外勤次数" readonly v-model:value="data.outTotal" addonAfter="次" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="10">
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="出差天数" readonly v-model:value="data.businessTravelTotal" addonAfter="天" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="补卡次数" readonly v-model:value="data.patchTotal" addonAfter="次" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="" v-bind="formItemProps">
              <a-input addonBefore="缺卡次数" readonly v-model:value="data.missingTotal" addonAfter="次" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </BasicModal>
</template>

<script lang="ts" setup name="oa-sign-statistics-modal">
  import dayjs from 'dayjs';
  import Pie from '/@/components/chart/Pie.vue';
  import Bar from '/@/components/chart/Bar.vue';
  import { ref, watch, unref } from 'vue';
  import { statisticsByMonth } from '../OaSign.api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  const emit = defineEmits(['register', 'success']);
  const { createMessage } = useMessage();
  const props = defineProps({
    title: { type: String, default: '考勤统计' },
    username: { type: String, default: '' },
    month: { type: Object, default: () => dayjs() },
  });
  const monthValue = ref<any>(props.month);
  const loading = ref<boolean>(false);
  const tabKey = ref<string>('tabKey');
  //月打卡数据
  const data = ref<any>({});
  //饼状图数据
  const pieChartData = ref<any>([]);
  //柱状图数据
  const barChartData = ref<any>([]);
  const formItemProps = ref<any>({ labelCol: { md: 24, sm: 24 }, wrapperCol: { md: 24, sm: 24 } });

  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    if (data.isUpdate) {
      monthValue.value = data.record.alertMonthValue;
    }
    await queryStatisticsByMonth();
  });

  /**
   * 获取按月统计的数据
   */
  async function queryStatisticsByMonth() {
    loading.value = true;
    let date = monthValue.value;
    let params = { username: props.username ? props.username : undefined, year: date.format('YYYY'), month: date.format('MM') };
    await statisticsByMonth(params)
      .then((res) => {
        if (res.success) {
          let { normalTotal, lateTotal, absentTotal, leaveEarlyTotal, missingTotal, patchTotal, leaveTotal, outTotal, businessTravelTotal } =
            res.result;
          // 饼图
          const pieDataSource = ref<any>([]);
          pieDataSource.value.push({ name: '正常打卡', value: normalTotal });
          pieDataSource.value.push({ name: '迟到', value: lateTotal });
          pieDataSource.value.push({ name: '旷工', value: absentTotal });
          pieDataSource.value.push({ name: '早退', value: leaveEarlyTotal });
          pieDataSource.value.push({ name: '补卡', value: patchTotal });
          pieDataSource.value.push({ name: '外勤', value: outTotal });
          pieDataSource.value.push({ name: '出差', value: businessTravelTotal });
          pieDataSource.value.push({ name: '请假', value: leaveTotal });
          pieDataSource.value.push({ name: '缺卡', value: missingTotal });
          //饼状图
          pieChartData.value = pieDataSource.value;
          // 柱状图
          barChartData.value = pieDataSource.value;
          data.value = res.result;
        } else {
          throw res.message;
        }
      })
      .catch((e) => {
        createMessage.warning({ title: '考勤统计查询失败', content: (e || {}).message || e });
        close(false);
      })
      .finally(() => {
        loading.value = false;
      });
  }

  /**
   * 弹窗关闭事件
   * @param ok
   */
  function close(ok) {
    if (!loading.value) {
      tabKey.value = 'bar';
      monthValue.value = '';
      if (ok) {
        emit('success');
        closeModal();
      }
    }
  }

  watch(monthValue, () => {
    queryStatisticsByMonth();
  });
</script>

<style lang="less" scoped>
  .spin {
    min-height: 320px;
    min-width: 100%;
    overflow: hidden;
  }
</style>
