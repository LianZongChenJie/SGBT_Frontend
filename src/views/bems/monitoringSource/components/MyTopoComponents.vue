<template>
  <div class="my-topo-components-main-box">
    <div class="container-box">
      <div class="tree-box">
        <ul class="deviceList">
          <li v-for="item in deviceList" :key="item.deviceId" @click="deviceCheck(item)" :class="{ checked: item.id === checkedId }">
            {{ item.deviceDetailName }}
          </li>
        </ul>
      </div>
      <div class="dinalu-topo-box"><div ref="container" id="dianLuTopo"> </div> </div>
    </div>
    <div v-show="showSingle" class="formBox singleForm" :style="{ top: targetTop, left: targetLeft }">
      <div class="title-box"> {{ modalTitle }}</div>
      <div class="form-content">
        <div class="select-box">
          <a-select
            size="small"
            v-if="isSelect"
            v-model:value="itemValue"
            :options="selectOptions"
            :fieldNames="{ label: 'value', value: 'key' }"
            style="width: 100%; background: rgba(0, 0, 0, 0)"
          />
          <a-input size="small" v-else type="number" v-model:value="itemValue" style="width: 100%" />
        </div>
        <div class="button-box">
          <span class="green" @click="submitControl">√</span>
          <span class="red" @click="cancel">×</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import { getDeviceListByCategoryId, getDeviceByCategoryId } from './api';

  const props = defineProps({
    path: {
      type: String,
      default: 'kongTiao.json',
    },
    categoryId: {
      type: String,
      default: '8',
    },
    deviceList: {
      type: Array,
      default: () => [],
    },
  });
  const checkedId = ref('');
  const deviceAttribute = ref({
    XK_B1_1: '厨房补风机组',
    XK_B1_2: '厨房补风机组',
    X_1_S1: '厨房补风机组',
    X_1_S2: '厨房补风机组',
    X_3_S1: '厨房补风机组',
    X_3_S2: '厨房补风机组',
    X_B1M_S1: '新风机组',
    X_B1M_1: '新风机组',
    X_B1M_S2: '新风机组',
    X_B1M_2: '新风机组',
    X_B1M_Z1: '变频新风机组',
    X_B1M_Z2: '变频新风机组',
    K_B1M_1: '空调机组',
    K_B1M_2: '空调机组',
    RHS_1_1: '热回收新风机组',
    RHS_3_1: '热回收新风机组',
    XK_B1_3: '厨房补风机组',
    XK_B1_4: '厨房补风机组',
  });
  const deviceList = ref<any[]>([]);
  const container = ref();
  const gv = ref();
  const dm = ref();
  const deviceData = ref<any>({});
  const isControlArr = ref<any[]>([]);
  const showSingle = ref(false);
  const targetTop = ref('');
  const targetLeft = ref('');
  const modalTitle = ref('');
  const isSelect = ref(true);
  const selectOptions = ref<any[]>([]);
  const itemValue = ref('');
  const targetId = ref('');
  const jsonName = ref('');
  const getDeviceListByCategoryIdHandle = async () => {
    const res = await getDeviceListByCategoryId({ categoryId: props.categoryId });
    console.log(res);
    res.forEach((item) => {
      item.deviceDetailName = deviceAttribute.value[item.deviceCode] + '_' + item.deviceCode || item.deviceName;
    });
    deviceList.value = res || [];
  };
  const deviceCheck = async (item) => {
    console.log(item, 'item');
    checkedId.value = item.id;
    const res = await getDeviceByCategoryId({ deviceId: item.id });
    res.forEach((item) => {
      if (item.valueConfig) {
        item.configList = JSON.parse(item.valueConfig);
        item.configList.forEach((e, index) => {
          if (e.key == item.value) {
            item.lable = e.value;
          }
        });
      } else {
        if (Number(item.value)) {
          item.lable = Number(item.value).toFixed(1);
        } else {
          item.lable = item.value;
        }
      }
    });
    deviceData.value = res;
    const deviceAttributeCodes = props.deviceList.map((d) => d.attributeCode);
    isControlArr.value = deviceData.value.filter((d) => deviceAttributeCodes.includes(d.attributeCode));
    jsonName.value = deviceAttribute.value[item.deviceCode];
    initEvent(item.deviceDetailName);
  };
  const clearTopoContent = () => {
    if (dm.value) {
      dm.value.clear(); // 清除数据模型中的所有数据
    }
    if (gv.value && container.value) {
      // 清除容器内的所有子元素
      while (container.value.firstChild) {
        container.value.removeChild(container.value.firstChild);
      }
    }
  };

  const initEvent = async (deviceName) => {
    await nextTick();
    if (!container.value) return;
    // 清除之前的内容
    clearTopoContent();
    gv.value = new ht.graph.GraphView();
    dm.value = gv.value.getDataModel();
    gv.value.addToDOM(container.value, {
      fill: false, // 关闭自动填充
    });

    gv.value.isMovable = function () {
      return false;
    }; // 禁止移动
    gv.value.getSelectWidth = function () {
      return 0;
    }; // 禁止选中
    gv.value.deserialize(`displays/dongnanqu/${jsonName.value}.json`, function (json, dm, gv, data) {
      dm.getDataByTag(`deviceName`).a('value', deviceName);
      isControlArr.value.forEach((item) => {
        console.log(item);
        dm.getDataByTag(item.attributeCode).a('value', item.lable + (item.unit ? item.unit : ''));
        if (item.attributeCode == 'SFDP') {
          dm.getDataByTag(`arrow`).a('value', item.value);
        }
      });

      gv.mi(function (e) {
        if (e.kind === 'clickData' && isControlArr.value.find((item) => item.attributeCode === e.data._tag).readwriteLevel === '1') {
          let targetItem = isControlArr.value.find((item) => item.attributeCode === e.data._tag);
          console.log(targetItem);
          targetTop.value = e.event.layerY + 'px';
          targetLeft.value = e.event.layerX + 'px';
          showSingle.value = true;
          modalTitle.value = targetItem.attributeName;
          itemValue.value = targetItem.lable + (targetItem.unit ? targetItem.unit : '');
          isSelect.value = targetItem.configList ? true : false;
          selectOptions.value = targetItem.configList || [];
          targetId.value = targetItem.id;
        }
      });

      gv.fitContent(); // 适配内容
    });
  };
  const cancel = () => {
    targetId.value = '';
    showSingle.value = false;
  };
  const submitControl = () => {
    if (!itemValue.value) message.error('请输入操作指令！');
    targetId.value = '';
    showSingle.value = false;
  };
  onMounted(async () => {
    await getDeviceListByCategoryIdHandle();
    await deviceCheck(deviceList.value[0]);
  });
