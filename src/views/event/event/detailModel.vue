<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" defaultFullscreen :showCancelBtn="false" :showOkBtn="false">
    <template #handle>
      <div class="event-handle">
        <span v-for="(b, index) in eventOperationList" :key="index">
          <a-popconfirm v-if="b.name == '接单'" title="确认接单?" ok-text="确认" cancel-text="取消" @confirm="handleOrder">
            <a-button type="primary" size="small">{{ b.name }}</a-button>
          </a-popconfirm>
          <a-button v-else type="primary" size="small" @click="handleDoAction(modalData, b.name)">{{ b.name }}</a-button>
        </span>
      </div>
    </template>
    <div class="event-title">事件信息</div>
    <div class="event-box" style="position: relative">
      <Info :record="modalData"></Info>
    </div>
    <div class="event-title">事件记录</div>
    <div class="event-box">
      <Record :record="modalData"></Record>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup name="EventDetail">
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import Info from './components/info.vue';
  import Record from './components/record.vue';
  import { useEventStoreWithOut } from '/@/store/modules/event';
  import { storeToRefs } from 'pinia';
  const useEventStor = useEventStoreWithOut();
  const { changeFlag, eventOperationList } = storeToRefs(useEventStor);
  const modalData = ref<Recordable>({});

  // 声明Emits
  const emit = defineEmits(['success', 'register', 'handleTakeOrder', 'doAction']);
  //确认接单
  const handleOrder = async () => {
    // 1. 使用 Promise 包装 emit
    await new Promise((resolve) => {
      emit('handleTakeOrder', modalData.value, resolve);
    });
    // 2. 父组件处理完成后才会执行这里
    changeFlag.value = !changeFlag.value;
  };
  const handleDoAction = (record: any, name: any) => {
    emit('doAction', record, name);
  };

  //表单赋值
  // 修改3：优化modalInner接收逻辑
  const [registerModal, { setModalProps }] = useModalInner(async (data) => {
    // 修改4：确保数据完整性和响应式
    if (data?.record) {
      modalData.value = {
        ...data.record,
        // 可以在这里添加其他需要传递的字段
      };
      //eventOperationList.value = modalData.value.eventOperationList;
    }
    setModalProps({ confirmLoading: false });
  });
  //设置标题
  const getTitle = computed(() => '事件详情');

  //获取子组件工单信息的按钮操作
  //console.log(infoRef.value)

  //表单提交事件
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
</style>
