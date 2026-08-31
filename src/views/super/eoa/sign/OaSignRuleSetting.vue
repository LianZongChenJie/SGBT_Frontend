<template>
  <a-card :bordered="false">
    <a-spin :spinning="loading">
      <BasicForm @register="registerForm" style="padding-top: 20px">
        <template #workingDays="{ model, field }">
          <a-checkbox-group v-model:value="model[field]" :options="daysOption" />
          <span class="tip">定义星期几需要打卡</span>
        </template>
        <template #onTimeLate="{ model, field }">
          <TimePicker @change="timeHandleChange('onTimeLate')" v-model:value="model[field]" v-bind="timePickerProps"></TimePicker>
          <span class="tip">上班时间之后到迟到时间之前打卡记为迟到</span>
        </template>
        <template #onTimeAbsent="{ model, field }">
          <TimePicker @change="timeHandleChange('onTimeAbsent')" v-model:value="model[field]" v-bind="timePickerProps"></TimePicker>
          <span class="tip">该时间后打卡记为旷工</span>
        </template>
        <template #offTimeEarly="{ model, field }">
          <TimePicker @change="timeHandleChange('offTimeEarly')" v-model:value="model[field]" v-bind="timePickerProps"></TimePicker>
          <span class="tip">该时间前打卡记为早退，反之记为正常打卡</span>
        </template>
        <template #geolocation="{ model, field }">
          <a-input style="width:300px" v-model:value="model[field]">
            <template #addonAfter><environment-outlined @click="selectLocation" /></template>
          </a-input>
          <span class="tip">获取打卡坐标经纬度，逗号分割</span>
        </template>
      </BasicForm>
      <div class="bottom-btn">
        <a-button @click="holidayHandleClick()" type="primary" ghost :style="{ marginRight: '8px' }">
          {{ showHoliday ? '收起' : '展开' }}假期安排
        </a-button>
        <a-button @click="syncHoliday" type="primary" ghost :style="{ marginRight: '8px' }">同步假期安排</a-button>
        <a-button type="primary" @click="handleClickSubmit">保存</a-button>
      </div>
    </a-spin>
  </a-card>
