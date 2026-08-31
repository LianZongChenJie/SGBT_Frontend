<template>
  <div class="my-topo-components-main-box">
    <div class="container-box">
      <div class="dinalu-topo-box">
        <div ref="container" id="dianLuTopo"> </div>
      </div>
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
    <div v-show="showForm" class="formBox allForm">
      <div class="title-box"> {{ modalTitle }} <span @click="cancel">×</span></div>
      <div class="form-content">
        <ul>
          <li v-for="(item, index) in attributes" :key="item.id">
            <div class="label">{{ item.attributeName }}</div>
            <div class="value">
              <span v-if="item.readwriteLevel == 0">{{ Number(item.value) ? Number(item.value).toFixed(1) : item.lable }}</span>
              <a-select
                v-else-if="item.configList"
                size="small"
                v-model:value="item.value"
                :options="item.configList"
                :fieldNames="{ label: 'value', value: 'key' }"
                style="width: 100%; background: rgba(0, 0, 0, 0)"
                @change="selectChange(item)"
              />
              <a-input @blur="selectChange(item)" v-else v-model:value="item.value" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { getDeviceList, controlDeviceApi } from './api';
  import { message } from 'ant-design-vue';
  const container = ref();
  const gv = ref();
  const dm = ref();
  const deviceList = ref();
  const showSingle = ref(false);
  const showForm = ref(false);
  const targetLeft = ref();
  const targetTop = ref();
  const modalTitle = ref();
  const isSelect = ref(false);
  const selectOptions = ref();
  const itemValue = ref();
  const targetId = ref();
  const attributeCode = ref();
  const configList = ref();
  const displayName = ref();
  const attributes = ref();
  const deviceCode = ref();
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
  const getDeviceListData = async () => {
    const res = await getDeviceList({
      deviceCodes:
        '1HaoLengQueBeng,2HaoLengQueBeng,3HaoLengQueBeng,4HaoLengQueBeng,5HaoLengQueBeng,6HaoLengDongBeng,7HaoLengDongBeng,8HaoLengDongBeng,9HaoLengDongBeng,10HaoLengDongBeng,1HaoLengQueTa,2HaoLengQueTa,3HaoLengQueTa,4HaoLengQueTa,5HaoLengQueTa,1HaoLiXinLengJi,2HaoLiXinLengJi,1HaoLuoGanLengJi,lyxtsd',
    });
    deviceList.value = res;
    console.log(deviceList.value, 'deviceList');
    initEvent();
  };
  const initEvent = async () => {
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
    gv.value.isZoomable = function () {
      return true;
    };
    gv.value.deserialize(`displays/dongnanqu/sg.json`, function (json, dm, gv, data) {
      // let targetNode = dm.getDataByTag(`lengqueta5`);
      // targetNode.a('pinlv', '123');
      // targetNode.s('body.color', 'pink');
      const lyxtsdList = [
        'LQSZGHSYL',
        'LQSZGHSWD',
        'FJSQHSYL',
        'LDSZGHSLL',
        'LDSZGHSWD',
        'FJSQGSYL',
        'LDSZGGSLL',
        'LDSZGGSWD',
        'LQSZGGSYL',
        'LQSZGGSWD',
        'ZLY',
        'CZMS',
        'SJB',
        'BAXTQT',
        'KZMS',
        'LQSWDSD',
        'LQSWXSD',
        'LQSYCSD',
      ];
      deviceList.value.forEach((item, index) => {
        item.attributes.forEach((e, i) => {
          if (e.valueConfig) {
            e.configList = JSON.parse(e.valueConfig);
            e.configList.forEach((item, index) => {
              if (item.key == e.value) {
                e.lable = item.value;
              }
            });
          } else {
            e.lable = e.value;
          }
          if (item.deviceCode == 'lyxtsd') {
            if (e.configList) {
              dm.getDataByTag(e.attributeCode).a('value', e.lable);
            } else {
              dm.getDataByTag(e.attributeCode).a('value', Number(e.value).toFixed(1) + (item.unit ? item.unit : ''));
            }
            dm.getDataByTag(e.attributeCode).a('name', e.attributeName);
          } else {
            if (e.configList) {
              e.configList.forEach((item, index) => {
                if (item.key == e.value) {
                  e.lable = item.value;
                }
              });
              console.log(item.deviceCode, e.attributeCode);
              dm.getDataByTag(item.deviceCode).a(e.attributeCode, e.lable);
            } else {
              dm.getDataByTag(item.deviceCode).a(e.attributeCode, Number(e.value).toFixed(1) + (item.unit ? item.unit : ''));
            }
          }
        });
      });
      gv.mi(function (e) {
        console.log(e);
        if (e.kind == 'clickData') {
          targetTop.value = e.event.layerY + 'px';
          targetLeft.value = e.event.layerX + 'px';
          deviceCode.value = e.data._tag;
          if (e.data._displayName == 'formitem') {
            showSingle.value = true;
            showForm.value = false;
            modalTitle.value = '冷源系统-' + e.data._attrObject.name;
            const lyst = deviceList.value.find((item) => item.deviceCode == 'lyxtsd');
            const targetItem = lyst.attributes.find((item) => item.attributeCode == e.data._tag);
            itemValue.value = targetItem.value;
            targetId.value = targetItem.id;
            configList.value = targetItem.configList;
            attributeCode.value = targetItem.attributeCode;
            if (targetItem.configList) {
              isSelect.value = true;
              selectOptions.value = targetItem.configList;
            } else {
              isSelect.value = false;
            }
          }
          if (
            e.data._displayName == 'lengqueta' ||
            e.data._displayName == 'lengquebeng' ||
            e.data._displayName == 'luoganlengji' ||
            e.data._displayName == 'lengdongbeng'
          ) {
            console.log(e);
            showSingle.value = false;
            showForm.value = true;
            modalTitle.value = e.data._attrObject.name;
            displayName.value = e.data._displayName;
            attributes.value = deviceList.value.find((item) => item.deviceCode == e.data._tag).attributes;
            console.log(attributes.value);
          }
        }
      });
      gv.fitContent(); // 适配内容
    });
  };
  const cancel = () => {
    targetId.value = '';
    showSingle.value = false;
    showForm.value = false;
  };
  const submitControl = async () => {
    console.log(itemValue.value);
    if (!itemValue.value) message.error('请输入操作指令！');
    let res = await controlDeviceApi({
      deviceAttributeId: targetId.value,
      value: itemValue.value,
    });
    if (!res) {
      showSingle.value = false;
      showForm.value = false;
      message.success('操作成功！');
      if (configList.value) {
        configList.value.forEach((item) => {
          if (item.key == itemValue.value) {
            console.log(attributeCode.value);
            dm.value.getDataByTag(attributeCode.value).a('value', item.value);
          }
        });
      } else {
        dm.value.getDataByTag(attributeCode.value).a('value', itemValue.value);
      }

      // getDeviceListData();
    }
  };
  const selectChange = (item) => {
    console.log(item);
    formSubmit(item);
  };
  const formSubmit = async (item) => {
    if (!item.value) message.error('请输入操作指令！');
    let res = await controlDeviceApi({
      deviceAttributeId: item.id,
      value: item.value,
    });
    if (!res) {
      message.success('操作成功！');
      if (item.configList) {
        item.configList.forEach((item) => {
          if (item.key == itemValue.value) {
            dm.value.getDataByTag(deviceCode.value).a(item.attributeCode, item.value);
          }
        });
      } else {
        dm.value.getDataByTag(deviceCode.value).a(item.attributeCode, item.value);
      }

      // getDeviceListData();
    }
  };
  onMounted(() => {
    getDeviceListData();
  });
