<template>
  <div class="approve-container">
    <a-button class="save-btn" type="primary" @click="saveCanvas">保存</a-button>
    <div class="node-panel">
      <NodePanel :lf="lf" />
    </div>
    <div id="graph" class="viewport"></div>
    <node-form @register="register" @success="nodeSubmit" />
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import LogicFlow from '@logicflow/core';
  import '@logicflow/core/dist/index.css';
  import { themeApprove } from './config';
  import './index.css';
  import NodePanel from './components/node-panel.vue';
  import RegisteNode from './components/registerNode';
  import RegisteMenu from './components/registerMenu';
  import { InsertNodeInPolyline } from '@logicflow/extension';
  import { useDrawer } from '/@/components/Drawer';
  import nodeForm from './components/node-form.vue';
  import { message } from 'ant-design-vue';
  LogicFlow.use(InsertNodeInPolyline); // 拖拽面板
  const lf = ref(null);
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
  const [register, { openDrawer }] = useDrawer();
  const initEvent = (lf) => {
    lf.on('element:click', ({ data }) => {
      openDrawer(true, data);
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
      console.log('空白区域点击');
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
  const nodeSubmit = (data) => {
    const node = lf.value.graphModel.nodesMap[data.id];
    const edge = lf.value.graphModel.edgesMap[data.id];
    if (node) {
      node.model.setProperties(data);
    } else if (edge) {
      edge.model.setProperties(Object.assign(edge.model.properties, data));
    }
  };
  const saveCanvas = () => {
    const data = lf.value.getGraphData();
    console.log(data);
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