</template>
<script lang="ts" setup name="oa-sign-rule">
  import { ref, onMounted, nextTick, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { ruleFormSchema } from './OaSign.data';
  import { getSyncHoliday, saveOrUpdate, queryRules } from './OaSign.api';
  import dayjs from 'dayjs';
  import { TimePicker } from 'ant-design-vue';
  import { EnvironmentOutlined } from '@ant-design/icons-vue';
  //注册表单
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: ruleFormSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  });
  const loading = ref<boolean>(false);
  const showHoliday = ref<boolean>(false);

  const daysOption = ref([
    { label: '星期一', value: '1' },
    { label: '星期二', value: '2' },
    { label: '星期三', value: '3' },
    { label: '星期四', value: '4' },
    { label: '星期五', value: '5' },
    { label: '星期六', value: '6' },
    { label: '星期日', value: '7' },
  ]);
  const timePickerProps = ref<any>({ format: 'HH:mm', getPopupContainer: (node) => node?.parentNode });

  /**
   * 初始化查询考勤规则
   */
  async function query() {
    loading.value = true;
    await queryRules().then((res) => {
      let { result } = res;
      if (result != null) {
        nextTick(() => {
          formatDateTime('HH:mm', result, ['onTime', 'onTimeLate', 'onTimeAbsent', 'offTime', 'offTimeEarly'], true);
          formatDateTime(
            'YYYY-MM-DD',
            result,
            [
              'holidayYuanDan[]',
              'holidayChunJie[]',
              'holidayQingMing[]',
              'holidayLaoDong[]',
              'holidayDuanWu[]',
              'holidayZhongQiu[]',
              'holidayGuoQing[]',
              'holidayOther[]',
            ],
            true
          );
          result.showStatus = result.showStatus ? result.showStatus : '1';
          result.workingDays = result.workingDays ? result.workingDays.split(',') : [];
          setHoliday(result, false);
        });
      }
    });
    loading.value = false;
  }

  /**
   * 保存
   */
  async function handleClickSubmit() {
    try {
      let values = await validate();
      loading.value = true;
      formatDateTime('HH:mm', values, ['onTime', 'onTimeLate', 'onTimeAbsent', 'offTime', 'offTimeEarly']);
      formatDateTime('YYYY-MM-DD', values, [
        'holidayYuanDan[]',
        'holidayChunJie[]',
        'holidayQingMing[]',
        'holidayLaoDong[]',
        'holidayDuanWu[]',
        'holidayZhongQiu[]',
        'holidayGuoQing[]',
        'holidayOther[]',
      ]);
      await saveOrUpdate(values);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取节假日期
   */
  async function syncHoliday() {
    await getSyncHoliday({}).then((res) => {
      let yuanDan = res.result.yuanDanHoliday;
      let chunJie = res.result.chunJieHoliday;
      let qingMing = res.result.qingMingHoliday;
      let laoDong = res.result.laoDongHoliday;
      let duanWu = res.result.duanWuHoliday;
      let zhongQiu = res.result.zhongQiuHoliday;
      let guoQing = res.result.guoQingHoliday;
      let formData = {
        holidayYuanDan: [dayjs(yuanDan[0], 'YYYY-MM-DD'), dayjs(yuanDan[yuanDan.length - 1], 'YYYY-MM-DD')],
        holidayChunJie: [dayjs(chunJie[0], 'YYYY-MM-DD'), dayjs(chunJie[chunJie.length - 1], 'YYYY-MM-DD')],
        holidayQingMing: [dayjs(qingMing[0], 'YYYY-MM-DD'), dayjs(qingMing[qingMing.length - 1], 'YYYY-MM-DD')],
        holidayLaoDong: [dayjs(laoDong[0], 'YYYY-MM-DD'), dayjs(laoDong[laoDong.length - 1], 'YYYY-MM-DD')],
        holidayDuanWu: [dayjs(duanWu[0], 'YYYY-MM-DD'), dayjs(duanWu[duanWu.length - 1], 'YYYY-MM-DD')],
        holidayZhongQiu: [dayjs(zhongQiu[0], 'YYYY-MM-DD'), dayjs(zhongQiu[zhongQiu.length - 1], 'YYYY-MM-DD')],
        holidayGuoQing: [dayjs(guoQing[0], 'YYYY-MM-DD'), dayjs(guoQing[guoQing.length - 1], 'YYYY-MM-DD')],
      };
      showHoliday.value = true;
      setHoliday(formData, true);
    });
  }

  /**
   * 展开日期点击事件
   */
  function holidayHandleClick() {
    showHoliday.value = !showHoliday.value;
    if (showHoliday.value) {
      setHoliday({}, true);
    } else {
      setHoliday({}, false);
    }
  }

  /**
   * 设置节日假期
   * @param record 日期数据
   * @param show 是否显示
   */
  function setHoliday(record, show) {
    updateSchema([
      {
        field: 'holidayYuanDan',
        show: show,
      },
      {
        field: 'holidayChunJie',
        show: show,
      },
      {
        field: 'holidayQingMing',
        show: show,
      },
      {
        field: 'holidayLaoDong',
        show: show,
      },
      {
        field: 'holidayDuanWu',
        show: show,
      },
      {
        field: 'holidayZhongQiu',
        show: show,
      },
      {
        field: 'holidayGuoQing',
        show: show,
      },
      {
        field: 'holidayOther',
        show: show,
      },
    ]);
    setFieldsValue({ ...record });
  }

  /**
   * 时间组件改变事件，需要触发一下表单验证
   * @param name
   */
  function timeHandleChange(name) {
    validate([name]);
  }

  /**
   * 格式化日期
   * @param fmt
   * @param obj
   * @param keys
   * @param isString
   */
  function formatDateTime(fmt, obj, keys, isString = false) {
    keys.forEach((key) => {
      let value = obj[key];
      let arr = key.split('[]');
      if (arr.length === 2) {
        value = obj[arr[0]];
        if (value) {
          if (isString) {
            obj[arr[0]] = value.split(',').map((v) => dayjs(v, fmt));
          } else {
            obj[arr[0]] = value.map((v) => v.format(fmt)).join(',');
          }
        } else {
          obj[arr[0]] = undefined;
        }
      } else if (value) {
        obj[key] = isString ? dayjs(value, fmt) : value.format(fmt);
      }
    });
  }

  /**
   * 选择定位
   */
  function selectLocation() {
    window.open('https://lbs.amap.com/tools/picker/', '_blank');
  }
  onMounted(() => {
    //初始化查询考勤规则
    query();
  });
</script>

<style lang="less" scoped>
  .tip {
    color: #a0a0a0;
    margin-left: 10px;
  }

  //update-begin---author:wangshuai ---date: 20230828 for：【QQYUN-6363】样式写的有问题，没有前缀------------
  //.time-picker-bigger {
  //  :deep(.ant-time-picker) {
  //    width: 200px;
  //
  //    &-panel-narrow &-panel-input-wrap {
  //      max-width: 200px;
  //    }
  //
  //    &-panel-select {
  //      width: 100px;
  //      overflow-y: auto;
  //
  //      li {
  //        padding: 0;
  //        text-align: center;
  //      }
  //    }
  //  }
  //
  //  :deep(.ant-time-picker-panel-select ul) {
  //    width: 100px;
  //  }
  //}
  //update-end---author:wangshuai ---date: 20230828 for：【QQYUN-6363】样式写的有问题，没有前缀------------

  .bottom-btn {
    width: 100%;
    border-top: 1px solid #e9e9e9;
    padding: 10px 16px;
    background: #fff;
    text-align: center;
  }
</style>
