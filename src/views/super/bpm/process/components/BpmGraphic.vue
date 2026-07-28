<template>
  <div>
    <div class="jee-bpm-graphic-containers">
      <div class="jee-bpm-graphic-canvas" :id="containerId"></div>
    </div>
    <bpm-node-info-modal @register="registerModal" @notify="handleModalVisible"></bpm-node-info-modal>
  </div>
</template>

<script>
  import { watch, ref, onMounted } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import BpmNodeInfoModal from './BpmNodeInfoModal.vue';
  import { useModal } from '/@/components/Modal';
  import inherits from 'inherits';
  import Viewer from 'bpmn-js/lib/Viewer';
  import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
  import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
  import { append as svgAppend, attr as svgAttr, create as svgCreate } from 'tiny-svg';
  import { query as domQuery } from 'min-dom';
  function CustomViewer(options) {
    Viewer.call(this, options);
  }
  inherits(CustomViewer, Viewer);
  CustomViewer.prototype._modules = [].concat(Viewer.prototype._modules, [ZoomScrollModule, MoveCanvasModule]);

  export default {
    name: 'BpmGraphic',
    props: {
      // 流程实例ID
      instanceId: {
        type: String,
        required: false,
      },
      center:{
        type: Boolean,
        default: false,
        required: false
      }
    },
    components: {
      BpmNodeInfoModal,
    },
    emits: ['task'],
    setup(props, { emit }) {
      const url = {
        getProcessInfo: '/act/designer/api/getProcessXmlByInstanceId',
        getInstanceInfo: '/act/task/getFlowMsgByProcInstId',
        getNodePositionInfo: '/act/task/getNodePositionInfo',
      };
      const [registerModal, { openModal, closeModal }] = useModal();
      const containerId = 'jee-bpm-graphic-canvas';
      let bpmViewer = null;
      onMounted(() => {
        newViewer();
      });

      let taskList = [];
      let currentTaskId = '';
      let currentNodeList = [];
      let historyNodeList = [];
      let historyLineList = [];
      let delayHandler = '';

      watch(
        () => props.instanceId,
        (val) => {
          if (val) {
            init();
          }
        },
        { immediate: true }
      );

      async function init() {
        let params = { processInstanceId: props.instanceId };
        // 1.加载流程设计xml
        let xml = await defHttp.get({ url: url.getProcessInfo, params }, { isTransformResponse: false });
        //console.log('xml', xml);
        // 2.加载流程实例信息
        let instanceInfo = await defHttp.get({ url: url.getInstanceInfo, params }, { isTransformResponse: false });
        //console.log('instanceInfo', instanceInfo);
        // 2.加载节点信息 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
        let nodeInfo = await defHttp.get({ url: url.getNodePositionInfo, params }, { isTransformResponse: false });
        //console.log('nodeInfo', nodeInfo);
        if (nodeInfo.success) {
          taskList = nodeInfo.result.hisTasks;
          emit('task', taskList);
        }
        //  console.log('taskList', nodeInfo.result)
        try {
          // 3.解析流程实例信息 NY5LzSY2VW1BSthYSnJArCFqbgwtZqSuyPQ/OD1n1twWJGU2RN/wkzf+kBVO5Dzt1tfCXbTnBERDugH4sSiNJM6d9gGujlqrqH0iD13cmCMX7UK/DTuXabF/acqdT052YWaK9072jFdyt+5PXI+shQ==
          if (instanceInfo.success) {
            historyNodeList = instanceInfo.result.highLightedActivitiIdList;
            currentNodeList = instanceInfo.result.runningActivitiIdList;
            historyLineList = instanceInfo.result.highLightedFlowIds;
          }
          // 4.绘制流程
          newViewer();
          const result = await bpmViewer.importXML(xml);
          const { warnings } = result;
          console.log('bpm graphic warnings', warnings);
          // 5.调整图片位置
          const canvas = bpmViewer.get('canvas');
          if(props.center == true){
            canvas.zoom('fit-viewport', true);
          }
          // 6.创建箭头标记
          createArrow();
          // 7.设置节点、线的颜色
          setColor();
          // 8.节点事件
          addEvent();
        } catch (err) {
          console.log(err.message, err.warnings);
        }
      }

      function setColor() {
        // access viewer components
        const canvas = bpmViewer.get('canvas');
        // 获取到全部节点
        const allShapes = bpmViewer.get('elementRegistry').getAll();
        //循环节点添加class
        allShapes.forEach((element) => {
          const shapeId = element.businessObject.id;
          // const shapeAttrs = element.businessObject.$attrs
          //console.info('123element', element)
          let type = element.type;
          if (type == 'bpmn:ExclusiveGateway' || type == 'bpmn:InclusiveGateway' || type == 'bpmn:ParallelGateway') {
            canvas.addMarker(shapeId, 'jee-bpm-gateway');
          }
          // add marker
          if (element.businessObject.$type != 'bpmn:Group') {
            if (element.businessObject.$type == 'bpmn:SequenceFlow') {
              if (historyLineList.includes(shapeId)) {
                canvas.addMarker(shapeId, 'jee-bpm-history-line');
              }
            } else {
              if (historyNodeList.includes(shapeId) && !currentNodeList.includes(shapeId)) {
                canvas.addMarker(shapeId, 'jee-bpm-history-node');
              }
              if (currentNodeList.includes(shapeId)) {
                canvas.addMarker(shapeId, 'jee-bpm-current-node');
              }
            }
          }
        });
      }

      // 自定义箭头标记-默认箭头是黑色的
      function createArrow() {
        const marker = svgCreate('marker');
        svgAttr(marker, {
          id: 'active-arrow',
          viewBox: '0 0 20 20',
          refX: '11',
          refY: '10',
          markerWidth: '10',
          markerHeight: '10',
          orient: 'auto',
          fill: '#408af1',
        });
        const path = svgCreate('path');
        svgAttr(path, {
          d: 'M 1 5 L 11 10 L 1 15 Z',
          style: 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1;',
        });
        const defs = domQuery('defs');
        svgAppend(marker, path);
        svgAppend(defs, marker);
      }

      //添加节点事件
      function addEvent() {
        const eventBus = bpmViewer.get('eventBus');
        eventBus.on('element.hover', (e) => {
          const { element } = e;
          if (!element.parent) {
            // 这里关闭modal
            delayClose();
            currentTaskId = '';
            //console.log('鼠标移至空白处', element);
            return;
          }
          if (!e || element.type === 'bpmn:Process') {
            return false;
          } else {
            let temp = element.id;
            let type = element.type;
            if (currentTaskId != temp && 'bpmn:UserTask' == type && historyNodeList.indexOf(temp) >= 0) {
              /**
               * 满足3个条件才弹框显示节点信息
               * 1.当前节点不是鼠标选中的节点，防止多次调用
               * 2.必须是任务节点
               * 3.必须是处理过的节点
               */
              currentTaskId = temp;
              //console.log('准备开启modal', e);
              showNodeInfo();
            }
          }
        });
      }

      function showNodeInfo() {
        closeModal();
        openModal(true, {
          dataList: taskList,
          taskId: currentTaskId,
        });
      }

      function handleModalVisible(flag) {
        //console.log('handleModalVisible', flag)
        if (flag == true) {
          clearTimeout(delayHandler);
        }
      }

      function delayClose() {
        //console.log('delayClose')
        delayHandler = setTimeout(() => {
          //console.log('准备关闭modal');
          if (currentTaskId) {
            showNodeInfo();
          } else {
            closeModal();
          }
        }, 500);
      }

      function newViewer() {
        if (bpmViewer == null) {
          let dom = document.getElementById(containerId);
          bpmViewer = new CustomViewer({
            container: dom,
          });
        }
      }

      return {
        registerModal,
        containerId,
        handleModalVisible,
      };
    },
  };
</script>

<style lang="less">
  .jee-bpm-graphic-containers {
    width: 100%;
    height: calc(100vh - 250px);
  }

  .jee-bpm-graphic-canvas {
    width: 100%;
    height: 100%;
  }
  .jee-bpm-graphic-canvas .bjs-powered-by {
    display: none;
  }
  /**网关样式*/
  .jee-bpm-gateway .djs-visual path {
    stroke: none !important;
  }

  /**走过的分支线样式 */
  .jee-bpm-history-line .djs-visual > :nth-child(1) {
    stroke: #408af1 !important;
  }
  .jee-bpm-history-line path {
    marker-end: url(#active-arrow) !important;
    stroke-width: 2px!important;
  }

  /**走过的节点样式 */
  .jee-bpm-history-node .djs-visual > :nth-child(1) {
    fill: #51a2f13b !important;
    stroke: #408af1 !important;
  }

  /**当前节点样式 */
  .jee-bpm-current-node .djs-visual > :nth-child(1) {
    fill: #f9ca6d !important;
    stroke: #cd9423 !important;
  }
  /*  .jee-bpm-current-node .djs-visual > text {
    fill: #fff !important;
  }*/
</style>
