<template>
  <div class="approve-container">
    <a-button class="save-btn" type="primary" @click="saveCanvas" :loading="saveLoading">保存</a-button>
    <div class="node-panel">
      <NodePanel :lf="lf" />
    </div>
    <div id="graph" class="viewport"></div>
    <node-form @register="registerNodeForm" @success="nodeSubmit" />
    <edge-form @register="registerEdgeForm" @success="nodeSubmit" />
    <panel-form @register="registerPanelForm" @success="panelSubmit" />
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import LogicFlow from '@logicflow/core';
  import '@logicflow/core/dist/index.css';
  import { themeApprove } from './config';
  import './index.css';
  import NodePanel from './components/node-panel.vue';
  import RegisteNode from './components/registerNode';
  import { InsertNodeInPolyline } from '@logicflow/extension';
  import RegisteMenu from './components/registerMenu';

  import { useDrawer } from '/@/components/Drawer';
  import nodeForm from './components/node-form.vue';
  import panelForm from './components/panel-form.vue';
  import edgeForm from './components/edge-form.vue';
  import { message } from 'ant-design-vue';
  import { addProcess, updateProcess } from '../api';
  LogicFlow.use(InsertNodeInPolyline); // 拖拽面板
  const lf = ref(null);
  const panelData = ref({});
  const allData = ref({});
  const uiJson = ref('');
  const title = ref('');
  const saveLoading = ref(false);
  const props = defineProps({
    processData: Object,
  });
  const emit = defineEmits(['closeModelhandle']);
  watch(
    () => props.processData,
    (newVal, oldVal) => {
      updateCanvas(newVal);
    },
    { deep: true }
  );

  const config = {
    stopScrollGraph: true,
    stopZoomGraph: true,
    grid: {
      size: 10,
      visible: true,
      type: 'mesh',
      config: {
        color: '#DCDCDC',
      },
    },
    keyboard: { enabled: true },
    style: themeApprove,
  };
  const [registerNodeForm, { openDrawer: openNodeForm }] = useDrawer();
  const [registerPanelForm, { openDrawer: openPanelForm }] = useDrawer();
  const [registerEdgeForm, { openDrawer: openEdgeForm }] = useDrawer();
  const initEvent = (lf) => {
    lf.on('element:click', ({ data }) => {
      if (data.type === 'polyline') {
        openEdgeForm(true, data);
      } else {
        openNodeForm(true, data);
      }
    });
    lf.on('node:dnd-add', (data) => {
      const graphData = lf.getGraphData();
      const nodes = graphData.nodes;
      const hasStart = nodes.filter((k) => k.type === 'start').length > 1;
      const hasEnd = nodes.filter((k) => k.type === 'end').length > 1;
      if (hasStart) {
        message.info('只能有一个开始节点');
        setTimeout(() => {
          lf.undo();
        }, 200);
      }
      if (hasEnd) {
        message.info('只能有一个结束节点');
        setTimeout(() => {
          lf.undo();
        }, 200);
      }
    });
    lf.on('blank:click', () => {
      openPanelForm(true, panelData.value);
    });
  };
  onMounted(() => {
    const logicFlow = new LogicFlow({
      ...config,
      container: document.querySelector('#graph'),
    });
    lf.value = logicFlow;
    RegisteNode(logicFlow);
    RegisteMenu(logicFlow);
    initEvent(logicFlow);

    logicFlow.render({});
  });
  // const initFlow = (newVal) => {

  // };
  /**
   * 提交节点的数据
   *
   * @param data 包含节点数据的对象
   */
  const nodeSubmit = (data) => {
    const node = lf.value.graphModel.nodesMap[data.id];
    const edge = lf.value.graphModel.edgesMap[data.id];
    if (node) {
      node.model.text.value = data.name;
      node.model.setProperties(data);
    } else if (edge) {
      edge.model.setProperties(Object.assign(edge.model.properties, data));
      edge.model.text.value = data.name;
    }
  };
  /**
   * 提交面板数据
   *
   * @param {Object} data 面板提交的数据对象
   */
  const panelSubmit = (data) => {
    panelData.value = data;
  };
  const saveCanvas = async () => {
    const data = lf.value.getGraphData();
    saveLoading.value = true;
    allData.value = {
      ...data,
      ...panelData.value,
    };
    if (validate()) {
      try {
        if (title.value === '新增流程') {
          await addProcess(allData.value);
        } else {
          allData.value.uiJson = uiJson.value;
          await updateProcess(allData.value);
        }
        emit('closeModelhandle');
        message.success('流程保存成功');
        saveLoading.value = false;
        // emit('save');
      } catch (error) {
        saveLoading.value = false;
      }
    } else {
      saveLoading.value = false;
    }
  };
  const updateCanvas = (newVal) => {
    title.value = newVal.title;
    if (newVal.title == '新增流程') {
      lf.value.render({});
      panelData.value = {};
    } else {
      panelData.value = {
        id: newVal.record.id,
        businessClassFullName: newVal.record.businessClassFullName,
        flowCode: newVal.record.flowCode,
        flowName: newVal.record.flowName,
        isEnable: newVal.record.isEnable,
      };
      uiJson.value = newVal.record.uiJson;
      lf.value.render(JSON.parse(newVal.record.uiJson));
    }
  };
  const validate = () => {
    let isValid = true;
    const nodes = lf.value.graphModel.nodes;
    const edges = lf.value.graphModel.edges;
    if (nodes.length === 0) {
      isValid = false;
      message.error(`至少需要一个节点`);
    }
    //遍历nodes数组，检查每个节点的类型
    for (const node of nodes) {
      // 如果是开始节点或结束节点，检查是否有连接
      if (!node.properties.id) {
        message.error(`${node.text.value}节点未完成表单填写`);
        isValid = false;
      }
    }
    for (const edge of edges) {
      // 如果是开始节点或结束节点，检查是否有连接
      if (!edge.properties.id) {
        message.error(`连线未完成表单填写`);
        isValid = false;
      }
    }
    if (!panelData.value.flowName) {
      message.error(`请点击画布空白处填写基本设置`);
      isValid = false;
    }
    return isValid;
  };
</script>

<style scoped>
  .viewport {
    overflow: hidden;
    position: relative;
    height: 100%;
  }
  .approve-container {
    position: relative;
  }
  .save-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 999;
  }
</style>
