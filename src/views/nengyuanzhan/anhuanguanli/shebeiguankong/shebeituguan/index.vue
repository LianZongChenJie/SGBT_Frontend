
<template>
  <div class="map-wrapper">
    <svg class="map-svg" preserveAspectRatio="none" viewBox="0 0 1920 1080"
      x="0"
      y="0"
    >
      <!-- ① 底图 -->
<!--      <image-->
<!--        :xlink:href="bgImg" height="100%"-->
<!--        preserveAspectRatio="xMidYMid meet"-->
<!--        vector-effect="non-scaling-stroke"-->
<!--        width="100%"-->
<!--        x="0" y="0"-->
<!--      />-->
      <image
        :xlink:href="bgImg" height="100%"
        width="100%"
        x="0" y="0"
      />

      <!-- ② 区域高亮 -->
<!--      <g v-for="area in areas" :key="area.id">-->
<!--        <path-->
<!--          :d="area.path"-->
<!--          :fill="area.color"-->
<!--          opacity="0.5"-->
<!--        />-->
<!--      </g>-->

<!--      &lt;!&ndash; ③ 设备点位 &ndash;&gt;-->
<!--      <g v-for="device in devices" :key="device.id">-->
<!--        <circle-->
<!--          :cx="device.x"-->
<!--          :cy="device.y"-->
<!--          :fill="getColor(device.type)"-->
<!--          r="10"-->
<!--          @click="onDeviceClick(device)"-->
<!--        />-->
<!--      </g>-->
    </svg>
    <a-tabs v-model:activeKey="activeKey" class="tabsBox" >
      <a-tab-pane key="1" tab="摄像机">
        <BasicForm @register="registerForm" @submit="handleSubmit" />

      </a-tab-pane>
      <a-tab-pane key="2" tab="门禁" force-render></a-tab-pane>
      <a-tab-pane key="3" tab="消防">

      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts" name="shebeituguan" setup>
import bgImg from "@/assets/images/ditu.png"
  import { ref, unref, reactive, toRaw, watch, computed } from 'vue';
import { BasicColumn, BasicTable, TableAction } from '@/components/Table';
import { BasicForm, useForm } from '/@/components/Form/index';
import { formSchema } from './demo.data';

const activeKey = ref('1');
//表单配置
const [registerForm, { resetFields, setFieldsValue,clearValidate,getFieldsValue, validate, updateSchema }] = useForm({
  labelWidth: 110,
  // labelCol: {span: 24},
  // wrapperCol: {span: 24},
  schemas: formSchema,
  // showActionButtonGroup: true,
  showResetButton: true,
  //自定义提交按钮文本和图标
  submitButtonOptions: { text: '查询', preIcon: '' },
  //查询列占比 24代表一行 取值范围 0-24
  actionColOptions: {
    span: 17,
    style: {
      textAlign: 'left',
    },
  },
});
function handleSubmit(values: any) {
  console.log('提交按钮数据::::', values);
}

</script>
<style lang="less" scoped>
.map-wrapper{
  position: relative;
  .map-svg{
    position: absolute;
    left: 0;
    top: 0;
  }
  .tabsBox{
    width: 400px;
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 1;
    background: rgba(88, 86, 97,0.8);
    padding: 10px;
  }
}
</style>