</script>
<style lang="less">
  .singleForm {
    position: absolute;
    width: 224px;
    .title-box {
      background: rgb(38, 40, 44);
      color: rgb(182, 184, 187);
      padding: 5px 20px;
    }
    .form-content {
      background: rgb(72, 72, 78);
      padding: 2px 5px 2px 24px;
      display: flex;
      justify-content: space-between;
      .select-box {
        width: 70%;
      }
      .ant-select-selector {
        background: rgba(0, 0, 0, 0) !important;
        color: #fff !important;
      }
      .ant-select-selection-item {
        color: rgb(182, 184, 187) !important;
        font-size: 12px !important;
      }
      .button-box {
        span {
          display: inline-block;
          border-radius: 50%;
          text-align: center;
          background: #222427;
          width: 20px;
          height: 20px;
          line-height: 16px;
          margin-left: 5px;
          cursor: pointer;
          &.green {
            border: 2px solid #29a738;
            color: #29a738;
          }
          &.red {
            border: 2px solid #da0015;
            color: #da0015;
          }
        }
      }
    }
  }
  .allForm {
    background: #292d30;
    position: absolute;
    width: 220px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 0 5px;
    .title-box {
      color: rgb(182, 184, 187);
      padding: 5px 10px;
      font-size: 16px;
      border-bottom: 2px solid rgba(227, 25, 55, 0.4);
      position: relative;
      span {
        position: absolute;
        right: 5px;
        cursor: pointer;
        font-size: 28px;
        top: -5px;
      }
    }
    .form-content {
      padding: 5px 10px;
      color: rgb(182, 184, 187);
      font-size: 14px;
      li {
        display: flex;
        font-size: 12px;
        .label {
          width: 110px;
        }
        .value {
          flex: 1;
          text-align: center;
        }
        .ant-select-selector {
          background: rgba(0, 0, 0, 0) !important;
          color: #fff !important;
        }
        .ant-select-selection-item {
          color: rgb(182, 184, 187) !important;
          font-size: 12px !important;
        }
        .ant-select-arrow {
          color: rgb(182, 184, 187) !important;
        }
        .ant-input {
          background: rgba(0, 0, 0, 0) !important;
          color: #fff !important;
        }
      }
    }
  }
</style>
<style scoped lang="less">
  .my-topo-components-main-box {
    height: 81vh;
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
        width: 100%;
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
</style>