</script>

<style scoped lang="less">
  .my-topo-components-main-box {
    height: 80vh;
    padding: 0 12px;

    .topo-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      height: 30px;
      padding-left: 18px;

      .icon-box {
        height: 20px;
        border-left: 5px solid #8080ff;
        margin-right: 10px;
      }

      > span {
        font-size: 18px;
        color: #506f8e;
        font-weight: 600;
      }
    }

    .container-box {
      height: calc(100% - 0px);
      display: flex;
      justify-content: space-between;

      .tree-box,
      .dinalu-topo-box {
        background-color: #fff;
        border-radius: 10px;
      }

      .tree-box {
        width: 20%;
        z-index: 10;
        overflow: auto;
      }

      .dinalu-topo-box {
        position: relative;
        width: 79%;
        height: 100%;
        margin: 0 auto;
        /* 居中显示 */
        overflow: hidden;
        position: relative;

        .full-screen {
          color: #000;
          position: absolute;
          top: 15px;
          left: 15px;

          &:hover {
            cursor: pointer;
            color: #00000085;
          }
        }

        .control-div {
          padding: 3px 12px;
          top: 100px;
          left: 100px;
          position: absolute;
          height: 130px;
          width: 200px;
          border: 2px solid #adadad;
          background-color: #fff;

          > div {
            height: 40px;
            width: 100%;
          }

          .title-box {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            font-size: 16px;
          }

          .select-box {
            height: 40px;
            width: 100%;
          }

          .button-box {
            display: flex;
            align-items: center;
            justify-content: space-around;
          }
        }
      }

      #dianLuTopo {
        height: 100%;
        width: 100%;
        position: absolute;
      }
    }
  }
  .deviceList {
    padding: 10px 5px;
    li {
      padding: 8px 12px;
      border-bottom: 1px solid #ebeaea;
      cursor: pointer;
      &.checked {
        background-color: #709cfa;
        color: #fff;
      }
    }
  }
</style>
