<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" defaultFullscreen :showCancelBtn="false" :showOkBtn="false">
    <template #handle v-if="showBtns">
      <div class="event-handle">
        <span v-for="(b, index) in eventOperationList" :key="index">
          <a-popconfirm v-if="b.name === '接单'" title="确认接单?" ok-text="确认" cancel-text="取消" @confirm="handleOrder">
            <a-button type="primary" size="small">{{ b.name }}</a-button>
          </a-popconfirm>
          <a-button v-else type="primary" size="small" @click="handleDoAction(modalData, b.name, b.code)">{{ b.name }}</a-button>
        </span>
      </div>
    </template>
    <a-tabs v-model:activeKey="activeKey" @change="tabChange">
      <a-tab-pane key="1" tab="详细信息" id="detailPane">
        <a-collapse v-model:activeKey="activeCollapse" expand-icon-position="end">
          <template #expandIcon="{ isActive }">
            <DoubleRightOutlined :rotate="isActive ? 90 : 0" />
          </template>
          <a-collapse-panel key="1" header="基本信息">
            <Info :record="infoData" />
            <div class="status-box">
              <span class="event-status" :style="{ color: statusColor[infoData.status] }">{{ infoData.status }}</span>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="2" header="用户信息">
            <userInfo :record="infoData" />
          </a-collapse-panel>
          <a-collapse-panel key="3" header="验收信息">
            <checkInfo :record="infoData" />
          </a-collapse-panel>
          <a-collapse-panel key="4" header="终止信息">
            <detailInfo :record="infoData" />
          </a-collapse-panel>
          <a-collapse-panel key="5" header="评价信息">
            <evaluate-detail :record="infoData" />
          </a-collapse-panel>
          <a-collapse-panel key="6" header="流程信息" :lazy="false">
            <Record :record="timeLineArr" />
          </a-collapse-panel>
        </a-collapse>
      </a-tab-pane>
      <a-tab-pane key="2" tab="物料信息">
        <a-table
          :columns="columnsSelect"
          :dataSource="infoData.usedMaterialList"
          bordered
          style="margin-left: 5px; margin-right: 5px"
          :pagination="false"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.dataIndex === 'selectNum'">
              <a-input-number v-model:value="record.selectNum" :min="1" :max="record.num" />
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="3" tab="流程图">
        <!-- 主题和功能按钮区域 -->
        <div class="button-group">
          <a-button type="primary" @click="toggleTheme">切换主题</a-button>
          <a-button type="default" @click="refreshMermaid">刷新流程图</a-button>
        </div>

        <!-- Mermaid 流程图区域：添加ref标识，避免scoped影响 -->
        <pre ref="mermaidRef" class="mermaid">{{ mermaidCode }}</pre>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>
<script lang="ts" setup name="OrderDetail">
  import { DoubleRightOutlined } from '@ant-design/icons-vue';
  import { ref, computed, watch, nextTick, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import detailInfo from './components/detailInfo.vue';
  import Info from './components/info.vue';
  import userInfo from './components/userInfo.vue';
  import checkInfo from './components/checkInfo.vue';
  import Record from './components/record.vue';
  import { useEventStoreWithOut } from '/@/store/modules/event';
  import { storeToRefs } from 'pinia';
  import { detail, getEventProcessList, getMermaid } from './eventOrder.api';
  import { statusColor } from './event.data';
  import mermaid from 'mermaid';
  import EvaluateDetail from './components/evaluateDetail.vue';

  // 初始化Mermaid配置（只执行一次）
  mermaid.initialize({
    startOnLoad: false, // 关闭自动加载，手动控制
    theme: 'default',
    securityLevel: 'loose', // 解决部分渲染权限问题
  });

  const useEventStor = useEventStoreWithOut();
  const { changeFlag, eventOperationList } = storeToRefs(useEventStor);
  const modalData = ref<Recordable>({});
  const activeKey = ref('1');
  const activeCollapse = ref(['1', '2', '3', '4', '5', '6']);
  const infoData = ref<Recordable>({});
  const timeLineArr = ref<any[]>([]);
  const showBtns = ref<boolean>(true);
  const status = ref('');
  let id = ref('');
  // 关键：添加ref引用，替代querySelector
  const mermaidRef = ref<HTMLPreElement | null>(null);

  // 修复：物料表格选择数量列的dataIndex错误
  const columnsSelect = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '5%',
      align: 'center',
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: '10%',
      align: 'center',
    },
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: '10%',
      align: 'center',
    },
    {
      title: '物料分类',
      dataIndex: 'typeName',
      key: 'typeName',
      width: '10%',
      align: 'center',
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: '15%',
      align: 'center',
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: '15%',
      align: 'center',
    },
    {
      title: '选择数量',
      dataIndex: 'selectNum', // 修复：从num改为selectNum
      key: 'selectNum',
      width: '14%',
      align: 'center',
    },
  ];

  // 声明Emits
  const emit = defineEmits(['success', 'register', 'handleTakeOrder', 'doAction']);

  // 确认接单
  const handleOrder = async () => {
    await new Promise((resolve) => {
      emit('handleTakeOrder', modalData.value, resolve);
    });
    changeFlag.value = !changeFlag.value;
  };

  const handleDoAction = (record: any, name: any, code: any) => {
    emit('doAction', record, name, code);
  };

  // const isTerminated = computed(() => {
  //   return status.value === '已终止';
  // });

  // 表单赋值
  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    activeKey.value = '1';
    if (data?.record) {
      status.value = data.record.status;
      modalData.value = { ...data.record };
      showBtns.value = data.name == '详情';
      id.value = data.record.id;

      // 按顺序加载数据
      await fetchDetail(id.value);
      await fetchProcess(id.value);
      await getMermaidHandle(id.value);
    }
    setModalProps({ confirmLoading: false });
  });

  // 设置标题
  const getTitle = computed(() => '工单详情');

  // 获取详情数据
  const fetchDetail = async (id) => {
    try {
      infoData.value = await detail({ id: id });
      eventOperationList.value = infoData.value.eventOperationList;
    } catch (e) {
      console.error('数据加载失败:', e);
    }
  };

  const fetchProcess = async (id) => {
    try {
      const res = await getEventProcessList({ orderId: id });
      timeLineArr.value = [...res];
      let service3Arr = timeLineArr.value.filter((item) => item.operationName === '分配');
      let service3 = service3Arr[0] ? JSON.parse(service3Arr[0].eventOrderAttributeJsonInfo.content).service3 : '';
      let handleArr = timeLineArr.value.filter((item) => item.operationName === '处理');
      let handleContent = handleArr.length > 0 ? JSON.parse(handleArr[0].eventOrderAttributeJsonInfo.content) : [];
      if (service3Arr.length > 0 && service3) {
        infoData.value.service3 = service3;
      }
      if (handleContent.length > 0) {
        infoData.value.dealResult = handleContent.description;
        infoData.value.dealpics = handleContent.pics;
      }
    } catch (e) {
      console.error('加载记录失败:', e);
    }
  };

  defineExpose({
    eventOperationList,
  });

  // 修复：监听changeFlag时添加.value
  watch(
    () => changeFlag.value,
    async () => {
      if(!id.value){
        return
      }
      await fetchDetail(id.value);
      await fetchProcess(id.value);
      await getMermaidHandle(id.value); // 状态变化时重新加载流程图
    },
    { deep: true }
  );

  const mermaidCode = ref('');

  // 获取Mermaid数据
  const getMermaidHandle = async (id) => {
    if (!id) return; // 空值防护
    try {
      mermaidCode.value = await getMermaid({ orderId: id });
      // 如果当前在流程图标签，立即刷新
      if (activeKey.value === '3') {
        await nextTick(refreshMermaid);
      }
    } catch (e) {
      console.error('Mermaid数据加载失败:', e);
      mermaidCode.value = 'graph TD\nA[加载失败] --> B[请点击刷新按钮重试]';
    }
  };

  // 标签切换逻辑优化
  const tabChange = async (key) => {
    if (key === '3') {
      await nextTick(async () => {
        // 如果没有数据，先获取再渲染
        if (!mermaidCode.value) {
          await getMermaidHandle(id.value);
        }
        await refreshMermaid();
      });
    }
  };

  // 刷新Mermaid图（核心修复：使用ref获取DOM）
  const refreshMermaid = async () => {
    // 1. 检查ref是否存在
    if (!mermaidRef.value || !mermaidCode.value) {
      console.warn('Mermaid容器或代码不存在');
      return;
    }

    try {
      // 2. 使用新版Mermaid API渲染
      const { svg } = await mermaid.render(
        `mermaid-${Date.now()}`, // 唯一ID，避免重复渲染冲突
        mermaidCode.value
      );
      // 3. 直接操作ref对应的DOM
      mermaidRef.value.innerHTML = svg;
    } catch (e) {
      console.error('Mermaid渲染失败:', e);
      mermaidRef.value.innerHTML = `<div style="color: red; padding: 20px;">流程图渲染失败：${e.message}</div>`;
    }
  };

  // 切换页面主题
  const toggleTheme = () => {
    const body = document.body;
    body.classList.toggle('dark-theme');
    // 主题切换后重新渲染流程图
    if (activeKey.value === '3') {
      refreshMermaid();
    }
  };

  onMounted(() => {});
</script>
<style lang="less" scoped>
  .event-box {
    padding: 0 30px;
  }

  .event-title {
    font-size: 16px;
    margin-bottom: 10px;
    margin-left: 10px;
  }

  .event-title::before {
    content: '';
    position: relative;
    top: 2px;
    bottom: 0;
    left: 0;
    width: 3px;
    background-color: #007bff;
    display: inline-block;
    height: 16px;
    margin-right: 5px;
  }

  .event-handle {
    float: right;
    margin-right: 96px;
    margin-top: -23px;

    button {
      margin-left: 10px;
    }
  }

  .event-handle:after {
    display: block;
    content: '';
    clear: both;
  }

  :deep(.ant-collapse-header > span) {
    color: #006889;
  }

  .status-box {
    position: absolute;
    top: 60px;
    right: 20px;
  }

  .event-status {
    font-size: 16px;
    font-weight: bold;
  }

  .demo-page {
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .button-group {
    margin-bottom: 20px;
  }

  .button-group .ant-btn {
    margin-right: 10px;
  }

  .mermaid {
    width: 100%;
    height: 500px;
    border: 1px solid #ddd;
    padding: 10px;
    overflow: auto; // 添加滚动，避免流程图超出容器
  }

  /* 示例暗黑主题 */
  body.dark-theme {
    background-color: #333;
    color: white;
  }

  body.dark-theme .demo-page {
    background-color: #444;
    color: white;
  }

  body.dark-theme .mermaid {
    background-color: #555;
  }
</style>
